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
