import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatHistoryItem {
  role: string;
  parts: { text: string }[];
}

export const getGeminiResponse = async (prompt: string, history: ChatHistoryItem[] = []) => {
  try {
    const apiKey = import.meta.env.VITE_AI_MENTOR_API_KEY;
    if (!apiKey) {
      throw new Error("API ключ не настроен");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const chatModel = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite', // Using the same model as backend
      systemInstruction: 'Ты — профессиональный AI-тимлидер по имени Beyim в инновационной компании Beyim. Твоя цель — помогать новым сотрудникам в онбординге, отвечать на их вопросы о культуре компании, процессах и задачах. Твой тон — дружелюбный, поддерживающий и профессиональный. Используй Markdown для форматирования ответов (жирный текст, списки, заголовки).'
    });

    const normalizedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: msg.parts
    }));

    const chat = chatModel.startChat({ history: normalizedHistory });
    const result = await chat.sendMessage(prompt);

    return result.response.text();
  } catch (error) {
    console.error("AI API Error:", error);
    return "Извини, произошла ошибка при получении ответа от AI-тимлидера Beyim. Пожалуйста, проверь правильность VITE_AI_MENTOR_API_KEY в переменных окружения Vercel.";
  }
};
