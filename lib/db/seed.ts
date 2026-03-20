import { sql } from '@vercel/postgres'
import { readFileSync } from 'fs'
import { join } from 'path'

async function seed() {
  console.log('Creating tables...')
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8')
  await sql.query(schema)

  console.log('Seeding times...')
  const timesData = [
    { nome: 'Atlético Palmital', cidade: 'Palmital' },
    { nome: 'União Esportiva', cidade: 'São Paulo' },
    { nome: 'EC Esperança', cidade: 'Campinas' },
    { nome: 'Recreativo Novo Mundo', cidade: 'Sorocaba' },
    { nome: 'Grêmio Amigos', cidade: 'Santos' },
    { nome: 'AD Central', cidade: 'Guarulhos' },
    { nome: 'Sporting Club', cidade: 'Osasco' },
    { nome: 'Bola de Ouro FC', cidade: 'São Bernardo' },
  ]

  const timeIds: number[] = []
  for (const t of timesData) {
    const result = await sql`
      INSERT INTO times (nome, cidade) VALUES (${t.nome}, ${t.cidade})
      ON CONFLICT DO NOTHING
      RETURNING id
    `
    if (result.rows.length > 0) {
      timeIds.push(result.rows[0].id)
    }
  }

  if (timeIds.length === 0) {
    console.log('Times already seeded, fetching existing IDs...')
    const existing = await sql`SELECT id FROM times ORDER BY id`
    for (const row of existing.rows) {
      timeIds.push(row.id)
    }
  }

  console.log('Seeding campeonatos...')
  const campeonatosData = [
    { nome: 'Campeonato Municipal', temporada: '2025', status: 'em_andamento' },
    { nome: 'Copa da Amizade', temporada: '2025', status: 'planejado' },
    { nome: 'Torneio de Verão', temporada: '2024', status: 'finalizado' },
  ]

  const campIds: number[] = []
  for (const c of campeonatosData) {
    const result = await sql`
      INSERT INTO campeonatos (nome, temporada, status) VALUES (${c.nome}, ${c.temporada}, ${c.status})
      RETURNING id
    `
    campIds.push(result.rows[0].id)
  }

  const c1 = campIds[0]

  console.log('Seeding participantes for campeonato 1...')
  for (const tId of timeIds) {
    await sql`INSERT INTO participantes (campeonato_id, time_id) VALUES (${c1}, ${tId})`
  }

  console.log('Seeding partidas...')
  // Rodada 1 — finalizada
  await sql`INSERT INTO partidas (campeonato_id, rodada, mandante_id, visitante_id, data, gols_mandante, gols_visitante, status) VALUES (${c1}, 1, ${timeIds[0]}, ${timeIds[1]}, '2025-03-01', 2, 1, 'finalizada')`
  await sql`INSERT INTO partidas (campeonato_id, rodada, mandante_id, visitante_id, data, gols_mandante, gols_visitante, status) VALUES (${c1}, 1, ${timeIds[2]}, ${timeIds[3]}, '2025-03-01', 0, 0, 'finalizada')`
  await sql`INSERT INTO partidas (campeonato_id, rodada, mandante_id, visitante_id, data, gols_mandante, gols_visitante, status) VALUES (${c1}, 1, ${timeIds[4]}, ${timeIds[5]}, '2025-03-02', 3, 1, 'finalizada')`
  await sql`INSERT INTO partidas (campeonato_id, rodada, mandante_id, visitante_id, data, gols_mandante, gols_visitante, status) VALUES (${c1}, 1, ${timeIds[6]}, ${timeIds[7]}, '2025-03-02', 1, 2, 'finalizada')`
  // Rodada 2 — finalizada
  await sql`INSERT INTO partidas (campeonato_id, rodada, mandante_id, visitante_id, data, gols_mandante, gols_visitante, status) VALUES (${c1}, 2, ${timeIds[1]}, ${timeIds[2]}, '2025-03-08', 1, 1, 'finalizada')`
  await sql`INSERT INTO partidas (campeonato_id, rodada, mandante_id, visitante_id, data, gols_mandante, gols_visitante, status) VALUES (${c1}, 2, ${timeIds[3]}, ${timeIds[4]}, '2025-03-08', 0, 2, 'finalizada')`
  await sql`INSERT INTO partidas (campeonato_id, rodada, mandante_id, visitante_id, data, gols_mandante, gols_visitante, status) VALUES (${c1}, 2, ${timeIds[5]}, ${timeIds[6]}, '2025-03-09', 1, 0, 'finalizada')`
  await sql`INSERT INTO partidas (campeonato_id, rodada, mandante_id, visitante_id, data, gols_mandante, gols_visitante, status) VALUES (${c1}, 2, ${timeIds[7]}, ${timeIds[0]}, '2025-03-09', 0, 1, 'finalizada')`
  // Rodada 3 — agendada
  await sql`INSERT INTO partidas (campeonato_id, rodada, mandante_id, visitante_id, data, status) VALUES (${c1}, 3, ${timeIds[0]}, ${timeIds[2]}, '2025-03-15', 'agendada')`
  await sql`INSERT INTO partidas (campeonato_id, rodada, mandante_id, visitante_id, data, status) VALUES (${c1}, 3, ${timeIds[1]}, ${timeIds[3]}, '2025-03-15', 'agendada')`
  await sql`INSERT INTO partidas (campeonato_id, rodada, mandante_id, visitante_id, data, status) VALUES (${c1}, 3, ${timeIds[4]}, ${timeIds[6]}, '2025-03-16', 'agendada')`
  await sql`INSERT INTO partidas (campeonato_id, rodada, mandante_id, visitante_id, data, status) VALUES (${c1}, 3, ${timeIds[5]}, ${timeIds[7]}, '2025-03-16', 'agendada')`

  console.log('Seed complete!')
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
