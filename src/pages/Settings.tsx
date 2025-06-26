import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/theme'

const currencies = ['USD', 'EUR', 'RUB']

export default function Settings() {
  const [currency, setCurrency] = useState('USD')
  const { dark, toggle } = useTheme()

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-zinc-900 mb-2 dark:text-zinc-100">Settings</h1>
      <Card className="p-6 space-y-6">
        <div>
          <div className="font-semibold mb-2">Profile</div>
          <div className="text-zinc-500 text-sm">(Заглушка профиля пользователя)</div>
        </div>
        <div>
          <div className="font-semibold mb-2">Currency</div>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map(cur => (
                <SelectItem key={cur} value={cur}>{cur}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4">
          <div className="font-semibold">Dark mode</div>
          <Switch checked={dark} onCheckedChange={toggle} />
          <span className="text-zinc-500 text-sm">{dark ? 'On' : 'Off'}</span>
        </div>
        <div className="flex gap-4 pt-2">
          <Button variant="outline">Export data</Button>
          <Button variant="outline">Import data</Button>
        </div>
      </Card>
    </div>
  )
} 