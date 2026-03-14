import { useCallback } from 'react'
import { useChatStore } from '../store/chatStore'
import { streamAsk } from '../api/ai'

export function useAiChat(courseId) {
  const { history, addMessage, updateLastAssistant, setStreaming, isStreaming } = useChatStore()

  const ask = useCallback(async (question) => {
    if (isStreaming) return
    addMessage('user', question)
    setStreaming(true)
    try {
      for await (const chunk of streamAsk(question, courseId, history)) {
        updateLastAssistant(chunk)
      }
    } catch (e) {
      updateLastAssistant('\n\n[Error getting response. Please try again.]')
    } finally {
      setStreaming(false)
    }
  }, [courseId, history, isStreaming, addMessage, setStreaming, updateLastAssistant])

  return { history, ask, isStreaming }
}
