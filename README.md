# WhatsAuth IA — MVP de Autorização WhatsApp

Sistema web para receber mensagens do WhatsApp Business, analisar com IA, aplicar regras de autorização e decidir: aprovar, bloquear, responder automaticamente ou enviar para revisão humana.

## Stack

- **Frontend:** Next.js 15 + React 19 + Tailwind CSS 4
- **Backend:** API Routes (serverless) no Next.js
- **Banco:** Supabase (PostgreSQL)
- **IA:** OpenAI (`OPENAI_API_KEY`) — compatível com provedores similares
- **WhatsApp:** Webhook preparado em `/api/whatsapp/webhook`

## Funcionalidades

| Tela | Descrição |
|------|-----------|
| Dashboard | Cards de totais + últimas mensagens |
| Inbox | Lista com filtros por status |
| Detalhe | Modal com análise IA, regra, ações manuais e histórico |
| Regras | CRUD de regras por palavras-chave |
| Simulador | Envia mensagens de teste sem API real |

## Configuração

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No SQL Editor, execute o arquivo `supabase/migrations/001_initial_schema.sql`
3. Copie URL e chaves para `.env.local`

### 2. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=sk-...          # opcional
WHATSAPP_VERIFY_TOKEN=...      # token de verificação Meta
```

### 3. Instalar e rodar

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Fluxo do MVP

1. Cadastre regras em **Regras** (ou use as 4 regras seed)
2. Vá em **Simulador**, preencha nome, telefone e mensagem
3. Clique em **Processar mensagem** — IA + regras definem status
4. Veja resultado no simulador ou em **Inbox** / **Dashboard**
5. Abra **Detalhes** para aprovar, bloquear, marcar pendente ou enviar resposta
6. Histórico de eventos fica registrado em `message_events`

## Webhook WhatsApp

**Verificação (GET):**

```
GET /api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=SEU_TOKEN&hub.challenge=CHALLENGE
```

**Mensagens (POST):** payload padrão Meta Cloud API — extrai texto, salva, analisa e aplica regras.

Configure no Meta Developer:
- Callback URL: `https://seu-dominio.com/api/whatsapp/webhook`
- Verify Token: mesmo valor de `WHATSAPP_VERIFY_TOKEN`

## API (resumo)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/stats` | Estatísticas + recentes |
| GET | `/api/messages` | Listar mensagens |
| GET | `/api/messages/:id` | Detalhe + eventos |
| POST | `/api/messages/simulate` | Simular mensagem |
| POST | `/api/messages/:id/action` | Ação manual |
| GET/POST | `/api/rules` | Listar / criar regras |
| PATCH/DELETE | `/api/rules/:id` | Atualizar / excluir |
| GET/POST | `/api/whatsapp/webhook` | Webhook WhatsApp |

## Segurança

- Chaves de API **somente** no servidor (`.env.local`, nunca no frontend)
- `OPENAI_API_KEY` e `SUPABASE_SERVICE_ROLE_KEY` não são expostas ao browser
- Webhook valida token de verificação Meta
- Eventos auditáveis em `message_events`
- Estrutura pronta para autenticação Supabase Auth (RLS já habilitado)

## Deploy

Recomendado: [Vercel](https://vercel.com) com variáveis de ambiente configuradas.

```bash
npm run build
```

## Critério de aceite

- [x] Cadastrar regras
- [x] Simular mensagem recebida
- [x] Processar com IA (ou regras quando batem keywords)
- [x] Visualizar decisão sugerida
- [x] Aprovar / bloquear / revisar / responder manualmente
- [x] Histórico no dashboard e detalhe da mensagem
