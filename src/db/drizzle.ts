import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

config({ path: '.env.local' }) // or .env

const client = postgres(process.env.DATABASE_URL!, { max: 5 }) // Transaction pooler
export const db = drizzle(client, { schema })
