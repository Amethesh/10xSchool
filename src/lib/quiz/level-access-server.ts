import { createClient } from '../supabase/server';

/**
 * Server-side function to check if user has admin role
 */
export async function checkAdminRole(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('admins')
    .select('role')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Failed to check admin role:', error.message);
    return false;
  }

  return data?.role === 'admin';
}