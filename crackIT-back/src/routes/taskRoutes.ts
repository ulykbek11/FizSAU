import { Router } from 'express';
import multer from 'multer';
import { createTask, submitSolution, getTask } from '../controllers/taskController';
import path from 'path';

const router = Router();

import os from 'os';

const upload = multer({ 
  dest: os.tmpdir() 
});

router.post('/', upload.fields([
  { name: 'starter', maxCount: 1 },
  { name: 'solution', maxCount: 1 }
]), createTask);

router.get('/:id', getTask);

router.post('/:id/submit', upload.single('userSolution'), submitSolution);

export default router;

