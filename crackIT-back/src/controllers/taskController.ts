import { Request, Response } from 'express';
import { FileService } from '../services/fileService';
import { DiffService } from '../services/diffService';
import { TaskService } from '../services/taskService';
import { SubmissionService } from '../services/submissionService';
import { AIService } from '../services/aiService';

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const starterFile = files?.starter?.[0];
    const solutionFile = files?.solution?.[0];
    const { title, description, evaluationCriteria } = req.body;

    if (!starterFile || !solutionFile) {
      res.status(400).json({ error: 'Starter and solution zip files are required' });
      return;
    }

    const starterPath = await FileService.unzipFile(starterFile.path, 'starter');
    const solutionPath = await FileService.unzipFile(solutionFile.path, 'solution');

    const solutionDiff = await DiffService.computeDiff(starterPath, solutionPath);

    const taskId = await TaskService.createTask({
      title: title || 'New Task',
      description: description || '',
      mode: 'simulation',
      starter_path: starterPath, 
      solution_diff: solutionDiff,
      evaluation_criteria: evaluationCriteria ? JSON.parse(evaluationCriteria) : []
    });

    FileService.cleanup(solutionPath);

    res.status(201).json({ taskId, message: 'Task created successfully' });
  } catch (error: any) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const task = await TaskService.getTask(id);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const submitSolution = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskId = req.params.id as string;
    const { userId } = req.body;
    const userFile = req.file;

    if (!userFile) {
      res.status(400).json({ error: 'User solution zip is required' });
      return;
    }

    const userPath = await FileService.unzipFile(userFile.path, 'user');

    const task = await TaskService.getTask(taskId);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    let userDiff = '';
    if (task.starter_path) {
      userDiff = await DiffService.computeDiff(task.starter_path, userPath);
    } else {
      userDiff = "Mocked diff because starter path is missing";
    }

    const evaluation = await AIService.generateEvaluation({
      description: task.description,
      solutionDiff: task.solution_diff,
      userDiff,
      evaluationCriteria: task.evaluation_criteria
    });

    const submissionId = await SubmissionService.createSubmission({
      taskId,
      userId: userId || 'anonymous',
      userDiff,
      score: evaluation.score,
      feedback: JSON.stringify(evaluation)
    });

    FileService.cleanup(userPath);

    res.json({ submissionId, evaluation });
  } catch (error: any) {
    console.error('Error submitting solution:', error);
    res.status(500).json({ error: error.message });
  }
};

