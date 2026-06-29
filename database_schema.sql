-- ==============================================================================
-- 🚀 REINICIO LIMPIO DE LA BASE DE DATOS: DISAGRO ERP
-- ==============================================================================
-- ADVERTENCIA: Esto borrará los datos actuales de las tablas para asegurar 
-- una instalación limpia y 100% compatible con el código.
-- Tus usuarios en "Authentication" (Correos/Contraseñas) NO se borrarán, 
-- pero sus perfiles sí, por lo que tendrás que volver a asignarles roles.
-- ==============================================================================

-- 1. Borrado limpio (En orden inverso para respetar las llaves foráneas)
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.proformas CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.areas CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

CREATE TABLE public.roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  is_system_admin boolean DEFAULT false,
  area_id uuid REFERENCES public.areas(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de ÁREAS
CREATE TABLE public.areas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla de USUARIOS (Perfiles)
CREATE TABLE public.users (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  role_id uuid REFERENCES public.roles(id) ON DELETE SET NULL,
  avatar_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabla de CLIENTES
CREATE TABLE public.clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name text NOT NULL,
  document_type text NOT NULL,
  document_number text NOT NULL,
  email text,
  phone text,
  address text,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabla de PROYECTOS
CREATE TABLE public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tabla de PROFORMAS
CREATE TABLE public.proformas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  correlative text NOT NULL,
  total_amount numeric(10,2) DEFAULT 0,
  status text DEFAULT 'draft',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Tabla de PRODUCTOS
CREATE TABLE public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  stock integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 🔐 RLS (Seguridad relajada para desarrollo)
-- ==============================================================================

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proformas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todo a autenticados" ON public.roles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a autenticados" ON public.areas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a autenticados" ON public.users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a autenticados" ON public.clients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a autenticados" ON public.projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a autenticados" ON public.proformas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a autenticados" ON public.products FOR ALL USING (auth.role() = 'authenticated');

-- ==============================================================================
-- 💡 DATOS INICIALES (Semilla)
-- ==============================================================================
INSERT INTO public.roles (name, is_system_admin) VALUES 
('Administración - Super Admin', true),
('Ventas - Ejecutivo', false),
('Operaciones', false);

-- Dar permisos EXPLÍCITOS a los roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

-- Refrescar la memoria caché de Supabase obligatoriamente
NOTIFY pgrst, 'reload schema';