import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('utils', () => {
  it('cn function should merge class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
    expect(cn('class1', undefined, 'class2')).toBe('class1 class2')
    expect(cn('class1', null, 'class2')).toBe('class1 class2')
  })
}) 