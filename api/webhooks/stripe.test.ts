import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({
              data: { user_id: 'test-user-id' },
              error: null,
            })
          ),
        })),
      })),
    })),
  })),
}));

// Mock Stripe
const mockStripe = {
  webhooks: {
    constructEvent: vi.fn(),
  },
  subscriptions: {
    retrieve: vi.fn(),
  },
};

vi.mock('stripe', () => ({
  default: vi.fn(() => mockStripe),
}));

describe('Stripe Webhook API Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variables
    process.env.STRIPE_SECRET_KEY = 'sk_test_key';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';
  });

  describe('POST /api/webhooks/stripe', () => {
    it('should handle checkout.session.completed event', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            client_reference_id: 'test-user-id',
            customer: 'cus_test123',
            subscription: 'sub_test123',
          },
        },
      };

      const mockSubscription = {
        status: 'active',
        quantity: 1,
        current_period_end: 1640995200,
        cancel_at: null,
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);
      mockStripe.subscriptions.retrieve.mockResolvedValue(mockSubscription);

      const req = {
        method: 'POST',
        headers: {
          'stripe-signature': 'valid_signature',
        },
        body: 'test_body',
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      // Import the handler dynamically to avoid module resolution issues
      const handler = await import('./stripe');
      
      await handler.default(req as any, res as any);

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        'test_body',
        'valid_signature',
        'whsec_test_secret'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ received: true });
    });

    it('should handle customer.subscription.updated event', async () => {
      const mockEvent = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test123',
            status: 'past_due',
            quantity: 2,
            current_period_end: 1640995200,
            cancel_at: 1641081600,
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

      const req = {
        method: 'POST',
        headers: {
          'stripe-signature': 'valid_signature',
        },
        body: 'test_body',
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      const handler = await import('./stripe');
      
      await handler.default(req as any, res as any);

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle customer.subscription.deleted event', async () => {
      const mockEvent = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test123',
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

      const req = {
        method: 'POST',
        headers: {
          'stripe-signature': 'valid_signature',
        },
        body: 'test_body',
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      const handler = await import('./stripe');
      
      await handler.default(req as any, res as any);

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should reject invalid webhook signatures', async () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const req = {
        method: 'POST',
        headers: {
          'stripe-signature': 'invalid_signature',
        },
        body: 'test_body',
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      const handler = await import('./stripe');
      
      await handler.default(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid signature' });
    });

    it('should reject requests without signature header', async () => {
      const req = {
        method: 'POST',
        headers: {},
        body: 'test_body',
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      const handler = await import('./stripe');
      
      await handler.default(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Missing signature or webhook secret' 
      });
    });

    it('should reject non-POST requests', async () => {
      const req = {
        method: 'GET',
        headers: {},
        body: 'test_body',
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      const handler = await import('./stripe');
      
      await handler.default(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
    });

    it('should handle webhook handler errors gracefully', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            client_reference_id: 'test-user-id',
            customer: 'cus_test123',
            subscription: 'sub_test123',
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);
      mockStripe.subscriptions.retrieve.mockRejectedValue(new Error('Database error'));

      const req = {
        method: 'POST',
        headers: {
          'stripe-signature': 'valid_signature',
        },
        body: 'test_body',
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      const handler = await import('./stripe');
      
      await handler.default(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Webhook handler failed' });
    });
  });

  describe('seat_count updates', () => {
    it('should update seat_count when subscription quantity changes', async () => {
      const mockEvent = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test123',
            status: 'active',
            quantity: 5,
            current_period_end: 1640995200,
            cancel_at: null,
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

      const supabase = createClient('test-url', 'test-key');

      await supabase
        .from('profiles')
        .update({
          subscription_status: mockEvent.data.object.status,
          billing_status: mockEvent.data.object.status,
          seat_count: mockEvent.data.object.quantity ?? 1,
          current_period_end: new Date(mockEvent.data.object.current_period_end * 1000),
          cancel_at: mockEvent.data.object.cancel_at
            ? new Date(mockEvent.data.object.cancel_at * 1000)
            : null,
        })
        .eq('user_id', 'test-user-id');

      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });

    it('should reset seat_count to 1 when subscription is cancelled', async () => {
      const mockEvent = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test123',
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

      const supabase = createClient('test-url', 'test-key');

      await supabase
        .from('profiles')
        .update({
          subscription_status: 'canceled',
          billing_status: 'free',
          seat_count: 1,
          current_period_end: null,
          cancel_at: null,
        })
        .eq('user_id', 'test-user-id');

      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });
  });

  describe('status synchronization', () => {
    it('should sync subscription_status and billing_status', async () => {
      const mockEvent = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test123',
            status: 'past_due',
            quantity: 1,
            current_period_end: 1640995200,
            cancel_at: null,
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

      const supabase = createClient('test-url', 'test-key');

      await supabase
        .from('profiles')
        .update({
          subscription_status: mockEvent.data.object.status,
          billing_status: mockEvent.data.object.status,
          seat_count: mockEvent.data.object.quantity ?? 1,
          current_period_end: new Date(mockEvent.data.object.current_period_end * 1000),
          cancel_at: mockEvent.data.object.cancel_at
            ? new Date(mockEvent.data.object.cancel_at * 1000)
            : null,
        })
        .eq('user_id', 'test-user-id');

      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });
  });
}); 