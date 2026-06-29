import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, email, password, role_id } = req.body;

  // Usa las variables de entorno de Vercel
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Falta la configuración de Supabase Service Role' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Crear el usuario usando la API de Admin de Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('Error desconocido al crear usuario');
    }

    // 2. Insertar los datos en la tabla pública "users"
    const { error: dbError } = await supabase.from('users').insert({
      id: authData.user.id,
      name,
      email,
      role_id
    });

    if (dbError) {
      // Intentar rollback en Auth si la DB falla
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(dbError.message);
    }

    return res.status(200).json({ success: true, user: authData.user });
  } catch (error: any) {
    console.error('Error in POST /api/users:', error);
    return res.status(400).json({ error: error.message || 'Error al crear usuario' });
  }
}
