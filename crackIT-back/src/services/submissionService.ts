import { supabase } from './taskService';

export class SubmissionService {
  static async createSubmission(data: any): Promise<string> {
    const { data: submission, error } = await supabase
      .from('submissions')
      .insert([{
        task_id: data.taskId,
        user_id: data.userId,
        user_diff: data.userDiff,
        score: data.score,
        feedback: data.feedback
      }])
      .select('id')
      .single();

    if (error) {
      console.error('Error creating submission in Supabase:', error);
      throw error;
    }
    return submission.id;
  }
}
