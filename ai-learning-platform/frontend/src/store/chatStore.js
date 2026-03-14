import { create } from 'zustand'

export const useChatStore = create((set, get) => ({
  history: [],     // [{role, content}]
  isStreaming: false,
  addMessage: (role, content) =>
    set({ history: [...get().history, { role, content }] }),
  updateLastAssistant: (chunk) => {
    const h = [...get().history]
    if (h.length && h[h.length - 1].role === 'assistant') {
      h[h.length - 1].content += chunk
    } else {
      h.push({ role: 'assistant', content: chunk })
    }
    set({ history: h })
  },
  setStreaming: (v) => set({ isStreaming: v }),
  clear: () => set({ history: [], isStreaming: false }),
}))
