import client from './client'

export const generateMCQs = (text, count = 5, difficulty = 1) =>
  client.post('/ai/generate-mcqs', { text, count, difficulty })

export const summarise = (topic, courseId) =>
  client.post('/ai/summarise', { topic, course_id: courseId })

export async function* streamAsk(question, courseId, history) {
  const authStorage = localStorage.getItem('auth-storage')
  if (!authStorage) {
    throw new Error('No authentication token found')
  }

  let accessToken
  try {
    accessToken = JSON.parse(authStorage).state?.accessToken
  } catch (error) {
    throw new Error('Invalid authentication data')
  }

  if (!accessToken) {
    throw new Error('Access token not found')
  }

  const res = await fetch('/api/ai/ask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ question, course_id: courseId, history }),
  })

  if (!res.ok) {
    throw new Error(`API request failed: ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const lines = decoder.decode(value).split('\n').filter(l => l.startsWith('data:'))
      for (const line of lines) {
        const text = line.slice(6).trim()
        if (text === '[DONE]') return
        yield text
      }
    }
  } finally {
    reader.releaseLock()
  }
}
