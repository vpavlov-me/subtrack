import { useOnboarding } from './OnboardingContext'
import Step0Company from './steps/Step0Company'
import Step1CSV from './steps/Step1CSV'
import Step2Reminder from './steps/Step2Reminder'
import Step3Invite from './steps/Step3Invite'

export default function OnboardingWizard() {
  const { step } = useOnboarding()
  return (
    <div className="max-w-lg mx-auto py-10">
      {step===0 && <Step0Company />} 
      {step===1 && <Step1CSV />} 
      {step===2 && <Step2Reminder />} 
      {step===3 && <Step3Invite />} 
      {step>=4 && <p>Done!</p>}
    </div>
  )
} 