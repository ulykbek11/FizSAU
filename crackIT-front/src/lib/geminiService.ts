interface ChatHistoryItem {
  role: string;
  parts: { text: string }[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getGeminiResponse = async (prompt: string, history: ChatHistoryItem[] = []) => {
  try {
    const normalizedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: msg.parts
    }));

    const response = await fetch(`${API_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, history: normalizedHistory })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("AI API Error:", error);
    return "Извини, произошла ошибка при получении ответа от AI-тимлидера Beyim. Попробуй ещё раз.";
  }
};

