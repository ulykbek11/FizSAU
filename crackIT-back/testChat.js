const { AIService } = require('./dist/services/aiService.js');
require('dotenv').config();

async function test() {
    try {
        const history = []; // simulate empty history
        const result = await AIService.generateChatResponse('hello', history);
        console.log('Success:', result);
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
