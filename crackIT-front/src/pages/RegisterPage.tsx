import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  User, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  Mail, 
  Lock,
  Sparkles,
  AlertCircle,
  Hash
} from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [role, setRole] = useState<'employee' | 'teamleader'>('employee');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (role === 'employee') {
        const { data: teamLeaderData } = await supabase
          .from('team_leaders')
          .select('id')
          .eq('invite_code', inviteCode)
          .single();

        if (!teamLeaderData) {
          throw new Error('Неверный инвайт-код. Тимлидер с таким кодом не найден.');
        }
      }

      const generatedInviteCode = role === 'teamleader' ? `FD-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : undefined;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role,
            first_name: firstName,
            last_name: lastName,

            company_name: companyName,
            invite_code: role === 'employee' ? inviteCode : generatedInviteCode,
          }
        }
      });

      if (error) throw error;

      if (data.user) {

        if (role === 'teamleader') {
          try {
            const { error: insertError } = await supabase
              .from('team_leaders')
              .insert({
                id: data.user.id,
                first_name: firstName,
                last_name: lastName,
                company_name: companyName,
                email: email,
                invite_code: generatedInviteCode
              });

            if (insertError) {
              console.error("DEBUG: Ошибка вставки в team_leaders:", insertError);

              alert(`Внимание: аккаунт создан, но возникла ошибка при записи в профиль: ${insertError.message}`);
            }
          } catch (tableErr) {
            console.error("DEBUG: Критическая ошибка таблицы:", tableErr);
          }
        } else if (role === 'employee') {
          try {

            const { data: teamLeaderData } = await supabase
              .from('team_leaders')
              .select('id')
              .eq('invite_code', inviteCode)
              .single();

            const { error: insertError } = await supabase
              .from('employees')
              .insert({
                id: data.user.id,
                first_name: firstName,
                last_name: lastName,
                email: email,
                invite_code: inviteCode,
                team_leader_id: teamLeaderData?.id || null
              });

            if (insertError) {
              console.error("DEBUG: Ошибка вставки в employees:", insertError);
            }
          } catch (tableErr) {
            console.error("DEBUG: Критическая ошибка таблицы employees:", tableErr);
          }
        }

        alert('Регистрация успешна! Проверьте почту (если включено подтверждение) или попробуйте войти!');
        navigate('/login');
      }
    } catch (err: any) {
      console.error("DEBUG: Ошибка signUp:", err);
      setError(err.message || 'Ошибка регистрации.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden relative font-sans text-slate-900">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10"
      >
        {}
        <div className="hidden lg:block space-y-8 pr-12">
          <div className="flex items-center gap-3 cursor-default">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Beyim</h1>
          </div>

          <div className="space-y-6">
            <h2 className="text-5xl font-extrabold leading-[1.1] text-slate-900">
              {role === 'employee' 
                ? "Начни путь в компании уверенно" 
                : "Управляй командой эффективно"}
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed max-w-md">
              {role === 'employee'
                ? "Решай реальные задачи с поддержкой AI-тимлидера Beyim. Никакого страха сделать ошибку — только развитие."
                : "Автоматизируй онбординг своей команды и отслеживай их прогресс в реальном времени."}
            </p>
          </div>

          <div className="space-y-4">
            {[
              role === 'employee' ? "AI-тимлидер Beyim на базе GPT-4o" : "Статистика обучения команды",
              role === 'employee' ? "Симулятор реальных задач" : "Управление контентом онбординга",
              role === 'employee' ? "Мгновенная связь с куратором" : "Аналитика прогресса новичков"
            ].map((text, i) => (
              <motion.div 
                key={text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
                className="flex items-center gap-3 text-slate-700"
              >
                <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-accent" />
                </div>
                <span className="font-semibold text-slate-600">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {}
        <div className="premium-glass p-8 sm:p-10 rounded-[40px] w-full border border-white/60 backdrop-blur-3xl bg-white/70 shadow-2xl flex flex-col gap-8 transition-all hover:bg-white/80">
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Создать аккаунт</h3>
            <p className="text-slate-500 font-medium tracking-tight">Заполни данные, чтобы войти в систему</p>
          </div>

          <div className="flex p-1.5 bg-slate-100/90 rounded-2xl">
            <button
              type="button"
              onClick={() => setRole('employee')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all duration-300 ${
                role === 'employee' 
                  ? 'bg-white text-primary shadow-lg shadow-primary/5' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <User size={18} />
              <span>Сотрудник</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('teamleader')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all duration-300 ${
                role === 'teamleader' 
                  ? 'bg-white text-primary shadow-lg shadow-primary/5' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users size={18} />
              <span>Тимлидер</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50/80 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 font-semibold shadow-sm"
              >
                <AlertCircle size={20} />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Имя</label>
                <input 
                   type="text" 
                   placeholder="Иван" 
                   className="input-premium py-3.5 px-5"
                   value={firstName}
                   onChange={(e) => setFirstName(e.target.value)}
                   required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Фамилия</label>
                <input 
                   type="text" 
                   placeholder="Иванов" 
                   className="input-premium py-3.5 px-5"
                   value={lastName}
                   onChange={(e) => setLastName(e.target.value)}
                   required
                />
              </div>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {role === 'employee' ? (
                  <motion.div
                    key="employee-fields"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Инвайт-код</label>
                      <div className="relative group">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                        <input 
                          type="text" 
                          placeholder="FD-XXXX-XXXX" 
                          className="input-premium pl-12 py-3.5"
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="teamleader-fields"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Название компании</label>
                      <div className="relative group">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                        <input 
                          type="text" 
                          placeholder="Напр. Verigram" 
                          className="input-premium pl-12 py-3.5"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    type="email" 
                    placeholder="work@example.com" 
                    className="input-premium pl-12 py-3.5"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Пароль</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="input-premium pl-12 py-3.5"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-3 mt-4 py-4.5 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="text-lg">Создать аккаунт</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold">Или</span></div>
            </div>

            <button
              type="button"
              onClick={async () => {
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                    queryParams: {
                      access_type: 'offline',
                      prompt: 'consent',
                    },
                  }
                });
                if (error) {
                  console.error("Google Auth Error:", error);
                  setError(error.message);
                }
              }}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold shadow-sm transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Продолжить через Google
            </button>

            <p className="text-center text-sm text-slate-500 mt-6 font-medium">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="font-bold text-primary hover:text-primary/80 transition-all border-b-2 border-primary/10 hover:border-primary">Войти</Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;

