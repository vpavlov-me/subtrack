import { supabase } from '@/lib/supabase';

export function getServiceIconUrl(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  // assuming bucket 'icons' public
  return `${supabase.storage.from('icons').getPublicUrl(slug + '.png').data.publicUrl}`;
}
