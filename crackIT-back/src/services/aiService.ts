import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config(); 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const evaluationModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
const chatModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: 'Ты — профессиональный AI-тимлидер по имени Beyim в инновационной компании Beyim. Твоя цель — помогать новым сотрудникам в онбординге, отвечать на их вопросы о культуре компании, процессах и задачах. Твой тон — дружелюбный, поддерживающий и профессиональный. Используй Markdown для форматирования ответов (жирный текст, списки, заголовки).'
});

interface EvaluationParams {
  description: string;
  solutionDiff: string;
  userDiff: string;
  evaluationCriteria: string[];
}

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export class AIService {
  static async generateEvaluation(params: EvaluationParams): Promise<any> {
    const prompt = `
Ты - AI-ментор. Твоя задача оценить решение пользователя по сравнению с эталонным решением.
Система проверяет не весь код, а только изменения (diff) относительно стартового шаблона.

Описание задачи:
${params.description}

Критерии оценки:
${params.evaluationCriteria.join(', ')}

Эталонные изменения (Solution Diff):
${params.solutionDiff}

Изменения пользователя (User Diff):
${params.userDiff}

Сравни изменения пользователя с эталоном. Решает ли пользователь задачу?
Оцени:
- корректность
- логику
- полноту
- ошибки

Верни ТОЛЬКО валидный JSON в следующем формате (без markdown разметки типа \`\`\`json):
{
  "score": 0-100,
  "logic": 0-100,
  "correctness": 0-100,
  "completeness": 0-100,
  "feedback": "Подробный текстовый фидбек в markdown формате"
}
    `;

    try {
      const result = await evaluationModel.generateContent(prompt);
      const responseText = result.response.text();

      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error in AI evaluation:', error);
      throw error;
    }
  }

  static async generateChatResponse(prompt: string, history: ChatMessage[] = []): Promise<string> {
    try {
      const normalizedHistory = history.filter(
        (message) =>
          (message.role === 'user' || message.role === 'model') &&
          Array.isArray(message.parts) &&
          message.parts.length > 0 &&
          typeof message.parts[0]?.text === 'string'
      );

      const chat = chatModel.startChat({ history: normalizedHistory });
      const result = await chat.sendMessage(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error in AI chat:', error);
      throw error;
    }
  }
}

