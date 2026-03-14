import ProgressBar from '../ui/ProgressBar'

export default function ResultSummary({ result }) {
  return (
    <div className="card space-y-4">
      <h3 className="font-semibold text-lg">Quiz Results</h3>
      <div className="flex items-center gap-4">
        <div className="text-4xl font-bold text-primary">{result.score_pct}%</div>
        <div className="text-sm text-gray-500">{result.correct}/{result.total} correct</div>
      </div>
      <ProgressBar value={result.score_pct} />
      {result.weak_topics.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Topics to review:</p>
          <div className="flex flex-wrap gap-2">
            {result.weak_topics.map(t => (
              <span key={t} className="bg-red-50 text-red-700 text-xs px-3 py-1 rounded-full border border-red-100">{t}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
