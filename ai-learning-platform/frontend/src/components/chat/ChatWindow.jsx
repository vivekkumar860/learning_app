import { useState, useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'

export default function ChatWindow({ history, onSend, isStreaming }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const handleSend = () => {
    if (!input.trim() || isStreaming) return
    onSend(input.trim())
    setInput('')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {history.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-12">Ask anything about the course material...</p>
        )}
        {history.map((msg, i) => <MessageBubble key={`msg-${msg.role}-${i}`} message={msg} />)}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-gray-200 p-4 flex gap-2">
        <input
          className="input flex-1"
          placeholder="Ask the AI tutor..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          disabled={isStreaming}
        />
        <button onClick={handleSend} disabled={isStreaming || !input.trim()} className="btn-primary px-3">
          <PaperAirplaneIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
