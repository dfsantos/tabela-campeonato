import postgres from 'postgres'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

interface ApiTeamEntry {
  team: {
    name: string
    country: string
  }
}

async function migratePaisTimes() {
  const dadosDir = join(__dirname, '..', 'dados')

  // STEP 1 — Adicionar coluna pais_id em times
  console.log('\n🔧 Adicionando coluna pais_id em times...')
  await sql`ALTER TABLE times ADD COLUMN IF NOT EXISTS pais_id INTEGER REFERENCES paises(id)`
  console.log('   Coluna adicionada (ou já existia).')

  // STEP 2 — Carregar paises do banco
  const paisRows = await sql<{ id: number; nome: string }[]>`SELECT id, nome FROM paises`
  const paisMap = new Map(paisRows.map((p) => [p.nome, p.id]))
  console.log(`\n🌍 Países carregados do banco: ${paisMap.size}`)

  // STEP 3 — Construir mapa time.name → pais_id a partir dos JSONs (todos, inclusive Brasil)
  const arquivos = readdirSync(dadosDir).filter(
    (f) => f.startsWith('times-') && f.endsWith('.json')
  )

  // Agrupado por pais_id para batch update eficiente
  const porPais = new Map<number, string[]>() // pais_id → [nomes dos times]

  for (const arquivo of arquivos) {
    const raw = readFileSync(join(dadosDir, arquivo), 'utf-8')
    const data = JSON.parse(raw)
    const entries: ApiTeamEntry[] = data.response ?? []

    for (const entry of entries) {
      const paisId = paisMap.get(entry.team.country)
      if (paisId === undefined) continue

      const lista = porPais.get(paisId) ?? []
      lista.push(entry.team.name)
      porPais.set(paisId, lista)
    }
  }

  console.log(`📦 Países com times nos JSONs: ${porPais.size}`)

  // STEP 4 — Atualizar pais_id em batch (um UPDATE por país)
  let totalAtualizados = 0
  for (const [paisId, nomes] of porPais) {
    const result = await sql`
      UPDATE times SET pais_id = ${paisId}
      WHERE nome = ANY(${nomes})
    `
    totalAtualizados += Number(result.count)
  }
  console.log(`\n✏️  Times atualizados via JSON: ${totalAtualizados}`)

  // STEP 5 — Fallback: times sem pais_id → Brasil
  const brasilId = paisMap.get('Brazil')
  if (brasilId === undefined) {
    console.warn('⚠️  País "Brazil" não encontrado na tabela paises. Fallback ignorado.')
  } else {
    const fallback = await sql`
      UPDATE times SET pais_id = ${brasilId} WHERE pais_id IS NULL
    `
    console.log(`🇧🇷 Times sem match (fallback Brasil): ${fallback.count}`)
  }

  // STEP 6 — Resumo
  const semPais = await sql`SELECT COUNT(*) AS total FROM times WHERE pais_id IS NULL`
  console.log(`\n✅ Migration concluída!`)
  console.log(`   Times sem pais_id após migration: ${semPais[0].total}`)

  await sql.end()
}

migratePaisTimes()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration falhou:', err)
    process.exit(1)
  })
