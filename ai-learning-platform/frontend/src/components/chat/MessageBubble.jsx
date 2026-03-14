import ReactMarkdown from 'react-markdown'
import clsx from 'clsx'

export default function MessageBubble({ message: { role, content } }) {
  return (
    <div className={clsx('flex', role === 'user' ? 'justify-end' : 'justify-start')}>
      <div className={clsx('max-w-[80%] rounded-2xl px-4 py-3 text-sm',
        role === 'user' ? 'bg-primary text-white' : 'bg-white border border-gray-100 text-gray-800')}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  )
}
