import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

interface EvaluationParams {
  description: string;
  solutionDiff: string;
  userDiff: string;
  evaluationCriteria: string[];
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
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Clean up markdown code block if present
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error in AI evaluation:', error);
      throw error;
    }
  }
}
