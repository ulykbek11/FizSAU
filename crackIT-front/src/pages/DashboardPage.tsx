import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  LogOut, 
  Bell,
  Sparkles,
  ArrowRight,
  ChevronRight,
  BrainCircuit,
  Zap,
  FileUp,
  X,
  Plus,
  Paperclip,
  Users,
  MessageSquare,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UploadTaskModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [solution, setSolution] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [taskFile, setTaskFile] = useState<File | null>(null);
  const [solutionFile, setSolutionFile] = useState<File | null>(null);
  
  const taskFileRef = React.useRef<HTMLInputElement>(null);
  const solutionFileRef = React.useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!title || !category || (!description && !taskFile) || (!solution && !solutionFile)) return;
    setIsSaving(true);
    
    const newTask = {
      id: window.crypto.randomUUID(),
      title,
      category,
      description,
      solution,
      taskFileName: taskFile?.name,
      solutionFileName: solutionFile?.name,
      author: 'Тимлидер',
      createdAt: new Date().toISOString()
    };

    const existingTasks = JSON.parse(localStorage.getItem('custom_tasks') || '[]');
    localStorage.setItem('custom_tasks', JSON.stringify([...existingTasks, newTask]));

    setTimeout(() => {
      setIsSaving(false);
      onClose();
      // Очистка полей
      setTitle('');
      setCategory('');
      setDescription('');
      setSolution('');
      setTaskFile(null);
      setSolutionFile(null);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header - Fixed */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <div className="space-y-0.5">
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">Новое задание</h2>
                <p className="text-[13px] text-slate-500 font-medium">Заполните данные или прикрепите файлы</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-900"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Название</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Напр: Оптимизация"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm text-slate-800 placeholder:text-slate-300"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Категория</label>
                  <input 
                    type="text" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Напр: Backend"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm text-slate-800 placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Описание задачи</label>
                  <button 
                    onClick={() => taskFileRef.current?.click()}
                    className="flex items-center gap-1.5 text-[10px] font-black text-primary hover:text-primary-dark uppercase tracking-widest transition-colors"
                  >
                    <Paperclip size={12} />
                    {taskFile ? 'Файл выбран' : 'Прикрепить файл'}
                  </button>
                  <input type="file" ref={taskFileRef} className="hidden" onChange={(e) => setTaskFile(e.target.files?.[0] || null)} />
                </div>
                {taskFile && (
                  <div className="px-3 py-2 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-between text-[11px] font-bold text-primary">
                    <span className="truncate max-w-[200px]">{taskFile.name}</span>
                    <button onClick={() => setTaskFile(null)}><X size={14} /></button>
                  </div>
                )}
                <textarea 
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Опишите задачу здесь..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm text-slate-800 resize-none placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Эталонное решение</label>
                  <button 
                    onClick={() => solutionFileRef.current?.click()}
                    className="flex items-center gap-1.5 text-[10px] font-black text-primary hover:text-primary-dark uppercase tracking-widest transition-colors"
                  >
                    <Paperclip size={12} />
                    {solutionFile ? 'Файл выбран' : 'Прикрепить файл'}
                  </button>
                  <input type="file" ref={solutionFileRef} className="hidden" onChange={(e) => setSolutionFile(e.target.files?.[0] || null)} />
                </div>
                {solutionFile && (
                  <div className="px-3 py-2 bg-green-50 border border-green-100 rounded-xl flex items-center justify-between text-[11px] font-bold text-green-600">
                    <span className="truncate max-w-[200px]">{solutionFile.name}</span>
                    <button onClick={() => setSolutionFile(null)}><X size={14} /></button>
                  </div>
                )}
                <textarea 
                  rows={3}
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="Вставьте код или ответ..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm text-slate-800 resize-none placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0">
              <button 
                onClick={handleSave}
                disabled={isSaving || !title || !category || (!description && !taskFile) || (!solution && !solutionFile)}
                className="w-full py-4 bg-primary hover:bg-primary-dark disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl font-black text-base shadow-lg shadow-primary/20 transition-all hover:translate-y-[-2px] active:translate-y-0 flex items-center justify-center gap-2.5 group"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                    Опубликовать задание
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [activeTasksCount, setActiveTasksCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Подсчет активных задач и уведомлений
    const customTasks = JSON.parse(localStorage.getItem('custom_tasks') || '[]');
    const progress = JSON.parse(localStorage.getItem('ai_simulator_progress') || '{"solvedCount":0}');
    // Считаем нерешенные задачи (моковые + от тимлида)
    const totalTasks = 2 + customTasks.length; 
    const unsolved = Math.max(0, totalTasks - progress.solvedCount);
    setActiveTasksCount(unsolved);

    // Формируем уведомления
    const notifs = [
      { id: 'welcome', title: 'Добро пожаловать!', text: 'Система Beyim готова к работе.', time: 'Только что', unread: true }
    ];
    if (customTasks.length > 0) {
      notifs.unshift({ 
        id: 'new_tasks', 
        title: 'Новые задачи', 
        text: `Тимлидер добавил ${customTasks.length} новых задач(и) для решения.`, 
        time: 'Недавно', 
        unread: true 
      });
    }
    setNotifications(notifs);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          console.error("Auth error or no user found:", error);
          navigate('/login');
        } else {
          // Если пользователь вошел через Google и у него нет роли
          if (!user.user_metadata?.role) {
            navigate('/complete-profile');
            return;
          }

          setUser(user);
          if (user.user_metadata?.role === 'teamleader') {
            fetchTeamMembers(user.id);
          }
        }
      } catch (err) {
        console.error("Critical error in fetchUser:", err);
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const fetchTeamMembers = async (teamLeaderId: string) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('team_leader_id', teamLeaderId);
      if (data && !error) {
        setTeamMembers(data);
      }
    } catch (err) {
      console.error('Error fetching team members:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (!user) return <div className="min-h-screen bg-background flex items-center justify-center font-sans"><div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div></div>;

  const firstName = user.user_metadata?.first_name || 'Сотрудник';
  const lastName = user.user_metadata?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const roleDisplay = user.user_metadata?.role === 'teamleader' ? 'Тимлидер' : 'Сотрудник';
  const isTeamLeader = user.user_metadata?.role === 'teamleader';
  const inviteCode = user.user_metadata?.invite_code || 'Нет кода';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-primary/10">
      <UploadTaskModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
      {/* Sidebar (Desktop) / Navbar (Mobile) */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 z-40 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/10 shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer">
              <Sparkles className="text-primary w-6 h-6" />
           </div>
           <span className="font-extrabold text-2xl tracking-tight text-slate-800">Beyim</span>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/40">
              <button className="px-4 py-1.5 bg-white rounded-xl shadow-sm border border-slate-200/20 text-sm font-bold text-slate-800">Рабочая область</button>
              {!isTeamLeader && (
                <button 
                  onClick={() => navigate('/analytics')}
                  className="px-4 py-1.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Аналитика
                </button>
              )}
           </div>

           <div className="h-10 w-[1px] bg-slate-200/60 hidden sm:block"></div>
           
           <div className="flex items-center gap-4">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all relative text-slate-400 hover:text-slate-600 active:scale-90"
                >
                  <Bell size={22} strokeWidth={2.3} />
                  {notifications.some(n => n.unread) && (
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white ring-2 ring-primary/20 animate-pulse"></span>
                  )}
                </button>
                
                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800">Уведомления</h3>
                        <button 
                          onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
                          className="text-xs text-primary font-semibold hover:underline"
                        >
                          Прочитать все
                        </button>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div 
                              key={notif.id} 
                              className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${notif.unread ? 'bg-primary/5' : ''}`}
                              onClick={() => {
                                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false } : n));
                                if (notif.id === 'new_tasks') navigate('/simulator');
                              }}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <h4 className={`text-sm font-bold ${notif.unread ? 'text-slate-900' : 'text-slate-700'}`}>{notif.title}</h4>
                                <span className="text-[10px] text-slate-400 font-medium">{notif.time}</span>
                              </div>
                              <p className="text-xs text-slate-500 line-clamp-2">{notif.text}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-slate-500 text-sm">Нет новых уведомлений</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex items-center gap-3.5 pl-2 group cursor-pointer">
                 <div className="text-right hidden sm:block">
                    <div className="text-sm font-extrabold leading-none text-slate-800 transition-colors group-hover:text-primary">{fullName}</div>
                    <div className="text-[11px] text-slate-400 capitalize font-bold mt-1 tracking-wider">{roleDisplay}</div>
                 </div>
                 <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-white shadow-md flex items-center justify-center overflow-hidden transition-all group-hover:ring-4 group-hover:ring-primary/10">
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                       {firstName.charAt(0)}
                    </div>
                 </div>
                 <button 
                   onClick={handleLogout}
                   className="p-2.5 hover:bg-red-50 rounded-2xl transition-all text-slate-400 hover:text-red-500 active:scale-90 ml-1 shadow-sm border border-transparent hover:border-red-100 hover:shadow-red-500/5"
                   title="Выйти"
                 >
                   <LogOut size={22} strokeWidth={2.3} />
                 </button>
              </div>
           </div>
        </div>
      </nav>

      <main className="pt-32 pb-16 px-6 sm:px-8 lg:px-12 max-w-[1440px] mx-auto">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="space-y-10"
        >
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20 text-primary font-bold text-xs tracking-wider uppercase">
                Мониторинг прогресса
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 flex items-center gap-4 tracking-tight">
                С возвращением, <span className="text-primary italic font-black">{firstName}</span>!
              </h1>
              <p className="text-slate-500 font-medium text-lg max-w-2xl leading-relaxed">
                Твой путь адаптации в самом разгаре. Давай продолжим работу над задачами от AI-тимлидера Beyim.
              </p>
              {isTeamLeader && (
                <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-2xl max-w-md">
                  <p className="text-sm font-bold text-slate-700 mb-1">Код приглашения для сотрудников:</p>
                  <div className="flex items-center justify-between bg-white px-4 py-2 rounded-xl border border-slate-200">
                    <span className="font-mono text-primary font-bold tracking-wider">{inviteCode}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(inviteCode);
                        alert('Код скопирован!');
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-primary transition-colors"
                    >
                      Копировать
                    </button>
                  </div>
                </div>
              )}
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             {/* Секция статистики */}
             <div className="lg:col-span-4 flex flex-col gap-4 h-full min-h-[320px]">
                <motion.button 
                   whileHover={{ y: -5, scale: 1.01 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={() => isTeamLeader ? setIsUploadModalOpen(true) : navigate('/tasks')}
                   className="premium-glass p-6 rounded-[32px] border border-white/60 bg-white/40 shadow-xl shadow-slate-200/40 relative overflow-hidden group text-left w-full cursor-pointer flex-1"
                >
                   <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full transition-transform group-hover:scale-150 duration-700" />
                   <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                      {isTeamLeader ? 'Управление задачами' : 'Активные задачи'}
                   </div>
                   <div className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                      {isTeamLeader ? (
                         <FileUp className="w-10 h-10 text-primary" />
                      ) : (
                         activeTasksCount
                      )}
                   </div>
                   <div className="mt-4 flex items-center gap-2">
                      {isTeamLeader ? (
                         <>
                            <div className="px-2 py-0.5 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase">Team Lead Tool</div>
                            <div className="text-slate-400 text-[11px] font-bold">Загрузить новый кейс</div>
                         </>
                      ) : (
                         <>
                            <div className="px-2 py-0.5 bg-green-100 text-green-700 rounded-lg text-[10px] font-black uppercase">Completed</div>
                            <div className="text-slate-400 text-[11px] font-bold">100% успеваемость</div>
                         </>
                      )}
                   </div>
                </motion.button>
                
                {!isTeamLeader && (
                  <motion.div 
                     whileHover={{ y: -5, scale: 1.01 }}
                     className="premium-glass p-6 rounded-[32px] border border-white/60 bg-white/40 shadow-xl shadow-slate-200/40 relative overflow-hidden text-left w-full flex-1"
                  >
                     <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full" />
                     <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                        Твой уровень
                     </div>
                     <div className="text-4xl font-black text-slate-900 tracking-tighter flex items-baseline gap-2">
                        1 <span className="text-sm font-bold text-slate-400 tracking-normal">Level</span>
                     </div>
                     <div className="mt-4 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full w-1/4"></div>
                     </div>
                  </motion.div>
                )}
             </div>

             {/* Секция основных действий */}
             {!isTeamLeader && (
               <div className="lg:col-span-4 h-full min-h-[320px]">
                  <motion.button 
                     whileHover={{ y: -8, scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     onClick={() => navigate('/simulator')}
                     className="p-8 rounded-[40px] bg-slate-900 border border-white/10 shadow-2xl shadow-slate-900/80 relative overflow-hidden group cursor-pointer text-left w-full transition-all flex flex-col justify-between h-full"
                  >
                     <div className="absolute -right-6 -bottom-6 text-white/5 group-hover:text-primary/10 group-hover:rotate-12 transition-all duration-700">
                        <BrainCircuit className="w-48 h-48" strokeWidth={1} />
                     </div>
                     
                     <div className="relative z-10 w-full">
                        <div className="flex justify-between items-start mb-6">
                           <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                                <Zap className="text-primary w-4 h-4" />
                             </div>
                             <span className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em]">Практика</span>
                           </div>
                           <div className="px-3 py-1 bg-white/5 text-white/80 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-md">
                              New
                           </div>
                        </div>
                        
                        <div className="space-y-1">
                           <h4 className="text-2xl font-black text-white tracking-tighter leading-none">AI Симулятор</h4>
                           <p className="text-2xl font-black text-primary italic tracking-tighter">реальных задач</p>
                        </div>
                     </div>

                     <div className="relative z-10 mt-auto">
                        <div className="flex items-center gap-4">
                           <div className="bg-primary group-hover:bg-white text-white group-hover:text-primary p-3 rounded-2xl shadow-lg shadow-primary/20 transition-all duration-300">
                              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                           </div>
                           <span className="text-[10px] font-black text-white/60 group-hover:text-white transition-colors uppercase tracking-widest">Начать практику</span>
                        </div>
                     </div>
                  </motion.button>
               </div>
             )}

             {/* Секция чата */}
             <div className="lg:col-span-4 h-full min-h-[320px]">
                <motion.button 
                   whileHover={{ y: -8, scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={() => navigate('/chat')}
                   className="p-8 rounded-[40px] bg-primary border border-primary-light shadow-2xl shadow-primary/40 relative overflow-hidden group cursor-pointer text-left w-full transition-all flex flex-col justify-between h-full"
                >
                   <div className="absolute -right-6 -bottom-6 text-white/10 group-hover:rotate-12 transition-all duration-700">
                      <Sparkles className="w-48 h-48" strokeWidth={1} />
                   </div>
                   
                   <div className="relative z-10 w-full">
                      <div className="flex justify-between items-start mb-6">
                          <span className="text-[11px] font-black text-white/70 uppercase tracking-[0.2em]">
                            {isTeamLeader ? 'Мессенджер' : 'Связь с тимлидером'}
                          </span>
                       </div>
                      
                      <div className="space-y-3">
                         <h4 className="text-3xl font-black text-white tracking-tighter leading-none">
                           {isTeamLeader ? 'Чат с командой' : 'Чат с тимлидером'}
                         </h4>
                         <p className="text-sm font-medium text-white/80 max-w-[200px]">
                           {isTeamLeader ? 'Общайся с сотрудниками напрямую' : 'Получи мгновенную помощь по любому вопросу'}
                         </p>
                      </div>
                   </div>

                   <div className="relative z-10 mt-auto flex justify-between items-end">
                      <div className="bg-white/20 group-hover:bg-white text-white group-hover:text-primary p-3 rounded-2xl transition-all duration-300 backdrop-blur-md">
                         <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </div>
                      <div className="bg-white/10 p-3 rounded-full backdrop-blur-md group-hover:bg-white/20 transition-all">
                         <ChevronRight className="w-5 h-5 text-white" />
                      </div>
                   </div>
                </motion.button>
             </div>
          </div>

          {isTeamLeader && (
            <div className="premium-glass p-12 rounded-[48px] min-h-[400px] flex items-center justify-center border border-white/80 bg-white/60 shadow-2xl shadow-slate-200/60 relative overflow-hidden">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none">
                 <Sparkles className="w-[600px] h-[600px] text-primary transition-all group-hover:rotate-45" strokeWidth={0.5} />
               </div>
               
               <div className="w-full relative z-10 flex flex-col h-full items-start justify-start">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <Users className="text-primary w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Моя команда</h3>
                    </div>
                    
                    {teamMembers.length > 0 ? (
                      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                        {teamMembers.map(member => (
                          <div key={member.id} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-bold">
                                {member.first_name?.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{member.first_name} {member.last_name}</div>
                                <div className="text-xs text-slate-500">{member.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => navigate(`/analytics?userId=${member.id}`)}
                                className="px-3 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors rounded-xl flex items-center justify-center"
                                title="Аналитика"
                              >
                                <BarChart3 size={18} />
                              </button>
                              <button 
                                onClick={() => navigate(`/chat?userId=${member.id}`)}
                                className="px-3 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors rounded-xl flex items-center justify-center"
                                title="Написать"
                              >
                                <MessageSquare size={18} />
                              </button>
                              <button 
                                onClick={() => setIsUploadModalOpen(true)}
                                className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors rounded-xl text-sm font-bold"
                              >
                                Дать таск
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center w-full py-12">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="text-slate-300 w-10 h-10" />
                        </div>
                        <p className="text-slate-500 font-medium">В вашей команде пока нет сотрудников.</p>
                        <p className="text-sm text-slate-400 mt-2">Отправьте им код приглашения: <span className="font-mono text-primary font-bold">{inviteCode}</span></p>
                      </div>
                    )}
                 </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardPage;
