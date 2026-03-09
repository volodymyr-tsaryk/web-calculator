---
name: Web Calculator
techStack:
  - "Next.js 16.1.6 (App Router)"
  - "React 19.2.3"
  - "TypeScript 5 (strict mode)"
  - "Tailwind CSS v4 (CSS-based config, no tailwind.config.ts)"
  - "math.js 15.1.1 (expression evaluation)"
  - "next-themes 0.4.6 (dark/light theming)"
  - "Jest 30.2.0 + React Testing Library 16.3.2"
  - "Vercel (static deployment, no backend)"
conventions:
  - "All calculator state lives exclusively in hooks/useCalculator.ts — no component-level state"
  - "Components are presentational and receive state as props; only Calculator/index.tsx is a stateful container"
  - "Math evaluation logic is isolated in lib/calculator.ts — wraps math.js, returns string|null, never throws"
  - "Button configuration is data-driven via BUTTONS array in lib/buttons.ts — UI is generated from config"
  - "Button routing: Calculator/index.tsx handleButton() dispatches '='→evaluate(), 'clear'→clear(), 'backspace'→backspace(), anything else→append()"
  - "Path aliases: @/components, @/hooks, @/lib, @/types"
  - "Named exports everywhere except app/layout.tsx and app/page.tsx (Next.js required defaults)"
  - "Components use 'use client' directive only when needed (hooks/browser APIs) — Calculator/index.tsx and ThemeToggle.tsx"
  - "Naming: PascalCase components, camelCase functions, UPPER_SNAKE_CASE constants, PascalCase interfaces"
  - "Error handling: try/catch wraps risky ops (localStorage, math.js); silent failures for non-critical (localStorage), user-visible error string for invalid expressions"
  - "localStorage key: 'calculator-history' — stores JSON array of HistoryEntry"
  - "Tailwind dark mode uses @variant dark (&:where(.dark, .dark *)) in globals.css — class-based, not media query"
  - "Tests: TDD for logic files (lib/, hooks/); no tests for presentational components"
  - "SSR safety: typeof window === 'undefined' guard before localStorage access"
triggerLabel: ai-review
mention: "@task-ai"
reviewCriteria:
  minDescriptionLength: 50
  requiredFields:
    - title
    - description
---

## Business Overview

Web Calculator is a study project — a full-page browser-based calculator with expression parsing, persistent calculation history, and dark/light theming. It is designed as a foundation to be extended into a scientific/engineering calculator.

**Users:** Individual users studying or using the calculator in a browser. No authentication, no accounts, no multi-user features.

**Business model:** Not a commercial product. Study/portfolio project.

**Deployment:** Vercel, static export. No backend, no database, no API routes. All state is client-side (localStorage for history).

**Key goals:** Clean extensible architecture for adding scientific features; proper documentation for AI-assisted development; Vercel-ready.

---

## Core Domain Concepts

**Expression**
A string representing a math formula being built by the user, e.g. `"2*(3+4)"`. Stored as a plain string. Evaluated live on every keystroke by math.js. Operators are stored as their math.js-compatible characters (`/` not `÷`, `*` not `×`, `-` not `−`).

**Result**
The current evaluated value of the expression, formatted as a string. Calculated by `lib/calculator.ts` `evaluate()` which returns `string | null`. Shown live in the display. Returns `null` (not an error) for incomplete expressions like `"2+"`.

**HistoryEntry**
A record of a completed calculation. Created when the user presses `=`. Contains `{ id: UUID, expression: string, result: string, timestamp: number }`. Persisted to localStorage as a JSON array under key `'calculator-history'`. Clicking a history entry restores the expression to the display.

**ButtonConfig**
Static configuration for a calculator button: `{ label, value, type, wide? }`. `label` is what's displayed; `value` is what gets appended to the expression (or a special action string like `'clear'`). `type` controls styling: `'number' | 'operator' | 'action' | 'paren'`.

**ButtonType**
Determines the visual style of a button:
- `number` → gray-700 background
- `operator` → blue-600 background
- `action` → gray-600 background (C, ⌫, =)
- `paren` → gray-700 background, blue-300 text

---

## Architecture

**Single-page client-side app.** No server-side logic, no API routes, no database.

```
Browser
  └── Next.js App Router (static output)
        └── app/layout.tsx       ← ThemeProvider wrapper
              └── app/page.tsx   ← renders <Calculator />
                    └── components/Calculator/index.tsx  ← stateful root
                          ├── hooks/useCalculator.ts     ← ALL state
                          ├── lib/calculator.ts          ← math evaluation
                          ├── lib/buttons.ts             ← button config
                          ├── components/Calculator/Display.tsx
                          ├── components/Calculator/Keypad.tsx
                          ├── components/HistoryPanel/
                          └── components/ThemeToggle.tsx
```

**Data flow:**
1. User clicks button or presses key
2. `handleButton(value)` or `useKeyboard()` receives the event
3. Routes to `append()`, `evaluate()`, `clear()`, or `backspace()` in `useCalculator`
4. `append()` concatenates token and calls `lib/calculator.ts evaluate()` for live result
5. `evaluate()` adds a `HistoryEntry` and persists to localStorage
6. React state update triggers re-render of Display and HistoryPanel

**Persistence:** localStorage only. `loadHistory()` runs on hook mount (guarded for SSR). `saveHistory()` runs on every `evaluate()` and `clearHistory()`.

**Theming:** `next-themes` sets `class="dark"` on `<html>`. Tailwind v4 is configured with `@variant dark (&:where(.dark, .dark *))` to apply `dark:` utilities based on that class.

---

## Key Business Rules

- **Expression-based evaluation:** The full expression string is always stored and evaluated as a unit. The app does NOT track operands and operators as separate state (no `currentValue` / `operator` pattern). This is intentional — it enables future scientific expression support.
- **Live evaluation:** `evaluate()` from `lib/calculator.ts` is called on EVERY keystroke in `append()` and `backspace()`. The result updates in real-time. Incomplete/invalid expressions return `null` (display shows previous result or `"0"`), not an error.
- **History is append-only at the front:** New entries are unshifted (`[entry, ...prev.history]`), so most recent appears first.
- **Evaluation only saves to history:** Appending tokens does NOT add to history. Only pressing `=` (or `Enter` on keyboard) saves a `HistoryEntry`.
- **Error state is transient:** Setting `error` in state shows it in the display. It is cleared on the next `append()`, `backspace()`, or `clear()` call.
- **Scientific functions already work:** math.js handles `sin()`, `cos()`, `tan()`, `log()`, `sqrt()`, `factorial()`, etc. in the expression string. The only missing piece is buttons to insert those tokens.
- **No input validation on the button level:** Any token can be appended. Validation happens lazily in math.js during `evaluate()`.

---

## Development Conventions

### Adding a new calculator button
1. Add entry to `BUTTONS` array in `lib/buttons.ts`
2. Set `label` (display text), `value` (token appended to expression), `type` (for styling)
3. If `value` is a special action (not a math token), add a case in `handleButton()` in `components/Calculator/index.tsx`
4. No changes to `useCalculator`, `lib/calculator.ts`, or any other file

### Adding scientific mode
1. Add `mode: 'basic' | 'scientific'` to `CalculatorState` in `types/calculator.ts`
2. Add `setMode` action to `useCalculator.ts`
3. Create `components/Calculator/ScientificKeypad.tsx` — buttons insert tokens like `sin(`, `sqrt(`, `log(`
4. In `Calculator/index.tsx`, conditionally render `<Keypad>` or `<ScientificKeypad>` based on `state.mode`
5. No changes to `lib/calculator.ts` — math.js already handles scientific functions

### Adding a new test
- Logic tests go in `lib/__tests__/` or `hooks/__tests__/`
- Use `renderHook` + `act` for hook tests
- Mock localStorage with the in-memory pattern from `hooks/__tests__/useCalculator.test.ts`
- Run with `npm run test`

### File locations
| What | Where |
|------|-------|
| Calculator state/actions | `hooks/useCalculator.ts` |
| Math evaluation | `lib/calculator.ts` |
| Button definitions | `lib/buttons.ts` |
| Shared TypeScript types | `types/calculator.ts` |
| UI components | `components/Calculator/` and `components/HistoryPanel/` |
| Global styles | `app/globals.css` |
| App entry | `app/page.tsx` |

---

## Common Pitfalls

- **Do not add `darkMode: 'class'` to a tailwind config** — there is no `tailwind.config.ts` in this project (Tailwind v4). Dark mode is configured via `@variant dark (&:where(.dark, .dark *))` in `app/globals.css`. Adding a config file may conflict.
- **Do not manage calculator state in components** — all state must stay in `useCalculator`. Components are passed state as props and call actions. Adding `useState` for calculator concerns in a component breaks the single-source-of-truth architecture.
- **Do not call `lib/calculator.ts evaluate()` directly from components** — it must go through the hook actions (`append`, `evaluate`, etc.).
- **`formatResult()` in `lib/calculator.ts` is not used in the current UI flow** — it exists for future use. The `evaluate()` function already formats via `math.js format()`. Do not add a second formatting layer without understanding this.
- **The display labels (÷, ×, −) differ from the token values (/, *, -)** — `ButtonConfig.label` is for display only; `ButtonConfig.value` is what gets appended to the expression. Never use the label as a token.
- **`ThemeToggle` has a `mounted` guard** — it renders a blank `<div>` until after hydration. This is required to prevent React hydration mismatch with SSR. Do not remove it.
- **`suppressHydrationWarning` on `<html>` is required** — `next-themes` modifies the class attribute client-side after SSR. Without this, React logs hydration warnings. Do not remove it from `app/layout.tsx`.
- **History entries are unshifted, not pushed** — newest entry is at index `[0]`. Code that iterates history should account for this order.
- **`crypto.randomUUID()` is used for history IDs** — this is a browser API, not available in Node.js < 19 or non-browser environments. Tests run in jsdom which supports it.
- **React Compiler is enabled** (`reactCompiler: true` in `next.config.ts`) — it auto-optimizes memoization. Do not add `useMemo`/`useCallback` manually unless you have a specific reason; the compiler handles it.

---

## External Integrations

**math.js 15.1.1**
The sole external computation dependency. Used in `lib/calculator.ts` via:
```typescript
import { evaluate as mathEvaluate, format } from 'mathjs'
```
`mathEvaluate(expression)` parses and evaluates any math expression string. `format(result, { notation: 'auto', precision: 10 })` formats the numeric output. No API calls — runs entirely in the browser bundle.

**next-themes 0.4.6**
Manages dark/light/system theme. Injects `class="dark"` or `class="light"` on `<html>`. Configured as `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>`. No external calls — browser-only.

**Vercel**
Deployment platform. The app is a static Next.js export — no serverless functions, no edge functions, no environment variables required. Auto-detected as Next.js on import.

**Next.js Google Fonts (Geist, Geist_Mono)**
Font loading via `next/font/google`. Geist Sans and Geist Mono are loaded with CSS variables (`--font-geist-sans`, `--font-geist-mono`) and applied via body className.
