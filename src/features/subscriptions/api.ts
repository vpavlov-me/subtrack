// Здесь будут функции для работы с Supabase
// Например: получение, добавление, удаление подписок

import { supabase } from '@/lib/supabase';
import { Subscription, SubscriptionCreate, SubscriptionUpdate } from './types';
import { parseCsvSubscriptions, CsvParseResult } from '@/lib/csv';

// Тип строки из БД (snake_case)
interface DbSubscriptionRow {
  id: string;
  name: string;
  price: number | string;
  currency?: string | null;
  billing_cycle: 'monthly' | 'yearly' | 'custom';
  next_billing_date: string;
  category?: string | null;
  payment_method?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

// Helpers для маппинга snake_case ↔ camelCase
function fromDb(row: DbSubscriptionRow): Subscription {
  return {
    id: row.id,
    name: row.name,
    price: parseFloat(row.price as unknown as string),
    currency: row.currency ?? 'USD',
    billingCycle: row.billing_cycle as 'monthly' | 'yearly' | 'custom',
    nextBillingDate: new Date(row.next_billing_date),
    category: row.category ?? 'General',
    paymentMethod: row.payment_method ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toDb(input: SubscriptionCreate | SubscriptionUpdate) {
  return {
    name: input.name,
    price: input.price,
    currency: input.currency ?? 'USD',
    billing_cycle: input.billingCycle,
    next_billing_date: input.nextBillingDate,
    category: input.category ?? 'General',
    payment_method: input.paymentMethod ?? null,
    notes: input.notes ?? null,
  };
}

// Получение подписок из Supabase
export async function fetchSubscriptions(): Promise<Subscription[]> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('next_billing_date', { ascending: true });

  if (error) {
    console.error('Error fetching subscriptions:', error.message);
    return [];
  }

  return (data ?? []).map(fromDb);
}

// Добавление подписки
export async function addSubscription(
  subscription: SubscriptionCreate
): Promise<Subscription> {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert(toDb(subscription))
    .select()
    .single();

  if (error) {
    console.error('Error adding subscription:', error.message);
    throw new Error('Failed to add subscription');
  }

  return fromDb(data);
}

// Обновление подписки
export async function updateSubscription(
  id: string,
  subscription: SubscriptionUpdate
): Promise<Subscription> {
  const { data, error } = await supabase
    .from('subscriptions')
    .update(toDb(subscription))
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating subscription:', error.message);
    throw new Error('Failed to update subscription');
  }

  return fromDb(data);
}

// Удаление подписки
export async function deleteSubscription(id: string): Promise<void> {
  const { error } = await supabase.from('subscriptions').delete().eq('id', id);

  if (error) {
    console.error('Error deleting subscription:', error.message);
    throw new Error('Failed to delete subscription');
  }
}

// Экспорт в CSV
export function exportToCSV(subscriptions: Subscription[]): string {
  try {
    const headers = ['Name', 'Price', 'Billing Cycle', 'Next Billing Date'];
    const rows = subscriptions.map(sub => [
      sub.name,
      sub.price.toString(),
      sub.billingCycle,
      sub.nextBillingDate.toISOString().split('T')[0],
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Failed to export subscriptions');
  }
}

// Импорт из CSV с улучшенной валидацией
export async function importFromCSV(csv: string): Promise<CsvParseResult> {
  try {
    // Используем новый CSV парсер
    const parseResult = parseCsvSubscriptions(csv);

    if (!parseResult.success || !parseResult.data) {
      return parseResult;
    }

    // Bulk insert с обработкой ошибок
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(parseResult.data.map(toDb))
      .select();

    if (error) {
      console.error('Error importing subscriptions:', error.message);
      return {
        success: false,
        errors: [`Database error: ${error.message}`],
        warnings: parseResult.warnings,
      };
    }

    return {
      success: true,
      data: (data ?? []).map(fromDb),
      warnings: parseResult.warnings,
    };
  } catch (error) {
    console.error('Error importing from CSV:', error);
    return {
      success: false,
      errors: [
        `Failed to import subscriptions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
    };
  }
}
