import { evaluate, formatResult } from '../calculator'

describe('evaluate', () => {
  it('evaluates basic addition', () => {
    expect(evaluate('2+3')).toBe('5')
  })

  it('evaluates multiplication', () => {
    expect(evaluate('4*5')).toBe('20')
  })

  it('evaluates expression with parentheses', () => {
    expect(evaluate('2*(3+4)')).toBe('14')
  })

  it('evaluates division', () => {
    expect(evaluate('10/4')).toBe('2.5')
  })

  it('returns null for incomplete expression', () => {
    expect(evaluate('2+')).toBeNull()
  })

  it('returns null for empty expression', () => {
    expect(evaluate('')).toBeNull()
  })

  it('returns null for invalid expression', () => {
    expect(evaluate('abc')).toBeNull()
  })
})

describe('formatResult', () => {
  it('formats integers without decimals', () => {
    expect(formatResult('14')).toBe('14')
  })

  it('rounds long decimals to 10 significant digits', () => {
    const result = formatResult('0.1000000001')
    expect(result.length).toBeLessThanOrEqual(12)
  })
})
