import postgres from 'postgres'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

interface ApiTeamEntry {
  team: {
    name: string
    national: boolean
  }
  venue: {
    city: string | null
  } | null
}

const EXCLUDED_SUFFIXES = [' W', ' U17', ' U20', ' U21', ' U23']

async function migrateTimes() {
  const dadosDir = join(__dirname, '..', 'dados')

  // STEP 1 — Carregar todos os times dos JSONs (exceto Brasil)
  const arquivos = readdirSync(dadosDir).filter(
    (f) => f.startsWith('times-') && f !== 'times-brasil.json' && f.endsWith('.json')
  )

  const teamsMap = new Map<string, string | null>() // nome -> cidade

  for (const arquivo of arquivos) {
    const raw = readFileSync(join(dadosDir, arquivo), 'utf-8')
    const data = JSON.parse(raw)
    const entries: ApiTeamEntry[] = data.response ?? []

    for (const entry of entries) {
      const nome = entry.team.name
      if (
        !teamsMap.has(nome) &&
        !EXCLUDED_SUFFIXES.some((s) => nome.endsWith(s))
      ) {
        teamsMap.set(nome, entry.venue?.city ?? null)
      }
    }
  }

  console.log(`\n📦 Times carregados dos JSONs: ${teamsMap.size}`)
  console.log(`   Arquivos lidos: ${arquivos.join(', ')}\n`)

  await sql.begin(async (tx) => {
    // STEP 2 — Eliminar duplicatas no banco
    const dupes = await tx<{ nome: string; ids: number[] }[]>`
      SELECT nome, array_agg(id ORDER BY id) AS ids
      FROM times
      GROUP BY nome
      HAVING count(*) > 1
    `

    let removidas = 0
    for (const { nome, ids } of dupes) {
      const canonical = ids[0]
      const extras = ids.slice(1)

      for (const dupId of extras) {
        await tx`UPDATE participantes SET time_id = ${canonical} WHERE time_id = ${dupId}`
        await tx`UPDATE partidas SET mandante_id = ${canonical} WHERE mandante_id = ${dupId}`
        await tx`UPDATE partidas SET visitante_id = ${canonical} WHERE visitante_id = ${dupId}`
        await tx`DELETE FROM times WHERE id = ${dupId}`
        removidas++
      }
    }
    console.log(`🧹 Duplicatas removidas: ${removidas}`)

    // STEP 3 + 4 — Atualizar existentes e inserir ausentes
    const existing = await tx<{ nome: string }[]>`SELECT nome FROM times`
    const existingNames = new Set(existing.map((r) => r.nome))

    let atualizados = 0
    let inseridos = 0

    for (const [nome, cidade] of teamsMap) {
      if (existingNames.has(nome)) {
        await tx`UPDATE times SET cidade = ${cidade} WHERE nome = ${nome}`
        atualizados++
      } else {
        await tx`INSERT INTO times (nome, cidade) VALUES (${nome}, ${cidade})`
        inseridos++
      }
    }

    console.log(`✏️  Times atualizados (nome já existia): ${atualizados}`)
    console.log(`➕ Times inseridos (novos): ${inseridos}`)
    console.log(`\n✅ Migration concluída com sucesso!`)
  })

  await sql.end()
}

migrateTimes()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration falhou:', err)
    process.exit(1)
  })
