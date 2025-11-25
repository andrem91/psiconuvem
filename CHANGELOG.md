# Changelog

Todas as mudanças notáveis do projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

### Planejado
- Multi-tenancy com isolamento de dados
- Autenticação JWT
- CRUD de Pacientes
- Sistema de Agenda
- Site público do psicólogo

---

## [0.0.1] - 2025-11-25

### Adicionado
- Setup inicial do projeto
- Docker Compose com PostgreSQL, Redis e LocalStack
- Estrutura Spring Boot 3.5.8
- Configuração de ambientes (dev/prod)
- Migration Flyway inicial (tenants e users)
- Dependências JWT e MapStruct
- Configuração de GitFlow
- Documentação inicial (README, CONTRIBUTING)

### Segurança
- .gitignore configurado para proteger .env
- Variáveis de ambiente para credenciais sensíveis
- Separação de buckets S3 por tipo de dado

---

## Tipos de Mudanças
- **Adicionado** - para novas funcionalidades
- **Alterado** - para mudanças em funcionalidades existentes
- **Descontinuado** - para funcionalidades que serão removidas
- **Removido** - para funcionalidades removidas
- **Corrigido** - para correção de bugs
- **Segurança** - em caso de vulnerabilidades
