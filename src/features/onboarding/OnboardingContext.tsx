import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface Ctx {
  step: number
  next: () => void
  prev: () => void
  complete: () => void
}

const OnboardingContext = createContext<Ctx | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem('onboarding_done')
    if (stored === 'true') setStep(4) // done
  }, [])

  const next = () => setStep(s => Math.min(s + 1, 3))
  const prev = () => setStep(s => Math.max(s - 1, 0))
  const complete = () => {
    localStorage.setItem('onboarding_done', 'true')
    setStep(4)
  }

  return (
    <OnboardingContext.Provider value={{ step, next, prev, complete }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider')
  return ctx
} 