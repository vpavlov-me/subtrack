import { supabase } from '@/lib/supabase';

export async function skipOnboarding(): Promise<{ error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: { message: 'User not authenticated' } };
    }

    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_complete: true })
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to skip onboarding:', error);
      return { error };
    }

    // Update localStorage as fallback
    localStorage.setItem('onboarding_done', 'true');
    
    return { error: null };
  } catch (error) {
    console.error('Error skipping onboarding:', error);
    return { error: { message: 'Failed to skip onboarding' } };
  }
} 