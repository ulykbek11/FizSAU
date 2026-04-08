import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  HelpCircle,
  CheckCircle2,
  Lightbulb,
  User,
  RefreshCw,
  ChevronRight,
  BrainCircuit,
  Award,
  ArrowLeft,
  FileUp,
  FileText,
  X
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ReactMarkdown from 'react-markdown';

import { supabase } from '../lib/supabaseClient';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Task {
  id: string;
  title: string;
  description: string;
  solution: string;
  author: string;
  category: string;
  taskFileName?: string;
  solutionFileName?: string;
  isSolved?: boolean;
}

export interface UserProgress {
  solvedCount: number;
  totalAttempts: number;
  lastSolvedId?: string;
  solvedTasks?: string[];
}

export const AISimulator: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetTaskId = searchParams.get('taskId');

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data, error } = await supabase.from('tasks').select('*');
        if (error) throw error;

        if (data && data.length > 0) {
          const progressData = JSON.parse(localStorage.getItem('ai_simulator_progress') || '{"solvedCount":0, "solvedTasks": []}');
          const solvedTaskIds = progressData.solvedTasks || [];

          const formattedTasks: Task[] = data.map(t => ({
            id: t.id,
            title: t.title,
            description: t.description || 'Без описания',
            solution: t.evaluation_criteria?.[0]?.text || '',
            author: 'Тимлидер',
            category: t.mode === 'simulation' ? 'Симуляция' : 'Код',
            isSolved: solvedTaskIds.includes(t.id)
          }));

          const activeTasks = formattedTasks.filter(t => !t.isSolved);

          setTasks(activeTasks);

          if (activeTasks.length > 0) {
            if (targetTaskId) {
              const found = activeTasks.find((t: Task) => t.id === targetTaskId);
              if (found) setCurrentTask(found);
              else setCurrentTask(activeTasks[0]);
            } else {
              setCurrentTask(activeTasks[0]);
            }
          } else {
            setCurrentTask(null);
          }
        } else {
          setTasks([]);
          setCurrentTask(null);
        }
      } catch (err) {
        console.error('Ошибка загрузки задач:', err);
        setCurrentTask(null);
      }
    };

    fetchTasks();
  }, [targetTaskId]);

  const [userInput, setUserInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [chatMessages, setChatMessages] = useState<{ id: string; role: 'user' | 'ai'; text: string; isError?: boolean }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('ai_simulator_progress');
    return saved ? JSON.parse(saved) : { solvedCount: 0, totalAttempts: 0, solvedTasks: [] };
  });
  const [showAuthorHelp, setShowAuthorHelp] = useState(false);

  useEffect(() => {
    localStorage.setItem('ai_simulator_progress', JSON.stringify(progress));
  }, [progress]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      if (!userInput.trim()) {
        setUserInput(`[Файл прикреплен: ${file.name}]\n\nЯ прикрепил документ с решением.`);
      }
    }
  };

  const handleCheckSolution = async () => {
    if (!currentTask || (!userInput.trim() && !selectedFile)) return;

    setIsChecking(true);

    try {

      setProgress(prev => {
        const solvedTasks = prev.solvedTasks || [];
        if (!solvedTasks.includes(currentTask.id)) {
          return {
            ...prev,
            solvedCount: prev.solvedCount + 1,
            totalAttempts: prev.totalAttempts + 1,
            solvedTasks: [...solvedTasks, currentTask.id]
          };
        }
        return { ...prev, totalAttempts: prev.totalAttempts + 1 };
      });

      const { getGeminiResponse } = await import('../lib/geminiService');

      const userText = userInput || (selectedFile ? `[Файл прикреплен: ${selectedFile.name}]` : 'Нет ответа');

      setChatMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'user', text: `Проверь мое решение:\n${userText}` }
      ]);

      const prompt = `
Ты - AI-ментор. Твоя основная роль - сравнивать ответ пользователя на правильность, не строго с эталоном, а проверять, можно ли засчитать ответ правильным по смыслу и логически. В случае чего - помогай пользователю.

Описание задачи:
${currentTask.description}

Эталонное решение:
${currentTask.solution}

Ответ пользователя:
${userText}

Оцени ответ пользователя логически и дай полезный, поддерживающий фидбэк. Если есть ошибки - мягко укажи на них и подскажи правильный путь. Отвечай от лица ИИ-тимлидера.
`;

      const aiResponse = await getGeminiResponse(prompt, []);

      setChatMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'ai', text: aiResponse }
      ]);

      setTasks(prev => prev.filter(t => t.id !== currentTask.id));

    } catch (error) {
      console.error(error);
      setChatMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'ai', text: '🤖 Тимлидер: Не удалось получить ответ от ИИ. Проверь подключение.', isError: true }
      ]);
    }

    setIsChecking(false);
  };

  const handleSendMessage = async () => {
    if (!currentTask || !chatInput.trim()) return;

    const messageText = chatInput;
    setChatInput('');
    setIsChatting(true);

    setChatMessages(prev => [
      ...prev,
      { id: Date.now().toString(), role: 'user', text: messageText }
    ]);

    try {
      const { getGeminiResponse } = await import('../lib/geminiService');

      const history = chatMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const contextPrefix = `Контекст: Мы обсуждаем задачу "${currentTask.title}". Описание: "${currentTask.description}".\nЭталонное решение: "${currentTask.solution}".\n\nВопрос пользователя: `;

      const aiResponse = await getGeminiResponse(contextPrefix + messageText, history);

      setChatMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'ai', text: aiResponse }
      ]);
    } catch (error) {
      console.error(error);
      setChatMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'ai', text: 'Произошла ошибка при отправке сообщения.', isError: true }
      ]);
    }

    setIsChatting(false);
  };

  const handleAskAuthor = () => {
    if (!currentTask) return;
    setShowAuthorHelp(true);
    setTimeout(() => setShowAuthorHelp(false), 3000);
    console.log(`Сообщение отправлено автору: ${currentTask.author}. Задача: ${currentTask.title}`);
  };

  const nextTask = () => {
    if (tasks.length === 0) {
      setCurrentTask(null);
      setUserInput('');
      setChatMessages([]);
      setChatInput('');
      return;
    }
    if (!currentTask) return;

    const currentIndex = tasks.findIndex(t => t.id === currentTask.id);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % tasks.length;

    setCurrentTask(tasks[nextIndex]);
    setUserInput('');
    setChatMessages([]);
    setChatInput('');
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB] pt-8 pb-16">
      <div className="max-w-5xl mx-auto px-6 space-y-8">
        {}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold text-sm group"
        >
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover:border-primary/20">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Вернуться в дашборд
        </button>

        {}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
              <div className="p-2 bg-slate-900 rounded-2xl shadow-lg">
                <BrainCircuit className="text-white w-6 h-6" />
              </div>
              AI-Симулятор
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Тренируйся на реальных задачах нашей команды</p>
          </div>

          <div className="premium-glass px-6 py-4 rounded-[24px] flex items-center gap-8 border-white/80 bg-white/40 shadow-xl shadow-slate-200/40">
            <div className="text-center">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Решено</p>
              <p className="text-2xl font-black text-primary">{progress.solvedCount}</p>
            </div>
            <div className="h-10 w-px bg-slate-200/60" />
            <div className="text-center">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Попыток</p>
              <p className="text-2xl font-black text-slate-800">{progress.totalAttempts}</p>
            </div>
            <div className="h-10 w-px bg-slate-200/60" />
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
              <Award className="text-accent w-6 h-6" />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {}
          <section className="lg:col-span-7 space-y-6">
            {!currentTask ? (
              <div className="premium-glass p-8 rounded-[32px] border-white/80 bg-white/60 shadow-2xl shadow-slate-200/40 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-300">
                  <BrainCircuit className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">Нет доступных задач</h2>
                <p className="text-slate-500 font-medium text-lg max-w-sm mx-auto">
                  Тимлидер пока не добавил ни одной задачи для решения. Загляни сюда позже!
                </p>
              </div>
            ) : (
              <>
                <motion.div
                  key={currentTask.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="premium-glass p-8 rounded-[32px] border-white/80 bg-white/60 shadow-2xl shadow-slate-200/40 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                    <BrainCircuit className="w-32 h-32" />
                  </div>

                  <div className="flex justify-between items-start mb-6">
                    <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest border border-primary/10">
                      {currentTask.category}
                    </span>
                    <button
                      onClick={nextTask}
                      className="text-slate-400 hover:text-primary transition-all flex items-center gap-1.5 text-xs font-black uppercase tracking-widest group"
                    >
                      Следующая <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>

                  <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{currentTask.title}</h2>
                  <p className="text-slate-600 leading-relaxed mb-8 font-medium text-lg">
                    {currentTask.description}
                  </p>

                  {currentTask.taskFileName && (
                    <div className="mb-8 flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-2xl w-fit">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/5">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Прикрепленный файл задачи</p>
                        <p className="text-sm font-bold text-primary truncate max-w-[200px]">{currentTask.taskFileName}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-100/50">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Автор задачи</p>
                      <p className="text-base font-bold text-slate-800">{currentTask.author}</p>
                    </div>
                  </div>
                </motion.div>

                <div className="space-y-4">
                  <label className="text-sm font-black text-slate-800 flex items-center gap-2 ml-2 uppercase tracking-widest">
                    Твое решение
                  </label>
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Введи решение задачи..."
                    className="input-premium min-h-[240px] font-mono text-sm leading-relaxed resize-none p-6 rounded-[24px] border-white shadow-xl shadow-slate-200/20 bg-white/80"
                  />

                  <div className="flex flex-wrap gap-4 pt-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                    />

                    <button
                      onClick={handleCheckSolution}
                      disabled={isChecking || (!userInput.trim() && !selectedFile)}
                      className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-[20px] font-black flex items-center gap-3 flex-1 justify-center transition-all hover:translate-y-[-4px] active:translate-y-0 shadow-xl shadow-primary/25 disabled:opacity-50 disabled:translate-y-0"
                    >
                      {isChecking ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5" />
                      )}
                      {isChecking ? 'Проверяем...' : 'Получить фидбэк от ИИ'}
                    </button>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-4 rounded-[20px] border-2 border-slate-100 bg-white hover:border-slate-200 text-slate-700 font-black flex items-center gap-3 transition-all active:scale-95 shadow-sm"
                      title="Прикрепить Word, Excel или PDF"
                    >
                      <FileUp className="w-5 h-5 text-primary" />
                      Загрузить док
                    </button>

                    <button
                      onClick={handleAskAuthor}
                      className="px-6 py-4 rounded-[20px] border-2 border-slate-100 bg-white hover:border-slate-200 text-slate-700 font-black flex items-center gap-3 transition-all active:scale-95 shadow-sm"
                    >
                      <HelpCircle className="w-5 h-5 text-slate-300" />
                      Помощь
                    </button>
                  </div>

                  {selectedFile && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-3 p-3 bg-white/50 border border-slate-200 rounded-2xl w-fit"
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex flex-col pr-4">
                        <span className="text-xs font-black text-slate-800 truncate max-w-[150px]">{selectedFile.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="p-1.5 hover:bg-slate-200 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {showAuthorHelp && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-4 bg-accent/10 border border-accent/20 rounded-2xl text-accent text-sm font-bold flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                          <Send className="w-4 h-4" />
                        </div>
                        Запрос на помощь успешно отправлен автору {currentTask.author}!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </section>

          {}
          <aside className="lg:col-span-5">
            <div className="sticky top-8 space-y-6">
              <div className="premium-glass p-6 rounded-[32px] border-white/80 bg-white/60 shadow-2xl shadow-slate-200/40 flex flex-col h-[700px]">
                <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3 tracking-tight shrink-0">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <Lightbulb className="text-amber-500 w-5 h-5" />
                  </div>
                  ИИ чат
                </h3>

                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4"
                >
                  <AnimatePresence>
                    {chatMessages.length === 0 ? (
                      <div className="py-12 text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-100/80 rounded-[28px] flex items-center justify-center mx-auto text-slate-300 border border-slate-200/50 shadow-inner">
                          <BrainCircuit className="w-10 h-10" />
                        </div>
                        <p className="text-slate-400 font-bold text-sm max-w-[200px] mx-auto leading-relaxed">
                          Задай вопрос ИИ-тимлидеру или отправь решение на проверку.
                        </p>
                      </div>
                    ) : (
                      chatMessages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "p-4 rounded-[24px] border-2 leading-relaxed font-medium text-sm",
                            msg.role === 'user'
                              ? "bg-white border-slate-100 text-slate-800 ml-8 shadow-sm"
                              : msg.isError
                                ? "bg-red-50 border-red-100 text-red-800 mr-8 shadow-sm"
                                : "bg-emerald-50 border-emerald-100 text-emerald-800 mr-8 shadow-sm"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "p-1.5 rounded-lg mt-0.5 shrink-0",
                              msg.role === 'user'
                                ? "bg-slate-100"
                                : msg.isError
                                  ? "bg-red-200"
                                  : "bg-emerald-200"
                            )}>
                              {msg.role === 'user' ? <User className="w-4 h-4" /> : <BrainCircuit className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <ReactMarkdown
                                components={{
                                  p: ({ node, ...props }) => <p className="mb-2 last:mb-0 whitespace-pre-wrap" {...props} />,
                                  ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                  ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                  li: ({ node, ...props }) => <li {...props} />,
                                  strong: ({ node, ...props }) => <strong className="font-bold text-slate-900" {...props} />,
                                  h3: ({ node, ...props }) => <h3 className="font-bold text-base mt-3 mb-1" {...props} />,
                                  h4: ({ node, ...props }) => <h4 className="font-bold mt-2 mb-1" {...props} />
                                }}
                              >
                                {msg.text}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                    {isChatting && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-[24px] border-2 bg-emerald-50 border-emerald-100 text-emerald-800 mr-8 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-emerald-200 shrink-0">
                            <BrainCircuit className="w-4 h-4" />
                          </div>
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="shrink-0 pt-4 border-t border-slate-100">
                  <div className="relative">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Задай вопрос ИИ-тимлидеру..."
                      disabled={isChatting}
                      className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white text-sm"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim() || isChatting}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AISimulator;

