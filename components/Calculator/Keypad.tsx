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
