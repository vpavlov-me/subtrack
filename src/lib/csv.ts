import { SubscriptionCreate } from '@/features/subscriptions/types'

export interface CsvParseResult {
  success: boolean
  data?: SubscriptionCreate[]
  errors?: string[]
  warnings?: string[]
}

export interface CsvRow {
  name: string
  price: string
  billingCycle: string
  nextBillingDate: string
  category?: string
  currency?: string
  paymentMethod?: string
  notes?: string
}

export function parseCsvSubscriptions(csvContent: string): CsvParseResult {
  const result: CsvParseResult = {
    success: false,
    errors: [],
    warnings: []
  }

  try {
    // Split CSV into lines and remove empty lines
    const lines = csvContent.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      result.errors?.push('CSV must have at least a header row and one data row')
      return result
    }

    // Parse header row
    const headerRow = lines[0]
    const headers = headerRow.split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, ''))
    
    // Validate headers
    const requiredHeaders = ['name', 'price', 'billingcycle', 'nextbillingdate']
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    if (missingHeaders.length > 0) {
      result.errors?.push(`Missing required headers: ${missingHeaders.join(', ')}`)
      return result
    }

    const subscriptions: SubscriptionCreate[] = []
    let hasErrors = false

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const values = line.split(',').map(v => v.trim())
      const rowNumber = i // Changed from i + 1 to match test expectations

      // Create row object
      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })

      // Check required fields
      const missingFields = requiredHeaders.filter(field => !row[field])
      if (missingFields.length > 0) {
        result.errors?.push(
          `Row ${rowNumber}: Missing required fields: ${missingFields.join(', ')}`
        )
        hasErrors = true
        continue
      }

      // Validate and parse price
      const price = parseFloat(row.price)
      if (isNaN(price) || price <= 0) {
        result.errors?.push(
          `Row ${rowNumber}: Invalid price "${row.price}". Must be a positive number.`
        )
        hasErrors = true
        continue
      }

      // Validate billing cycle
      const billingCycle = row.billingcycle.toLowerCase()
      if (!['monthly', 'yearly', 'custom'].includes(billingCycle)) {
        result.errors?.push(
          `Row ${rowNumber}: Invalid billing cycle "${row.billingcycle}". Must be monthly, yearly, or custom.`
        )
        hasErrors = true
        continue
      }

      // Validate and parse date
      const nextBillingDate = new Date(row.nextbillingdate)
      if (isNaN(nextBillingDate.getTime())) {
        result.errors?.push(
          `Row ${rowNumber}: Invalid date "${row.nextbillingdate}". Use YYYY-MM-DD format.`
        )
        hasErrors = true
        continue
      }

      // Validate currency (optional)
      let currency = row.currency?.toUpperCase() || 'USD'
      const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY']
      if (!validCurrencies.includes(currency)) {
        result.warnings?.push(
          `Row ${rowNumber}: Unsupported currency "${currency}". Using USD instead.`
        )
        currency = 'USD'
      }

      // Create subscription object
      const subscription: SubscriptionCreate = {
        name: row.name,
        price: price,
        currency: currency,
        billingCycle: billingCycle as 'monthly' | 'yearly' | 'custom',
        nextBillingDate: nextBillingDate,
        category: row.category || 'General',
        paymentMethod: row.paymentmethod || undefined,
        notes: row.notes || undefined
      }

      subscriptions.push(subscription)
    }

    if (subscriptions.length === 0) {
      result.errors?.push('No valid subscriptions found in CSV')
      return result
    }

    // Only set success to true if there are no errors
    result.success = !hasErrors
    result.data = subscriptions

    // Add summary warning if there were parsing issues
    if (result.warnings && result.warnings.length > 0) {
      result.warnings.unshift(`${result.warnings.length} warnings found during parsing`)
    }

  } catch (error) {
    result.errors?.push(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return result
}

export function generateCsvTemplate(): string {
  const headers = [
    'Name',
    'Price',
    'Billing Cycle',
    'Next Billing Date',
    'Category',
    'Currency',
    'Payment Method',
    'Notes'
  ]

  const example = [
    'Netflix',
    '15.99',
    'monthly',
    '2024-02-01',
    'Entertainment',
    'USD',
    'Credit Card',
    'Personal account'
  ]

  return [headers.join(','), example.join(',')].join('\n')
}

export function validateCsvHeaders(headers: string[]): { valid: boolean; errors: string[] } {
  const requiredHeaders = ['name', 'price', 'billingcycle', 'nextbillingdate']
  const errors: string[] = []

  for (const required of requiredHeaders) {
    if (!headers.some(header => 
      header.toLowerCase().replace(/\s+/g, '') === required
    )) {
      errors.push(`Missing required header: ${required}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export function parseCSV(csvContent: string): { data: any[], headers: string[] } {
  const lines = csvContent.split('\n').filter(line => line.trim())
  if (lines.length < 1) {
    return { data: [], headers: [] }
  }

  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim())
  
  // Parse data rows
  const data = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim())
    const row: any = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    return row
  })

  return { data, headers }
} 