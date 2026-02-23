"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Send, Sparkles, Bot, Loader2, 
  ShieldCheck, Flame, Zap, Crown
} from "lucide-react";

const SUGGESTIONS = ["Menu Terlaris? 🌟", "Info Gizi & Protein 💪", "Promo Member 💎"];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Halo Kak! ✨ Saya AI Concierge Sate Taichan. Siap membantu pesanan premium Kakak.", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isOpen, isLoading]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;
    setMessages(prev => [...prev, { id: Date.now(), text, sender: "user" }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await response.json();
      
      let botReply = data.jawaban;
      if (data.menu_direkomendasikan && data.menu_direkomendasikan !== "-") {
        botReply += `\n\n✨ **${data.menu_direkomendasikan}**\nRp${data.harga}`;
      }

      setMessages(prev => [...prev, { id: Date.now(), text: botReply, sender: "bot" }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now(), text: "Maaf Kak, layanan sedang sibuk. 🙏", sender: "bot" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 left-8 z-[100] flex flex-col items-start font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 30, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-[350px] md:w-[400px] h-[580px] bg-black/80 backdrop-blur-[30px] border border-white/20 rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(193,18,31,0.3)] flex flex-col"
          >
            {/* Header Luxury */}
            <div className="p-6 relative overflow-hidden border-b border-white/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 blur-[60px] rounded-full pointer-events-none" />
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <motion.div 
                       animate={{ rotate: [0, 5, -5, 0] }}
                       transition={{ duration: 4, repeat: Infinity }}
                       className="w-12 h-12 bg-gradient-to-tr from-[#C1121F] via-[#ff4d4d] to-[#ffbaba] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(193,18,31,0.5)]"
                    >
                      <Crown size={24} className="text-white drop-shadow-md" />
                    </motion.div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-[3px] border-black rounded-full shadow-lg" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-base tracking-tight flex items-center gap-1.5">
                      TAICHAN ELITE <Sparkles size={14} className="text-yellow-400 fill-yellow-400" />
                    </h3>
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-[0.2em]">Smart Concierge</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white transition-all bg-white/5 p-2 rounded-full">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Chat Space */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar bg-gradient-to-b from-transparent to-red-950/10">
              {messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, x: msg.sender === 'user' ? 15 : -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] px-5 py-3 rounded-3xl text-[14px] leading-relaxed shadow-xl ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-[#C1121F] to-[#8a0d16] text-white rounded-tr-none' 
                      : 'bg-white/10 border border-white/10 text-gray-100 rounded-tl-none backdrop-blur-md'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 px-5 py-4 rounded-3xl rounded-tl-none border border-white/10 flex gap-2 items-center">
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  </div>
                </div>
              )}
            </div>

            {/* Premium Suggestions */}
            <div className="px-6 py-3 flex gap-2 overflow-x-auto no-scrollbar border-t border-white/5">
              {SUGGESTIONS.map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSend(s)}
                  className="flex-shrink-0 text-[11px] font-bold bg-gradient-to-b from-white/10 to-white/5 hover:from-red-600 hover:to-red-700 border border-white/10 px-4 py-2 rounded-full text-white/80 hover:text-white transition-all transform active:scale-90"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-6 bg-black/40">
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 pl-5 focus-within:border-red-500/50 focus-within:ring-1 focus-within:ring-red-500/20 transition-all shadow-2xl">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Katakan sesuatu..."
                  className="flex-1 bg-transparent text-white text-[14px] focus:outline-none placeholder:text-white/20"
                />
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSend()} 
                  disabled={!input.trim()}
                  className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] disabled:opacity-20 transition-all"
                >
                  <Send size={18} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB: The Attention Seeker */}
      {!isOpen && (
        <div className="relative group">
          {/* Pulsing Aura */}
          <div className="absolute inset-0 bg-red-600 rounded-full blur-2xl opacity-40 group-hover:opacity-80 animate-pulse transition-opacity" />
          
          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="relative h-14 px-8 bg-gradient-to-r from-black via-[#1a1a1a] to-black border border-white/20 rounded-full flex items-center gap-4 shadow-2xl overflow-hidden"
          >
            {/* Animated Shine Effect */}
            <motion.div 
              animate={{ x: [-100, 200] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" 
            />
            
            <div className="relative">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <Flame size={18} className="text-white fill-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping" />
            </div>
            
            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Exclusive AI</span>
              <span className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                Asisten Taichan <Sparkles size={14} className="text-yellow-400" />
              </span>
            </div>
          </motion.button>
        </div>
      )}
    </div>
  );
}