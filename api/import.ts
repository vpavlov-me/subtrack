import { createClient } from '@supabase/supabase-js';

// Types for CSV parsing
interface SubscriptionCreate {
  name: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'custom';
  nextBillingDate: Date;
  category?: string;
  paymentMethod?: string;
  notes?: string;
}

interface CsvParseResult {
  success: boolean;
  data?: SubscriptionCreate[];
  errors?: string[];
  warnings?: string[];
}

// CSV parsing function (simplified version for API route)
function parseCsvSubscriptions(csvContent: string): CsvParseResult {
  const result: CsvParseResult = {
    success: false,
    errors: [],
    warnings: [],
  };

  try {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      result.errors?.push('CSV must have at least a header row and one data row');
      return result;
    }

    const headerRow = lines[0];
    const headers = headerRow.split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, ''));
    
    const requiredHeaders = ['name', 'price', 'billingcycle', 'nextbillingdate'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      result.errors?.push(`Missing required headers: ${missingHeaders.join(', ')}`);
      return result;
    }

    const subscriptions: SubscriptionCreate[] = [];
    let hasErrors = false;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = line.split(',').map(v => v.trim());
      const rowNumber = i;

      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      const missingFields = requiredHeaders.filter(field => !row[field]);
      if (missingFields.length > 0) {
        result.errors?.push(`Row ${rowNumber}: Missing required fields: ${missingFields.join(', ')}`);
        hasErrors = true;
        continue;
      }

      const price = parseFloat(row.price);
      if (isNaN(price) || price <= 0) {
        result.errors?.push(`Row ${rowNumber}: Invalid price "${row.price}". Must be a positive number.`);
        hasErrors = true;
        continue;
      }

      const billingCycle = row.billingcycle.toLowerCase();
      if (!['monthly', 'yearly', 'custom'].includes(billingCycle)) {
        result.errors?.push(`Row ${rowNumber}: Invalid billing cycle "${row.billingcycle}". Must be monthly, yearly, or custom.`);
        hasErrors = true;
        continue;
      }

      const nextBillingDate = new Date(row.nextbillingdate);
      if (isNaN(nextBillingDate.getTime())) {
        result.errors?.push(`Row ${rowNumber}: Invalid date "${row.nextbillingdate}". Use YYYY-MM-DD format.`);
        hasErrors = true;
        continue;
      }

      let currency = row.currency?.toUpperCase() || 'USD';
      const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];
      if (!validCurrencies.includes(currency)) {
        result.warnings?.push(`Row ${rowNumber}: Unsupported currency "${currency}". Using USD instead.`);
        currency = 'USD';
      }

      const subscription: SubscriptionCreate = {
        name: row.name,
        price: price,
        currency: currency,
        billingCycle: billingCycle as 'monthly' | 'yearly' | 'custom',
        nextBillingDate: nextBillingDate,
        category: row.category || 'General',
        paymentMethod: row.paymentmethod || undefined,
        notes: row.notes || undefined,
      };

      subscriptions.push(subscription);
    }

    if (subscriptions.length === 0) {
      result.errors?.push('No valid subscriptions found in CSV');
      return result;
    }

    result.success = !hasErrors;
    result.data = subscriptions;

    if (result.warnings && result.warnings.length > 0) {
      result.warnings.unshift(`${result.warnings.length} warnings found during parsing`);
    }
  } catch (error) {
    result.errors?.push(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

// Helper function to convert SubscriptionCreate to database format
function toDb(subscription: SubscriptionCreate) {
  return {
    name: subscription.name,
    price: subscription.price,
    currency: subscription.currency,
    billing_cycle: subscription.billingCycle,
    next_billing_date: subscription.nextBillingDate.toISOString(),
    category: subscription.category,
    payment_method: subscription.paymentMethod,
    notes: subscription.notes,
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { csvContent } = req.body;

    if (!csvContent || typeof csvContent !== 'string') {
      return res.status(400).json({ 
        error: 'CSV content is required and must be a string' 
      });
    }

    // Parse CSV content
    const parseResult: CsvParseResult = parseCsvSubscriptions(csvContent);

    if (!parseResult.success || !parseResult.data) {
      return res.status(400).json({
        success: false,
        errors: parseResult.errors,
        warnings: parseResult.warnings,
      });
    }

    // Get current user
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Supabase configuration missing' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Bulk insert subscriptions
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(parseResult.data.map(toDb))
      .select();

    if (error) {
      console.error('Database error during import:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to import subscriptions to database',
        details: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: data || [],
      warnings: parseResult.warnings,
      message: `Successfully imported ${parseResult.data.length} subscription(s)`,
    });

  } catch (error) {
    console.error('Import API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during import',
    });
  }
} 