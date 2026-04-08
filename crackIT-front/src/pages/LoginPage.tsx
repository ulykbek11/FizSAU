import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  User, 
  Users, 
  ArrowRight, 
  Mail, 
  Lock,
  Sparkles,
  Fingerprint,
  AlertCircle
} from 'lucide-react';

const LoginPage: React.FC = () => {
  const [role, setRole] = useState<'employee' | 'teamleader'>('employee');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка входа. Проверьте данные.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden relative">
      {}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10"
      >
        {}
        <div className="hidden lg:block space-y-8 pr-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Beyim</h1>
          </div>

          <div className="space-y-6">
            <h2 className="text-5xl font-extrabold leading-[1.1] text-slate-900">
              С возвращением <br />
              <span className="text-primary italic">в будущее компании</span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed max-w-md">
              Продолжай работу над своими задачами, общайся с AI-тимлидером Beyim и помогай коллегам осваиваться.
            </p>
          </div>

          <div className="premium-glass p-6 rounded-3xl border border-white/40 shadow-xl inline-block">
             <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                   <Fingerprint className="text-primary w-8 h-8" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Безовасность</div>
                  <div className="text-slate-800 font-semibold">Зашифровано сквозным шифрованием</div>
                </div>
             </div>
          </div>
        </div>

        {}
        <div className="premium-glass p-8 sm:p-10 rounded-[32px] w-full border border-white/50 backdrop-blur-xl bg-white/80 shadow-2xl">
          <div className="flex flex-col gap-8">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">Вход в систему</h3>
              <p className="text-slate-500">Введите свои данные для продолжения</p>
            </div>

            {}
            <div className="flex p-1 bg-slate-100/80 rounded-2xl">
              <button
                type="button"
                onClick={() => setRole('employee')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  role === 'employee' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <User size={18} />
                <span>Сотрудник</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('teamleader')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  role === 'teamleader' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Users size={18} />
                <span>Тимлидер</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 text-sm"
                >
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </motion.div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                    <input 
                      type="email" 
                      placeholder="work@company.com" 
                      className="input-premium pl-12"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-sm font-semibold text-slate-700">Пароль</label>
                    <a href="#" className="text-xs font-semibold text-primary hover:underline transition-all">Забыли пароль?</a>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="input-premium pl-12"
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
                className="btn-primary w-full flex items-center justify-center gap-2 mt-4 py-4"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Войти</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white/50 backdrop-blur-px px-2 text-slate-400">Или</span></div>
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

              <p className="text-center text-sm text-slate-500">
                Нет аккаунта?{' '}
                <Link to="/register" className="font-bold text-primary hover:underline transition-all">Присоединиться</Link>
              </p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;

