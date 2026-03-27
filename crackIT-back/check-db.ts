import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('Testing connection to Supabase...');
  try {
    const { error: taskError } = await supabase.from('tasks').select('id').limit(1);
    const { error: msgError } = await supabase.from('messages').select('id').limit(1);
    
    if (taskError || msgError) {
      console.error('❌ Ошибка подключения или необходимые таблицы ("tasks", "messages") не существуют:');
      console.error(taskError?.message || msgError?.message);
      console.log('\nПожалуйста, убедитесь, что вы выполнили скрипт из файла database.sql в SQL Editor Supabase.');
      process.exit(1);
    } else {
      console.log('✅ Подключение к базе данных успешно! Все необходимые таблицы существуют.');
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Неизвестная ошибка:', err);
    process.exit(1);
  }
}

checkDatabase();
