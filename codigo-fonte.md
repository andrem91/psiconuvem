# Contexto do Repositório: andrem91/psiconuvem

Este documento contém o código fonte atual do projeto para análise de contexto.

## Stack
- **Next.js:** 16.0.6
- **Prisma:** 7.0.1 (Adapter Pattern)
- **Database:** PostgreSQL 18
- **Language:** TypeScript
- **Encryption:** AES-256-GCM

---

## 1. package.json
```json
{
  "name": "psiconuvem",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type": "module",
    "prepare": "husky",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "docker:up": "docker compose up -d",
    "docker:down": "docker compose down",
    "docker:logs": "docker compose logs -f",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:push": "prisma db push"
  },
  "dependencies": {
    "@prisma/adapter-pg": "^7.0.1",
    "@prisma/client": "^7.0.1",
    "dotenv": "^17.2.3",
    "next": "16.0.6",
    "pg": "^8.16.3",
    "react": "19.2.0",
    "react-dom": "19.2.0"
  },
  "devDependencies": {
    "@commitlint/cli": "^20.1.0",
    "@commitlint/config-conventional": "^20.0.0",
    "@tailwindcss/postcss": "^4",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^20.19.25",
    "@types/pg": "^8.15.6",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react": "^5.1.1",
    "@vitest/coverage-v8": "^4.0.14",
    "babel-plugin-react-compiler": "1.0.0",
    "eslint": "^9",
    "eslint-config-next": "16.0.6",
    "eslint-config-prettier": "^10.1.8",
    "husky": "^9.1.7",
    "jsdom": "^27.2.0",
    "lint-staged": "^16.2.7",
    "prettier": "^3.7.3",
    "prisma": "^7.0.1",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vitest": "^4.0.14"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

## 2\. next.config.ts

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
}

export default nextConfig
```

## 3\. prisma/schema.prisma

```prisma
generator client {
  provider = "prisma-client"
  output   = "./generated"
}

datasource db {
  provider = "postgresql"
}

// ==================== AUTH.JS ====================

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ==================== USUÁRIO/PSICÓLOGO ====================

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?
  // Hash bcrypt para credentials

  accounts Account[]
  sessions Session[]

  // Relação 1:1 com Psychologist (após completar cadastro)
  psychologist Psychologist?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Psychologist {
  id     String @id @default(cuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Dados profissionais
  crp         String  @unique
  slug        String  @unique
  bio         String? @db.Text
  photo       String?
  phone       String?
  specialties String[]

  // Plano e Trial
  plan           String    @default("TRIAL") // TRIAL | ESSENTIAL | PRO | PREMIUM
  trialEndsAt    DateTime?
  asaasCustomerId String?  @unique

  // Relações
  patients      Patient[]
  appointments  Appointment[]
  clinicalNotes ClinicalNote[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ==================== PACIENTE ====================

model Patient {
  id             String @id @default(cuid())
  psychologistId String

  name      String
  email     String?
  phone     String
  birthdate DateTime?

  // LGPD - Consentimento
  lgpdConsent     Boolean   @default(false)
  lgpdConsentDate DateTime?
  lgpdConsentIp   String?

  // Relações
  psychologist  Psychologist   @relation(fields: [psychologistId], references: [id], onDelete: Cascade)
  appointments  Appointment[]
  clinicalNotes ClinicalNote[]

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime? 
  // Soft delete (LGPD)

  @@index([psychologistId])
}

// ==================== AGENDAMENTO ====================

model Appointment {
  id             String @id @default(cuid())
  psychologistId String
  patientId      String

  scheduledAt DateTime
  duration    Int      @default(50) // minutos
  status      String   @default("SCHEDULED") // SCHEDULED | COMPLETED | CANCELLED | NO_SHOW
  type        String   @default("presencial") // presencial | online
  meetLink    String?
  notes       String?  @db.Text

  // CFP Telepsicologia - Consentimento
  telepsyConsent Boolean @default(false)

  // Relações
  psychologist Psychologist @relation(fields: [psychologistId], references: [id], onDelete: Cascade)
  patient      Patient      @relation(fields: [patientId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([psychologistId, scheduledAt])
  @@index([patientId])
}

// ==================== PRONTUÁRIO ====================

model ClinicalNote {
  id             String @id @default(cuid())
  psychologistId String
  patientId      String

  sessionDate   DateTime
  sessionNumber Int
  duration      Int      // minutos
  sessionType   String   // presencial | online
  content       String   @db.Text // ⚠️ CRIPTOGRAFADO (AES-256-GCM)

  // Relações
  psychologist Psychologist @relation(fields: [psychologistId], references: [id], onDelete: Cascade)
  patient      Patient      @relation(fields: [patientId], references: [id], onDelete: Cascade)

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime? 
  // Soft delete (CFP: manter 5 anos)

  @@index([psychologistId, patientId])
}
```

## 4\. src/lib/prisma.ts

```typescript
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
```

## 5\. src/lib/encryption.ts

```typescript
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY

  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set')
  }

  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
  }

  return Buffer.from(key, 'hex')
}

/**
 * Criptografa texto usando AES-256-GCM
 * @param text - Texto em claro
 * @returns String no formato: iv:authTag:ciphertext (hex)
 */
export function encrypt(text: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  // Formato: iv:authTag:ciphertext
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

/**
 * Descriptografa texto
 * @param encrypted - String no formato iv:authTag:ciphertext
 * @returns Texto em claro
 */
export function decrypt(encrypted: string): string {
  const key = getEncryptionKey()
  const parts = encrypted.split(':')

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format')
  }

  const [ivHex, authTagHex, ciphertext] = parts
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Gera chave de criptografia (executar UMA VEZ)
 * @returns Chave hex de 64 caracteres
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex')
}
```

## 6\. docker-compose.yml

```yaml
version: '3.8'

services:
  # PostgreSQL 18
  postgres:
    image: postgres:18-alpine
    container_name: psiconuvem-postgres
    restart: unless-stopped
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: psiconuvem
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5

  # pgAdmin (interface visual)
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: psiconuvem-pgadmin
    restart: unless-stopped
    ports:
      - '5050:80'
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@psiconuvem.com
      PGADMIN_DEFAULT_PASSWORD: admin
      PGADMIN_CONFIG_SERVER_MODE: 'False'
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
    driver: local
  pgadmin_data:
    driver: local
```

## 7\. tsconfig.json

```json
{
  "compilerOptions": {
    "target": "esnext",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "types": ["vitest/globals"],
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts",
    "vitest.config.ts",
  ],
  "exclude": ["node_modules"]
}
```

## 8\. src/app/page.tsx

```tsx
import Image from 'next/image'

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{' '}
            <a
              href="[https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app](https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app)"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{' '}
            or the{' '}
            <a
              href="[https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app](https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app)"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{' '}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="[https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app](https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app)"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="[https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app](https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app)"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  )
}
```

## 9\. src/app/layout.tsx

```tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  )
}
```

## 10. src/app/globals.css
```css
@import "tailwindcss";

@theme {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```

## 11\. .env.example

```bash
# Conexão com o Banco (Docker Local)
# Formato: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
DATABASE_URL="postgresql://psiconuvem:password123@localhost:5432/psiconuvem_db?schema=public"

# Chave de Criptografia (32 bytes em hex) para o Prontuário
# Gere uma nova com: openssl rand -hex 32
ENCRYPTION_KEY="0000000000000000000000000000000000000000000000000000000000000000"

# NextAuth (Se for usar futuramente)
AUTH_SECRET="seu-segredo-aqui" # openssl rand -base64 32

# Configuração Next.js
NODE_ENV="development"
```

## 12\. vitest.config.ts

Configuração de testes unitários e de integração.

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
 
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
```

## 13\. tests/setup.ts

Setup do ambiente de testes.

```typescript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock do ResizeObserver (necessário para alguns componentes de UI)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Limpeza automática após cada teste
afterEach(() => {
  vi.clearAllMocks()
})
```

## 14\. postcss.config.mjs

```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

## 15\. eslint.config.mjs

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
```

## 16. prisma/migrations/20251202093058_init/migration.sql
SQL inicial gerado pelo Prisma para criar as tabelas no PostgreSQL.
```sql
-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Psychologist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "crp" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT,
    "photo" TEXT,
    "phone" TEXT,
    "specialties" TEXT[],
    "plan" TEXT NOT NULL DEFAULT 'TRIAL',
    "trialEndsAt" TIMESTAMP(3),
    "asaasCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Psychologist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "psychologistId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "birthdate" TIMESTAMP(3),
    "lgpdConsent" BOOLEAN NOT NULL DEFAULT false,
    "lgpdConsentDate" TIMESTAMP(3),
    "lgpdConsentIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "psychologistId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 50,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "type" TEXT NOT NULL DEFAULT 'presencial',
    "meetLink" TEXT,
    "notes" TEXT,
    "telepsyConsent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalNote" (
    "id" TEXT NOT NULL,
    "psychologistId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "sessionNumber" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "sessionType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ClinicalNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Psychologist_userId_key" ON "Psychologist"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Psychologist_crp_key" ON "Psychologist"("crp");

-- CreateIndex
CREATE UNIQUE INDEX "Psychologist_slug_key" ON "Psychologist"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Psychologist_asaasCustomerId_key" ON "Psychologist"("asaasCustomerId");

-- CreateIndex
CREATE INDEX "Patient_psychologistId_idx" ON "Patient"("psychologistId");

-- CreateIndex
CREATE INDEX "Appointment_psychologistId_scheduledAt_idx" ON "Appointment"("psychologistId", "scheduledAt");

-- CreateIndex
CREATE INDEX "Appointment_patientId_idx" ON "Appointment"("patientId");

-- CreateIndex
CREATE INDEX "ClinicalNote_psychologistId_patientId_idx" ON "ClinicalNote"("psychologistId", "patientId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Psychologist" ADD CONSTRAINT "Psychologist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_psychologistId_fkey" FOREIGN KEY ("psychologistId") REFERENCES "Psychologist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_psychologistId_fkey" FOREIGN KEY ("psychologistId") REFERENCES "Psychologist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalNote" ADD CONSTRAINT "ClinicalNote_psychologistId_fkey" FOREIGN KEY ("psychologistId") REFERENCES "Psychologist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalNote" ADD CONSTRAINT "ClinicalNote_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## 17\. prisma.config.ts

```typescript
// This file was generated by Prisma and assumes you have installed the following:
// npm install --save-dev prisma dotenv
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

## 18\. commitlint.config.js

Padrão de commits (Conventional Commits).

```javascript
module.exports = { extends: ['@commitlint/config-conventional'] }
```

## 19\. tests/encryption.test.ts

Teste vital para garantir que a criptografia de ponta a ponta dos prontuários funciona.

```typescript
import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, generateEncryptionKey } from '@/lib/encryption'

// Mock da variável de ambiente para testes
process.env.ENCRYPTION_KEY = generateEncryptionKey()

describe('Encryption Lib', () => {
  it('should encrypt and decrypt text correctly', () => {
    const originalText = 'Dados sensíveis do paciente: Diagnóstico X'
    
    const encrypted = encrypt(originalText)
    expect(encrypted).not.toBe(originalText)
    expect(encrypted).toContain(':') // Verifica formato iv:authTag:content
    
    const decrypted = decrypt(encrypted)
    expect(decrypted).toBe(originalText)
  })

  it('should generate different outputs for same input (IV randomization)', () => {
    const text = 'Mesmo texto'
    const enc1 = encrypt(text)
    const enc2 = encrypt(text)
    
    expect(enc1).not.toBe(enc2)
    expect(decrypt(enc1)).toBe(text)
    expect(decrypt(enc2)).toBe(text)
  })
})
```

## 20\. tests/example.test.ts

```typescript
import { expect, test } from 'vitest'

test('Math works', () => {
  expect(1 + 1).toBe(2)
})
```

## 21\. .prettierrc

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

## 22\. .husky/pre-commit

Garante a qualidade do código antes do commit.

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
npx commitlint --edit $1
```

## 23\. README.md

(Resumo)

```markdown
# PsicoNuvem

SaaS de gestão para psicólogos focado em compliance, segurança e facilidade de uso.

## Stack
- Next.js 16
- Prisma 7 (Adapter Pattern)
- PostgreSQL
- Docker

## Como rodar
1. `npm install`
2. `npm run docker:up` (Sobe o banco)
3. `npm run db:migrate` (Cria tabelas)
4. `npm run dev`
```
