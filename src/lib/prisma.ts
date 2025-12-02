import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
// ATENÇÃO: A importação agora vem do caminho que você definiu no schema
import { PrismaClient } from '../../prisma/generated/client' 

const connectionString = `${process.env.DATABASE_URL}`

const createPrismaClient = () => {
  // 1. Configura o pool de conexão nativo (do driver 'pg')
  const pool = new Pool({ connectionString })
  
  // 2. Cria o adaptador do Prisma
  const adapter = new PrismaPg(pool)
  
  // 3. Passa o adaptador para o cliente
  return new PrismaClient({ adapter })
}

type PrismaClientType = ReturnType<typeof createPrismaClient>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientType | undefined
}

// Singleton: Reusa a instância em dev para evitar "Too many connections"
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma