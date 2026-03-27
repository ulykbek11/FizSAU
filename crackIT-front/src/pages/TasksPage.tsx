import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BrainCircuit, FileText, ChevronRight, Trash2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import type { Task } from '../components/AISimulator';
import { UploadTaskModal } from '../components/UploadTaskModal';

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTeamLeader, setIsTeamLeader] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const leader = user?.user_metadata?.role === 'teamleader';
        setIsTeamLeader(leader);

        const { data, error } = await supabase.from('tasks').select('*');
        if (error) throw error;

        if (data) {
          const progress = JSON.parse(localStorage.getItem('ai_simulator_progress') || '{"solvedCount":0, "solvedTasks": []}');
          const solvedTaskIds = progress.solvedTasks || [];

          const formattedTasks: Task[] = data.map(t => ({
            id: t.id,
            title: t.title,
            description: t.description || 'Без описания',
            solution: t.evaluation_criteria?.[0]?.text || '',
            author: 'Тимлидер',
            category: t.mode === 'simulation' ? 'Симуляция' : 'Код',
            isSolved: solvedTaskIds.includes(t.id)
          }));

          const displayTasks = leader ? formattedTasks : formattedTasks.filter(t => !t.isSolved);
          setTasks(displayTasks);
        }
      } catch (err) {
        console.error('Ошибка загрузки задач:', err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  const handleDeleteTask = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    if (!window.confirm('Точно удалить задачу для всей команды?')) return;

    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Ошибка удаления:', err);
      alert('Ошибка при удалении');
    }
  };

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
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
              <div className="p-2 bg-primary/10 rounded-2xl">
                <FileText className="text-primary w-6 h-6" />
              </div>
              {isTeamLeader ? 'Управление задачами' : 'Активные задачи'}
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              {isTeamLeader ? 'Создавайте и отзывайте задачи для команды.' : 'Список всех доступных задач от вашего тимлидера и AI-ментора.'}
            </p>
          </div>
          {isTeamLeader && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 transition-all hover:translate-y-[-2px] active:translate-y-0 flex items-center gap-2"
            >
              <Plus size={18} />
              Добавить задачу
            </button>
          )}
        </header>

        <UploadTaskModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onTaskSaved={() => window.location.reload()}
        />

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

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 relative z-10">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <BrainCircuit className="w-4 h-4" />
                    {task.author}
                  </div>
                  <div className="flex items-center gap-2">
                    {isTeamLeader && (
                      <button
                        onClick={(e) => handleDeleteTask(e, task.id)}
                        className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                        title="Отозвать (удалить) задачу"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </div>
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
