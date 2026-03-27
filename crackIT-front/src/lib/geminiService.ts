import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_AI_MENTOR_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Используем модель gemini-2.5-flash-lite по строгому требованию пользователя
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash-lite",
  systemInstruction: "Ты — профессиональный AI-тимлидер по имени Beyim в инновационной компании Beyim. Твоя цель — помогать новым сотрудникам в онбординге, отвечать на их вопросы о культуре компании, процессах и задачах. Твой тон — дружелюбный, поддерживающий и профессиональный. Используй Markdown для форматирования ответов (жирный текст, списки, заголовки).",
});

export const getGeminiResponse = async (prompt: string, history: { role: string; parts: { text: string }[] }[]) => {
  try {
    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Извини, произошла ошибка при получении ответа от AI-тимлидера Beyim. Пожалуйста, проверь API ключ или попробуй позже.";
  }
};
