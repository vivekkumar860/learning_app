import { useState } from 'react'
import clsx from 'clsx'

export default function MCQCard({ mcq, onAnswer }) {
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)

  const handleSelect = (i) => {
    if (revealed) return
    setSelected(i)
    setRevealed(true)
    onAnswer(mcq.id, i)
  }

  return (
    <div className="card space-y-4">
      <p className="font-medium text-gray-900">{mcq.question}</p>
      <div className="space-y-2">
        {mcq.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className={clsx(
              'w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors',
              !revealed && 'hover:border-primary/50 hover:bg-primary/5 border-gray-200',
              revealed && i === selected && opt.is_correct && 'bg-green-50 border-green-400 text-green-800',
              revealed && i === selected && !opt.is_correct && 'bg-red-50 border-red-400 text-red-800',
              revealed && i !== selected && opt.is_correct && 'bg-green-50 border-green-300 text-green-700',
              revealed && i !== selected && !opt.is_correct && 'border-gray-100 text-gray-400',
              !revealed && 'border-gray-200 text-gray-700'
            )}
          >
            <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
            {opt.text}
          </button>
        ))}
      </div>
      {revealed && mcq.explanation && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-800">
          <span className="font-medium">Explanation: </span>{mcq.explanation}
        </div>
      )}
    </div>
  )
}
