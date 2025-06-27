import { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

const demoTransactions = [
  {
    id: 't1',
    sub: 'Netflix',
    date: '2024-06-01',
    amount: 12.99,
    currency: 'USD',
    status: 'Paid',
  },
  {
    id: 't2',
    sub: 'Figma',
    date: '2024-01-10',
    amount: 144,
    currency: 'USD',
    status: 'Paid',
  },
];
const subs = ['All', 'Netflix', 'Figma'];
const periods = ['All', 'Last 30 days', 'This year'];

export default function Transactions() {
  const [subFilter, setSubFilter] = useState('All');
  const [period, setPeriod] = useState('All');

  // Фильтрация (заглушка)
  const filtered = demoTransactions.filter(
    t => subFilter === 'All' || t.sub === subFilter
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900">Transactions</h1>
        <div className="flex gap-4">
          <Select value={subFilter} onValueChange={setSubFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Subscription" />
            </SelectTrigger>
            <SelectContent>
              {subs.map(s => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              {periods.map(p => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Card className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subscription</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-zinc-400"
                >
                  No transactions yet.
                  <br />
                  <Button variant="link" className="mt-2">
                    Add subscription
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium text-zinc-900">
                    {t.sub}
                  </TableCell>
                  <TableCell>{t.date}</TableCell>
                  <TableCell>
                    <span className="text-zinc-900 font-semibold">
                      {t.amount}
                    </span>
                    <span className="text-xs text-zinc-500 ml-1">
                      {t.currency}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-block rounded px-2 py-0.5 text-xs bg-zinc-100 text-zinc-700">
                      {t.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
