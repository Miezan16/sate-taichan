"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";

const SUGGESTIONS = ["Menu paling pedas?", "Lokasi terdekat?", "Promo hari ini?"];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ id: 1, text: "Halo! Saya AI Taichan. Ada yang bisa dibantu?", sender: "bot" }]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen]);

  const handleSend = (text: string = input) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), text, sender: "user" }]);
    setInput("");
    
    // Simulate AI typing
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Saya sedang mengecek database untuk Anda...", sender: "bot" }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-80 md:w-96 bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[500px]"
          >
            {/* Header */}
            <div className="bg-gradient-to-tr from-[#C1121F] to-[#800a12] p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white font-bold text-sm tracking-wide">TAICHAN AI</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-[#C1121F] text-white rounded-br-none shadow-lg shadow-red-900/20' 
                      : 'bg-[#1a1a1a] text-gray-300 border border-white/5 rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Suggestions */}
            <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
              {SUGGESTIONS.map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSend(s)}
                  className="whitespace-nowrap text-[10px] bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-1.5 rounded-full text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Sparkles size={10} /> {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-[#111111] border-t border-white/5 flex gap-2">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Tanya sesuatu..."
                className="flex-1 bg-[#050505] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#C1121F] border border-white/5 placeholder:text-gray-600"
              />
              <button onClick={() => handleSend()} className="bg-[#C1121F] text-white p-3 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20">
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-tr from-[#C1121F] to-[#800a12] rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(193,18,31,0.5)] border border-white/10 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 hover:opacity-100 transition-opacity" />
        <MessageSquare size={24} className="relative z-10" />
      </motion.button>
    </div>
  );
}