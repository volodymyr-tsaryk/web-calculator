// lib/calculator.ts
import { evaluate as mathEvaluate, format } from 'mathjs'

export function evaluate(expression: string): string | null {
  if (!expression.trim()) return null
  try {
    const result = mathEvaluate(expression)
    if (typeof result !== 'number' && typeof result !== 'bigint') return null
    return format(result, { notation: 'auto', precision: 10 })
  } catch {
    return null
  }
}

export function formatResult(value: string): string {
  const num = parseFloat(value)
  if (isNaN(num)) return value
  // Remove trailing zeros after decimal
  return String(parseFloat(num.toPrecision(10)))
}
