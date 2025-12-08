# Nova Experiência de Prontuário Clínico (UX) - PsicoNuvem

> "Sua escrita clínica, fluida e segura. Foque na escuta, não na burocracia."

Este documento detalha o design do módulo de Prontuário (Clinical Notes), focando na experiência de escrita e na evolução do paciente.

## 1. Conceito Central: "The Therapeutic Timeline"

**Problema Comum**: Prontuários costumam ser formulários frios e desconectados, onde é difícil lembrar o que foi tratado há 3 sessões.
**Solução**: Uma **Linha do Tempo Evolutiva** que coloca a sessão atual em contexto com as anteriores.

---

## 2. Escopo do MVP (O que faremos AGORA)

### A. Editor de Sessão "Distraction-Free"
Uma tela limpa para escrita durante ou pós-sessão.
-   **Auto-Save**: Salvamento automático a cada digitação para evitar perda de dados.
-   **Cabeçalho Automático**: Data, Hora, Número da Sessão (calculado), Tipo (Online/Presencial).
-   **Editor Rico (Markdown ou Tiptap)**: Negrito, itálico, listas, mas sem excessos.

### B. Linha do Tempo Lateral (Contexto)
Enquanto escreve a nota atual, uma barra lateral mostra os **resumos das últimas 3 sessões**.
-   **Objetivo**: Lembrar rapidamente "onde paramos" e "quais tarefas de casa foram passadas".
-   **Navegação**: Clicar em uma data anterior carrega aquela nota para leitura (read-only).

### C. Segurança Visível
Indicadores claros de que o conteúdo é protegito.
-   🔒 **Badge "Criptografado de Ponta a Ponta"**: Reforça a segurança técnica (AES-256).
-   👁️ **Modo Privacidade/Blur**: Um botão para "borrar" o texto rapidamente se alguém entrar na sala.

### D. Templates Rápidos
Botões para inserir estruturas comuns:
-   *Template SOAP* (Subjetivo, Objetivo, Avaliação, Plano).
-   *Template Anamnese* (para primeira consulta).
-   *Template GAP* (Geral, Análise, Pendências).

---

## 3. Visão de Futuro (Backlog)

- [ ] **Voice-to-Text**: Ditar a evolução após a sessão.
- [ ] **Insights via IA**: Resumo automático de temas recorrentes ("Paciente citou 'ansiedade' em 4 das últimas 5 sessões").
- [ ] **Anexos Seguros**: Upload de desenhos/fotos de atividades.
- [ ] **Exportação PDF Assinada**: Gerar documento oficial para fins jurídicos.

---

## 4. Mudanças Técnicas Necessárias (MVP)

1.  **Backend**:
    -   `ClinicalNote` schema (já existe).
    -   `getClinicalHistory(patientId)`: Buscar notas ordenadas.
    -   `saveClinicalNote()`: Com criptografia AES-256 (já temos lib de encryption).
2.  **Frontend**:
    -   `NoteEditor`: Componente com estado local e debounce para auto-save.
    -   `HistorySidebar`: Lista lateral.
    -   `SecurityBadge`: Componente visual.
