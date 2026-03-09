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
