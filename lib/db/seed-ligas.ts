import postgres from 'postgres'
import { readFileSync } from 'fs'
import { join } from 'path'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

interface ApiLeagueEntry {
  league: {
    name: string
    type: string
    logo: string
  }
  country: {
    name: string
  }
}

const BATCH_SIZE = 100

async function seedLigas() {
  const raw = readFileSync(join(__dirname, '..', 'dados', 'ligas.json'), 'utf-8')
  const data = JSON.parse(raw)
  const entries: ApiLeagueEntry[] = data.response

  console.log(`Total de ligas no JSON: ${entries.length}`)

  // Criar tabela se não existir
  await sql`
    CREATE TABLE IF NOT EXISTS ligas (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      tipo TEXT NOT NULL,
      logo TEXT,
      pais_id INTEGER REFERENCES paises(id)
    )
  `

  // Montar mapa de país nome → id
  const paises = await sql`SELECT id, nome FROM paises`
  const paisMap = new Map<string, number>()
  for (const p of paises) {
    paisMap.set(p.nome, p.id)
  }
  console.log(`Países no banco: ${paisMap.size}`)

  const existing = await sql`SELECT count(*) AS total FROM ligas`
  if (Number(existing[0].total) > 0) {
    console.log(`Tabela ligas já possui ${existing[0].total} registros. Limpando...`)
    await sql`DELETE FROM ligas`
  }

  let inserted = 0
  let paisNaoEncontrado = 0

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE)
    const values = batch.map(e => {
      const paisId = paisMap.get(e.country.name) ?? null
      if (!paisId) paisNaoEncontrado++
      return {
        nome: e.league.name,
        tipo: e.league.type,
        logo: e.league.logo ?? null,
        pais_id: paisId,
      }
    })

    await sql`
      INSERT INTO ligas ${sql(values, 'nome', 'tipo', 'logo', 'pais_id')}
    `

    inserted += batch.length
    console.log(`Inseridos: ${inserted}/${entries.length}`)
  }

  if (paisNaoEncontrado > 0) {
    console.warn(`⚠ ${paisNaoEncontrado} ligas com país não encontrado (pais_id = null)`)
  }

  console.log(`Seed concluído! ${inserted} ligas inseridas.`)
  await sql.end()
}

seedLigas()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed falhou:', err)
    process.exit(1)
  })
