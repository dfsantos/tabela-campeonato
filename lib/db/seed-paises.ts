import postgres from 'postgres'
import { readFileSync } from 'fs'
import { join } from 'path'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

interface ApiCountryEntry {
  name: string
  code: string | null
  flag: string | null
}

const BATCH_SIZE = 100

async function seedPaises() {
  const raw = readFileSync(join(__dirname, '..', 'dados', 'paises.json'), 'utf-8')
  const data = JSON.parse(raw)
  const entries: ApiCountryEntry[] = data.response

  console.log(`Total de países no JSON: ${entries.length}`)

  // Criar tabela se não existir
  await sql`
    CREATE TABLE IF NOT EXISTS paises (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      codigo TEXT,
      bandeira TEXT
    )
  `

  const existing = await sql`SELECT count(*) AS total FROM paises`
  if (Number(existing[0].total) > 0) {
    console.log(`Tabela paises já possui ${existing[0].total} registros. Limpando...`)
    await sql`DELETE FROM paises`
  }

  let inserted = 0

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE)
    const values = batch.map(e => ({
      nome: e.name,
      codigo: e.code ?? null,
      bandeira: e.flag ?? null,
    }))

    await sql`
      INSERT INTO paises ${sql(values, 'nome', 'codigo', 'bandeira')}
    `

    inserted += batch.length
    console.log(`Inseridos: ${inserted}/${entries.length}`)
  }

  console.log(`Seed concluído! ${inserted} países inseridos.`)
  await sql.end()
}

seedPaises()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed falhou:', err)
    process.exit(1)
  })
