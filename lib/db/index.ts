import postgres from 'postgres'

const connectionString = process.env.POSTGRES_URL!

export const sql = postgres(connectionString, {
  ssl: 'require',
})
