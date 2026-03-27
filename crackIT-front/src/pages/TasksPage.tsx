import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BrainCircuit, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import type { Task } from '../components/AISimulator';

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data, error } = await supabase.from('tasks').select('*');
        if (error) throw error;
        
        if (data) {
          // Получаем прогресс из localStorage (можно также грузить из БД, но пока берем отсюда)
          const progress = JSON.parse(localStorage.getItem('ai_simulator_progress') || '{"solvedCount":0, "solvedTasks": []}');
          const solvedTaskIds = progress.solvedTasks || []; // Допустим, мы будем хранить массив ID решенных задач

          const formattedTasks: Task[] = data.map(t => ({
            id: t.id,
            title: t.title,
            description: t.description || 'Без описания',
            solution: t.evaluation_criteria?.[0]?.text || '',
            author: 'Тимлидер',
            category: t.mode === 'simulation' ? 'Симуляция' : 'Код',
            isSolved: solvedTaskIds.includes(t.id) // Флаг, решена ли задача
          }));
          
          // Отфильтровываем решенные задачи, если хотим чтобы они отпадали из активных
          // Если хотим, чтобы они были видны, но отмечены галочкой, убираем фильтр
          // По ТЗ: "решенные таски должны отпадать" -> фильтруем
          const activeTasks = formattedTasks.filter(t => !t.isSolved);
          setTasks(activeTasks);
        }
      } catch (err) {
        console.error('Ошибка загрузки задач:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F6FB] pt-8 pb-16">
      <div className="max-w-5xl mx-auto px-6 space-y-8">
        {/* Navigation */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold text-sm group w-fit"
        >
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover:border-primary/20">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Вернуться в дашборд
        </button>

        {/* Header */}
        <header>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-primary/10 rounded-2xl">
              <FileText className="text-primary w-6 h-6" />
            </div>
            Активные задачи
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Список всех доступных задач от вашего тимлидера и AI-ментора.
          </p>
        </header>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Загрузка задач...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <FileText className="w-8 h-8" />
            </div>
            <p className="text-slate-500 font-medium">Пока нет доступных задач.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tasks.map((task, idx) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => navigate(`/simulator?taskId=${task.id}`)}
                className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all cursor-pointer group flex flex-col justify-between h-full min-h-[220px]"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black rounded-full uppercase tracking-widest border border-primary/10">
                      {task.category}
                    </span>
                    {task.author === 'Тимлидер' && (
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full uppercase tracking-widest">
                        От Тимлида
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {task.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-3">
                    {task.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <BrainCircuit className="w-4 h-4" />
                    {task.author}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
