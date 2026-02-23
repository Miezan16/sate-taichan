"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, Utensils, Search, Flame, X, Plus, Trash2, Hash, 
  CheckCircle, ShoppingCart, ArrowRight, Loader2, Star, MapPin, 
  Info, Sparkles, ChevronRight, Clock, Phone, ChefHat
} from "lucide-react";

import ChatWidget from "@/components/ChatWidget"; 

// --- 1. DEFINISI TIPE DATA ---
interface MenuItem {
  id: number;
  nama: string;
  deskripsi: string;
  harga: number;
  image: string;
  kategori: string;
}

interface CartItem extends MenuItem {
  qty: number;
}

// --- 2. DATA MENU & MEJA ---
const MOCK_MENUS: MenuItem[] = [
  { id: 1, nama: "Taichan Original", deskripsi: "Daging ayam dada pilihan, dibakar sempurna dengan siraman jeruk nipis.", harga: 28000, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000", kategori: "Original" },
  { id: 2, nama: "Taichan Jumbo Wagyu", deskripsi: "Bukan ayam biasa. Sate sapi wagyu leleh di mulut dengan sambal khas.", harga: 75000, image: "https://images.unsplash.com/photo-1603083539532-7814650909d8?q=80&w=1000", kategori: "Jumbo" },
  { id: 3, nama: "Kulit Ayam Crispy", deskripsi: "Digoreng kering hingga renyah, gurih, cocok untuk pendamping.", harga: 18000, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=1000", kategori: "Skin" },
  { id: 6, nama: "Es Jeruk Kelapa", deskripsi: "Perasan jeruk asli dipadu serutan kelapa muda manis.", harga: 15000, image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=1000", kategori: "Drinks" },
];

const CATEGORIES = ["All", "Original", "Jumbo", "Skin", "Drinks"];

// Nomor meja yang tersedia (1-12)
const AVAILABLE_TABLES = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

// --- SUB-COMPONENTS ---
const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick} 
    className={`group relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${active ? "bg-[#C1121F] text-white shadow-[0_0_20px_rgba(193,18,31,0.4)] scale-105" : "text-gray-500 hover:bg-white/5 hover:text-white"}`}
    title={label}
  >
    <Icon size={22} strokeWidth={active ? 2.5 : 2} />
    <span className="absolute left-16 bg-[#1a1a1a] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-white/10 whitespace-nowrap z-50">
      {label}
    </span>
  </button>
);

export default function CustomerOrderPage() {
  const [activeTab, setActiveTab] = useState("Home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Cart & Checkout States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "form" | "waiting" | "success">("cart");
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State untuk menyimpan ID pesanan yang baru di-submit agar bisa dipantau
  const [submittedOrderId, setSubmittedOrderId] = useState<number | null>(null);

  const cartTotal = cart.reduce((total, item) => total + (item.harga * item.qty), 0);
  const totalItems = cart.reduce((total, item) => total + item.qty, 0);

  // --- LOGIKA PESANAN ---
  const handleAddToCart = (menu: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === menu.id);
      if (existing) return prev.map(item => item.id === menu.id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { ...menu, qty: 1 }];
    });
    setCheckoutStep("cart");
    setIsCartOpen(true);
  };

  const removeFromCart = (menuId: number) => {
    setCart(prev => prev.filter(item => item.id !== menuId));
  };

  const submitOrder = async () => {
    if (!customerName.trim() || !tableNumber.trim()) return alert("Harap isi Nama dan pilih Nomor Meja!");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/transaksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama_pelanggan: customerName,
          nomor_meja: tableNumber,
          total_harga: cartTotal,
          items: cart.map(item => ({
            menu_id: item.id,
            jumlah: item.qty,
            harga_satuan: item.harga
          }))
        }),
      });

      if (!response.ok) throw new Error("Gagal");
      const data = await response.json();
      
      // Simpan ID yang dikembalikan oleh API (Asumsi API mereturn { id: ..., status: "PENDING" })
      if(data && data.id) {
        setSubmittedOrderId(data.id);
      }
      
      setCheckoutStep("waiting");
      setCart([]);
    } catch (error) {
      alert("Terjadi kesalahan saat mengirim pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- EFEK POLLING: PANTAU STATUS PESANAN ---
  useEffect(() => {
    let interval: NodeJS.Timeout;

    // Hanya lakukan polling jika sedang menunggu kasir dan punya ID pesanan
    if (checkoutStep === "waiting" && submittedOrderId) {
      interval = setInterval(async () => {
        try {
          // Ambil ulang data dari API
          const res = await fetch("/api/transaksi", { cache: "no-store" });
          const data = await res.json();
          
          // Cari pesanan kita
          const myOrder = data.find((o: any) => o.id === submittedOrderId);
          
          // Jika status BUKAN PENDING (misal sudah PROCESSING/UNPAID), berarti kasir sudah accept!
          if (myOrder && myOrder.status !== "PENDING") {
            setCheckoutStep("success");
            clearInterval(interval);
          }
        } catch (error) {
          console.error("Gagal mengecek status:", error);
        }
      }, 3000); // Cek setiap 3 detik
    }

    return () => clearInterval(interval);
  }, [checkoutStep, submittedOrderId]);

  // Tutup Modal Handler
  const handleCloseModal = () => {
    setIsCartOpen(false);
    // Jika user menutup modal saat sukses, reset semuanya ke awal
    if (checkoutStep === "success") {
      setCheckoutStep("cart");
      setCustomerName("");
      setTableNumber("");
      setSubmittedOrderId(null);
    }
  };

  const filteredMenus = MOCK_MENUS.filter(menu => {
    const matchesSearch = menu.nama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || menu.kategori === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // --- VIEW RENDERERS (Sama seperti sebelumnya) ---

  const renderHome = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="relative rounded-[2rem] overflow-hidden h-[400px] border border-white/10 group flex items-end p-8">
        <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000" alt="Hero" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full w-fit mb-4 border border-white/20">
              <Star className="text-yellow-400 fill-yellow-400" size={14} />
              <span className="text-white text-xs font-bold tracking-wider uppercase">4.9/5 DARI 2.000+ REVIEW</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-4">Sate Taichan <br/><span className="text-[#C1121F]">Premium.</span></h1>
            <p className="text-gray-300 text-lg mb-6">Nikmati sensasi gurih, pedas, dan perasan jeruk nipis segar yang menggugah selera. Dibakar sempurna khusus untukmu.</p>
            <button onClick={() => setActiveTab("Menu")} className="bg-[#C1121F] hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest transition-all shadow-lg flex items-center gap-3">Pesan Sekarang <ArrowRight size={20} /></button>
          </div>
        </div>
      </div>
      {/* Cards Info Bawah Hero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl flex items-center gap-4 hover:border-white/20 transition-all">
          <div className="w-12 h-12 bg-[#C1121F]/10 rounded-2xl flex items-center justify-center text-[#C1121F]"><Flame size={24} /></div>
          <div><h4 className="text-white font-bold">100% Daging Segar</h4><p className="text-sm text-gray-500">Kualitas premium setiap hari</p></div>
        </div>
        <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl flex items-center gap-4 hover:border-white/20 transition-all">
          <div className="w-12 h-12 bg-[#C1121F]/10 rounded-2xl flex items-center justify-center text-[#C1121F]"><Clock size={24} /></div>
          <div><h4 className="text-white font-bold">Buka Sampai Malam</h4><p className="text-sm text-gray-500">16.00 WIB - 23.00 WIB</p></div>
        </div>
        <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl flex items-center gap-4 hover:border-white/20 transition-all cursor-pointer" onClick={() => setActiveTab("Location")}>
          <div className="w-12 h-12 bg-[#C1121F]/10 rounded-2xl flex items-center justify-center text-[#C1121F]"><MapPin size={24} /></div>
          <div><h4 className="text-white font-bold">Lokasi Kami</h4><p className="text-sm text-gray-500">Lihat di Peta <ChevronRight size={14} className="inline" /></p></div>
        </div>
      </div>
    </motion.div>
  );

  const renderMenu = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 bg-[#111111] p-8 rounded-[2rem] border border-white/5">
        <div><h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Our Menu</h2><p className="text-gray-500 font-medium">Pilih sate favoritmu langsung dari meja.</p></div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input type="text" placeholder="Cari menu..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-full py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#C1121F] transition-colors" />
        </div>
      </div>
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 w-full">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase transition-all border ${selectedCategory === cat ? "bg-[#C1121F] text-white border-[#C1121F]" : "bg-[#111111] text-gray-400 border-white/5 hover:border-white/20 hover:text-white"}`}>{cat}</button>
          ))}
        </div>
        <button onClick={() => setIsCartOpen(true)} className="relative flex-shrink-0 w-12 h-12 bg-white/5 border border-white/10 rounded-full text-white">
          <ShoppingCart size={20} className="mx-auto" />
          {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-white text-[#C1121F] text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#111111]">{totalItems}</span>}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filteredMenus.map(menu => (
          <div key={menu.id} className="bg-[#111111] rounded-[2rem] overflow-hidden border border-white/5 group hover:border-[#C1121F]/50 transition-all flex flex-col relative shadow-lg">
            <div className="h-48 relative overflow-hidden"><img src={menu.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={menu.nama} /></div>
            <div className="p-5 flex flex-col flex-1 -mt-12 relative z-10">
              <div className="bg-[#1a1a1a]/80 backdrop-blur-md self-start px-3 py-1 rounded-lg border border-white/10 mb-3"><span className="text-[#C1121F] font-black text-sm">Rp{menu.harga.toLocaleString()}</span></div>
              <h4 className="font-bold text-white text-lg mb-2">{menu.nama}</h4>
              <p className="text-gray-400 text-xs line-clamp-2 mb-6">{menu.deskripsi}</p>
              <button onClick={() => handleAddToCart(menu)} className="mt-auto w-full bg-white/5 hover:bg-[#C1121F] border border-white/10 text-white py-3 rounded-xl text-sm font-bold transition-all flex justify-center items-center gap-2"><Plus size={16} /> Tambah</button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-[#EAEAEA] selection:bg-[#C1121F] font-sans overflow-hidden">
      {/* Background Gradient & Sidebar ... (tetap sama) */}
      <div className="fixed inset-0 z-0 pointer-events-none"><div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#C1121F]/5 rounded-full blur-[120px]" /></div>
      <div className="relative z-10 flex h-screen">
        <aside className="hidden lg:flex fixed left-6 top-6 bottom-6 w-20 bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 rounded-3xl flex-col items-center py-8 gap-6 z-40">
          <div className="w-12 h-12 bg-gradient-to-tr from-[#C1121F] to-red-600 rounded-xl flex items-center justify-center mb-8"><Flame size={24} className="text-white" /></div>
          <div className="flex flex-col gap-4 w-full px-2 flex-1">
            <SidebarItem icon={Home} label="Dashboard" active={activeTab === "Home"} onClick={() => setActiveTab("Home")} />
            <SidebarItem icon={Utensils} label="Menu & Pesan" active={activeTab === "Menu"} onClick={() => setActiveTab("Menu")} />
          </div>
        </aside>
        
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/10 p-4 z-40 flex justify-around">
           <SidebarItem icon={Home} label="Home" active={activeTab === "Home"} onClick={() => setActiveTab("Home")} />
           <SidebarItem icon={Utensils} label="Menu" active={activeTab === "Menu"} onClick={() => setActiveTab("Menu")} />
        </div>

        <main className="flex-1 overflow-y-auto lg:pl-32 lg:pr-8 px-4 pt-8 pb-32 w-full max-w-7xl mx-auto">
          {activeTab === "Home" && renderHome()}
          {activeTab === "Menu" && renderMenu()}
        </main>
      </div>

      <ChatWidget />

      {/* --- MODAL CART & CHECKOUT DIPERBARUI --- */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={checkoutStep !== "waiting" ? handleCloseModal : undefined} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#111111] border-l border-white/10 z-[70] flex flex-col shadow-2xl">
              
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0a0a0a]">
                <h3 className="text-xl font-black text-white">
                  {checkoutStep === "cart" && "Pesanan Saya"}
                  {checkoutStep === "form" && "Data & Nomor Meja"}
                  {checkoutStep === "waiting" && "Menunggu Kasir..."}
                  {checkoutStep === "success" && "Pesanan Diterima!"}
                </h3>
                {checkoutStep !== "waiting" && (
                  <button onClick={handleCloseModal} className="text-gray-400 hover:text-white"><X size={20} /></button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                {/* STEP 1: CART */}
                {checkoutStep === "cart" && (
                  <div className="space-y-4">
                    {cart.length === 0 ? <p className="text-center text-gray-500 mt-20">Keranjang Kosong</p> : cart.map(item => (
                      <div key={item.id} className="bg-[#1a1a1a] p-4 rounded-2xl flex gap-4 items-center">
                        <img src={item.image} className="w-14 h-14 rounded-xl object-cover" alt="" />
                        <div className="flex-1"><h4 className="text-white font-bold text-sm">{item.nama}</h4><p className="text-[#C1121F] font-bold text-sm">Rp{item.harga.toLocaleString()}</p></div>
                        <div className="text-xs font-bold bg-[#111111] px-2 py-1 rounded text-white mr-2">{item.qty}x</div>
                        <button onClick={() => removeFromCart(item.id)} className="text-gray-500 hover:text-[#C1121F]"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                )}

                {/* STEP 2: FORM DATA & GRID MEJA */}
                {checkoutStep === "form" && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Siapa Nama Anda?</label>
                      <input 
                        type="text" 
                        value={customerName} 
                        onChange={(e) => setCustomerName(e.target.value)} 
                        placeholder="Ketik nama pemesan..." 
                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-4 text-white font-bold focus:border-[#C1121F] outline-none transition-all placeholder:font-normal" 
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block flex items-center justify-between">
                        <span>Pilih Meja Anda</span>
                        <span className="text-[#C1121F]">{tableNumber ? `Meja ${tableNumber}` : 'Belum dipilih'}</span>
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {AVAILABLE_TABLES.map(t => (
                          <button
                            key={t}
                            onClick={() => setTableNumber(t)}
                            className={`py-3 rounded-xl font-black text-center border transition-all duration-200 ${
                              tableNumber === t
                                ? "bg-[#C1121F] border-[#C1121F] text-white shadow-[0_0_20px_rgba(193,18,31,0.5)] scale-105"
                                : "bg-[#1a1a1a] border-white/10 text-gray-500 hover:border-white/30 hover:text-white"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: WAITING FOR CASHIER */}
                {checkoutStep === "waiting" && (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in duration-500">
                    <div className="relative">
                      <div className="absolute inset-0 bg-[#C1121F] blur-[50px] opacity-20 rounded-full animate-pulse"></div>
                      <Loader2 className="animate-spin text-[#C1121F] relative z-10" size={64} />
                    </div>
                    <div>
                      <h3 className="text-white text-xl font-black mb-2 uppercase tracking-wide">Menunggu Kasir...</h3>
                      <p className="text-gray-400 text-sm leading-relaxed px-4">
                        Pesanan sudah terkirim. Mohon jangan tutup halaman ini sampai kasir menerima pesanan Anda.
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 4: SUCCESS / ACCEPTED */}
                {checkoutStep === "success" && (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                      <ChefHat className="text-green-400" size={48} />
                    </div>
                    <div>
                      <h3 className="text-green-400 text-2xl font-black mb-2 uppercase tracking-wide">Diterima!</h3>
                      <p className="text-gray-300 text-sm leading-relaxed px-4">
                        Kasir telah menerima pesanan Anda. Makanan sedang dipersiapkan oleh koki kami. Silakan tunggu di <strong className="text-white">Meja {tableNumber}</strong>.
                      </p>
                    </div>
                    <button onClick={handleCloseModal} className="mt-8 px-8 py-3 border border-white/20 rounded-full text-sm font-bold hover:bg-white hover:text-black transition-all">
                      Tutup & Kembali
                    </button>
                  </div>
                )}
              </div>

              {/* FOOTER ACTION BUTTONS */}
              {cart.length > 0 && checkoutStep !== "waiting" && checkoutStep !== "success" && (
                <div className="p-6 bg-[#0a0a0a] border-t border-white/10 space-y-4">
                  <div className="flex justify-between text-lg text-white font-black"><span>Total Bayar</span><span className="text-[#C1121F]">Rp{cartTotal.toLocaleString()}</span></div>
                  
                  {checkoutStep === "cart" ? (
                    <button onClick={() => setCheckoutStep("form")} className="w-full bg-[#C1121F] hover:bg-red-700 text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-all">Lanjut Pilih Meja</button>
                  ) : (
                    <div className="flex gap-3">
                      <button onClick={() => setCheckoutStep("cart")} className="w-14 h-14 bg-[#1a1a1a] border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all"><ArrowRight size={20} className="rotate-180" /></button>
                      <button onClick={submitOrder} disabled={isSubmitting || !tableNumber || !customerName} className="flex-1 bg-white text-black hover:bg-gray-200 py-4 rounded-xl font-black uppercase tracking-widest disabled:opacity-50 transition-all flex justify-center items-center gap-2">
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Kirim Pesanan"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}