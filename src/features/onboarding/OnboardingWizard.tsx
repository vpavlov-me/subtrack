import { useOnboarding } from './OnboardingContext';
import { skipOnboarding } from './api/skipOnboarding';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Step0Company from './steps/Step0Company';
import Step1CSV from './steps/Step1CSV';
import Step2Reminder from './steps/Step2Reminder';
import Step3Invite from './steps/Step3Invite';

export default function OnboardingWizard() {
  const { step } = useOnboarding();
  const navigate = useNavigate();

  const handleSkip = async () => {
    try {
      const { error } = await skipOnboarding();
      if (error) {
        toast.error('Ошибка при пропуске onboarding');
      } else {
        toast.success('Onboarding пропущен');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Произошла ошибка');
    }
  };

  return (
    <div className="max-w-lg mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Добро пожаловать в SubTrack</h1>
        <Button
          variant="ghost"
          onClick={handleSkip}
          className="text-zinc-500 hover:text-zinc-700"
        >
          Пропустить
        </Button>
      </div>
      
      {step === 0 && <Step0Company />}
      {step === 1 && <Step1CSV />}
      {step === 2 && <Step2Reminder />}
      {step === 3 && <Step3Invite />}
      {step >= 4 && <p>Done!</p>}
    </div>
  );
}
