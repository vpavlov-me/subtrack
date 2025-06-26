import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import MarketingLayout from '@/components/marketing/Layout'

const plans = [
  {
    name: 'Basic',
    price: '0',
    period: 'mo',
    features: [
      'До 50 подписок',
      'Напоминания по email',
      'Поддержка по email',
    ],
    cta: 'Начать бесплатно',
  },
  {
    name: 'Premium',
    price: '9',
    period: 'mo',
    features: [
      'Неограниченно подписок',
      'Напоминания по Slack / Telegram',
      'Интеграция с бухгалтерией',
      'Приоритетная поддержка',
    ],
    cta: 'Обновить',
  },
]

export default function Pricing() {
  return (
    <MarketingLayout>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-24 px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-4">Простое и прозрачное ценообразование</h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">Выберите план, подходящий вашему бизнесу. Отменить можно в любой момент.</p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map(plan => (
            <Card key={plan.name} className="p-8 rounded-2xl border bg-white dark:bg-zinc-950 flex flex-col">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{plan.name}</h2>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">${plan.price}</span>
                  <span className="text-zinc-600 dark:text-zinc-400">/{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-3 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <Check className="w-4 h-4 text-green-500" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="mt-8">
                <Button className="w-full">{plan.cta}</Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </MarketingLayout>
  )
} 