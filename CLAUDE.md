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
