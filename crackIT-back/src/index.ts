import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import taskRoutes from './routes/taskRoutes';
import fs from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './swagger';
import { AIService } from './services/aiService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Create tmp directory if it doesn't exist
const tmpDir = path.join(__dirname, '..', 'tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

// Routes
app.use('/tasks', taskRoutes);
app.post('/ai/chat', async (req, res) => {
  try {
    const { prompt, history } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const response = await AIService.generateChatResponse(prompt, Array.isArray(history) ? history : []);
    res.json({ response });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate AI response' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Root route redirects to swagger
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});

server.on('error', (e) => console.error('Server Error:', e));
server.on('close', () => console.log('Server closed'));


