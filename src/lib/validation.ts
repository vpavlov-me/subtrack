import { z } from 'zod'

// Базовые схемы валидации
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required')
  .max(254, 'Email too long')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Zа-яА-Я\s\-']+$/, 'Name contains invalid characters')

export const amountSchema = z
  .number()
  .positive('Amount must be positive')
  .max(999999.99, 'Amount too large')

export const currencySchema = z
  .string()
  .length(3, 'Currency must be 3 characters')
  .regex(/^[A-Z]{3}$/, 'Invalid currency format')

// Схемы для форм
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirm: z.string().min(1, 'Please confirm your password'),
}).refine(data => data.password === data.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
})

export const subscriptionSchema = z.object({
  name: nameSchema,
  price: amountSchema,
  currency: currencySchema,
  billingCycle: z.enum(['monthly', 'yearly', 'custom']),
  nextPayment: z.string().datetime(),
  category: z.string().min(1).max(50),
  paymentMethod: z.string().optional(),
  notes: z.string().max(500).optional(),
})

export const teamSchema = z.object({
  name: nameSchema,
  description: z.string().max(500).optional(),
})

export const inviteSchema = z.object({
  email: emailSchema,
  role: z.enum(['admin', 'member']),
})

// Функции санитизации
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Удаляем потенциально опасные символы
    .slice(0, 1000) // Ограничиваем длину
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export function sanitizeAmount(amount: number): number {
  return Math.round(amount * 100) / 100 // Округляем до 2 знаков
}

// Функции валидации
export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success
}

export function validatePassword(password: string): boolean {
  return passwordSchema.safeParse(password).success
}

export function validateAmount(amount: number): boolean {
  return amountSchema.safeParse(amount).success
}

// Rate limiting helpers
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map()
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now()
    const attempt = this.attempts.get(key)
    
    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs })
      return true
    }
    
    if (attempt.count >= this.maxAttempts) {
      return false
    }
    
    attempt.count++
    return true
  }
  
  reset(key: string): void {
    this.attempts.delete(key)
  }
}

// CSRF protection
export function generateCSRFToken(): string {
  return crypto.getRandomValues(new Uint8Array(32))
    .reduce((acc, val) => acc + val.toString(16).padStart(2, '0'), '')
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken && token.length === 64
}

// Input sanitization for XSS prevention
export function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export function unescapeHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || ''
} 