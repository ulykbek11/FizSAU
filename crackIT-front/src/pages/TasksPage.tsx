import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BrainCircuit, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { MOCK_TASKS } from '../components/AISimulator';
import type { Task } from '../components/AISimulator';

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const customTasks = JSON.parse(localStorage.getItem('custom_tasks') || '[]');
    setTasks([...MOCK_TASKS, ...customTasks]);
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

        {/* Tasks List */}
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
        
        {tasks.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <FileText className="w-8 h-8" />
            </div>
            <p className="text-slate-500 font-medium">Пока нет доступных задач.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
