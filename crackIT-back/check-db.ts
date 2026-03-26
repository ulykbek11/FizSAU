import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('Testing connection to Supabase...');
  try {
    const { data, error } = await supabase.from('tasks').select('id').limit(1);
    
    if (error) {
      console.error('❌ Ошибка подключения или таблица "tasks" не существует:');
      console.error(error.message);
      console.log('\nПожалуйста, убедитесь, что вы выполнили скрипт из файла database.sql в SQL Editor Supabase.');
      process.exit(1);
    } else {
      console.log('✅ Подключение к базе данных успешно! Таблицы существуют.');
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Неизвестная ошибка:', err);
    process.exit(1);
  }
}

checkDatabase();
