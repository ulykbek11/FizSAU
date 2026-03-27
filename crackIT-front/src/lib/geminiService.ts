interface ChatHistoryItem {
  role: string;
  parts: { text: string }[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getGeminiResponse = async (prompt: string, history: ChatHistoryItem[]) => {
  try {
    const response = await fetch(`${API_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        history
      })
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null);
      const message = errorPayload?.error || 'AI service is unavailable';
      throw new Error(message);
    }

    const payload = await response.json();
    return payload.response || '';
  } catch (error) {
    console.error("AI API Error:", error);
    return "Извини, произошла ошибка при получении ответа от AI-тимлидера Beyim. Пожалуйста, проверь API ключ или попробуй позже.";
  }
};
