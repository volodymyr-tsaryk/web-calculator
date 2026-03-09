# Web Calculator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full-page Next.js 15 web calculator with expression parsing, persistent history, and dark/light theming — deployable to Vercel.

**Architecture:** Feature-based component architecture with all state in a `useCalculator` hook. Pure math logic isolated in `lib/calculator.ts` (wraps `math.js`). UI split into `Calculator`, `Display`, `Keypad`, `HistoryPanel`, and `ThemeToggle` components.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, math.js, next-themes, Jest + React Testing Library

**Design doc:** `docs/plans/2026-03-09-calculator-design.md`

---

## Task 1: Scaffold Next.js Project

**Files:**
- Create: project root (Next.js scaffold)

**Step 1: Initialize Next.js app**

Run from the repo root (not inside a subdirectory — the repo IS the project):

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

Answer prompts: accept all defaults.

**Step 2: Verify dev server starts**

```bash
npm run dev
```

Expected: server starts at `http://localhost:3000`, default Next.js page visible.

**Step 3: Commit scaffold**

```bash
git add -A
git commit -m "feat: scaffold Next.js 15 app with TypeScript and Tailwind"
```

---

## Task 2: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install runtime dependencies**

```bash
npm install mathjs next-themes
```

**Step 2: Install test dependencies**

```bash
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest @types/jest
```

**Step 3: Configure Jest**

Create `jest.config.ts`:

```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
}

export default createJestConfig(config)
```

Create `jest.setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

**Step 4: Add test script to package.json**

In `package.json`, add to `"scripts"`:

```json
"test": "jest",
"test:watch": "jest --watch"
```

**Step 5: Verify test setup**

```bash
npx jest --version
```

Expected: prints jest version without errors.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add mathjs, next-themes, and jest test setup"
```

---

## Task 3: TypeScript Types

**Files:**
- Create: `types/calculator.ts`

**Step 1: Write the types file**

```typescript
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
```

**Step 2: Commit**

```bash
git add types/calculator.ts
git commit -m "feat: add calculator TypeScript types"
```

---

## Task 4: Calculator Library (Pure Math Logic)

**Files:**
- Create: `lib/calculator.ts`
- Create: `lib/__tests__/calculator.test.ts`

**Step 1: Write failing tests**

Create `lib/__tests__/calculator.test.ts`:

```typescript
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
```

**Step 2: Run to verify tests fail**

```bash
npx jest lib/__tests__/calculator.test.ts
```

Expected: FAIL — "Cannot find module '../calculator'"

**Step 3: Implement lib/calculator.ts**

```typescript
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
```

**Step 4: Run tests to verify they pass**

```bash
npx jest lib/__tests__/calculator.test.ts
```

Expected: all 7 tests PASS

**Step 5: Commit**

```bash
git add lib/calculator.ts lib/__tests__/calculator.test.ts
git commit -m "feat: add calculator math library with tests"
```

---

## Task 5: Button Configuration

**Files:**
- Create: `lib/buttons.ts`

**Step 1: Create button layout config**

```typescript
// lib/buttons.ts
import { ButtonConfig } from '@/types/calculator'

export const BUTTONS: ButtonConfig[] = [
  // Row 1
  { label: '7', value: '7', type: 'number' },
  { label: '8', value: '8', type: 'number' },
  { label: '9', value: '9', type: 'number' },
  { label: '÷', value: '/', type: 'operator' },
  // Row 2
  { label: '4', value: '4', type: 'number' },
  { label: '5', value: '5', type: 'number' },
  { label: '6', value: '6', type: 'number' },
  { label: '×', value: '*', type: 'operator' },
  // Row 3
  { label: '1', value: '1', type: 'number' },
  { label: '2', value: '2', type: 'number' },
  { label: '3', value: '3', type: 'number' },
  { label: '−', value: '-', type: 'operator' },
  // Row 4
  { label: '0', value: '0', type: 'number' },
  { label: '.', value: '.', type: 'number' },
  { label: '=', value: '=', type: 'action' },
  { label: '+', value: '+', type: 'operator' },
  // Row 5
  { label: '(', value: '(', type: 'paren' },
  { label: ')', value: ')', type: 'paren' },
  { label: 'C', value: 'clear', type: 'action' },
  { label: '⌫', value: 'backspace', type: 'action' },
]
```

**Step 2: Commit**

```bash
git add lib/buttons.ts
git commit -m "feat: add button configuration layout"
```

---

## Task 6: useCalculator Hook

**Files:**
- Create: `hooks/useCalculator.ts`
- Create: `hooks/__tests__/useCalculator.test.ts`

**Step 1: Write failing tests**

Create `hooks/__tests__/useCalculator.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react'
import { useCalculator } from '../useCalculator'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('useCalculator', () => {
  beforeEach(() => localStorageMock.clear())

  it('starts with empty expression', () => {
    const { result } = renderHook(() => useCalculator())
    expect(result.current.state.expression).toBe('')
  })

  it('appends token to expression', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.append('2'))
    act(() => result.current.append('+'))
    act(() => result.current.append('3'))
    expect(result.current.state.expression).toBe('2+3')
  })

  it('evaluates expression and adds to history', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.append('2'))
    act(() => result.current.append('+'))
    act(() => result.current.append('3'))
    act(() => result.current.evaluate())
    expect(result.current.state.result).toBe('5')
    expect(result.current.state.history).toHaveLength(1)
    expect(result.current.state.history[0].expression).toBe('2+3')
  })

  it('clears expression', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.append('5'))
    act(() => result.current.clear())
    expect(result.current.state.expression).toBe('')
    expect(result.current.state.result).toBe('')
  })

  it('handles backspace', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.append('1'))
    act(() => result.current.append('2'))
    act(() => result.current.backspace())
    expect(result.current.state.expression).toBe('1')
  })

  it('clears history', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.append('1'))
    act(() => result.current.evaluate())
    act(() => result.current.clearHistory())
    expect(result.current.state.history).toHaveLength(0)
  })

  it('restores expression from history', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.append('7'))
    act(() => result.current.append('+'))
    act(() => result.current.append('3'))
    act(() => result.current.evaluate())
    const entry = result.current.state.history[0]
    act(() => result.current.restoreFromHistory(entry))
    expect(result.current.state.expression).toBe('7+3')
  })
})
```

**Step 2: Run to verify tests fail**

```bash
npx jest hooks/__tests__/useCalculator.test.ts
```

Expected: FAIL — "Cannot find module '../useCalculator'"

**Step 3: Implement useCalculator hook**

Create `hooks/useCalculator.ts`:

```typescript
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
```

**Step 4: Run tests to verify they pass**

```bash
npx jest hooks/__tests__/useCalculator.test.ts
```

Expected: all 7 tests PASS

**Step 5: Commit**

```bash
git add hooks/useCalculator.ts hooks/__tests__/useCalculator.test.ts
git commit -m "feat: add useCalculator hook with localStorage history and tests"
```

---

## Task 7: Display Component

**Files:**
- Create: `components/Calculator/Display.tsx`

**Step 1: Implement Display component**

```typescript
// components/Calculator/Display.tsx
interface DisplayProps {
  expression: string
  result: string
  error: string | null
}

export function Display({ expression, result, error }: DisplayProps) {
  return (
    <div className="bg-gray-900 dark:bg-gray-950 rounded-xl p-4 min-h-[100px] flex flex-col justify-end items-end gap-1 font-mono">
      <div className="text-gray-400 text-sm min-h-[20px] truncate w-full text-right">
        {expression || '0'}
      </div>
      {error ? (
        <div className="text-red-400 text-lg font-semibold">{error}</div>
      ) : (
        <div className="text-white text-3xl font-bold truncate w-full text-right">
          {result || '0'}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/Calculator/Display.tsx
git commit -m "feat: add Display component"
```

---

## Task 8: Keypad Component

**Files:**
- Create: `components/Calculator/Keypad.tsx`

**Step 1: Implement Keypad component**

```typescript
// components/Calculator/Keypad.tsx
import { BUTTONS } from '@/lib/buttons'
import { ButtonConfig } from '@/types/calculator'

interface KeypadProps {
  onButton: (value: string) => void
}

const buttonStyles: Record<string, string> = {
  number:   'bg-gray-700 hover:bg-gray-600 text-white',
  operator: 'bg-blue-600 hover:bg-blue-500 text-white',
  action:   'bg-gray-600 hover:bg-gray-500 text-white',
  paren:    'bg-gray-700 hover:bg-gray-600 text-blue-300',
}

function CalcButton({ config, onClick }: { config: ButtonConfig; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        ${buttonStyles[config.type]}
        rounded-xl text-xl font-semibold
        h-14 transition-colors duration-100
        active:scale-95 select-none cursor-pointer
        ${config.wide ? 'col-span-2' : ''}
      `}
    >
      {config.label}
    </button>
  )
}

export function Keypad({ onButton }: KeypadProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {BUTTONS.map((btn) => (
        <CalcButton
          key={btn.value}
          config={btn}
          onClick={() => onButton(btn.value)}
        />
      ))}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/Calculator/Keypad.tsx
git commit -m "feat: add Keypad component"
```

---

## Task 9: HistoryPanel Component

**Files:**
- Create: `components/HistoryPanel/HistoryItem.tsx`
- Create: `components/HistoryPanel/index.tsx`

**Step 1: Implement HistoryItem**

```typescript
// components/HistoryPanel/HistoryItem.tsx
import { HistoryEntry } from '@/types/calculator'

interface HistoryItemProps {
  entry: HistoryEntry
  onClick: (entry: HistoryEntry) => void
}

export function HistoryItem({ entry, onClick }: HistoryItemProps) {
  return (
    <button
      onClick={() => onClick(entry)}
      className="w-full text-right px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
    >
      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
        {entry.expression}
      </div>
      <div className="text-base font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
        = {entry.result}
      </div>
    </button>
  )
}
```

**Step 2: Implement HistoryPanel**

```typescript
// components/HistoryPanel/index.tsx
import { HistoryEntry } from '@/types/calculator'
import { HistoryItem } from './HistoryItem'

interface HistoryPanelProps {
  history: HistoryEntry[]
  onSelect: (entry: HistoryEntry) => void
  onClear: () => void
}

export function HistoryPanel({ history, onSelect, onClear }: HistoryPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          History
        </h2>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {history.length === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-gray-600 mt-6">
            No history yet
          </p>
        ) : (
          history.map((entry) => (
            <HistoryItem key={entry.id} entry={entry} onClick={onSelect} />
          ))
        )}
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add components/HistoryPanel/
git commit -m "feat: add HistoryPanel component"
```

---

## Task 10: ThemeToggle Component

**Files:**
- Create: `components/ThemeToggle.tsx`

**Step 1: Implement ThemeToggle**

```typescript
// components/ThemeToggle.tsx
'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="w-9 h-9" /> // prevent hydration mismatch

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-9 h-9 rounded-lg flex items-center justify-center text-lg
        bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
        transition-colors cursor-pointer"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
```

**Step 2: Commit**

```bash
git add components/ThemeToggle.tsx
git commit -m "feat: add ThemeToggle component"
```

---

## Task 11: Calculator Root Component

**Files:**
- Create: `components/Calculator/index.tsx`

**Step 1: Implement Calculator root**

```typescript
// components/Calculator/index.tsx
'use client'

import { useCalculator } from '@/hooks/useCalculator'
import { Display } from './Display'
import { Keypad } from './Keypad'
import { HistoryPanel } from '@/components/HistoryPanel'
import { ThemeToggle } from '@/components/ThemeToggle'

export function Calculator() {
  const { state, append, evaluate, clear, backspace, clearHistory, restoreFromHistory } = useCalculator()

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
```

**Step 2: Commit**

```bash
git add components/Calculator/index.tsx
git commit -m "feat: add Calculator root component"
```

---

## Task 12: App Layout & Pages

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

**Step 1: Update app/layout.tsx to add ThemeProvider**

Replace the contents of `app/layout.tsx` with:

```typescript
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Web Calculator',
  description: 'A modern web calculator with expression parsing and history',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Step 2: Update app/page.tsx**

Replace contents with:

```typescript
import { Calculator } from '@/components/Calculator'

export default function Home() {
  return <Calculator />
}
```

**Step 3: Simplify globals.css**

Keep only the Tailwind directives and remove the default Next.js boilerplate styles. The file should be:

```css
@import "tailwindcss";
```

(Tailwind v4 uses this single import. If scaffolded with v3, keep the three `@tailwind` directives instead.)

**Step 4: Verify the app runs**

```bash
npm run dev
```

Open `http://localhost:3000` — full-page calculator should render with display, keypad, and history panel.

**Step 5: Commit**

```bash
git add app/layout.tsx app/page.tsx app/globals.css
git commit -m "feat: wire up app layout, ThemeProvider, and main page"
```

---

## Task 13: Keyboard Support

**Files:**
- Modify: `hooks/useCalculator.ts`

**Step 1: Add keyboard event handler to useCalculator**

Add this export to the bottom of `hooks/useCalculator.ts`:

```typescript
export function useKeyboard(
  handlers: Pick<ReturnType<typeof useCalculator>, 'append' | 'evaluate' | 'clear' | 'backspace'>
) {
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
```

**Step 2: Use the hook in Calculator/index.tsx**

In `components/Calculator/index.tsx`, import and call `useKeyboard`:

```typescript
import { useCalculator, useKeyboard } from '@/hooks/useCalculator'

// Inside the Calculator component, after destructuring:
useKeyboard({ append, evaluate, clear, backspace })
```

**Step 3: Verify keyboard works**

Run `npm run dev`, click on the page to focus it, and type numbers/operators. They should appear in the display.

**Step 4: Commit**

```bash
git add hooks/useCalculator.ts components/Calculator/index.tsx
git commit -m "feat: add keyboard input support"
```

---

## Task 14: CLAUDE.md Documentation

**Files:**
- Create: `CLAUDE.md`

**Step 1: Write CLAUDE.md**

```markdown
# Web Calculator — CLAUDE.md

## Project Purpose

A study project: a full-page web calculator with expression parsing, persistent history, and dark/light theming. Built to be extended toward a scientific/engineering calculator.

**Live URL:** Deployed on Vercel (see Vercel dashboard for URL)

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Next.js | 15 | Framework (App Router) |
| TypeScript | 5 | Type safety |
| Tailwind CSS | v4 | Styling |
| math.js | latest | Expression evaluation |
| next-themes | latest | Dark/light theme switching |
| Jest + RTL | latest | Unit testing |

---

## Project Structure

```
app/
  layout.tsx          # Root layout, wraps app in ThemeProvider
  page.tsx            # Entry point — renders <Calculator />
  globals.css         # Tailwind import

components/
  Calculator/
    index.tsx         # Root calculator layout, keyboard handler
    Display.tsx       # Expression + result display area
    Keypad.tsx        # 5×4 button grid
  HistoryPanel/
    index.tsx         # History list + clear button
    HistoryItem.tsx   # Single history entry (click to restore)
  ThemeToggle.tsx     # Dark/light toggle button

hooks/
  useCalculator.ts    # ALL calculator state & actions (single source of truth)

lib/
  calculator.ts       # Pure evaluate() function wrapping math.js
  buttons.ts          # Static button configuration array

types/
  calculator.ts       # Shared TypeScript interfaces

docs/
  plans/              # Design and implementation plan documents
```

---

## Key Conventions

### State lives in useCalculator
Never manage calculator state in components. All state (`expression`, `result`, `history`, `error`) lives in `hooks/useCalculator.ts`. Components receive state as props and call actions.

### Pure math logic in lib/calculator.ts
The `evaluate()` function in `lib/calculator.ts` wraps `math.js` and returns `string | null`. It never throws. All expression evaluation goes through this function.

### Button actions
Buttons emit a `value` string. The `Calculator/index.tsx` `handleButton()` function routes:
- `'='` → `evaluate()`
- `'clear'` → `clear()`
- `'backspace'` → `backspace()`
- anything else → `append(value)`

---

## How to Add a New Button

1. Add an entry to the `BUTTONS` array in `lib/buttons.ts`
2. Set `type` to `'number'`, `'operator'`, `'action'`, or `'paren'`
3. If `value` is a new action (not a token), handle it in `handleButton()` in `components/Calculator/index.tsx`

---

## How to Add a New Calculator Mode (e.g. Scientific)

1. Add `mode: 'basic' | 'scientific'` to `CalculatorState` in `types/calculator.ts`
2. Add `setMode` action to `useCalculator.ts`
3. Create `components/Calculator/ScientificKeypad.tsx` with scientific buttons
   - Buttons insert expression tokens: `sin(`, `cos(`, `sqrt(`, etc.
   - `math.js` already handles these — no changes to `lib/calculator.ts` needed
4. In `components/Calculator/index.tsx`, render `Keypad` or `ScientificKeypad` based on `state.mode`

---

## Running the Project

```bash
npm run dev        # Development server at localhost:3000
npm run build      # Production build
npm run test       # Run unit tests
npm run test:watch # Watch mode
```

---

## Deployment (Vercel)

1. Push to GitHub
2. Import repo in Vercel dashboard
3. Framework: Next.js (auto-detected)
4. No environment variables required
5. Deploy — done

---

## Design Decisions

- **Expression parsing over sequential state:** We store the full expression string and evaluate it with `math.js` on every keystroke. This is simpler and more extensible than tracking operand/operator state manually.
- **localStorage for history:** No backend needed — history is saved client-side. Users own their data.
- **next-themes for theming:** Handles SSR hydration safely via `suppressHydrationWarning` on `<html>`.
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md with project documentation"
```

---

## Task 15: Final Verification & Vercel Prep

**Files:**
- Check: `next.config.ts`

**Step 1: Run full test suite**

```bash
npm run test
```

Expected: all tests PASS

**Step 2: Run production build**

```bash
npm run build
```

Expected: build completes with no errors. Note any warnings.

**Step 3: Verify Vercel config**

Open `next.config.ts`. For standard Vercel deployment, no changes are needed — Next.js App Router deploys as-is. If you see `output: 'export'`, remove it (static export disables some Next.js features).

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: verify build and finalize for Vercel deployment"
```

**Step 5: Push to GitHub and deploy**

```bash
git remote add origin <your-github-repo-url>
git push -u origin main
```

Then import the repo in the Vercel dashboard.

---

## Summary

| Task | What gets built |
|------|----------------|
| 1 | Next.js scaffold |
| 2 | Dependencies + Jest setup |
| 3 | TypeScript types |
| 4 | `lib/calculator.ts` + tests |
| 5 | Button configuration |
| 6 | `useCalculator` hook + tests |
| 7 | Display component |
| 8 | Keypad component |
| 9 | HistoryPanel component |
| 10 | ThemeToggle component |
| 11 | Calculator root component |
| 12 | App layout + pages |
| 13 | Keyboard support |
| 14 | CLAUDE.md documentation |
| 15 | Final verification + Vercel prep |
