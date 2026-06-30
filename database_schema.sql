-- ==============================================================================
-- 🚀 REINICIO LIMPIO DE LA BASE DE DATOS: DISAGRO ERP
-- ==============================================================================
-- ADVERTENCIA: Esto borrará los datos actuales de las tablas para asegurar 
-- una instalación limpia y 100% compatible con el código frontend.
-- Tus usuarios en "Authentication" (Correos/Contraseñas) NO se borrarán, 
-- pero sus perfiles sí, por lo que tendrás que volver a asignarles roles.
-- ==============================================================================

-- 1. Borrado limpio (En orden inverso para respetar las llaves foráneas)
DROP TABLE IF EXISTS public.calendar_events CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.proformas CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.areas CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

-- 2. Tabla de ÁREAS
CREATE TABLE public.areas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de ROLES
CREATE TABLE public.roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  is_system_admin boolean DEFAULT false,
  area_id uuid REFERENCES public.areas(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla de USUARIOS (Perfiles)
CREATE TABLE public.users (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  role_id uuid REFERENCES public.roles(id) ON DELETE SET NULL,
  avatar_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabla de CLIENTES
CREATE TABLE public.clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  company text,
  email text,
  phone text,
  location text,
  notes text,
  status text DEFAULT 'active',
  assigned_salesperson_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabla de PROYECTOS
CREATE TABLE public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE,
  title text NOT NULL,
  description text,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  assigned_salesperson_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  status text DEFAULT 'PENDING',
  expected_revenue numeric(10,2) DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tabla de PROFORMAS
CREATE TABLE public.proformas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  items jsonb DEFAULT '[]'::jsonb,
  total numeric(10,2) DEFAULT 0,
  expiration_date timestamp with time zone,
  issue_date timestamp with time zone DEFAULT timezone('utc'::text, now()),
  status text DEFAULT 'PENDING',
  generated_file_url text,
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

-- 9. Tabla de EVENTOS DE CALENDARIO
CREATE TABLE public.calendar_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  type text NOT NULL,
  event_date timestamp with time zone NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  related_project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  target_role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE,
  target_area_id uuid REFERENCES public.areas(id) ON DELETE CASCADE,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Tabla de NOTIFICACIONES
CREATE TABLE public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  type text NOT NULL,
  read boolean DEFAULT false,
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
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir todo a autenticados" ON public.roles;
DROP POLICY IF EXISTS "Permitir todo a autenticados" ON public.areas;
DROP POLICY IF EXISTS "Permitir todo a autenticados" ON public.users;
DROP POLICY IF EXISTS "Permitir todo a autenticados" ON public.clients;
DROP POLICY IF EXISTS "Permitir todo a autenticados" ON public.projects;
DROP POLICY IF EXISTS "Permitir todo a autenticados" ON public.proformas;
DROP POLICY IF EXISTS "Permitir todo a autenticados" ON public.products;
DROP POLICY IF EXISTS "Permitir todo a autenticados" ON public.calendar_events;
DROP POLICY IF EXISTS "Permitir todo a autenticados" ON public.notifications;

CREATE POLICY "Permitir todo a autenticados" ON public.roles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a autenticados" ON public.areas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a autenticados" ON public.users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a autenticados" ON public.clients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a autenticados" ON public.projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a autenticados" ON public.proformas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a autenticados" ON public.products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a autenticados" ON public.calendar_events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a autenticados" ON public.notifications FOR ALL USING (auth.role() = 'authenticated');

-- ==============================================================================
-- 🗂 BUCKET DE AVATARES
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update their own avatar." ON storage.objects;

CREATE POLICY "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Anyone can upload an avatar." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Anyone can update their own avatar." ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'avatars');

-- ==============================================================================
-- 📡 HABILITAR REALTIME
-- ==============================================================================
-- Esto es necesario para que las notificaciones lleguen en tiempo real (websockets)
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ==============================================================================
-- 💡 DATOS INICIALES (Semilla)
-- ==============================================================================
INSERT INTO public.areas (id, name) VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Administración'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Ventas'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Operaciones')
ON CONFLICT DO NOTHING;

INSERT INTO public.roles (name, is_system_admin, area_id) VALUES 
('Super Admin', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('Ejecutivo', false, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'),
('Especialista', false, 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33')
ON CONFLICT DO NOTHING;

-- Dar permisos EXPLÍCITOS a los roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

-- Refrescar la memoria caché de Supabase obligatoriamente
NOTIFY pgrst, 'reload schema';