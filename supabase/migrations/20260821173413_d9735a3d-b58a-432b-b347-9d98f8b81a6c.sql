create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  company text,
  message text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);
grant insert on public.inquiries to anon;
grant select, insert, update on public.inquiries to authenticated;
grant all on public.inquiries to service_role;
alter table public.inquiries enable row level security;
create policy "anyone can send an inquiry" on public.inquiries for insert to anon with check (true);
create policy "authenticated can send an inquiry" on public.inquiries for insert to authenticated with check (true);
create policy "staff read inquiries" on public.inquiries for select to authenticated using (public.is_staff(auth.uid()));
create policy "staff update inquiries" on public.inquiries for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));