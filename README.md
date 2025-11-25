# 🧠 PsicoNuvem

> SaaS de Gestão Clínica + Presença Digital para Psicólogos Brasileiros

<div align="center">

[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.8-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-18-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Latest-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](CONTRIBUTING.md)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-fe5196?style=for-the-badge&logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)

**Status:** 🚧 Em Desenvolvimento Ativo (Sprint 1/6)

[Ver Documentação](docs/) · [Reportar Bug](https://github.com/SEU_USUARIO/psiconuvem/issues) · [Solicitar Feature](https://github.com/SEU_USUARIO/psiconuvem/issues)

</div>

---

## 📖 Sobre o Projeto

O **PsicoNuvem** é uma plataforma SaaS que une gestão clínica e presença digital para os **547 mil psicólogos brasileiros**.

### 🎯 Funcionalidades

- 📅 **Agenda Inteligente** - Slots dinâmicos + lembretes automáticos
- 📝 **Prontuário Eletrônico** - CFP/LGPD compliant
- 💰 **Gestão Financeira** - Asaas + NFS-e automática
- 🎥 **Telepsicologia** - LiveKit com criptografia E2E
- 🌐 **Site Profissional** - CMS integrado com agendamento público
- 🔒 **Compliance Total** - LGPD + Resolução CFP 09/2024

---

## 🏗️ Stack Tecnológica

<table>
<tr>
<td><b>Backend</b></td>
<td>Java 21 • Spring Boot 3.5.8 • PostgreSQL 16 • Redis 7.2</td>
</tr>
<tr>
<td><b>Frontend</b></td>
<td>Angular 18 • TailwindCSS 3.4 • PrimeNG 17</td>
</tr>
<tr>
<td><b>Cloud</b></td>
<td>AWS (EC2, RDS, S3, DynamoDB) • LocalStack (dev)</td>
</tr>
<tr>
<td><b>Integrações</b></td>
<td>Asaas • LiveKit • WhatsApp Business API</td>
</tr>
</table>

### Multi-tenancy

Isolamento automático via Hibernate Filter:

```java
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
public abstract class BaseEntity {
    @Column(name = "tenant_id", nullable = false)
    private String tenantId;
}
```

---

## 🚀 Quick Start

### Pré-requisitos

```bash
java -version   # 21+
node -v         # 20+
docker --version
mvn -version    # 3.8+
```

### Instalação

```bash
# 1. Clonar
git clone https://github.com/SEU_USUARIO/psiconuvem.git
cd psiconuvem

# 2. Configurar .env
cp .env.example .env
nano .env  # Preencher POSTGRES_PASSWORD e JWT_SECRET

# 3. Subir infra
cd infra && docker-compose up -d

# 4. Backend
cd ../backend/api && mvn spring-boot:run

# 5. Frontend (outro terminal)
cd ../../frontend/psiconuvem-app
npm install && ng serve
```

### Acessar

- Frontend: http://localhost:4200
- Backend: http://localhost:8080
- DynamoDB Admin: http://localhost:8001

---

## 📦 Estrutura

```
psiconuvem/
├── backend/api/          # Spring Boot
│   └── src/main/java/br/com/psiconuvem/
│       ├── core/         # Domain, Security
│       ├── modules/      # Tenant, User, Patient...
│       ├── infrastructure/
│       └── api/v1/
├── frontend/             # Angular
├── infra/               # Docker Compose
└── docs/                # Documentação
```

---

## 🌳 GitFlow

- **main** → Produção (protegida)
- **develop** → Desenvolvimento (protegida)
- **feature/\*** → Novas features
- **bugfix/\*** → Correções

### Commits

```bash
feat(patient): add CPF validation
fix(auth): resolve token expiration
docs(readme): update setup instructions
```

---

## 🗺️ Roadmap

| Sprint | Versão | Status | Entregas |
|--------|--------|--------|----------|
| 1 | v0.1.0 | 🚧 **Em Progresso** | Multi-tenancy + Auth JWT |
| 2 | v0.2.0 | 📋 Planejado | CRUD Pacientes + Agenda |
| 3 | v0.3.0 | 📋 Planejado | Site Público + CMS |
| 4 | v0.4.0 | 📋 Planejado | Asaas + NFS-e |
| 5 | v0.5.0 | 📋 Planejado | LiveKit + Auditoria |
| 6 | **v1.0.0** | 📋 Planejado | 🚀 **MVP Completo** |

**Duração:** 14 semanas

---

## 🧪 Testes

```bash
# Backend
mvn clean test
mvn jacoco:report  # Cobertura em target/site/jacoco/

# Frontend
npm run test
```

**Métricas:** Cobertura mínima 60% (target: 80%)

---

## 📚 Documentação

- [Guia de Contribuição](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)
- [Roadmap Detalhado](docs/RoadMap-gemini.md)
- [Plano de Negócio](docs/plano_negocio.md)

---

## 🤝 Contribuir

1. Fork o projeto
2. Crie branch (`git checkout -b feature/MinhaFeature`)
3. Commit (`git commit -m 'feat: adiciona MinhaFeature'`)
4. Push (`git push origin feature/MinhaFeature`)
5. Abra Pull Request

---

## 🔐 Segurança

- ✅ LGPD compliant (AES-256)
- ✅ Resolução CFP 09/2024
- ✅ Audit logs (DynamoDB)
- ✅ JWT + Rate limiting

**Vulnerabilidades:** [security@psiconuvem.com.br](mailto:security@psiconuvem.com.br)

---

## 📄 Licença

MIT License - Veja [LICENSE](LICENSE)

---

## 👨‍💻 Autor

**Seu Nome**

GitHub: [@seu-usuario](https://github.com/seu-usuario)  
LinkedIn: [Seu Perfil](https://linkedin.com/in/seu-perfil)

---

<div align="center">

**Feito com ❤️ para os psicólogos brasileiros**

⭐ Se este projeto te ajudou, considere dar uma estrela!

</div>