import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import client from '../../api/client'

export default function FlashCards() {
  const { moduleId } = useParams()
  const [cards, setCards] = useState([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    client.get(`/quiz/${moduleId}`).then(r => setCards(r.data))
  }, [moduleId])

  if (!cards.length) return <p className="text-gray-400">No flashcards for this module yet.</p>
  const card = cards[index]

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Flashcards</h1>
      <p className="text-sm text-gray-400">{index + 1} / {cards.length}</p>
      <div onClick={() => setFlipped(f => !f)} className="card min-h-48 flex items-center justify-center cursor-pointer text-center select-none">
        {!flipped
          ? <p className="text-lg font-medium">{card.question}</p>
          : <div className="space-y-2">
              {card.options.filter(o => o.is_correct).map((o, i) => <p key={i} className="text-green-700 font-medium">{o.text}</p>)}
              {card.explanation && <p className="text-sm text-gray-500">{card.explanation}</p>}
            </div>
        }
      </div>
      <div className="flex gap-3">
        <button className="btn-ghost flex-1" onClick={() => { setIndex(Math.max(0, index-1)); setFlipped(false) }}>Previous</button>
        <button className="btn-primary flex-1" onClick={() => { setIndex(Math.min(cards.length-1, index+1)); setFlipped(false) }}>Next</button>
      </div>
    </div>
  )
}
