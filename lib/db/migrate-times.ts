import postgres from 'postgres'
import { readFileSync } from 'fs'
import { join } from 'path'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

interface ApiTeamEntry {
  team: { name: string }
  venue: { city: string | null }
}

const BATCH_SIZE = 100

async function migrateTimes() {
  const raw = readFileSync(join(__dirname, '..', 'dados', 'times.json'), 'utf-8')
  const data = JSON.parse(raw)
  const entries: ApiTeamEntry[] = data.response

  const EXCLUDED_SUFFIXES = [' W', ' U17', ' U20']
  const filtered = entries.filter(e =>
    !EXCLUDED_SUFFIXES.some(suffix => e.team.name.endsWith(suffix))
  )

  console.log(`Total no JSON: ${entries.length} | Após filtro: ${filtered.length}`)

  console.log('Limpando dados existentes...')
  await sql`DELETE FROM partidas`
  await sql`DELETE FROM participantes`
  const deleted = await sql`DELETE FROM times`
  console.log(`${deleted.count} times removidos.`)

  let inserted = 0

  for (let i = 0; i < filtered.length; i += BATCH_SIZE) {
    const batch = filtered.slice(i, i + BATCH_SIZE)
    const values = batch.map(e => ({
      nome: e.team.name,
      cidade: e.venue.city ?? null,
    }))

    await sql`
      INSERT INTO times ${sql(values, 'nome', 'cidade')}
    `

    inserted += batch.length
    console.log(`Inseridos: ${inserted}/${filtered.length}`)
  }

  console.log(`Migration concluída! ${inserted} times inseridos.`)
  await sql.end()
}

migrateTimes()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration falhou:', err)
    process.exit(1)
  })
