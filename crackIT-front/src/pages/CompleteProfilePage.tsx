import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  User, 
  Users, 
  ArrowRight, 
  Sparkles,
  AlertCircle,
  Hash
} from 'lucide-react';

const CompleteProfilePage: React.FC = () => {
  const [role, setRole] = useState<'employee' | 'teamleader'>('employee');
  const [inviteCode, setInviteCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);
    };
    checkUser();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const generatedInviteCode = role === 'teamleader' ? `FD-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : undefined;

      const fullName = user.user_metadata?.full_name || '';
      const nameParts = fullName.split(' ');
      const firstName = user.user_metadata?.first_name || nameParts[0] || '';
      const lastName = user.user_metadata?.last_name || nameParts.slice(1).join(' ') || '';

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          role: role,
          company_name: companyName,
          invite_code: role === 'employee' ? inviteCode : generatedInviteCode,
          first_name: firstName,
          last_name: lastName
        }
      });

      if (updateError) throw updateError;

      if (role === 'teamleader') {
        const { error: insertError } = await supabase
          .from('team_leaders')
          .insert({
            id: user.id,
            first_name: firstName,
            last_name: lastName,
            company_name: companyName,
            email: user.email,
            invite_code: generatedInviteCode
          });

        if (insertError) {
          console.error("DEBUG: Ошибка вставки в team_leaders:", insertError);
          alert(`Внимание: профиль обновлен, но возникла ошибка: ${insertError.message}`);
        }
      } else if (role === 'employee') {
        const { data: teamLeaderData } = await supabase
          .from('team_leaders')
          .select('id')
          .eq('invite_code', inviteCode)
          .single();

        if (!teamLeaderData) {
          throw new Error('Неверный инвайт-код. Тимлидер с таким кодом не найден.');
        }

        const { error: insertError } = await supabase
          .from('employees')
          .insert({
            id: user.id,
            first_name: firstName,
            last_name: lastName,
            email: user.email,
            invite_code: inviteCode,
            team_leader_id: teamLeaderData.id
          });

        if (insertError) {
          console.error("DEBUG: Ошибка вставки в employees:", insertError);
          throw new Error('Ошибка при сохранении профиля сотрудника.');
        }
      }

      navigate('/dashboard');
    } catch (err: any) {
      console.error("DEBUG: Ошибка завершения профиля:", err);
      setError(err.message || 'Ошибка обновления профиля.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden relative font-sans text-slate-900">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="premium-glass p-8 sm:p-10 rounded-[40px] w-full border border-white/60 backdrop-blur-3xl bg-white/70 shadow-2xl flex flex-col gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 mx-auto">
              <Sparkles className="text-white w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Завершение регистрации</h3>
              <p className="text-slate-500 font-medium tracking-tight">Укажите вашу роль в системе</p>
            </div>
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
                  <span className="text-lg">Сохранить и продолжить</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CompleteProfilePage;
