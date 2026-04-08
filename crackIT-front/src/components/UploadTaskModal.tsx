import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, Plus, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const UploadTaskModal: React.FC<{ isOpen: boolean; onClose: () => void; onTaskSaved?: () => void }> = ({ isOpen, onClose, onTaskSaved }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [solution, setSolution] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [taskFile, setTaskFile] = useState<File | null>(null);
    const [solutionFile, setSolutionFile] = useState<File | null>(null);

    const taskFileRef = React.useRef<HTMLInputElement>(null);
    const solutionFileRef = React.useRef<HTMLInputElement>(null);

    const handleSave = async () => {
        if (!title || (!description && !taskFile) || (!solution && !solutionFile)) return;
        setIsSaving(true);

        try {
            const { error } = await supabase.from('tasks').insert([{
                title,
                description: description || category || 'Без описания',
                mode: 'simulation',
                evaluation_criteria: JSON.stringify([{ text: solution || 'Оценивать по смыслу' }])
            }]);

            if (error) throw error;

            setTitle('');
            setCategory('');
            setDescription('');
            setSolution('');
            setTaskFile(null);
            setSolutionFile(null);
            onClose();
            if (onTaskSaved) {
                onTaskSaved();
            } else {
                window.location.reload();
            }
        } catch (err) {
            console.error('Ошибка при сохранении задачи:', err);
            alert('Ошибка при сохранении задачи');
        } finally {
            setIsSaving(false);
        }
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
                        {}
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

                        {}
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

                        {}
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

