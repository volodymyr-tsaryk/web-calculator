'use client'

import { useState, useEffect, useCallback } from 'react'
import { evaluate as mathEvaluate } from '@/lib/calculator'
import { CalculatorState, HistoryEntry } from '@/types/calculator'

const HISTORY_KEY = 'calculator-history'

function loadHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveHistory(history: HistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  } catch {
    // localStorage unavailable
  }
}

const initialState: CalculatorState = {
  expression: '',
  result: '',
  history: [],
  error: null,
}

export function useCalculator() {
  const [state, setState] = useState<CalculatorState>(initialState)

  useEffect(() => {
    setState(prev => ({ ...prev, history: loadHistory() }))
  }, [])

  const append = useCallback((token: string) => {
    setState(prev => {
      const expression = prev.expression + token
      const result = mathEvaluate(expression) ?? ''
      return { ...prev, expression, result, error: null }
    })
  }, [])

  const evaluate = useCallback(() => {
    setState(prev => {
      const result = mathEvaluate(prev.expression)
      if (!result) return { ...prev, error: 'Invalid expression' }
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        expression: prev.expression,
        result,
        timestamp: Date.now(),
      }
      const history = [entry, ...prev.history]
      saveHistory(history)
      return { ...prev, result, history, error: null }
    })
  }, [])

  const clear = useCallback(() => {
    setState(prev => ({ ...prev, expression: '', result: '', error: null }))
  }, [])

  const backspace = useCallback(() => {
    setState(prev => {
      const expression = prev.expression.slice(0, -1)
      const result = mathEvaluate(expression) ?? ''
      return { ...prev, expression, result, error: null }
    })
  }, [])

  const clearHistory = useCallback(() => {
    saveHistory([])
    setState(prev => ({ ...prev, history: [] }))
  }, [])

  const restoreFromHistory = useCallback((entry: HistoryEntry) => {
    setState(prev => ({
      ...prev,
      expression: entry.expression,
      result: entry.result,
      error: null,
    }))
  }, [])

  return { state, append, evaluate, clear, backspace, clearHistory, restoreFromHistory }
}

export function useKeyboard(handlers: {
  append: (token: string) => void
  evaluate: () => void
  clear: () => void
  backspace: () => void
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const key = e.key
      if ('0123456789'.includes(key)) handlers.append(key)
      else if ('+-*/'.includes(key)) handlers.append(key)
      else if (key === '(' || key === ')') handlers.append(key)
      else if (key === '.') handlers.append('.')
      else if (key === 'Enter' || key === '=') handlers.evaluate()
      else if (key === 'Backspace') handlers.backspace()
      else if (key === 'Escape') handlers.clear()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handlers])
}
