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
