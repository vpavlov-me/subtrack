import { describe, it, expect, vi, beforeEach } from 'vitest';
import { skipOnboarding } from './skipOnboarding';
import type { User } from '@supabase/supabase-js';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  },
}));

describe('skipOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should update onboarding_complete to true for authenticated user', async () => {
    const mockUser: User = {
      id: 'test-user-id',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2023-01-01T00:00:00Z',
      email: 'test@example.com',
      email_confirmed_at: '2023-01-01T00:00:00Z',
      last_sign_in_at: '2023-01-01T00:00:00Z',
      role: 'authenticated',
      updated_at: '2023-01-01T00:00:00Z',
    };
    
    const mockSupabase = await import('@/lib/supabase');
    
    vi.mocked(mockSupabase.supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    vi.mocked(mockSupabase.supabase.from).mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    } as any);

    const result = await skipOnboarding();

    expect(result.error).toBeNull();
    expect(localStorage.getItem('onboarding_done')).toBe('true');
  });

  it('should return error for unauthenticated user', async () => {
    const mockSupabase = await import('@/lib/supabase');
    
    vi.mocked(mockSupabase.supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: null,
    } as any);

    const result = await skipOnboarding();

    expect(result.error).toEqual({ message: 'User not authenticated' });
  });
}); 