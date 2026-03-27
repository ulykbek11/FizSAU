import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  LogOut, 
  Bell,
  Sparkles,
  BarChart3,
  Activity,
  Calendar,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AnalyticsPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [progress, setProgress] = useState({ solvedCount: 0, totalAttempts: 0 });
  const [viewedEmployee, setViewedEmployee] = useState<{ firstName: string; lastName: string } | null>(null);
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('userId');
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Подсчет уведомлений
    const customTasks = JSON.parse(localStorage.getItem('custom_tasks') || '[]');
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
    const fetchData = async () => {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        if (error || !currentUser) {
          navigate('/login');
          return;
        }
        setUser(currentUser);

        if (targetUserId) {
          const { data: empData } = await supabase
            .from('employees')
            .select('first_name, last_name')
            .eq('id', targetUserId)
            .single();
          
          if (empData) {
            setViewedEmployee({ firstName: empData.first_name, lastName: empData.last_name });
          }

          const { data: submissions } = await supabase
            .from('submissions')
            .select('score')
            .eq('user_id', targetUserId);
          
          if (submissions && submissions.length > 0) {
            const solved = submissions.filter(s => s.score && s.score >= 80).length;
            setProgress({ solvedCount: solved, totalAttempts: submissions.length });
          } else {
            setProgress({ solvedCount: 0, totalAttempts: 0 });
          }
        } else {
          const savedProgress = localStorage.getItem('ai_simulator_progress');
          if (savedProgress) {
            setProgress(JSON.parse(savedProgress));
          }
        }
      } catch (err) {
        console.error(err);
        if (!user) navigate('/login');
      }
    };
    fetchData();
  }, [navigate, targetUserId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (!user) return <div className="min-h-screen bg-background flex items-center justify-center font-sans"><div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div></div>;

  const firstName = user.user_metadata?.first_name || 'Сотрудник';
  const lastName = user.user_metadata?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const roleDisplay = user.user_metadata?.role === 'teamleader' ? 'Тимлидер' : 'Сотрудник';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-primary/10">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 z-40 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/10 shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <Sparkles className="text-primary w-6 h-6" />
           </div>
           <span className="font-extrabold text-2xl tracking-tight text-slate-800">Beyim</span>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/40">
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-4 py-1.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Рабочая область
              </button>
              <button className="px-4 py-1.5 bg-white rounded-xl shadow-sm border border-slate-200/20 text-sm font-bold text-slate-800">
                Аналитика
              </button>
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
          <header className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-accent/10 px-3 py-1 rounded-full border border-accent/20 text-accent font-bold text-xs tracking-wider uppercase">
              Аналитика и прогресс
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {viewedEmployee ? (
                <>Статистика сотрудника: <span className="text-primary italic font-black">{viewedEmployee.firstName} {viewedEmployee.lastName}</span></>
              ) : (
                <>Ваша <span className="text-primary italic font-black">статистика</span></>
              )}
            </h1>
            <p className="text-slate-500 font-medium text-lg max-w-2xl leading-relaxed">
              Отслеживайте {viewedEmployee ? 'достижения и динамику обучения сотрудника' : 'свои достижения и динамику обучения'} в реальном времени.
            </p>
          </header>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Активные часы', value: `${(progress.totalAttempts * 0.25).toFixed(1)}ч`, icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50' },
              { label: 'Завершено задач', value: progress.solvedCount.toString(), icon: BarChart3, color: 'text-green-500', bg: 'bg-green-50' },
              { label: 'Текущий стрик', value: progress.solvedCount > 0 ? '1 день' : '0 дней', icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-50' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="premium-glass p-6 rounded-[32px] border border-white bg-white/50 shadow-sm hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                  <stat.icon size={24} />
                </div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</div>
                <div className="text-3xl font-black text-slate-900">{stat.value}</div>
                <div className="mt-2 flex items-center gap-1 text-green-500 font-bold text-xs">
                  <ChevronUp size={14} />
                  <span>Активность за сегодня</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Placeholder */}
          <div className="grid grid-cols-1 gap-8">
            <div className="premium-glass p-8 rounded-[40px] border border-white bg-white/50 shadow-sm min-h-[400px]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-800">Активность по дням</h3>
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
                </div>
              </div>
              <div className="h-64 flex items-end justify-between gap-2">
                {[40, 70, 45, 90, 65, 80, Math.min(100, Math.max(10, progress.totalAttempts * 10))].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                    className="w-full bg-gradient-to-t from-primary/20 to-primary rounded-t-xl relative group cursor-pointer"
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {h}%
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                <span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AnalyticsPage;
