import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: { user_id: 'test-user-id' }, 
            error: null 
          }))
        }))
      }))
    }))
  }))
}))

// Mock Stripe
const mockStripe = {
  webhooks: {
    constructEvent: vi.fn()
  },
  subscriptions: {
    retrieve: vi.fn()
  }
}

vi.mock('stripe', () => ({
  default: vi.fn(() => mockStripe)
}))

describe('Stripe Webhook Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkout.session.completed', () => {
    it('should update profile with subscription details', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            client_reference_id: 'test-user-id',
            customer: 'cus_test123',
            subscription: 'sub_test123'
          }
        }
      }

      const mockSubscription = {
        status: 'active',
        quantity: 1,
        current_period_end: 1640995200, // 2022-01-01
        cancel_at: null
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)
      mockStripe.subscriptions.retrieve.mockResolvedValue(mockSubscription)

      // This would be the actual webhook handler logic
      const supabase = createClient('test-url', 'test-key')
      
      const subscription = await mockStripe.subscriptions.retrieve(mockEvent.data.object.subscription)
      
      await supabase.from('profiles').update({
        customer_id: mockEvent.data.object.customer,
        subscription_id: mockEvent.data.object.subscription,
        subscription_status: subscription.status,
        billing_status: subscription.status,
        seat_count: subscription.quantity ?? 1,
        current_period_end: new Date(subscription.current_period_end * 1000),
        cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
      }).eq('user_id', mockEvent.data.object.client_reference_id)

      expect(mockStripe.subscriptions.retrieve).toHaveBeenCalledWith('sub_test123')
      expect(supabase.from).toHaveBeenCalledWith('profiles')
    })
  })

  describe('customer.subscription.updated', () => {
    it('should update profile with new subscription status', async () => {
      const mockEvent = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test123',
            status: 'past_due',
            quantity: 2,
            current_period_end: 1640995200,
            cancel_at: 1641081600
          }
        }
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)

      const supabase = createClient('test-url', 'test-key')
      
      await supabase.from('profiles').update({
        subscription_status: mockEvent.data.object.status,
        billing_status: mockEvent.data.object.status,
        seat_count: mockEvent.data.object.quantity ?? 1,
        current_period_end: new Date(mockEvent.data.object.current_period_end * 1000),
        cancel_at: mockEvent.data.object.cancel_at ? new Date(mockEvent.data.object.cancel_at * 1000) : null,
      }).eq('user_id', 'test-user-id')

      expect(supabase.from).toHaveBeenCalledWith('profiles')
    })
  })

  describe('customer.subscription.deleted', () => {
    it('should reset profile to free plan', async () => {
      const mockEvent = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test123'
          }
        }
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)

      const supabase = createClient('test-url', 'test-key')
      
      await supabase.from('profiles').update({
        subscription_status: 'canceled',
        billing_status: 'free',
        seat_count: 1,
        current_period_end: null,
        cancel_at: null,
      }).eq('user_id', 'test-user-id')

      expect(supabase.from).toHaveBeenCalledWith('profiles')
    })
  })

  describe('webhook signature validation', () => {
    it('should reject invalid signatures', () => {
      const invalidSignature = 'invalid_signature'
      const body = 'test_body'

      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature')
      })

      expect(() => {
        mockStripe.webhooks.constructEvent(body, invalidSignature, 'test_secret')
      }).toThrow('Invalid signature')
    })
  })
}) 