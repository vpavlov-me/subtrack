import { OnboardingProvider } from '@/features/onboarding/OnboardingContext'
import OnboardingWizard from '@/features/onboarding/OnboardingWizard'

export default function OnboardingPage(){
  return (
    <OnboardingProvider>
      <OnboardingWizard />
    </OnboardingProvider>
  )
} 