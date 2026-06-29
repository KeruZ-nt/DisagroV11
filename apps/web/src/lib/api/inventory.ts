import { supabase } from '@/lib/supabase';

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data;
}

export async function upsertProductsFromExcel(products: any[]) {
  // En Supabase, para hacer upsert masivo por nombre (que es UNIQUE):
  // Necesitamos asegurarnos que los datos tienen el formato correcto
  const formattedProducts = products
    .map((p) => ({
      name: String(p.name).trim(),
      description: p.description ? String(p.description).trim() : null,
      unit_price: Number(p.unit_price) || 0,
      stock: Number(p.stock) || 0,
      updated_at: new Date().toISOString(),
    }))
    .filter((p) => p.name !== '');

  if (formattedProducts.length === 0)
    return { success: false, error: 'No valid products found' };

  const { error } = await supabase
    .from('products')
    .upsert(formattedProducts, { onConflict: 'name' });

  if (error) {
    throw new Error(`Error guardando productos: ${error.message}`);
  }

  const { notifyAdmin } = await import('./notifications');
  await notifyAdmin(
    `Inventario actualizado masivamente por Excel (${products.length} filas procesadas).`,
    'success'
  );

  return { success: true };
}

export async function createProduct(product: {
  name: string;
  description?: string;
  unit_price: number;
  stock: number;
}) {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateProduct(
  id: string,
  product: {
    name?: string;
    description?: string;
    unit_price?: number;
    stock?: number;
  }
) {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteProduct(productId: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);
  if (error) throw new Error(error.message);

  return { success: true };
}
