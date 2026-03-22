import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

async function migrate() {
  console.log('Adding grupo column to participantes...')
  await sql`ALTER TABLE participantes ADD COLUMN IF NOT EXISTS grupo INTEGER`

  console.log('Adding grupo column to partidas...')
  await sql`ALTER TABLE partidas ADD COLUMN IF NOT EXISTS grupo INTEGER`

  console.log('Migration complete!')
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err)
    process.exit(1)
  })
