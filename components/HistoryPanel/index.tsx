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
