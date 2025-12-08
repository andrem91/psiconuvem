# Nova Experiência do Site Profissional (UX) - PsicoNuvem

> "Seu cartão de visitas digital. Converta visitantes em pacientes."

Este documento detalha o design do Site Público (`/p/[slug]`), focando em **Autoridade** e **Conversão**.

## 1. Conceito Central: "The Conversion Funnel"

**Problema Atual**: Muitos psicólogos não têm site, ou usam Linktrees genéricos que não passam credibilidade.
**Solução**: Uma página de perfil profissional, otimizada para SEO, que guia o visitante para uma única ação: **Agendar** ou **Entrar em Contato**.

---

## 2. Escopo do MVP (O que faremos AGORA)

### A. Estrutura da Landing Page
Uma página única (Single Page), elegante e responsiva.
1.  **Hero Section (Topo)**:
    -   Foto profissional (Avatar grande).
    -   Nome e CRP.
    -   Título de impacto (ex: "Psicóloga Clínica Especialista em Ansiedade").
    -   **Botão Primário (CTA)**: "Agendar Consulta" (Link para WhatsApp).
2.  **Sobre Mim**:
    -   Texto biográfico curto e humanizado.
    -   Formação acadêmica (credibilidade).
3.  **Especialidades (Tags)**:
    -   Lista visual do que atende (ex: "Ansiedade", "Depressão", "Terapia de Casal").
4.  **Como Funciona**:
    -   Cards simples: "1. Entre em contato" -> "2. Agendamos o horário" -> "3. Terapia Online/Presencial".
5.  **Rodapé**:
    -   Endereço (com mapa Google integrado se presencial).
    -   Links sociais (Insta/LinkedIn).
    -   Selo "Powered by PsicoNuvem".

### B. Otimização para "WhatsApp First"
No Brasil, a conversa começa no Zap.
-   O botão de contato não abre só o app, ele já leva uma mensagem pronta:
    > *"Olá Dr(a). [Nome], vi seu site no PsicoNuvem e gostaria de saber sobre horários."*

### C. SEO Automático
-   O sistema gera automaticamente as metatags:
    -   Title: "Psicóloga [Nome] - Terapia Online"
    -   Description: "[Bio curta...]"
    -   OpenGraph (Imagem que aparece ao compartilhar no Zap).

---

## 3. Visão de Futuro (Backlog)

- [ ] **Auto-Agendamento**: O paciente vê os horários livres e marca sozinho (integrado com a Agenda).
- [ ] **Blog/Artigos**: Área para o psicólogo postar textos (atrair tráfego orgânico).
- [ ] **Vídeo de Apresentação**: Um vídeo de 1min do psicólogo se apresentando.
- [ ] **Depoimentos**: Área para feedbacks anônimos (com cuidado ético do CRP).

---

## 4. Mudanças Técnicas Necessárias (MVP)

1.  **Banco de Dados (`ProfessionalProfile`)**:
    -   Tabela já prevista, precisamos criar: `slug`, `themeColor`, `heroTitle`, `whatsappNumber`.
2.  **Frontend (Public Zone)**:
    -   Nova rota dinâmica `src/app/p/[slug]/page.tsx`.
    -   **Layout Isolado**: Não usa o sidebar do dashboard. Design limpo.
    -   **SSG/ISR**: Geração estática para ser ultra-rápido.
3.  **Editor do Perfil (Dashboard)**:
    -   Tela de configurações onde o psicólogo edita sua bio, foto e escolhe a "Cor Tema" do site.
