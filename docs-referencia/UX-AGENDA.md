# Nova Experiência de Agenda (UX) - PsicoNuvem

> "Seu dia, visualizado. Gestão de tempo sem esforço."

Este documento detalha a renovação do módulo de Agenda, focando em Gestão do Tempo e Redução de No-Shows.

## 1. Conceito Central: "The Daily Cockpit"

**Problema Atual**: Uma lista estática de "próximos agendamentos" que não dá a noção visual de **tempo**, **intervalos** ou **sobreposições**.
**Solução**: Uma visualização cronológica do DIA (Day View) que destaca o "Agorismo" (o que está acontecendo agora) e o "Próximo Passo".

---

## 2. Escopo do MVP (O que faremos AGORA)

### A. Visualização Cronológica (Timeline do Dia)
Em vez de cards soltos, uma linha do tempo vertical (ex: 08:00 às 20:00).
-   **Slots de Atendimento**: Blocos coloridos ocupando o espaço proporcional à duração (50min).
-   **Indicador de "AGORA"**: Uma linha horizontal vermelha mostrando o horário atual.
-   **Gaps Visuais**: Espaços em branco mostram claramente onde há janela livre.

### B. Navegação Rápida
-   **Mini-Calendário**: Calendário pequeno à esquerda para pular rapidamente para qualquer data.
-   **Botões "Ontem / Hoje / Amanhã"**: Navegação ágil no topo.

### C. Smart Cards de Agendamento
O bloco do agendamento deve mostrar info crítica:
-   **Status Visual**:
    -   🟦 Azul: Agendado (Futuro)
    -   🟩 Verde: Realizado (Concluído)
    -   🟥 Vermelho: Faltou (No-Show)
    -   ⬜ Cinza: Cancelado
-   **Ações Rápidas (Hover/Menu)**:
    -   ✅ **Confirmar Presença**: O paciente chegou.
    -   💸 **Receber**: Atalho para modal de pagamento (se não tiver plano).
    -   📞 **Link**: Atalho para Meet/WhatsApp.

### D. Redução de No-Show (MVP Manual)
-   **Botão "Lembrete via Zap"**: Um botão pequeno no card que gera o link: *"Olá [Nome], confirmando nossa sessão de hoje às [Horario]."*

---

## 3. Visão de Futuro (Backlog)

- [ ] **Drag & Drop**: Arrastar agendamento para mudar horário.
- [ ] **Semana / Mês**: Visualizações expandidas.
- [ ] **Integração Google Calendar**: Sync bidirecional.
- [ ] **Bloqueio de Horários**: "Almoço", "Compromisso Pessoal".
- [ ] **Detecção de Conflitos Visual**: Mostrar aviso vermelho se tentar agendar em horário ocupado.

---

## 4. Mudanças Técnicas Necessárias (MVP)

1.  **Frontend**:
    -   Criar `DayTimeline`: Componente que desenha o grid de horas.
    -   Criar `AppointmentBlock`: O card posicionado com `top` e `height` baseados em CSS (cálculo de minutos).
    -   Estado global de data selecionada (via URL Query Param `?date=YYYY-MM-DD`).
2.  **Backend**:
    -   Ajustar `getAppointments` para garantir que retorne TUDO do dia selecionado (incluindo cancelados para histórico).
3.  **Utils**:
    -   `timeToPixels(time)`: Função para converter "08:30" em posição absoluta na tela.
