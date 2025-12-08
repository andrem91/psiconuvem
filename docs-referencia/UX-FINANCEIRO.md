# Nova Experiência Financeira (UX) - PsicoNuvem

> "Gerenciar relacionamentos, não apenas transações."

Este documento detalha o conceito, o MVP (Mínimo Produto Viável) e a visão de futuro para o módulo financeiro do PsicoNuvem.

## 1. Conceito Central: "Patient-Centric Finance"

**Problema Atual**: O modelo tradicional "Contábil" (lista de lançamentos infinitos) desconecta o psicólogo do paciente. É difícil responder rápido: *"Quem está me devendo?"* ou *"Quanto a Maria tem que pagar?"*.

**Solução**: Inverter a visão. O átomo principal deixa de ser a **Sessão** e passa ser o **Paciente**.
O Psicólogo gerencia **Saldos de Pacientes**.

---

## 2. Escopo do MVP (O que faremos AGORA)

O foco é agilidade de cobrança e clareza imediata da saúde do consultório.

### A. Painel de Saúde (Topo)
Três métricas vitais que respondem "Como estou este mês?":
1.  **A Receber (Previsão)**: Soma de tudo agendado para o mês atual + Mensalidades do mês.
2.  **Recebido (Caixa)**: O que efetivamente entrou no mês.
3.  **Em Atraso (Alerta Total)**: Soma de **todas** as pendências vencidas (mesmo de meses anteriores). *Esse número deve zerar.*

### B. A Lista Inteligente de Pacientes
Substitui a tabela de sessões. Ordenada por prioridade: **Devedores primeiro**.

**Cada linha do Paciente mostra:**
-   **Nome/Foto**: Identificação rápida.
-   **Status Financeiro**:
    -   🔴 **Inadimplente**: Tem boleto/sessão vencida.
    -   🟡 **Aberto**: Tem sessões realizadas/agendadas não pagas (mas no prazo).
    -   🟢 **Em Dia**: Tudo pago.
-   **Resumo de Pendência**: "R$ 450,00 (2 sessões, 1 mensalidade)".
-   **Ações Imediatas (Hover/Direto)**:
    -   📱 **WhatsApp de Cobrança**: Gera mensagem automática: _"Olá [Nome], valor em aberto de R$ X referente a..."_
    -   ✅ **Baixar Pendências**: Modal rápido para marcar tudo como pago.

### C. Gaveta de Detalhes (Drawer)
Ao clicar no paciente, abre-se uma gaveta lateral (não sai da tela):
-   Lista cronológica (Extrato) apenas daquele paciente.
-   Opção de editar/excluir sessões específicas.
-   Histórico de pagamentos.

---

## 3. Visão de Futuro (Backlog de Ideias)

Melhorias para quando o MVP estiver consolidado.

### Automação & Inteligência
- [ ] **Régua de Cobrança Automática**: Enviar lembrete via WhatsApp/E-mail 1 dia antes e 1 dia depois do vencimento.
- [ ] **Links de Pagamento**: Gerar link do Asaas/Stripe/MercadoPago e enviar junto com a cobrança.
- [ ] **Conciliação Bancária**: Ler extrato OFX ou API do banco para baixar automático.

### Inteligência de Dados
- [ ] **Score do Paciente**: Identificar pagadores frequentes em atraso.
- [ ] **Previsão de Fluxo de Caixa**: Gráfico projetando os próximos 3 meses baseados na recorrência.

### Customização
- [ ] **Modelos de Mensagem**: Permitir o psicólogo editar os templates de cobrança do WhatsApp.
