import { Router } from 'express';
import multer from 'multer';
import { createTask, submitSolution, getTask } from '../controllers/taskController';
import path from 'path';

const router = Router();

// Configure multer for temp storage
const upload = multer({ 
  dest: path.join(__dirname, '..', '..', 'tmp') 
});

// Create task with starter and solution zips
router.post('/', upload.fields([
  { name: 'starter', maxCount: 1 },
  { name: 'solution', maxCount: 1 }
]), createTask);

// Get a task
router.get('/:id', getTask);

// Submit user solution zip
router.post('/:id/submit', upload.single('userSolution'), submitSolution);

export default router;
