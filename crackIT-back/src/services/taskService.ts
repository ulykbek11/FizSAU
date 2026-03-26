import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export class TaskService {
  static async createTask(data: any): Promise<string> {
    const { data: task, error } = await supabase
      .from('tasks')
      .insert([data])
      .select('id')
      .single();

    if (error) {
      console.error('Error creating task in Supabase:', error);
      throw error;
    }
    return task.id;
  }

  static async getTask(id: string): Promise<any> {
    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return task;
  }
}
