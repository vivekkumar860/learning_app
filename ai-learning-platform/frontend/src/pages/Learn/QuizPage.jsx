import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import client from '../../api/client'
import MCQCard from '../../components/quiz/MCQCard'
import ResultSummary from '../../components/quiz/ResultSummary'

export default function QuizPage() {
  const { moduleId } = useParams()
  const [mcqs, setMcqs] = useState([])
  const [done, setDone] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => { client.get(`/quiz/${moduleId}`).then(r => setMcqs(r.data)) }, [moduleId])

  const handleAnswer = async (mcqId, selectedIndex) => {
    await client.post('/quiz/attempt', { mcq_id: mcqId, selected_option_index: selectedIndex })
    if (mcqs[mcqs.length - 1]?.id === mcqId) {
      const r = await client.get(`/quiz/results/${moduleId}`)
      setResult(r.data)
      setDone(true)
    }
  }

  if (done && result) return <div className="max-w-xl"><ResultSummary result={result} /></div>
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Quiz</h1>
      {mcqs.map(mcq => <MCQCard key={mcq.id} mcq={mcq} onAnswer={handleAnswer} />)}
    </div>
  )
}
