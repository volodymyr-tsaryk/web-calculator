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
