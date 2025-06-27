import { describe, it, expect } from 'vitest';
import {
  parseCsvSubscriptions,
  generateCsvTemplate,
  validateCsvHeaders,
} from './csv';

describe('CSV Parser', () => {
  describe('parseCsvSubscriptions', () => {
    it('should parse valid CSV successfully', () => {
      const csv = `Name,Price,Billing Cycle,Next Billing Date,Category,Currency,Payment Method,Notes
Netflix,15.99,monthly,2024-02-01,Entertainment,USD,Credit Card,Personal account
Spotify,9.99,monthly,2024-02-05,Entertainment,USD,PayPal,Family plan`;

      const result = parseCsvSubscriptions(csv);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0]).toEqual({
        name: 'Netflix',
        price: 15.99,
        currency: 'USD',
        billingCycle: 'monthly',
        nextBillingDate: new Date('2024-02-01'),
        category: 'Entertainment',
        paymentMethod: 'Credit Card',
        notes: 'Personal account',
      });
    });

    it('should handle missing optional fields', () => {
      const csv = `Name,Price,Billing Cycle,Next Billing Date
Netflix,15.99,monthly,2024-02-01`;

      const result = parseCsvSubscriptions(csv);

      expect(result.success).toBe(true);
      expect(result.data?.[0]).toEqual({
        name: 'Netflix',
        price: 15.99,
        currency: 'USD',
        billingCycle: 'monthly',
        nextBillingDate: new Date('2024-02-01'),
        category: 'General',
        paymentMethod: undefined,
        notes: undefined,
      });
    });

    it('should validate required headers', () => {
      const csv = `Name,Price,Category
Netflix,15.99,Entertainment`;

      const result = parseCsvSubscriptions(csv);

      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        'Missing required headers: billingcycle, nextbillingdate'
      );
    });

    it('should validate required fields in data rows', () => {
      const csv = `Name,Price,Billing Cycle,Next Billing Date
Netflix,15.99,monthly,2024-02-01
,9.99,monthly,2024-02-05`;

      const result = parseCsvSubscriptions(csv);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Row 2: Missing required fields: name');
    });

    it('should validate price format', () => {
      const csv = `Name,Price,Billing Cycle,Next Billing Date
Netflix,invalid,monthly,2024-02-01`;

      const result = parseCsvSubscriptions(csv);

      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        'Row 1: Invalid price "invalid". Must be a positive number.'
      );
    });

    it('should validate billing cycle', () => {
      const csv = `Name,Price,Billing Cycle,Next Billing Date
Netflix,15.99,weekly,2024-02-01`;

      const result = parseCsvSubscriptions(csv);

      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        'Row 1: Invalid billing cycle "weekly". Must be monthly, yearly, or custom.'
      );
    });

    it('should validate date format', () => {
      const csv = `Name,Price,Billing Cycle,Next Billing Date
Netflix,15.99,monthly,invalid-date`;

      const result = parseCsvSubscriptions(csv);

      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        'Row 1: Invalid date "invalid-date". Use YYYY-MM-DD format.'
      );
    });

    it('should handle unsupported currencies with warning', () => {
      const csv = `Name,Price,Billing Cycle,Next Billing Date,Currency
Netflix,15.99,monthly,2024-02-01,XYZ`;

      const result = parseCsvSubscriptions(csv);

      expect(result.success).toBe(true);
      expect(result.warnings).toContain(
        'Row 1: Unsupported currency "XYZ". Using USD instead.'
      );
      expect(result.data?.[0].currency).toBe('USD');
    });

    it('should handle empty CSV', () => {
      const result = parseCsvSubscriptions('');

      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        'CSV must have at least a header row and one data row'
      );
    });

    it('should handle CSV with only headers', () => {
      const csv = `Name,Price,Billing Cycle,Next Billing Date`;
      const result = parseCsvSubscriptions(csv);

      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        'CSV must have at least a header row and one data row'
      );
    });

    it('should handle case-insensitive headers', () => {
      const csv = `NAME,PRICE,BILLING CYCLE,NEXT BILLING DATE
Netflix,15.99,monthly,2024-02-01`;

      const result = parseCsvSubscriptions(csv);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it('should handle headers with spaces', () => {
      const csv = `Name,Price,Billing Cycle,Next Billing Date
Netflix,15.99,monthly,2024-02-01`;

      const result = parseCsvSubscriptions(csv);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('generateCsvTemplate', () => {
    it('should generate valid CSV template', () => {
      const template = generateCsvTemplate();

      expect(template).toContain(
        'Name,Price,Billing Cycle,Next Billing Date,Category,Currency,Payment Method,Notes'
      );
      expect(template).toContain(
        'Netflix,15.99,monthly,2024-02-01,Entertainment,USD,Credit Card,Personal account'
      );
    });
  });

  describe('validateCsvHeaders', () => {
    it('should validate correct headers', () => {
      const headers = ['name', 'price', 'billingcycle', 'nextbillingdate'];
      const result = validateCsvHeaders(headers);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing headers', () => {
      const headers = ['name', 'price'];
      const result = validateCsvHeaders(headers);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required header: billingcycle');
      expect(result.errors).toContain(
        'Missing required header: nextbillingdate'
      );
    });

    it('should handle case-insensitive headers', () => {
      const headers = ['NAME', 'PRICE', 'BILLINGCYCLE', 'NEXTBILLINGDATE'];
      const result = validateCsvHeaders(headers);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
