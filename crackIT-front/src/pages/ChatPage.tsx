import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Send, 
  ArrowLeft, 
  PanelLeft,
  X,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

interface UserContact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialUserId = searchParams.get('userId');

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [role, setRole] = useState<'employee' | 'teamleader' | null>(null);
  
  const [contacts, setContacts] = useState<UserContact[]>([]);
  const [currentContact, setCurrentContact] = useState<UserContact | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setCurrentUser(user);
      const userRole = user.user_metadata?.role;
      setRole(userRole);

      // Fetch contacts
      if (userRole === 'employee') {
        const { data: empData } = await supabase
          .from('employees')
          .select('team_leader_id')
          .eq('id', user.id)
          .single();
          
        if (empData?.team_leader_id) {
          const { data: tlData } = await supabase
            .from('team_leaders')
            .select('*')
            .eq('id', empData.team_leader_id)
            .single();
            
          if (tlData) {
            setContacts([tlData]);
            setCurrentContact(tlData);
          }
        }
      } else {
        const { data: empData } = await supabase
          .from('employees')
          .select('*')
          .eq('team_leader_id', user.id);
          
        if (empData && empData.length > 0) {
          setContacts(empData);
          if (initialUserId) {
            const found = empData.find((e: any) => e.id === initialUserId);
            if (found) setCurrentContact(found);
            else setCurrentContact(empData[0]);
          } else {
            setCurrentContact(empData[0]);
          }
        }
      }
      setIsLoading(false);
    };
    init();
  }, [navigate, initialUserId]);

  // Messages fetch and realtime subscription
  useEffect(() => {
    if (!currentUser || !currentContact) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${currentContact.id}),and(sender_id.eq.${currentContact.id},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });
        
      if (data) setMessages(data);
    };

    fetchMessages();

    // Fallback polling every 3 seconds in case Supabase Realtime is not enabled for the table
    const interval = setInterval(fetchMessages, 3000);

    const channel = supabase
      .channel(`chat_${currentUser.id}_${currentContact.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, payload => {
        const newMessage = payload.new as Message;
        if (
          (newMessage.sender_id === currentUser.id && newMessage.receiver_id === currentContact.id) ||
          (newMessage.sender_id === currentContact.id && newMessage.receiver_id === currentUser.id)
        ) {
          setMessages(prev => {
            if (prev.find(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [currentUser, currentContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentUser || !currentContact) return;

    const msgText = inputValue;
    setInputValue('');
    
    // Optimistic update
    const tempMessage: Message = {
      id: crypto.randomUUID(),
      sender_id: currentUser.id,
      receiver_id: currentContact.id,
      content: msgText,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMessage]);

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUser.id,
        receiver_id: currentContact.id,
        content: msgText
      });

    if (error) {
      console.error("Error sending message:", error);
      // Fallback: reload messages if error or just rely on the next poll
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-white border-r border-slate-200/60 flex flex-col h-screen z-50 relative shrink-0"
          >
            <div className="p-4 border-b border-slate-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="text-primary w-5 h-5" />
                </div>
                <span className="font-extrabold text-lg text-slate-800">
                  {role === 'teamleader' ? 'Моя команда' : 'Тимлидер'}
                </span>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
              {contacts.length === 0 ? (
                <div className="text-center text-slate-400 mt-10 text-sm">
                  Нет контактов
                </div>
              ) : (
                contacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => setCurrentContact(contact)}
                    className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      currentContact?.id === contact.id 
                        ? 'bg-primary/10 text-primary border border-primary/10' 
                        : 'hover:bg-slate-100 text-slate-600 border border-transparent'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${currentContact?.id === contact.id ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {contact.first_name.charAt(0)}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold truncate">{contact.first_name} {contact.last_name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-200/60 mt-auto">
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center gap-3 p-3 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors font-bold text-sm"
              >
                <ArrowLeft size={18} />
                В дашборд
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-5 left-6 z-50 p-2.5 bg-white border border-slate-200/60 shadow-sm rounded-xl text-slate-600 hover:bg-slate-50 transition-all active:scale-90"
          >
            <PanelLeft size={22} />
          </button>
        )}

        {/* Header */}
        <nav className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {isSidebarOpen ? null : <div className="w-10" />}
            {currentContact ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/10 text-primary font-bold text-lg">
                  {currentContact.first_name.charAt(0)}
                </div>
                <div>
                  <h1 className="font-bold text-slate-800 leading-none">{currentContact.first_name} {currentContact.last_name}</h1>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">На связи</span>
                  </div>
                </div>
              </div>
            ) : (
              <h1 className="font-bold text-slate-800">Выберите чат</h1>
            )}
          </div>
        </nav>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
          {messages.map((message) => {
            const isMe = message.sender_id === currentUser?.id;
            return (
              <div 
                key={message.id}
                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isMe 
                      ? 'bg-slate-200 text-slate-600' 
                      : 'bg-primary/20 text-primary'
                  }`}>
                    {isMe ? currentUser.user_metadata?.first_name?.charAt(0) || '?' : currentContact?.first_name.charAt(0) || '?'}
                  </div>
                  
                  <div className={`px-5 py-3.5 rounded-[24px] shadow-sm relative ${
                    isMe 
                      ? 'bg-primary text-white rounded-br-sm' 
                      : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm'
                  }`}>
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <div className={`text-[10px] mt-1.5 font-medium ${isMe ? 'text-white/70 text-right' : 'text-slate-400'}`}>
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200/60 shrink-0">
          <div className="max-w-4xl mx-auto relative flex items-end gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={currentContact ? "Напишите сообщение..." : "Выберите собеседника"}
                disabled={!currentContact}
                className="w-full bg-slate-100 border-none rounded-2xl py-4 pl-4 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 disabled:opacity-50"
              />
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || !currentContact}
              className="p-4 bg-primary hover:bg-primary-dark text-white rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 active:scale-95"
            >
              <Send size={20} className={inputValue.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;