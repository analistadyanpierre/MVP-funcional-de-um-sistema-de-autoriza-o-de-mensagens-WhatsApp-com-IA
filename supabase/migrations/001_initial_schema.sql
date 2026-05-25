-- WhatsApp Authorization MVP - Schema

create table if not exists public.rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  keywords text[] not null default '{}',
  action text not null check (action in ('approve', 'block', 'review', 'reply')),
  auto_reply text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_name text,
  sender_phone text not null,
  content text not null,
  ai_category text,
  ai_risk_level text check (ai_risk_level in ('low', 'medium', 'high')),
  ai_intent text,
  ai_decision text,
  ai_reason text,
  suggested_reply text,
  applied_rule_id uuid references public.rules(id) on delete set null,
  applied_rule_name text,
  status text not null default 'pending' check (
    status in ('approved', 'blocked', 'pending', 'replied', 'auto_replied')
  ),
  created_at timestamptz not null default now()
);

create table if not exists public.message_events (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  event_type text not null,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_status on public.messages(status);
create index if not exists idx_messages_created_at on public.messages(created_at desc);
create index if not exists idx_message_events_message_id on public.message_events(message_id);

alter table public.rules enable row level security;
alter table public.messages enable row level security;
alter table public.message_events enable row level security;

-- MVP: allow service role full access; anon read for demo (tighten in production)
create policy "Allow all for authenticated" on public.rules for all using (true) with check (true);
create policy "Allow all for authenticated messages" on public.messages for all using (true) with check (true);
create policy "Allow all for authenticated events" on public.message_events for all using (true) with check (true);

-- Seed default rules
insert into public.rules (name, keywords, action, auto_reply, active) values
  ('Bloquear spam', array['ganhe dinheiro', 'clique aqui', 'promoção falsa', 'loteria'], 'block', null, true),
  ('Aprovar saudações', array['olá', 'oi', 'bom dia', 'boa tarde', 'boa noite'], 'approve', null, true),
  ('Responder horário', array['horário', 'funcionamento', 'abre', 'fecha'], 'reply', 'Nosso horário de atendimento é de segunda a sexta, das 9h às 18h.', true),
  ('Revisar reclamações', array['reclamação', 'problema', 'insatisfeito', 'cancelar'], 'review', null, true)
;
