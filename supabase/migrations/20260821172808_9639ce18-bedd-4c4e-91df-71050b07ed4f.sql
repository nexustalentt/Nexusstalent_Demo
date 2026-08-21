-- roles
create type public.app_role as enum ('admin','editor');
create type public.job_status as enum ('draft','active','closed','archived');
create type public.application_status as enum ('new','under_review','shortlisted','interview','selected','rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles readable by authenticated" on public.profiles for select to authenticated using (true);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','editor'))
$$;

create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)), new.email)
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- jobs
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  job_code text,
  title text not null,
  slug text not null unique,
  department text,
  location text,
  work_mode text,
  employment_type text,
  experience_min numeric,
  experience_max numeric,
  salary text,
  short_description text,
  description text,
  responsibilities text,
  requirements text,
  preferred_qualifications text,
  benefits text,
  skills text[] not null default '{}',
  application_method text not null default 'google_form',
  google_form_url text,
  form_id uuid,
  status public.job_status not null default 'draft',
  is_sample boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);
grant select on public.jobs to anon;
grant select, insert, update, delete on public.jobs to authenticated;
grant all on public.jobs to service_role;
alter table public.jobs enable row level security;
create policy "public can view active jobs" on public.jobs for select to anon using (status = 'active');
create policy "staff can view all jobs" on public.jobs for select to authenticated using (public.is_staff(auth.uid()));
create policy "staff manage jobs" on public.jobs for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger jobs_updated_at before update on public.jobs for each row execute function public.update_updated_at_column();
create index jobs_status_idx on public.jobs(status);

create table public.forms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  google_form_url text not null,
  description text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.forms to authenticated;
grant all on public.forms to service_role;
alter table public.forms enable row level security;
create policy "staff manage forms" on public.forms for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger forms_updated_at before update on public.forms for each row execute function public.update_updated_at_column();
alter table public.jobs add constraint jobs_form_fk foreign key (form_id) references public.forms(id) on delete set null;

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id) on delete set null,
  candidate_name text not null,
  email text not null,
  phone text,
  location text,
  experience text,
  skills text[] not null default '{}',
  resume_url text,
  source text not null default 'google_form',
  status public.application_status not null default 'new',
  notes text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.applications to authenticated;
grant all on public.applications to service_role;
alter table public.applications enable row level security;
create policy "staff manage applications" on public.applications for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger applications_updated_at before update on public.applications for each row execute function public.update_updated_at_column();
create index applications_job_idx on public.applications(job_id);

create table public.application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  old_status public.application_status,
  new_status public.application_status not null,
  changed_by uuid,
  note text,
  created_at timestamptz not null default now()
);
grant select, insert on public.application_events to authenticated;
grant all on public.application_events to service_role;
alter table public.application_events enable row level security;
create policy "staff view events" on public.application_events for select to authenticated using (public.is_staff(auth.uid()));
create policy "staff insert events" on public.application_events for insert to authenticated with check (public.is_staff(auth.uid()));

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  actor_id uuid,
  actor_email text,
  details jsonb,
  created_at timestamptz not null default now()
);
grant select, insert on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;
alter table public.audit_logs enable row level security;
create policy "staff view audit" on public.audit_logs for select to authenticated using (public.is_staff(auth.uid()));
create policy "staff insert audit" on public.audit_logs for insert to authenticated with check (public.is_staff(auth.uid()));

create table public.site_settings (
  id boolean primary key default true,
  company_name text not null default 'Nexus Talent',
  company_email text,
  recruitment_email text,
  phone text,
  address text,
  business_hours text,
  linkedin_url text,
  twitter_url text,
  years_experience text,
  professionals_placed text,
  enterprise_clients text,
  successful_projects text,
  notify_on_new_application boolean not null default true,
  notify_on_shortlist boolean not null default false,
  notify_on_interview boolean not null default false,
  notify_on_selected boolean not null default false,
  seo_title text,
  seo_description text,
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id)
);
grant select on public.site_settings to anon;
grant select, insert, update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "public read settings" on public.site_settings for select to anon using (true);
create policy "auth read settings" on public.site_settings for select to authenticated using (true);
create policy "staff update settings" on public.site_settings for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "staff insert settings" on public.site_settings for insert to authenticated with check (public.is_staff(auth.uid()));
create trigger site_settings_updated_at before update on public.site_settings for each row execute function public.update_updated_at_column();

insert into public.site_settings (id, company_email, recruitment_email, phone, address, business_hours, linkedin_url, years_experience, professionals_placed, enterprise_clients, successful_projects, seo_title, seo_description)
values (true,'info@nexustalent.com','careers@nexustalent.com','+91 80 4718 2200','Prestige Tech Park, Outer Ring Road, Bangalore 560103, India','Monday – Friday, 9:00 AM – 6:00 PM IST','https://www.linkedin.com','15','12,000+','500+','1,200+','Nexus Talent — Consultancy, Staffing & Recruitment','Consulting, staffing and recruitment solutions that help enterprises build high-performing teams.');

insert into public.jobs (job_code,title,slug,department,location,work_mode,employment_type,experience_min,experience_max,salary,short_description,description,responsibilities,requirements,preferred_qualifications,benefits,skills,google_form_url,status,is_sample,published_at) values
('SAMPLE-QA-001','Software QA Engineer','software-qa-engineer-bangalore','Engineering','Bangalore, India','Hybrid','Full Time',2,5,'Competitive','Own functional and automation testing for enterprise web platforms.','You will join a quality engineering pod embedded with an enterprise client, owning test strategy for a large web platform used by thousands of internal users.','Design and execute functional, regression and API test suites.
Build and maintain Selenium automation frameworks.
Partner with developers on defect triage and root-cause analysis.','2–5 years of software testing experience.
Strong Java and Selenium WebDriver skills.
Hands-on API testing and SQL query experience.','ISTQB certification.
Exposure to CI pipelines and performance testing.','Health insurance, certification sponsorship, hybrid working.','{"Java","Selenium","API Testing","SQL"}','https://docs.google.com/forms/d/e/1FAIpQLSf_sample_qa/viewform','active',true, now() - interval '3 days'),
('SAMPLE-JAVA-002','Senior Java Developer','senior-java-developer-pune','Engineering','Pune, India','Remote','Full Time',5,9,'Competitive','Build scalable microservices for a global banking client.','A senior backend role on a long-running modernisation programme for a tier-one banking client, migrating monolithic services to a cloud-native microservice estate.','Design and build Spring Boot microservices.
Lead code reviews and mentor mid-level engineers.
Own service reliability and performance targets.','5+ years of Java engineering experience.
Deep Spring Boot and REST API expertise.
Experience with Kafka and relational databases.','AWS certification.
Domain experience in banking or payments.','Remote-first working, annual learning budget, insurance for family.','{"Java","Spring Boot","Kafka","AWS","Microservices"}','https://docs.google.com/forms/d/e/1FAIpQLSf_sample_java/viewform','active',true, now() - interval '6 days'),
('SAMPLE-DATA-003','Data Analyst','data-analyst-hyderabad','Analytics','Hyderabad, India','Hybrid','Full Time',2,4,'Competitive','Turn operational data into decisions for retail leadership teams.','Work alongside a retail client''s commercial team, building the reporting layer that leadership uses for weekly trading decisions.','Build and maintain Power BI dashboards.
Write performant SQL for analytical models.
Present findings to business stakeholders.','2–4 years in an analytics role.
Advanced SQL and Power BI or Tableau.
Strong communication skills.','Python for data wrangling.
Retail or e-commerce domain exposure.','Health insurance, flexible hours, upskilling programme.','{"SQL","Power BI","Excel","Python"}','https://docs.google.com/forms/d/e/1FAIpQLSf_sample_data/viewform','active',true, now() - interval '9 days'),
('SAMPLE-SAP-004','SAP Consultant','sap-consultant-mumbai','Consulting','Mumbai, India','On-site','Contract',6,12,'Day rate, negotiable','Lead SAP S/4HANA functional workstreams for manufacturing clients.','A client-facing consulting role delivering S/4HANA rollouts across manufacturing plants in western India.','Run requirement workshops with business owners.
Configure SAP MM and PP modules.
Support cutover, hypercare and knowledge transfer.','6+ years of SAP functional consulting.
At least two end-to-end S/4HANA implementations.
Willingness to travel to plant locations.','SAP certification.
Experience with Fiori applications.','Competitive day rate, travel allowance, extension potential.','{"SAP S/4HANA","SAP MM","SAP PP","Fiori"}','https://docs.google.com/forms/d/e/1FAIpQLSf_sample_sap/viewform','active',true, now() - interval '12 days'),
('SAMPLE-DEVOPS-005','DevOps Engineer','devops-engineer-bangalore','Engineering','Bangalore, India','Remote','Full Time',4,8,'Competitive','Automate delivery pipelines for regulated enterprise workloads.','Join a platform engineering team responsible for the CI/CD and observability tooling used by 200+ engineers at an insurance client.','Own Terraform modules and Kubernetes manifests.
Improve pipeline reliability and deployment frequency.
Embed security scanning into CI.','4+ years in DevOps or platform engineering.
Strong Kubernetes, Terraform and CI/CD experience.
Scripting in Python or Bash.','CKA certification.
Experience with regulated environments.','Remote working, certification budget, on-call allowance.','{"Kubernetes","Terraform","Docker","CI/CD","AWS"}',null,'active',true, now() - interval '15 days'),
('SAMPLE-BA-006','Business Analyst','business-analyst-gurugram','Consulting','Gurugram, India','Hybrid','Full Time',3,6,'Competitive','Bridge business intent and delivery teams on transformation programmes.','Support a large transformation programme for a telecommunications client, translating business outcomes into deliverable requirements.','Elicit and document business requirements.
Own process maps and user stories.
Facilitate UAT with business users.','3–6 years as a business analyst.
Strong stakeholder management.
Agile delivery experience.','Telecom domain knowledge.
CBAP or equivalent certification.','Health insurance, hybrid working, structured career path.','{"Requirements Analysis","Agile","JIRA","Process Mapping"}',null,'draft',true, null);