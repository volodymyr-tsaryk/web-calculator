// components/Calculator/index.tsx
'use client'

import { useCalculator, useKeyboard } from '@/hooks/useCalculator'
import { Display } from './Display'
import { Keypad } from './Keypad'
import { HistoryPanel } from '@/components/HistoryPanel'
import { ThemeToggle } from '@/components/ThemeToggle'

export function Calculator() {
  const { state, append, evaluate, clear, backspace, clearHistory, restoreFromHistory } = useCalculator()
  useKeyboard({ append, evaluate, clear, backspace })

  function handleButton(value: string) {
    if (value === '=') evaluate()
    else if (value === 'clear') clear()
    else if (value === 'backspace') backspace()
    else append(value)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-lg font-bold text-gray-800 dark:text-white tracking-tight">
          Web Calculator
        </h1>
        <ThemeToggle />
      </header>

      {/* Main layout */}
      <main className="flex flex-col lg:flex-row max-w-4xl mx-auto p-6 gap-6">
        {/* Calculator panel */}
        <div className="flex flex-col gap-4 w-full lg:w-80 shrink-0">
          <Display
            expression={state.expression}
            result={state.result}
            error={state.error}
          />
          <Keypad onButton={handleButton} />
        </div>

        {/* History panel */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden lg:max-h-[520px]">
          <HistoryPanel
            history={state.history}
            onSelect={restoreFromHistory}
            onClear={clearHistory}
          />
        </div>
      </main>
    </div>
  )
}
