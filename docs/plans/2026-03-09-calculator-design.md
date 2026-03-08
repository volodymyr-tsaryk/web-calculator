# Web Calculator — Design Document

**Date:** 2026-03-09
**Status:** Approved

---

## Overview

A full-page web-based calculator built with Next.js 15 (App Router), TypeScript, Tailwind CSS, and `math.js`. Designed as a study project with a clear extensibility path toward a scientific/engineering calculator. Deployed on Vercel.

---

## Goals

- Basic calculator operations via expression parsing (not sequential button state)
- Persistent calculation history (localStorage) with session clear
- Dark/light theme switcher
- Clean, AI-friendly codebase structure for future feature extension
- Proper CLAUDE.md documentation

---

## Architecture

### Project Structure

```
web-calculator/
├── app/
│   ├── layout.tsx          # Root layout, ThemeProvider
│   ├── page.tsx            # Main calculator page
│   └── globals.css         # CSS variables for themes
├── components/
│   ├── Calculator/
│   │   ├── Display.tsx     # Expression + result display
│   │   ├── Keypad.tsx      # Basic button grid
│   │   └── index.tsx       # Root layout (Display + Keypad + History)
│   ├── HistoryPanel/
│   │   ├── HistoryItem.tsx
│   │   └── index.tsx
│   └── ThemeToggle.tsx
├── hooks/
│   └── useCalculator.ts    # All calculator state & logic
├── lib/
│   └── calculator.ts       # Pure math helpers (wraps math.js)
├── types/
│   └── calculator.ts       # Shared TypeScript types
└── docs/
    └── plans/              # Design & implementation docs
```

### Tech Stack

| Tool | Purpose |
|------|---------|
| Next.js 15 (App Router) | Framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| `math.js` | Expression evaluation |
| `next-themes` | Dark/light theme switching |

---

## UI Layout

```
┌─────────────────────────────────────────────────┐
│  [☀/🌙 Theme Toggle]              Web Calculator │
├──────────────────────────┬──────────────────────┤
│                          │   History Panel       │
│  ┌────────────────────┐  │  ─────────────────── │
│  │ 2 * (3 + 4)        │  │  2*(3+4) = 14        │
│  │              = 14  │  │  5! = 120             │
│  └────────────────────┘  │  sin(90) = 1          │
│                          │  ─────────────────── │
│  [7][8][9][÷]            │  [Clear History]      │
│  [4][5][6][×]            │                       │
│  [1][2][3][−]            │                       │
│  [0][.][=][+]            │                       │
│  [(][)][C][⌫]            │                       │
└──────────────────────────┴──────────────────────┘
```

- **Display**: live expression + evaluated result below
- **Keypad**: 5×4 grid; button types: `number | operator | action | paren`
- **HistoryPanel**: scrollable, clickable entries restore expression; persistent via localStorage
- **Responsive**: history panel collapses below keypad on mobile

---

## State Management

All state lives in `useCalculator` hook:

```typescript
type CalculatorState = {
  expression: string      // current expression: "2*(3+4)"
  result: string          // live-evaluated result: "14"
  history: HistoryEntry[] // persisted to localStorage
  error: string | null    // shown in display, cleared on next input
}

type HistoryEntry = {
  id: string
  expression: string
  result: string
  timestamp: number
}
```

### Data Flow

1. Button press → `appendToExpression(token)` or action (`clear`, `backspace`, `evaluate`)
2. Every keystroke → `math.js` evaluates live → updates `result`
3. `=` pressed → entry pushed to `history` → saved to localStorage
4. History item clicked → restores expression to display
5. Theme toggle → `next-themes` manages `<html>` class

### Error Handling

`math.js` throws on invalid expressions. Errors are caught in `lib/calculator.ts`, returned as `null` result (not thrown), and displayed non-blocking in the display. Cleared on next input.

---

## Extensibility: Scientific Mode

No existing code changes required. Adding scientific mode means:

1. Add `ScientificKeypad.tsx` — new component with function buttons (`sin`, `cos`, `log`, etc.)
2. Add `mode: 'basic' | 'scientific'` to `CalculatorState`
3. Toggle renders `Keypad` or `ScientificKeypad`
4. No changes to `useCalculator`, `lib/calculator.ts`, or `HistoryPanel` — `math.js` already handles scientific functions

Scientific keypad buttons simply insert expression tokens (e.g., `sin(`, `sqrt(`) — same mechanism as basic buttons.

---

## Deployment

- Platform: Vercel
- No backend required — pure client-side app
- `next.config.ts` may need `output: 'export'` if static export is preferred, otherwise standard Vercel Next.js deployment works out of the box

---

## CLAUDE.md Contents (planned)

- Project purpose & tech stack summary
- Component map: what each file does
- How to add a new button/operator
- How to add a new calculator mode
- Key conventions (hook-first logic, pure lib functions)
- Vercel deployment notes
