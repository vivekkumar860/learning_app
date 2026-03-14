import { useEffect, useState } from 'react'
import client from '../../api/client'
import toast from 'react-hot-toast'

export default function ReviewSuggestions() {
  const [suggestions, setSuggestions] = useState([])
  useEffect(() => { client.get('/admin/suggestions').then(r => setSuggestions(r.data)) }, [])

  const review = async (id, status) => {
    await client.patch(`/admin/suggestions/${id}`, { status })
    setSuggestions(s => s.filter(sg => sg.id !== id))
    toast.success(`Suggestion ${status}`)
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold">Review Suggestions</h1>
      {!suggestions.length && <p className="text-gray-400 card text-center py-8">No pending suggestions.</p>}
      {suggestions.map(s => (
        <div key={s.id} className="card space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{s.suggestion_type}</span>
              <p className="mt-2 text-sm text-gray-600">{s.content}</p>
              {s.description && <p className="text-xs text-gray-400 mt-1">{s.description}</p>}
            </div>
          </div>
          <p className="text-xs text-gray-400">By: {s.users?.full_name || s.submitted_by}</p>
          <div className="flex gap-2">
            <button className="bg-green-50 text-green-700 border border-green-200 text-sm px-3 py-1.5 rounded-lg hover:bg-green-100"
              onClick={() => review(s.id, 'approved')}>Approve</button>
            <button className="bg-red-50 text-red-700 border border-red-200 text-sm px-3 py-1.5 rounded-lg hover:bg-red-100"
              onClick={() => review(s.id, 'rejected')}>Reject</button>
          </div>
        </div>
      ))}
    </div>
  )
}
