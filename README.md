# 🧠 PsicoNuvem

> SaaS de gestão clínica para psicólogos brasileiros

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%2B%20Auth-3ECF8E?logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📋 Sobre o Projeto

**PsicoNuvem** é uma plataforma completa para psicólogos gerenciarem suas clínicas de forma segura e eficiente. O sistema foi desenvolvido com foco em:

- 🔒 **Segurança** - Criptografia, RLS (Row Level Security), LGPD compliance
- 🏢 **Multi-tenancy** - Isolamento total de dados entre profissionais
- 🇧🇷 **Brasil** - Integração com Asaas, validação de CRP, normas CFP
- ⚡ **Performance** - Next.js 16, React Server Components, Edge Runtime

---

## ✨ Features

### Implementadas ✅

- [x] **Autenticação Completa**
  - Registro com validação de CRP
  - Login com email/senha
  - Confirmação de email
  - Proteção de rotas (middleware)

- [x] **Gestão de Pacientes**
  - CRUD completo
  - Soft delete (LGPD)
  - Consentimento LGPD com registro de IP
  - Validação de telefone brasileiro

- [x] **Segurança Enterprise**
  - Row Level Security (RLS) em todas tabelas
  - Multi-tenancy (isolamento de dados)
  - Criptografia AES-256-GCM para dados sensíveis
  - Admin Client para operações privilegiadas

- [x] **Dashboard**
  - Visão geral da clínica
  - Contadores de pacientes/consultas
  - Informações do plano (Trial 30 dias)

### Roadmap 🚀

- [ ] **Agenda** - Agendamento de consultas
- [ ] **Prontuário Eletrônico** - Notas clínicas criptografadas
- [ ] **Integração Google Meet** - Telepsicologia
- [ ] **Portal do Paciente** - Área restrita para pacientes
- [ ] **Pagamentos** - Integração Asaas
- [ ] **Site Público** - Página profissional do psicólogo

---

## 🛠️ Stack Tecnológica

| Categoria | Tecnologia |
|-----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Linguagem** | TypeScript 5.x |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | Supabase Auth |
| **ORM** | Supabase Client |
| **Styling** | Tailwind CSS 4 |
| **Validação** | Zod |
| **Ícones** | Lucide React |
| **Testes** | Vitest + Testing Library |
| **Qualidade** | ESLint, Prettier, Husky |

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 20+
- Docker (para Supabase local)
- Git

### 1. Clone o repositório

```bash
git clone https://github.com/andrem91/psiconuvem.git
cd psiconuvem
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase local

```bash
# Iniciar Supabase (Docker)
npx supabase start

# Aplicar migrations
npx supabase db reset
```

### 4. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com as credenciais do Supabase local:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENCRYPTION_KEY=sua_chave_hex_64_caracteres
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## 📁 Estrutura do Projeto

```
psiconuvem/
├── src/
│   ├── app/                    # App Router (páginas)
│   │   ├── auth/callback/      # OAuth/Email callback
│   │   ├── dashboard/          # Área autenticada
│   │   │   ├── _components/    # Componentes do dashboard
│   │   │   └── pacientes/      # CRUD de pacientes
│   │   ├── login/              # Página de login
│   │   └── registro/           # Página de cadastro
│   │
│   ├── lib/                    # Lógica de negócio
│   │   ├── actions/            # Server Actions
│   │   ├── supabase/           # Clients Supabase
│   │   ├── validations/        # Schemas Zod
│   │   ├── encryption.ts       # Criptografia AES-256
│   │   ├── tenant.ts           # Multi-tenancy helper
│   │   └── ip.ts               # Captura IP (LGPD)
│   │
│   ├── types/                  # TypeScript types
│   └── middleware.ts           # Proteção de rotas
│
├── supabase/
│   ├── migrations/             # SQL migrations
│   └── config.toml             # Configuração local
│
└── tests/                      # Testes unitários
```

---

## 🔒 Segurança

### Row Level Security (RLS)

Todas as tabelas possuem políticas RLS que garantem:

- Psicólogo só acessa **seus próprios dados**
- Isolamento completo entre tenants
- Proteção mesmo se houver bug no código

### LGPD Compliance

- ✅ Consentimento explícito com registro de data/IP
- ✅ Soft delete (dados mantidos por 5 anos - CFP)
- ✅ Criptografia de dados sensíveis
- ✅ Direito de acesso e portabilidade

### CFP (Conselho Federal de Psicologia)

- ✅ Validação de CRP no cadastro
- ✅ Campos obrigatórios de prontuário
- ✅ Retenção de 5 anos (Resolução 001/2009)

---

## 🧪 Testes

```bash
# Rodar testes
npm test

# Testes com UI
npm run test:ui

# Coverage
npm run test:coverage
```

---

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Iniciar build de produção |
| `npm run lint` | Verificar linting |
| `npm run format` | Formatar código |
| `npm test` | Rodar testes |
| `npm run test:coverage` | Testes com coverage |

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Conventional Commits

Este projeto usa [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova feature
- `fix:` Correção de bug
- `docs:` Documentação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Tarefas gerais

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**André Marques**

- GitHub: [@andrem91](https://github.com/andrem91)

---

<p align="center">
  Feito com ❤️ para psicólogos brasileiros
</p>