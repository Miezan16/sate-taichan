"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Utensils, 
  MapPin, 
  Info, 
  Search, 
  Flame, 
  MessageSquare, 
  X, 
  ChevronRight,
  Send,
  Star,
  ShieldCheck,
  Award,
  Clock,
  Phone,
  Instagram,
  ArrowRight
} from "lucide-react";

// --- DATA MENU (UNCHANGED) ---
const MOCK_MENUS = [
  { id: 1, nama: "Sate Taichan Original", deskripsi: "Daging ayam pilihan dengan bumbu bawang putih asli.", harga: 25000, protein: 18, image: "https://images.unsplash.com/photo-1529563021404-929d75d3b673?q=80&w=800", badge: "Best Seller", kategori: "Original" },
  { id: 2, nama: "Sate Taichan Jumbo", deskripsi: "Porsi 2x lipat untuk yang lapar mata.", harga: 45000, protein: 32, image: "https://images.unsplash.com/photo-1603083539532-7814650909d8?q=80&w=800", badge: "Favorite", kategori: "Jumbo" },
  { id: 3, nama: "Kulit Crispy", deskripsi: "Kulit ayam goreng tepung super renyah.", harga: 15000, protein: 8, image: "https://images.unsplash.com/photo-1562967960-f0d094083402?q=80&w=800", badge: "New", kategori: "Skin" },
  { id: 4, nama: "Es Jeruk Segar", deskripsi: "Perasan jeruk asli, manis pas, dingin menyegarkan.", harga: 10000, protein: 0, image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=800", badge: null, kategori: "Drinks" },
];

const CATEGORIES = ["All", "Original", "Jumbo", "Skin", "Drinks"];

// --- SUB-COMPONENTS (UI REDESIGN) ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`group relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${
      active 
        ? "bg-[#C1121F] text-white shadow-[0_0_20px_rgba(193,18,31,0.4)] scale-105" 
        : "text-gray-500 hover:bg-white/5 hover:text-white"
    }`}
  >
    <Icon size={22} strokeWidth={active ? 2.5 : 2} />
    {/* Tooltip */}
    <span className="absolute left-16 bg-[#1a1a1a] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-50 border border-white/10 shadow-xl translate-x-2 group-hover:translate-x-0">
      {label}
    </span>
  </button>
);

// --- SECTIONS (UI REDESIGN) ---

const HomeSection = ({ onNavigate }: { onNavigate: (tab: string) => void }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-16 w-full max-w-6xl mx-auto">
    {/* Hero Card */}
    <div className="relative rounded-[2.5rem] overflow-hidden bg-[#111111] border border-white/5 shadow-2xl group">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000')] bg-cover bg-center opacity-20 group-hover:scale-105 transition-transform duration-700" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent" />
      
      <div className="relative z-10 p-10 md:p-20 max-w-3xl">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-[#C1121F] animate-pulse" />
          <span className="text-xs font-bold tracking-widest text-gray-300 uppercase">Premium Dining Experience</span>
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
          THE ART OF <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C1121F] to-red-500">TAICHAN</span>
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl mb-10 font-light leading-relaxed max-w-xl">
          Selamat datang di Luxe Concierge. Rasakan sensasi kuliner sate taichan dengan standar kualitas tertinggi dan rasa yang otentik.
        </p>
        
        <button 
          onClick={() => onNavigate("Menu")} 
          className="group bg-[#C1121F] text-white px-8 py-4 rounded-full font-bold text-sm tracking-wider uppercase hover:bg-red-600 transition-all flex items-center gap-3 active:scale-95 shadow-[0_0_30px_rgba(193,18,31,0.3)]"
        >
          Order Now 
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[ 
        { label: "Quality", val: "A+ Grade", icon: ShieldCheck, color: "text-blue-500" }, 
        { label: "Rating", val: "4.9/5.0", icon: Star, color: "text-yellow-500" }, 
        { label: "Service", val: "24/7 AI", icon: MessageSquare, color: "text-[#C1121F]" } 
      ].map((item, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * i }}
          className="bg-[#111111] p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors flex items-center gap-6 group"
        >
          <div className={`p-4 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors ${item.color}`}>
            <item.icon size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{item.label}</p>
            <p className="text-2xl font-bold text-white">{item.val}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const LocationSection = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
    <div className="space-y-8 flex flex-col justify-center">
      <div>
        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">Our Locations</h2>
        <div className="h-1 w-20 bg-[#C1121F] rounded-full" />
      </div>
      
      <div className="bg-[#111111] p-8 rounded-[2rem] border border-white/5 space-y-8 shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="text-[#C1121F]" size={20} />
            <h3 className="text-2xl font-bold text-white">Bandung Central Luxe</h3>
          </div>
          <p className="text-gray-400 text-sm font-light pl-8">Jl. Dipatiukur No. 10, Bandung (Dekat Kampus UNPAD)</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 text-sm text-gray-300 bg-white/5 p-3 rounded-xl">
            <Clock size={16} className="text-[#C1121F]"/> 
            <span>16:00 - 23:00 WIB</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-300 bg-white/5 p-3 rounded-xl">
            <Phone size={16} className="text-[#C1121F]"/> 
            <span>+62 812-3456-7890</span>
          </div>
        </div>
        
        <button className="w-full bg-white text-black py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-gray-200 transition-all shadow-lg">
          Get Direction
        </button>
      </div>
    </div>
    
    <div className="rounded-[2rem] overflow-hidden bg-gray-900 border border-white/10 h-[400px] lg:h-auto relative group shadow-2xl">
       <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1000" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500 grayscale group-hover:grayscale-0" alt="map" />
       <div className="absolute inset-0 flex items-center justify-center">
         <div className="bg-[#C1121F] text-white px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2 transform group-hover:scale-110 transition-transform">
           <MapPin size={18} /> View on Maps
         </div>
       </div>
    </div>
  </motion.div>
);

const AboutSection = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto text-center space-y-12 py-10">
    <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-[#C1121F] to-red-900 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(193,18,31,0.3)] rotate-3">
      <Award size={48} className="text-white" />
    </div>
    
    <div className="space-y-6">
      <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter">The Story</h2>
      <p className="text-xl text-gray-400 font-light leading-relaxed max-w-2xl mx-auto">
        "Luxe Edition lahir dari dedikasi untuk mengangkat derajat kuliner jalanan menjadi pengalaman bintang lima. Kami percaya bahwa Sate Taichan bukan sekadar makanan, melainkan harmoni antara kelembutan daging ayam pilihan dan ledakan sambal rawit murni."
      </p>
    </div>

    <div className="grid grid-cols-2 gap-6 pt-10 max-w-2xl mx-auto">
      <div className="bg-[#111111] p-8 rounded-3xl border border-white/5 hover:border-[#C1121F]/30 transition-colors group">
        <h4 className="text-[#C1121F] font-black text-4xl mb-2 group-hover:scale-110 transition-transform block">100%</h4>
        <p className="text-xs text-gray-500 uppercase tracking-[0.2em] font-bold">Fresh Ingredients</p>
      </div>
      <div className="bg-[#111111] p-8 rounded-3xl border border-white/5 hover:border-[#C1121F]/30 transition-colors group">
        <h4 className="text-[#C1121F] font-black text-4xl mb-2 group-hover:scale-110 transition-transform block">NO</h4>
        <p className="text-xs text-gray-500 uppercase tracking-[0.2em] font-bold">Preservatives</p>
      </div>
    </div>
  </motion.div>
);

const SpicyModal = ({ menu, onClose }: { menu: any, onClose: () => void }) => {
  const [level, setLevel] = useState(5);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-[#111111] border border-white/10 w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl relative">
        <div className="h-56 relative">
          <img src={menu.image} className="w-full h-full object-cover" alt={menu.nama} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white p-2.5 rounded-full hover:bg-[#C1121F] transition-colors border border-white/10"><X size={20} /></button>
        </div>
        <div className="p-8 -mt-12 relative z-10">
          <h2 className="text-3xl font-bold text-white mb-2 text-center">{menu.nama}</h2>
          <p className="text-center text-gray-500 text-sm mb-8">Customize your heat level</p>
          
          <div className="mb-10 bg-[#1a1a1a] p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between text-xs text-gray-400 mb-4 font-bold uppercase tracking-widest">
              <span>Mild</span>
              <span className="text-[#C1121F] text-lg">Level {level}</span>
              <span>Extreme</span>
            </div>
            <input type="range" min="0" max="10" value={level} onChange={(e) => setLevel(Number(e.target.value))} className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#C1121F]" />
          </div>
          
          <button className="w-full bg-gradient-to-r from-[#C1121F] to-red-600 text-white font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(193,18,31,0.4)] transition-all flex justify-center items-center gap-2 active:scale-95">
            Confirm Order - Rp{menu.harga.toLocaleString()}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- CHATWIDGET LOGIC (UI REDESIGN) ---
const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ id: number; text: string; sender: string; recommendations?: string }[]>([
    { id: 1, text: "Selamat datang di Luxe Concierge. Ada yang bisa saya bantu Kak?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = { id: Date.now(), text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { 
        id: Date.now() + 1, 
        text: data.jawaban || "Maaf, saya belum mengerti.", 
        sender: "bot",
        recommendations: data.menu_direkomendasikan 
      }]);
    } catch (error) {
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: "Maaf, sistem Luxe AI sedang sibuk.", sender: "bot" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20, originY: 1 }} 
            animate={{ opacity: 1, scale: 1, y: 0, originY: 1 }} 
            exit={{ opacity: 0, scale: 0.9, y: 20, originY: 1 }} 
            className="mb-4 w-[350px] md:w-[400px] h-[550px] bg-[#0a0a0a] border border-white/10 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#C1121F] to-red-900 p-5 text-white flex justify-between items-center shadow-lg z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">Luxe AI</h3>
                  <p className="text-[10px] text-red-200 opacity-80">Online & Ready</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={18} /></button>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#050505] scrollbar-thin scrollbar-thumb-gray-800">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-[#C1121F] text-white rounded-tr-none' 
                      : 'bg-[#1a1a1a] text-gray-300 rounded-tl-none border border-white/5'
                  }`}>
                    {msg.text}
                    {msg.recommendations && msg.recommendations !== "-" && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-[9px] font-bold text-[#C1121F] mb-1 uppercase tracking-wider flex items-center gap-1">
                          <Star size={10} fill="#C1121F" /> Recommended
                        </p>
                        <p className="font-bold text-white text-sm">{msg.recommendations}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                   <div className="bg-[#1a1a1a] border border-white/5 p-4 rounded-2xl rounded-tl-none flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-75" />
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#111111] border-t border-white/5">
              <div className="flex gap-2 bg-[#050505] p-1.5 rounded-full border border-white/10 focus-within:border-[#C1121F]/50 transition-colors">
                <input 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                  placeholder="Ask Luxe AI..." 
                  className="flex-1 bg-transparent text-white text-sm px-4 py-2 focus:outline-none placeholder:text-gray-600" 
                />
                <button 
                  onClick={handleSend} 
                  disabled={!input.trim()}
                  className={`p-2.5 rounded-full text-white transition-all ${input.trim() ? 'bg-[#C1121F] shadow-lg shadow-red-900/20' : 'bg-gray-800 text-gray-500'}`}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Floating Button */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 ${isOpen ? 'bg-gray-800 rotate-90' : 'bg-gradient-to-tr from-[#C1121F] to-red-600 shadow-[0_0_30px_rgba(193,18,31,0.4)]'}`}
      >
        {isOpen ? <X size={28}/> : <MessageSquare size={28}/>}
      </motion.button>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function TaichanDashboard() {
  const [activeTab, setActiveTab] = useState("Home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMenu, setSelectedMenu] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredMenus = MOCK_MENUS.filter(menu => {
    const matchesSearch = menu.nama.toLowerCase().includes(searchQuery.toLowerCase()) || menu.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || menu.kategori === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-[#EAEAEA] selection:bg-[#C1121F] selection:text-white overflow-x-hidden font-sans">
      
      {/* Ambient Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#C1121F]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/5 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-purple-900/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar Desktop */}
        {!isMobile && (
          <aside className="fixed left-6 top-6 bottom-6 w-20 bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 rounded-3xl flex flex-col items-center py-8 gap-8 z-50 shadow-2xl">
            <div className="w-12 h-12 bg-gradient-to-tr from-[#C1121F] to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/40 mb-4">
              <Flame size={24} className="text-white" />
            </div>
            <div className="flex flex-col gap-6 w-full px-2">
              <SidebarItem icon={Home} label="Home" active={activeTab === "Home"} onClick={() => setActiveTab("Home")} />
              <SidebarItem icon={Utensils} label="Menu" active={activeTab === "Menu"} onClick={() => setActiveTab("Menu")} />
              <SidebarItem icon={MapPin} label="Location" active={activeTab === "Location"} onClick={() => setActiveTab("Location")} />
              <SidebarItem icon={Info} label="About" active={activeTab === "About"} onClick={() => setActiveTab("About")} />
            </div>
            <div className="mt-auto">
               <div className="w-2 h-2 rounded-full bg-gray-800" />
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto transition-all duration-300 scrollbar-hide ${!isMobile ? "pl-28 pr-8" : "pb-24"}`}>
          <div className="max-w-7xl mx-auto py-8 md:py-12">
            
            <AnimatePresence mode="wait">
              {activeTab === "Home" && <HomeSection key="home" onNavigate={setActiveTab} />}
              
              {activeTab === "Menu" && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} key="menu" className="space-y-10 w-full">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                    <div>
                      <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic mb-2">Signature Menu</h2>
                      <p className="text-gray-500 font-medium">Curated selection for you</p>
                    </div>
                    <div className="relative w-full md:w-80 group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C1121F] transition-colors" size={20} />
                      <input 
                        type="text" 
                        placeholder="Search delicacies..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="w-full bg-[#111111] border border-white/10 rounded-full py-3.5 pl-12 pr-6 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#C1121F]/50 focus:border-[#C1121F] transition-all placeholder:text-gray-600" 
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar mask-fade-right">
                    {CATEGORIES.map(cat => (
                      <button 
                        key={cat} 
                        onClick={() => setSelectedCategory(cat)} 
                        className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 border ${
                          selectedCategory === cat 
                            ? "bg-[#C1121F] text-white border-[#C1121F] shadow-[0_0_20px_rgba(193,18,31,0.3)]" 
                            : "bg-[#111111] text-gray-400 border-white/5 hover:border-white/20 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredMenus.map(menu => (
                      <motion.div 
                        layout 
                        key={menu.id} 
                        whileHover={{ y: -8 }} 
                        onClick={() => setSelectedMenu(menu)} 
                        className="bg-[#111111] rounded-[2rem] overflow-hidden border border-white/5 group hover:border-[#C1121F]/30 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transition-all flex flex-col cursor-pointer relative"
                      >
                        <div className="h-52 relative overflow-hidden">
                          <img src={menu.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={menu.nama} />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] to-transparent opacity-80" />
                          {menu.badge && (
                            <div className="absolute top-4 left-4 bg-[#C1121F] text-[10px] font-black px-3 py-1.5 rounded-full uppercase text-white shadow-lg shadow-red-900/20 tracking-wider">
                              {menu.badge}
                            </div>
                          )}
                          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                             <span className="text-[#C1121F] font-bold text-sm">Rp{menu.harga.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                          <h4 className="font-bold text-white text-lg leading-tight mb-2 group-hover:text-[#C1121F] transition-colors">{menu.nama}</h4>
                          <p className="text-gray-500 text-xs font-light line-clamp-2 mb-6 leading-relaxed">{menu.deskripsi}</p>
                          <div className="mt-auto pt-4 flex justify-between items-center border-t border-white/5">
                             <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-tighter bg-white/5 px-2 py-1 rounded-md">
                                <Flame size={12} className="text-orange-500" /> {menu.protein}g Protein
                             </div>
                             <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#C1121F] group-hover:text-white transition-all duration-300">
                                <ChevronRight size={16} />
                             </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "Location" && <LocationSection key="location" />}
              {activeTab === "About" && <AboutSection key="about" />}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <nav className="fixed bottom-6 left-6 right-6 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex justify-around z-50 shadow-2xl">
          {[ { id: "Home", icon: Home }, { id: "Menu", icon: Utensils }, { id: "Location", icon: MapPin }, { id: "About", icon: Info } ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`p-3 rounded-xl transition-all ${activeTab === item.id ? "bg-[#C1121F] text-white shadow-lg shadow-red-900/20" : "text-gray-500 hover:text-white"}`}>
              <item.icon size={22} />
            </button>
          ))}
        </nav>
      )}

      {/* Global Elements */}
      <ChatWidget />
      <AnimatePresence>{selectedMenu && <SpicyModal menu={selectedMenu} onClose={() => setSelectedMenu(null)} />}</AnimatePresence>
    </div>
  );
}