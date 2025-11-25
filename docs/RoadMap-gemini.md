Aqui está o **Roadmap de Execução Definitivo do PsicoNuvem**, atualizado com todas as correções estratégicas (Agenda Real, NFS-e Nativa, LiveKit) e focado na realidade de um desenvolvedor solo aprendendo AWS.

Este é o seu guia dia-a-dia para os próximos 3 meses.

---

# 📅 Roadmap de Execução: PsicoNuvem (Versão Final)

**Premissas:**
* **Ciclo:** Sprints de 2 semanas (10 dias úteis).
* **Foco:** Java Spring Boot + AWS (simulado via LocalStack) + Angular.
* **Meta:** MVP validado e vendável em 12 semanas.

---

## 🏗️ Sprint 1: Fundação, Infra e Multi-tenancy
**Objetivo:** Ter o ambiente de desenvolvimento pronto e o isolamento de dados garantido (Segurança).

* **Dias 1-2: "O Chão de Fábrica" (Infra Local)**
    * [ ] Configurar `docker-compose.yml` com **LocalStack** (S3, SQS, DynamoDB) e **PostgreSQL**.
    * [ ] Criar script `init-aws.sh` para levantar os buckets e filas automaticamente.
    * [ ] Inicializar projeto Spring Boot (Monolito Modular) e Angular (Standalone).
* **Dias 3-5: O Core Multi-tenant (Segurança)**
    * [ ] Implementar Entidade Base com `tenant_id`.
    * [ ] Configurar **Hibernate Filter** para injetar `WHERE tenant_id = ?` em todas as queries.
    * [ ] Criar Aspecto (`@Aspect`) que ativa o filtro baseado no Contexto do Usuário.
* **Dias 6-7: Autenticação & Frontend Base**
    * [ ] Implementar Spring Security + JWT.
    * [ ] Criar Telas de Login e Registro no Angular.
    * [ ] Configurar Interceptor no Angular para enviar o Token JWT.
* **Dias 8-10: Qualidade & Testes**
    * [ ] Configurar **Testcontainers** (Java) para testes de integração reais.
    * [ ] Escrever teste que prova que o Usuário A não vê dados do Usuário B.

---

## 🏥 Sprint 2: Core Clínico & Agenda Real
**Objetivo:** O psicólogo consegue cadastrar pacientes, configurar horários e atender.

* **Dias 1-3: Gestão de Pacientes**
    * [ ] Backend: CRUD de Pacientes (`Patient` entity).
    * [ ] Frontend: Lista com busca e Formulário de Cadastro.
* **Dias 4-6: Agenda Real (Mudança Crítica)**
    * [ ] Backend: Criar tabelas `Availability` (Configuração de horários do psicólogo) e `Appointment` (Agendamentos).
    * [ ] Lógica: Algoritmo que cruza disponibilidade x agendamentos para retornar "Slots Livres".
    * [ ] Frontend: Visualização de Calendário (Admin) para o psicólogo ver seu dia.
* **Dias 7-9: Prontuário Flexível (JSONB)**
    * [ ] Backend: Entidade `ClinicalRecord` usando coluna `jsonb` no PostgreSQL para guardar a evolução da sessão.
    * [ ] Frontend: Tela de "Linha do Tempo" do paciente.
* **Dia 10: Anexos (S3 Local)**
    * [ ] Implementar Upload de Arquivos via **Presigned URLs** apontando para o LocalStack.

---

## 🌐 Sprint 3: O "Consultório Digital" (Diferencial)
**Objetivo:** Gerar o site público do psicólogo e permitir agendamento externo.

* **Dias 1-2: CMS & Configuração**
    * [ ] Backend: Endpoints públicos `/api/public/profile/{slug}`.
    * [ ] Frontend Admin: Tela para psicólogo subir foto, bio e escolher cor do tema.
* **Dias 3-5: O Site Público (Frontend)**
    * [ ] Criar Layout Público no Angular (sem autenticação).
    * [ ] Consumir a **Agenda Real** (da Sprint 2) para mostrar horários livres aos visitantes.
    * [ ] Implementar fluxo: Visitante escolhe horário -> Preenche Nome/Zap -> Cria `Appointment` provisório.
* **Dias 6-7: Blog & SEO**
    * [ ] CRUD simples de Artigos (`BlogPost`).
    * [ ] Configurar Angular Meta Service para injetar Tags SEO dinâmicas (Title, Description).
* **Dias 8-10: Domínios & Viral Loop**
    * [ ] Backend: Lógica para ler Header `Host` e identificar tenant.
    * [ ] Frontend: Implementar rodapé *"Powered by PsicoNuvem"* nos sites gratuitos.

---

## 💰 Sprint 4: Monetização & Fiscal
**Objetivo:** Garantir a receita e a conformidade fiscal (NFS-e).

* **Dias 1-3: Integração Asaas (Trial 30 Dias)**
    * [ ] Client Java para criar Cliente e Assinatura no Asaas.
    * [ ] Lógica de Trial: Cadastro libera acesso imediato, bloqueio só ocorre em D+30.
* **Dias 4-5: Webhooks & SQS**
    * [ ] Configurar Fila SQS `payment-webhooks` no LocalStack.
    * [ ] Endpoint que recebe POST do Asaas e joga na fila.
    * [ ] Worker que processa: `PAYMENT_RECEIVED` -> Renova Acesso.
* **Dias 6-7: Bloqueio Automático**
    * [ ] Middleware que checa `subscription_status` e `expiration_date`.
    * [ ] Tela de "Bloqueio/Renovação" no Frontend.
* **Dias 8-10: NFS-e Nativa (Simplificação)**
    * [ ] Configurar no painel do Asaas a emissão automática de NFS-e (Municipal).
    * [ ] Backend: Escutar webhook de `INVOICE_CREATED` do Asaas.
    * [ ] Salvar o PDF da nota (link do Asaas) no histórico financeiro do psicólogo.

---

## 🎥 Sprint 5: Telemedicina & Auditoria
**Objetivo:** Vídeo estável e Rastreabilidade (LGPD).

* **Dias 1-4: Vídeo (LiveKit)**
    * [ ] Backend: Integrar SDK LiveKit para gerar Token JWT de sala.
    * [ ] Frontend: Criar componente de Sala de Vídeo (usando componentes prontos do LiveKit).
    * [ ] Regra: Botão "Entrar" só ativa 10 min antes do agendamento.
* **Dias 5-6: Notificações Simples**
    * [ ] Botão "Enviar Lembrete WhatsApp" (Gera link `wa.me` com texto pronto).
    * [ ] E-mail de confirmação de agendamento (usando AWS SES simulado ou SMTP simples).
* **Dias 7-9: Auditoria (DynamoDB)**
    * [ ] Configurar tabela `audit_logs` no LocalStack.
    * [ ] Criar Aspecto Java que intercepta ações críticas e salva log no DynamoDB.
* **Dia 10: Polimento Geral**
    * [ ] Resolver bugs acumulados e débitos técnicos.

---

## 🧪 Sprint 6: Validação & Go Live (Produção)
**Objetivo:** Sair do LocalStack para AWS Real e Validar com usuários.

* **Dias 1-3: Infraestrutura AWS Real**
    * [ ] Criar conta AWS e configurar Billing Alerts (Orçamento).
    * [ ] Provisionar RDS (Postgres), Buckets S3 e Tabela DynamoDB reais.
    * [ ] Deploy do Backend (EC2/Elastic Beanstalk) e Frontend (S3+CloudFront).
* **Dias 4-8: Semana de Validação (Buffer)**
    * [ ] **Ação:** Convidar 5-10 conhecidos/psicólogos para usar o sistema gratuitamente (Beta).
    * [ ] **Regra:** PROIBIDO codar novas features. Foco apenas em corrigir bugs críticos encontrados por eles.
* **Dia 9: Configuração Final**
    * [ ] Configurar Domínio Oficial (`psiconuvem.com.br`).
    * [ ] Certificados SSL.
* **Dia 10: LANÇAMENTO 🚀**
    * [ ] Abrir cadastro para o público.
    * [ ] Ativar campanhas de marketing (se houver).

---

### Definição de Pronto (DoD) - Para cada dia
Para considerar uma tarefa "Feita" neste roadmap:
1.  Funciona no LocalStack (sem erros no console).
2.  O código está no Git (Branch `feature/` mergeado na `develop`).
3.  Testes básicos (caminho feliz) passaram.