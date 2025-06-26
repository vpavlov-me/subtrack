import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import MarketingLayout from '@/components/marketing/Layout'

export default function Landing() {
  return (
    <MarketingLayout>
      <div className="flex-1 flex flex-col">
        {/* Hero */}
        <section className="flex-1 flex items-center justify-center px-4 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950">
          <div className="max-w-4xl text-center space-y-6">
            <Badge variant="secondary" className="mx-auto w-max">С заботой о фрилансерах и малом бизнесе</Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight">
              Никогда больше не забывайте о&nbsp;повторяющихся&nbsp;расходах
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
              SubTrack автоматически напоминает о грядущих платежах и&nbsp;помогает оптимизировать ваши подписки.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="px-8 py-6 text-base">Попробовать бесплатно</Button>
              </Link>
              <Link to="/pricing" className="text-zinc-600 dark:text-zinc-400 hover:underline flex items-center gap-1 text-base">
                Узнать о тарифах <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 bg-white dark:bg-zinc-950">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-12">Ключевые преимущества</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Автоматические напоминания',
                  desc: 'Получайте email-уведомления до списания средств и принимайте решения заранее.'
                },
                {
                  title: 'Полный контроль над расходами',
                  desc: 'Визуализируйте ежемесячные и годовые затраты в понятных дашбордах.'
                },
                {
                  title: 'Безопасность данных',
                  desc: 'Ваши данные хранятся в Supabase и никогда не передаются третьим лицам.'
                },
              ].map(f => (
                <Card key={f.title} className="p-6 space-y-4 rounded-2xl border bg-zinc-50 dark:bg-zinc-900">
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{f.title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">{f.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-zinc-50 dark:bg-zinc-900">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-12">Что говорят пользователи</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  name: 'Алексей, фриланс-дизайнер',
                  quote: 'SubTrack сэкономил мне десятки часов и сотни долларов!'
                },
                {
                  name: 'Мария, владелец агентства',
                  quote: 'Мы наконец-то видим все подписки команды в одном месте.'
                },
              ].map(t => (
                <Card key={t.name} className="p-6 space-y-4 rounded-2xl border bg-white dark:bg-zinc-950">
                  <p className="text-zinc-600 dark:text-zinc-400 italic">"{t.quote}"</p>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">{t.name}</div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-extrabold">Готовы оптимизировать расходы?</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">Зарегистрируйтесь сейчас и получите 14 дней полного доступа без ограничений.</p>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="bg-white text-indigo-600 hover:bg-zinc-100 px-8 py-6 text-base">Начать бесплатно</Button>
            </Link>
          </div>
        </section>

        {/* Use cases */}
        <section className="py-24 bg-white dark:bg-zinc-950">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-12">Кому полезен SubTrack?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Фрилансеры',
                  desc: 'Следите за расходами на сервисы дизайна, хостинга и продвижения без лишних таблиц.'
                },
                {
                  title: 'Агентства',
                  desc: 'Управляйте подписками клиентов и команды в одном месте, избегая двойных оплат.'
                },
                {
                  title: 'Соло-фаундеры',
                  desc: 'Контролируйте burn-rate, получайте напоминания и прогнозы по кэшу.'
                },
              ].map(u => (
                <Card key={u.title} className="p-6 space-y-3 rounded-2xl border bg-zinc-50 dark:bg-zinc-900">
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{u.title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{u.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Screenshots */}
        <section className="py-24 bg-zinc-50 dark:bg-zinc-900">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Скриншоты продукта</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="aspect-video rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              ))}
            </div>
          </div>
        </section>
      </div>
    </MarketingLayout>
  )
} 