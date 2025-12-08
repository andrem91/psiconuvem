# Nova Experiência de Pacientes (UX) - PsicoNuvem

> "Transformando cada cadastro em um relacionamento vivo."

Este documento detalha a renovação do módulo de Pacientes, focando em Retenção e Relacionamento (CRM).

## 1. Conceito Central: "Relationship Lifecycle"

**Problema Atual**: Uma lista estática (Nome/Email/Telefone). Não diz quem está vindo, quem sumiu ou quem precisa de atenção.
**Solução**: Um painel que mostra a saúde do relacionamento terapêutico.

---

## 2. Escopo do MVP (O que faremos AGORA)

### A. Lista Inteligente de Pacientes (Smart List)
Substituir a tabela padrão por uma lista rica com indicadores visuais.

**Novas Colunas/Indicadores:**
1.  **Status do Relacionamento**:
    -   🟢 **Ativo**: Teve sessão nos últimos 30 dias ou tem agendamento futuro.
    -   🟡 **Inativo**: Sem sessão há mais de 30 dias (Risco de Abandono).
    -   ⚪ **Arquivado**: Alta / Encerramento (Novo campo no banco).
2.  **Cronograma**:
    -   **Última Sessão**: data relativa (ex: "há 3 dias").
    -   **Próxima Sessão**: data futura (ex: "Sexta, 14:00") ou botão **"Agendar"** se vazio.
3.  **Financeiro Rápido**:
    -   Indicador discreto se está inadimplente (vermelho) ou em dia (verde).

### B. Filtros de Gestão
-   **Todos**
-   **Ativos** (Foco do dia a dia)
-   **Inativos** (Para ação de recuperação)
-   **Arquivados** (Histórico)

### C. Ações Rápidas (Quick Actions)
-   📅 **Agendar** (Abre modal de agendamento pré-preenchido).
-   💬 **WhatsApp** (Mensagem personalizada).

---

## 3. Visão de Futuro (Backlog)

- [ ] ** Tags/Etiquetas**: "Ansiedade", "Terapia de Casal", "Encaminhado por Dr. João".
- [ ] **Funil de Novos Pacientes (CRM)**: Coluna "Lead/Interessado" para quem entrou em contato mas não agendou.
- [ ] **Aniversariantes do Mês**: Card de destaque no topo.
- [ ] **Timeline Visual**: Linha do tempo gráfica com sessões, pagamentos e anotações.

---

## 4. Mudanças Técnicas Necessárias (MVP)

1.  **Banco de Dados**:
    -   Criar campo `status` em `Patient` (enum: ACTIVE, INACTIVE, ARCHIVED).
    -   (Opcional para MVP, pode ser calculado): Lógica de "Last Visit".
2.  **Backend**:
    -   `getPatientsWithStats()`: Buscar paciente + data da última/próxima consulta.
3.  **Frontend**:
    -   Refazer `/dashboard/pacientes/page.tsx`.
    -   Criar componente `PatientCard` ou `PatientRow` rico.
