// types/calculator.ts

export type ButtonType = 'number' | 'operator' | 'action' | 'paren'

export interface ButtonConfig {
  label: string
  value: string
  type: ButtonType
  wide?: boolean
}

export interface HistoryEntry {
  id: string
  expression: string
  result: string
  timestamp: number
}

export interface CalculatorState {
  expression: string
  result: string
  history: HistoryEntry[]
  error: string | null
}
