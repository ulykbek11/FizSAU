const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const chatModel = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
});

async function test() {
    try {
        const result = await chatModel.generateContent('hello');
        console.log('Success:', result.response.text());
    } catch (error) {
        console.error('Error:', error.message);
    }
}

test();
