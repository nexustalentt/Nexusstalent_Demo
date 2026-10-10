export const SUPABASE_PROJECT_ID = "jqzrucouqxbzcayropvu";

export const SUPABASE_SQL_EDITOR_URL = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`;

export const PRODUCTS_SQL_MIGRATION = `-- ==============================================================================
-- Products Table for Proprietary and Active Software Builds
-- Run this script in your Supabase project's SQL Editor (Dashboard -> SQL Editor)
-- URL: https://supabase.com/dashboard/project/jqzrucouqxbzcayropvu/sql/new
-- ==============================================================================

-- 1. Create the products table if it does not exist
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Web & Mobile Apps',
  status TEXT NOT NULL DEFAULT 'in_development',
  status_label TEXT,
  link_type TEXT NOT NULL DEFAULT 'website',
  website_url TEXT,
  preview_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  highlights TEXT[] NOT NULL DEFAULT '{}',
  version TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure link_type column exists if table was created previously without it
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS link_type TEXT NOT NULL DEFAULT 'website';

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to prevent conflicts when re-running
DROP POLICY IF EXISTS "Public read products" ON public.products;
DROP POLICY IF EXISTS "Staff insert products" ON public.products;
DROP POLICY IF EXISTS "Staff update products" ON public.products;
DROP POLICY IF EXISTS "Staff delete products" ON public.products;
DROP POLICY IF EXISTS "Allow anon insert products" ON public.products;
DROP POLICY IF EXISTS "Allow anon update products" ON public.products;
DROP POLICY IF EXISTS "Allow anon delete products" ON public.products;

-- 4. Create RLS policies
-- Allow everyone (public visitors, mobile devices, guest users) to view products
CREATE POLICY "Public read products" ON public.products
  FOR SELECT USING (true);

-- Allow authenticated staff members full access to manage products
CREATE POLICY "Staff insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Staff update products" ON public.products
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Staff delete products" ON public.products
  FOR DELETE TO authenticated USING (true);

-- Allow anon key (for server functions and client updates) to manage products
CREATE POLICY "Allow anon insert products" ON public.products
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update products" ON public.products
  FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow anon delete products" ON public.products
  FOR DELETE TO anon USING (true);

-- 5. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON public.products(sort_order);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);

-- 6. Insert default products (will not overwrite if they already exist)
INSERT INTO public.products (
  id, name, tagline, description, category, status, status_label, link_type, website_url, preview_url, tags, highlights, version, featured, sort_order, created_at, updated_at
) VALUES
(
  'prod-shopping-app-01',
  'NexusCart E-Commerce Shopping App',
  'Modern high-conversion shopping application with instant catalog search, multi-vendor cart, and 1-click checkout.',
  'Currently in active engineering. A flagship shopping platform featuring native mobile experience and high-performance Web storefront. Includes instant Algolia-grade catalog indexing, real-time inventory locking, localized payment gateways (Stripe, Apple Pay, Cards), and automated order fulfillment tracking.',
  'E-Commerce & Retail',
  'in_development',
  'Currently Working On',
  'website',
  'https://shop.nexustalent.io',
  'https://nexuscart-demo.vercel.app',
  ARRAY['React Native', 'Next.js 15', 'Stripe Checkout', 'Tailwind CSS', 'Redis Cache', 'Node.js'],
  ARRAY['Sub-200ms product catalog search & smart filters', 'Real-time stock reservation & shopping cart sync', 'Multi-currency localized checkout & shipping calculators', 'Omnichannel merchant administration & order dashboard'],
  'v0.9-WIP',
  true,
  1,
  '2026-09-15T10:00:00.000Z',
  '2026-10-10T12:00:00.000Z'
),
(
  'prod-zozii-ai-02',
  'Zozii Desktop AI Assistant',
  'Windows native AI co-pilot invisible to screen shares and meeting streams.',
  'Desktop Windows application applying DWM_EXCLUDEFROMCAPTURE protection and local WASAPI loopback audio taps to provide instant <320ms streaming answers in critical meetings.',
  'Desktop AI & Win32',
  'live',
  'Live & Production Ready',
  'website',
  '/zozii',
  'https://zozii-iota.vercel.app/',
  ARRAY['Electron 32', 'Direct3D Screen Guard', 'WASAPI Audio', 'Groq LLaMA-3.3', 'Gemini 1.5'],
  ARRAY['100% invisible to Zoom, Teams & Google Meet screen shares', 'Zero remote audio upload or recording (Local-First)', 'Sub-second word-by-word token streaming'],
  'v1.09.01',
  true,
  2,
  '2026-08-01T10:00:00.000Z',
  '2026-10-10T12:00:00.000Z'
),
(
  'prod-apex-clinic-03',
  'Apex Clinical Health Portal',
  'Digital patient booking, doctor scheduling, and HIPAA-compliant telehealth suite.',
  'Modern healthcare practice portal providing automated patient check-in, real-time calendar slot booking, doctor consultation video feeds, and EHR prescription synchronization.',
  'Healthcare SaaS',
  'in_development',
  'Currently Working On',
  'website',
  'https://apexclinic.health',
  'https://apexclinic.health/booking',
  ARRAY['TypeScript', 'WebRTC Video', 'PostgreSQL', 'FHIR Standards', 'Tailwind CSS'],
  ARRAY['Instant slot booking with doctor availability sync', 'Secure encrypted patient telemetry', 'Multi-clinic branch administration'],
  'v1.2-Beta',
  false,
  3,
  '2026-08-20T10:00:00.000Z',
  '2026-10-10T12:00:00.000Z'
),
(
  'prod-artisan-reserve-04',
  'Artisan Reserve Hospitality System',
  'Interactive digital dining table reservation, QR menu, and kitchen display platform.',
  'Comprehensive hospitality software that replaces legacy paper reservations with an interactive visual table map, SMS table-ready notifications, and real-time kitchen order routing.',
  'Hospitality & POS',
  'live',
  'Live in Production',
  'website',
  'https://artisancafe.com',
  'https://artisancafe.com/reserve',
  ARRAY['React', 'FastAPI', 'WebSockets', 'Stripe Terminal', 'PostgreSQL'],
  ARRAY['Live visual table map with seating timers', 'Automated SMS & WhatsApp guest reminders', 'Integrated kitchen display sync'],
  'v2.4.0',
  false,
  4,
  '2026-07-10T10:00:00.000Z',
  '2026-10-10T12:00:00.000Z'
),
(
  'prod-screenshot-saver-05',
  'Screenshot Saver (Windows)',
  'Lightweight high-speed desktop utility for rapid screen capture, instant annotations, and automatic disk saving.',
  'Windows desktop application designed for instant full-screen and region screenshot capture with automatic file saving, clipboard sync, and zero bloat.',
  'Desktop Tools & Windows',
  'live',
  'Direct Download',
  'exe',
  '/downloads/Screenshot.Saver.1.exe',
  'https://github.com/nexustalentt/jobconnect-x-e65f4f66/releases/tag/V01_S',
  ARRAY['Windows Utility', 'C++ / Win32', 'Screen Capture', 'Executable', 'Direct Download'],
  ARRAY['Instant background screen capture with customizable hotkeys', 'Direct .exe installer without complex dependencies', 'Automatic high-resolution image saving to local disk'],
  'v1.0 (V01_S)',
  true,
  5,
  '2026-10-10T14:18:00.000Z',
  '2026-10-10T14:18:00.000Z'
)
ON CONFLICT (id) DO NOTHING;
`;
