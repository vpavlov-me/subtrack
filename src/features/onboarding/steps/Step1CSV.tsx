import { Button } from '@/components/ui/button'
import { useOnboarding } from '../OnboardingContext'

export default function Step1CSV() {
  const { next, prev } = useOnboarding()
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Import subscriptions CSV</h2>
      <p>Скачайте шаблон и заполните ваши подписки.</p>
      <Button variant="outline" asChild><a href="/csv-template.csv" download>Download template</a></Button>
      <input type="file" accept=".csv" />
      <div className="flex gap-2">
        <Button variant="secondary" onClick={prev}>Back</Button>
        <Button onClick={next}>Next</Button>
      </div>
    </div>
  )
} 