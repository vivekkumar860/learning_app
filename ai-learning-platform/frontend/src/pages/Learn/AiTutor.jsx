import { useSearchParams } from 'react-router-dom'
import { useAiChat } from '../../hooks/useAiChat'
import ChatWindow from '../../components/chat/ChatWindow'

export default function AiTutor() {
  const [params] = useSearchParams()
  const courseId = params.get('course')
  const { history, ask, isStreaming } = useAiChat(courseId)
  return (
    <div className="h-[calc(100vh-10rem)] card flex flex-col p-0 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold">AI Tutor</h2>
        <p className="text-xs text-gray-400">Answers are grounded in your course material</p>
      </div>
      <ChatWindow history={history} onSend={ask} isStreaming={isStreaming} />
    </div>
  )
}
