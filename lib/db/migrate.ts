import { sql } from './index'
import { readFileSync } from 'fs'
import { join } from 'path'

async function migrate() {
  const migrationPath = join(__dirname, 'migrations', '001-copa-mata-mata.sql')
  const migration = readFileSync(migrationPath, 'utf-8')

  const statements = migration
    .split(';')
    .map((s) =>
      s
        .split('\n')
        .filter((line) => !line.trimStart().startsWith('--'))
        .join('\n')
        .trim()
    )
    .filter((s) => s.length > 0)

  for (const statement of statements) {
    console.log(`Executando: ${statement.substring(0, 60)}...`)
    await sql.unsafe(statement)
  }

  console.log('\nMigration concluída com sucesso!')
  await sql.end()
}

migrate().catch((e) => {
  console.error('Erro na migration:', e)
  process.exit(1)
})
