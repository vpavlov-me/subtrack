import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { supabase } from '@/lib/supabase';

interface Ctx {
  step: number;
  next: () => void;
  prev: () => void;
  complete: () => void;
}

const OnboardingContext = createContext<Ctx | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_complete')
          .single();

        if (profile?.onboarding_complete) {
          setStep(4); // done
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
        // Fallback to localStorage check
        const stored = localStorage.getItem('onboarding_done');
        if (stored === 'true') setStep(4);
      }
    };

    void checkOnboardingStatus();
  }, []);

  const next = () => setStep(s => Math.min(s + 1, 3));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const complete = async () => {
    try {
      // Update database
      await supabase
        .from('profiles')
        .update({ onboarding_complete: true })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      // Update localStorage as fallback
      localStorage.setItem('onboarding_done', 'true');
      setStep(4);
    } catch (error) {
      console.error('Failed to mark onboarding complete:', error);
      // Fallback to localStorage only
      localStorage.setItem('onboarding_done', 'true');
      setStep(4);
    }
  };

  return (
    <OnboardingContext.Provider value={{ step, next, prev, complete }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx)
    throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
