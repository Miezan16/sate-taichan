"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ClipboardList, Flame, X, Banknote, CreditCard, LayoutGrid, 
  History, Loader2, Clock, ChevronRight, Wallet, Printer, CheckCircle2,
  Receipt, Download
} from "lucide-react";

// --- TYPES ---
type StatusPesanan = "PENDING" | "PROCESSING" | "UNPAID" | "COMPLETED";
type MetodePembayaran = "CASH" | "EWALLET";

interface MenuItem { nama: string; }
interface OrderItem { id: number; menu: MenuItem; jumlah: number; harga_satuan: number; }
interface Order {
  id: number; nama_pelanggan: string; nomor_meja: string; status: StatusPesanan;
  total_harga: number; tanggal: string; kasir_nama?: string; metode_pembayaran?: MetodePembayaran;
  items: OrderItem[];
}

const COLUMNS = [
  { id: "PENDING", label: "Pesanan Masuk", icon: ClipboardList, accent: "from-yellow-400 to-amber-600", bgAccent: "bg-yellow-500", textAccent: "text-yellow-400", borderAccent: "border-yellow-500/30" },
  { id: "PROCESSING", label: "Dapur / Masak", icon: Flame, accent: "from-orange-500 to-red-600", bgAccent: "bg-orange-500", textAccent: "text-orange-400", borderAccent: "border-orange-500/30" },
  { id: "UNPAID", label: "Siap Bayar", icon: Wallet, accent: "from-cyan-400 to-blue-600", bgAccent: "bg-cyan-500", textAccent: "text-cyan-400", borderAccent: "border-cyan-500/30" },
];

export default function CashierDashboard() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "history">("dashboard");
  const [orders, setOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [loadingOrderId, setLoadingOrderId] = useState<number | null>(null);
  const [cashierName, setCashierName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<MetodePembayaran>("CASH");

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/transaksi", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data.filter((o: Order) => o.status !== "COMPLETED"));
        setHistoryOrders(data.filter((o: Order) => o.status === "COMPLETED"));
      }
    } catch (error) { console.error("Fetch Error:", error); }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleNextStatus = async (order: Order) => {
    let nextStatus: StatusPesanan | null = null;
    if (order.status === "PENDING") nextStatus = "PROCESSING";
    else if (order.status === "PROCESSING") nextStatus = "UNPAID";
    
    if (order.status === "UNPAID") { setSelectedOrder(order); setIsModalOpen(true); return; }
    if (!nextStatus) return;

    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: nextStatus } : o));
    setLoadingOrderId(order.id);
    try {
      const res = await fetch(`/api/transaksi/${order.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!res.ok) throw new Error();
      await fetchOrders();
    } catch (err) {
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: order.status } : o));
    } finally { setLoadingOrderId(null); }
  };

  const handleFinalSubmit = async () => {
    if (!cashierName.trim() || !selectedOrder) return alert("Nama kasir wajib diisi!");
    try {
      const res = await fetch(`/api/transaksi/${selectedOrder.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED", kasir_nama: cashierName, metode_pembayaran: paymentMethod })
      });
      if (res.ok) { 
        setSelectedOrder(prev => prev ? {...prev, kasir_nama: cashierName, metode_pembayaran: paymentMethod} : null);
        setShowReceipt(true); 
        await fetchOrders(); 
      }
    } catch (err) { alert("Gagal memproses pembayaran"); }
  };

  const closeModal = () => {
    setIsModalOpen(false); setShowReceipt(false); setCashierName(""); setPaymentMethod("CASH"); setSelectedOrder(null);
  };

  const handlePrintHistory = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Izinkan popup untuk mencetak PDF');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan Riwayat Transaksi</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px;
              color: #000;
            }
            .header {
              text-align: center;
              border-bottom: 3px double #000;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .title { font-size: 24px; font-weight: bold; margin: 0; }
            .subtitle { font-size: 12px; color: #666; margin: 5px 0; }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
              margin-top: 15px;
            }
            th {
              background-color: #1a1a1e;
              color: #fff !important;
              font-weight: bold;
              padding: 10px 8px;
              text-align: left;
              border: 1px solid #333;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            td {
              padding: 8px;
              border: 1px solid #ddd;
            }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .total-row {
              font-weight: bold;
              background-color: #e8e8e8 !important;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .info { 
              display: flex; 
              justify-content: space-between; 
              margin: 15px 0;
              padding: 10px;
              background: #f5f5f5;
              border-radius: 4px;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">KITCHEN FLOW</h1>
            <p class="subtitle">Laporan Riwayat Transaksi</p>
            <p class="subtitle">Dicetak: ${new Date().toLocaleString('id-ID')}</p>
          </div>
          <div class="info">
            <span><strong>Total Transaksi:</strong> ${historyOrders.length}</span>
            <span><strong>Tanggal:</strong> ${new Date().toLocaleDateString('id-ID')}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tanggal</th>
                <th>Pelanggan</th>
                <th class="text-center">Meja</th>
                <th>Kasir</th>
                <th>Metode</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${historyOrders.map(order => `
                <tr>
                  <td>#${order.id}</td>
                  <td>${new Date(order.tanggal).toLocaleString('id-ID')}</td>
                  <td><strong>${order.nama_pelanggan}</strong></td>
                  <td class="text-center">${order.nomor_meja}</td>
                  <td>${order.kasir_nama || '-'}</td>
                  <td>${order.metode_pembayaran || '-'}</td>
                  <td class="text-right"><strong>Rp ${order.total_harga.toLocaleString('id-ID')}</strong></td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="6" class="text-right">GRAND TOTAL</td>
                <td class="text-right">Rp ${historyOrders.reduce((sum, o) => sum + o.total_harga, 0).toLocaleString('id-ID')}</td>
              </tr>
            </tfoot>
          </table>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handlePrintReceipt = () => {
    if (!selectedOrder) return;
    
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) {
      alert('Izinkan popup untuk mencetak struk');
      return;
    }

    const now = new Date();
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Struk Pembayaran</title>
          <style>
            @page { size: auto; margin: 0; }
            body { 
              font-family: 'Courier New', monospace;
              font-size: 11px;
              line-height: 1.4;
              margin: 0;
              padding: 10px;
              width: 58mm;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .divider-double { border-top: 2px dashed #000; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; margin: 5px 0; }
            td { padding: 2px 0; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="text-center" style="margin-bottom: 8px;">
            <div style="font-size: 13px; font-weight: bold; text-transform: uppercase;">KITCHEN FLOW</div>
            <div style="font-size: 9px;">Jl. Masa Depan No. 99</div>
            <div style="font-size: 9px;">Telp: 0811-2233-4455</div>
          </div>
          <div class="divider"></div>
          <table>
            <tr><td>No. Trx</td><td class="text-right">: ${String(selectedOrder.id).padStart(6, '0')}</td></tr>
            <tr><td>Tanggal</td><td class="text-right">: ${now.toLocaleDateString('id-ID')}</td></tr>
            <tr><td>Waktu</td><td class="text-right">: ${now.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</td></tr>
            <tr><td>Kasir</td><td class="text-right">: ${selectedOrder.kasir_nama?.substring(0, 10) || '-'}</td></tr>
            <tr><td>Meja</td><td class="text-right">: ${selectedOrder.nomor_meja}</td></tr>
          </table>
          <div class="divider-double"></div>
          <div class="text-center" style="margin: 8px 0;">
            <div style="font-size: 9px; text-transform: uppercase;">Pelanggan</div>
            <div style="font-weight: bold; font-size: 12px;">${selectedOrder.nama_pelanggan}</div>
          </div>
          <div class="divider"></div>
          <table>
            ${selectedOrder.items.map(item => `
              <tr><td colspan="2" style="font-weight: bold; padding-top: 6px;">${item.menu.nama}</td></tr>
              <tr><td>${item.jumlah} x ${item.harga_satuan.toLocaleString('id-ID')}</td><td class="text-right">${(item.jumlah * item.harga_satuan).toLocaleString('id-ID')}</td></tr>
            `).join('')}
          </table>
          <div class="divider-double"></div>
          <table>
            <tr><td class="bold">TOTAL</td><td class="text-right bold" style="font-size: 13px;">Rp ${selectedOrder.total_harga.toLocaleString('id-ID')}</td></tr>
            <tr><td>Bayar (${selectedOrder.metode_pembayaran || paymentMethod})</td><td class="text-right">Rp ${selectedOrder.total_harga.toLocaleString('id-ID')}</td></tr>
            <tr><td>Kembali</td><td class="text-right">Rp 0</td></tr>
          </table>
          <div class="divider-double"></div>
          <div class="text-center" style="margin-top: 10px;">
            <div style="font-weight: bold; font-size: 12px;">*** TERIMA KASIH ***</div>
            <div style="font-size: 9px; margin-top: 5px;">Barang yang dibeli tidak dapat</div>
            <div style="font-size: 9px;">ditukar/dikembalikan</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // --- IMPROVED ORDER CARD ---
  const OrderCard = ({ order, accentGradient, textAccent, borderAccent, bgAccent, compactMode }: { 
    order: Order, accentGradient: string, textAccent: string, borderAccent: string, bgAccent: string, compactMode: boolean 
  }) => {
    const isLoading = loadingOrderId === order.id;
    const isLastStatus = order.status === "UNPAID";

    if (compactMode) {
      // Ultra compact mode for many orders
      return (
        <motion.div 
          layout
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }}
          className={`group relative bg-gradient-to-r from-[#18181b] to-[#1a1a1e] rounded-lg p-3 border ${borderAccent} hover:border-opacity-60 transition-all duration-200 hover:shadow-lg`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-1.5 h-10 rounded-full bg-gradient-to-b ${accentGradient} opacity-80`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[9px] font-bold ${textAccent} bg-[#1a1a1e] px-1.5 py-0.5 rounded border ${borderAccent}`}>#{order.id}</span>
                <span className="text-[9px] text-gray-400 bg-[#27272a] px-1.5 py-0.5 rounded">Meja {order.nomor_meja}</span>
              </div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white truncate max-w-[150px]">{order.nama_pelanggan}</h4>
                <span className="text-xs font-bold text-white">Rp{(order.total_harga/1000).toFixed(0)}k</span>
              </div>
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                {order.items?.slice(0, 2).map((item) => (
                  <span key={item.id} className="text-[8px] text-gray-400 bg-[#27272a] px-1 py-0.5 rounded">
                    {item.jumlah}x {item.menu?.nama?.slice(0, 8)}
                  </span>
                ))}
                {order.items?.length > 2 && (
                  <span className="text-[8px] text-gray-500">+{order.items.length - 2}</span>
                )}
              </div>
            </div>
            <button 
              onClick={() => handleNextStatus(order)} 
              disabled={isLoading}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                isLoading ? "bg-[#27272a]" : `bg-gradient-to-br ${accentGradient} hover:scale-105 active:scale-95`
              }`}
            >
              {isLoading ? <Loader2 className="animate-spin text-white" size={14} /> : <ChevronRight className="text-white" size={16} strokeWidth={3} />}
            </button>
          </div>
        </motion.div>
      );
    }

    // Normal card mode
    return (
      <motion.div 
        layout 
        layoutId={`order-${order.id}`}
        initial={{ opacity: 0, scale: 0.95, y: 10 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className={`group relative bg-gradient-to-br from-[#18181b] via-[#1a1a1e] to-[#1c1c21] rounded-xl p-4 border ${borderAccent} hover:border-opacity-60 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden`}
      >
        {/* Glow effect */}
        <div className={`absolute -top-20 -right-20 w-32 h-32 bg-gradient-to-br ${accentGradient} rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
        
        {/* Table number badge */}
        <div className="absolute top-3 right-4">
          <span className={`text-5xl font-black ${textAccent} opacity-20 select-none`}>{order.nomor_meja}</span>
        </div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-gradient-to-r ${accentGradient} text-white shadow-sm`}>
                  #{order.id}
                </span>
                <span className={`text-[9px] font-bold px-2 py-1 rounded-lg ${bgAccent}/10 ${textAccent} border ${borderAccent}`}>
                  🪑 Meja {order.nomor_meja}
                </span>
              </div>
              <h3 className="font-bold text-base text-white uppercase tracking-tight truncate">{order.nama_pelanggan}</h3>
              <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                <Clock size={10} /> {new Date(order.tanggal).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}
              </p>
            </div>
          </div>
          
          {/* Items List */}
          <div className="space-y-2 mb-4 pl-3 border-l-2 border-[#27272a]">
            {order.items?.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center justify-between text-[11px] group/item">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r ${accentGradient} text-white`}>
                    {item.jumlah}x
                  </span> 
                  <span className="text-gray-300 font-medium truncate max-w-[140px]">{item.menu?.nama}</span>
                </div>
                <span className="text-gray-400 font-semibold">Rp{(item.jumlah * item.harga_satuan/1000).toFixed(0)}k</span>
              </div>
            ))}
            {order.items?.length > 4 && (
              <div className={`text-[10px] ${textAccent} italic pl-1 font-medium`}>+ {order.items.length - 4} item lainnya...</div>
            )}
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-[#27272a]">
            <div>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-1">Total Tagihan</p>
              <p className={`text-lg font-black ${textAccent} tracking-tight`}>
                Rp{order.total_harga.toLocaleString()}
              </p>
            </div>
            <button 
              onClick={() => handleNextStatus(order)} 
              disabled={isLoading}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg active:scale-90 ${
                isLoading 
                  ? "bg-[#27272a] cursor-wait" 
                  : `bg-gradient-to-br ${accentGradient} hover:shadow-${bgAccent}/40 hover:scale-105`
              }`}
            >
              {isLoading ? (
                <Loader2 className="animate-spin text-white" size={18} />
              ) : isLastStatus ? (
                <Wallet className="text-white drop-shadow-sm" size={18} />
              ) : (
                <ChevronRight className="text-white drop-shadow-sm" size={20} strokeWidth={3} />
              )}
            </button>
          </div>
        </div>
        
        {/* Hover overlay */}
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${accentGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#09090b] via-[#0a0a0c] to-[#0f0f13] text-white font-sans selection:bg-cyan-500/30 overflow-hidden flex">
      {/* --- SIDEBAR --- */}
      <aside className="w-20 bg-gradient-to-b from-[#09090b] to-[#0f0f13] flex flex-col items-center py-6 z-40 border-r border-[#18181b]/80 backdrop-blur-xl">
        <div className="mb-10 p-3 bg-gradient-to-br from-[#18181b] to-[#1a1a1e] rounded-2xl shadow-lg border border-[#27272a]/50">
          <Flame className="text-red-500" size={24} fill="currentColor" />
        </div>
        <nav className="flex flex-col gap-4 w-full px-3">
          <button 
            onClick={() => setActiveTab("dashboard")} 
            className={`group relative w-full aspect-square flex flex-col items-center justify-center gap-1.5 rounded-2xl transition-all duration-300 ${
              activeTab === "dashboard" 
                ? "text-white bg-gradient-to-br from-[#18181b] to-[#1a1a1e] border border-[#3f3f46] shadow-lg" 
                : "text-gray-500 hover:text-white hover:bg-[#18181b]/50"
            }`}
          >
            <LayoutGrid size={20} className={`transition-transform ${activeTab === "dashboard" ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="text-[9px] font-bold tracking-wide">Dashboard</span>
            {activeTab === "dashboard" && (
              <motion.div layoutId="activeTab" className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-8 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab("history")} 
            className={`group relative w-full aspect-square flex flex-col items-center justify-center gap-1.5 rounded-2xl transition-all duration-300 ${
              activeTab === "history" 
                ? "text-white bg-gradient-to-br from-[#18181b] to-[#1a1a1e] border border-[#3f3f46] shadow-lg" 
                : "text-gray-500 hover:text-white hover:bg-[#18181b]/50"
            }`}
          >
            <History size={20} className={`transition-transform ${activeTab === "history" ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="text-[9px] font-bold tracking-wide">Riwayat</span>
            {activeTab === "history" && (
              <motion.div layoutId="activeTab" className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-8 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
            )}
          </button>
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-6 h-screen overflow-hidden flex flex-col">
        <header className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase text-white mb-1 flex items-center gap-3">
              Kitchen<span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Flow</span>.
            </h1>
            <p className="text-gray-500 font-medium text-[10px] tracking-wide flex items-center gap-2 uppercase">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/30"></span> 
              System Active • {orders.length} Pesanan Aktif
            </p>
          </div>
        </header>

        {activeTab === "dashboard" ? (
          <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide">
            {COLUMNS.map((col) => {
              const colOrders = orders.filter(o => o.status === col.id);
              const compactMode = colOrders.length > 6;
              
              return (
                <motion.div 
                  key={col.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full"
                >
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#27272a]/60">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${col.accent} shadow-lg`}>
                      <col.icon className="text-white drop-shadow-sm" size={18} />
                    </div>
                    <h2 className="font-bold text-sm text-white uppercase tracking-wider">{col.label}</h2>
                    <span className={`ml-auto px-3 py-1.5 rounded-full text-xs font-black bg-gradient-to-r ${col.accent} text-white shadow-sm`}>
                      {colOrders.length}
                    </span>
                    {compactMode && (
                      <span className="text-[9px] text-gray-500 bg-[#18181b] px-2 py-1 rounded-lg border border-[#27272a]">
                        Mode Kompak
                      </span>
                    )}
                  </div>
                  
                  {colOrders.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="w-full h-36 border-2 border-dashed border-[#18181b]/80 rounded-2xl flex flex-col items-center justify-center text-gray-600 bg-[#0f0f13]/50"
                    >
                      <col.icon className="mb-2 opacity-30" size={28} />
                      <span className="font-bold uppercase text-[10px] tracking-widest">Tidak ada pesanan</span>
                    </motion.div>
                  ) : (
                    <motion.div 
                      layout
                      className={`grid gap-4 ${
                        compactMode 
                          ? "grid-cols-1" 
                          : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                      }`}
                    >
                      <AnimatePresence mode="popLayout">
                        {colOrders.map(o => (
                          <OrderCard 
                            key={`order-${o.id}`} 
                            order={o} 
                            accentGradient={col.accent} 
                            textAccent={col.textAccent}
                            borderAccent={col.borderAccent}
                            bgAccent={col.bgAccent}
                            compactMode={compactMode}
                          />
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4 pb-4 border-b border-[#27272a]/60">
              <div>
                <h2 className="font-bold text-lg text-white uppercase tracking-wider flex items-center gap-2">
                  <History className="text-cyan-400" size={20} />
                  Riwayat Transaksi
                </h2>
                <p className="text-[10px] text-gray-500 mt-1">{historyOrders.length} transaksi</p>
              </div>
              <button 
                onClick={handlePrintHistory} 
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase hover:shadow-lg hover:shadow-cyan-500/30 transition-all active:scale-95 border border-cyan-400/30"
              >
                <Download size={16} /> Export PDF
              </button>
            </div>

            <div className="flex-1 bg-[#101012] border border-[#27272a] rounded-2xl overflow-hidden flex flex-col">
              <div className="no-print p-4 bg-gradient-to-r from-[#141417] to-[#18181b] border-b border-[#27272a]">
                <p className="text-xs text-gray-400 font-medium flex items-center gap-2">
                  <Receipt size={14} className="text-cyan-400" />
                  Klik Export PDF untuk mencetak laporan
                </p>
              </div>
              
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gradient-to-r from-[#18181b] to-[#1a1a1e] text-gray-300 uppercase text-[10px] sticky top-0 z-10 shadow-md border-b border-[#27272a]">
                    <tr>
                      <th className="p-4 font-bold tracking-wider w-20">ID</th>
                      <th className="p-4 font-bold tracking-wider">Tanggal</th>
                      <th className="p-4 font-bold tracking-wider">Pelanggan</th>
                      <th className="p-4 font-bold tracking-wider text-center w-20">Meja</th>
                      <th className="p-4 font-bold tracking-wider">Kasir</th>
                      <th className="p-4 font-bold tracking-wider text-center w-28">Metode</th>
                      <th className="p-4 font-bold tracking-wider text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272a]/50">
                    {historyOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center p-12 text-gray-500">
                          <div className="flex flex-col items-center gap-3">
                            <History className="opacity-30" size={36} />
                            <span className="font-medium">Belum ada data riwayat</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      historyOrders.map((h, index) => (
                        <motion.tr 
                          key={h.id} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="hover:bg-gradient-to-r hover:from-[#18181b]/80 hover:to-transparent transition-colors"
                        >
                          <td className="p-4 font-mono text-cyan-400 font-bold text-xs">#{h.id}</td>
                          <td className="p-4 text-gray-300 text-xs">
                            <div className="font-medium text-white">{new Date(h.tanggal).toLocaleDateString('id-ID')}</div>
                            <div className="text-gray-500">{new Date(h.tanggal).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</div>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-white uppercase text-xs">{h.nama_pelanggan}</span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center justify-center bg-gradient-to-br from-[#27272a] to-[#2a2a2e] px-3 py-1.5 rounded-lg text-xs font-bold text-gray-300 border border-[#3f3f46]">
                              {h.nomor_meja}
                            </span>
                          </td>
                          <td className="p-4 text-gray-300 text-xs">{h.kasir_nama || '-'}</td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border ${
                              h.metode_pembayaran === 'CASH' 
                                ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                            }`}>
                              {h.metode_pembayaran === 'CASH' ? <Banknote size={10} /> : <CreditCard size={10} />}
                              {h.metode_pembayaran}
                            </span>
                          </td>
                          <td className="p-4 text-right font-black text-white text-sm">
                            Rp {h.total_harga.toLocaleString('id-ID')}
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- MODAL CHECKOUT & STRUK --- */}
      <AnimatePresence>
        {isModalOpen && selectedOrder && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-[#09090b]/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`w-full ${showReceipt ? 'max-w-md' : 'max-w-4xl'} bg-gradient-to-br from-[#101012] via-[#141417] to-[#18181b] border border-[#27272a] rounded-[2rem] overflow-hidden shadow-2xl shadow-black/50 relative`}
            >
              {!showReceipt && (
                <button 
                  onClick={closeModal} 
                  className="absolute top-5 right-5 p-2.5 bg-[#18181b] hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all z-20 border border-[#27272a]"
                >
                  <X size={18} />
                </button>
              )}
              
              {!showReceipt ? (
                <div className="flex flex-col lg:flex-row h-full lg:h-[520px]">
                  <div className="lg:w-5/12 bg-gradient-to-b from-[#18181b] to-[#1a1a1e] p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden border-r border-[#27272a]/50">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-2xl" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                          <ClipboardList className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-white">Ringkasan</h2>
                      </div>
                      
                      <div className="mb-6 p-4 bg-[#101012]/80 rounded-xl border border-[#27272a]">
                        <h3 className="text-lg font-bold text-white uppercase mb-2">{selectedOrder.nama_pelanggan}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-400 text-xs font-bold uppercase bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/20">
                            Meja {selectedOrder.nomor_meja}
                          </span>
                          <span className="text-gray-500 text-[10px]">•</span>
                          <span className="text-gray-400 text-[10px]">#{selectedOrder.id}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2.5 border-t border-[#27272a] pt-4 relative z-10 max-h-[220px] overflow-y-auto scrollbar-hide pr-2">
                        {selectedOrder.items.map(item => (
                          <motion.div 
                            key={item.id} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex justify-between items-center text-xs p-2 hover:bg-[#141417] rounded-lg transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30">
                                {item.jumlah}x
                              </span> 
                              <span className="text-gray-300">{item.menu.nama}</span>
                            </div>
                            <span className="text-white font-semibold">Rp{(item.jumlah * item.harga_satuan).toLocaleString()}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="relative z-10 mt-auto pt-5 border-t border-[#27272a]">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total Tagihan</p>
                      <p className="text-3xl font-black text-white tracking-tighter bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                        Rp{selectedOrder.total_harga.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="lg:w-7/12 p-6 lg:p-8 flex flex-col justify-center bg-gradient-to-b from-[#101012] to-[#0f0f13]">
                    <div className="space-y-6 max-w-md mx-auto w-full">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block pl-1 flex items-center gap-2">
                          <CreditCard size={12} /> Metode Pembayaran
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {(['CASH', 'EWALLET'] as const).map((method) => (
                            <motion.button 
                              key={method}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setPaymentMethod(method)}
                              className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                                paymentMethod === method 
                                  ? 'border-cyan-500 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 text-white shadow-lg shadow-cyan-500/20' 
                                  : 'border-[#27272a] bg-[#141417] text-gray-400 hover:border-gray-500'
                              }`}
                            >
                              {method === 'CASH' ? <Banknote size={20} /> : <CreditCard size={20} />}
                              <span className="font-bold text-xs tracking-wide">{method === 'CASH' ? 'Tunai' : 'E-Wallet'}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block pl-1 flex items-center gap-2">
                          <ClipboardList size={12} /> Nama Kasir
                        </label>
                        <input 
                          autoFocus 
                          value={cashierName} 
                          onChange={(e) => setCashierName(e.target.value)} 
                          placeholder="Masukkan nama kasir..."
                          className="w-full bg-[#18181b] border border-[#27272a] rounded-xl pl-10 pr-4 py-4 text-base text-white font-semibold focus:border-cyan-500 focus:bg-[#101012] focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder:text-[#3f3f46]"
                        />
                        <div className="absolute left-3.5 top-[118px] text-gray-500">
                          <Wallet size={16} />
                        </div>
                      </div>
                      
                      <motion.button 
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleFinalSubmit} 
                        disabled={!cashierName.trim()}
                        className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white py-4 rounded-xl font-bold uppercase tracking-wider text-sm hover:shadow-xl hover:shadow-cyan-500/30 transition-all active:scale-[0.98] disabled:opacity-40 mt-2 border border-cyan-400/30 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={18} />
                        Konfirmasi Pembayaran
                      </motion.button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="flex items-center justify-center gap-2 text-green-400 mb-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-5 py-3 rounded-full border border-green-500/30 w-fit mx-auto"
                  >
                    <CheckCircle2 size={20} className="animate-pulse" /> 
                    <span className="text-sm font-bold uppercase tracking-wide">Pembayaran Berhasil</span>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-[#fefefe] text-black p-5 rounded-xl shadow-2xl mb-6 relative overflow-hidden max-w-sm mx-auto"
                  >
                    <div className="absolute top-0 left-0 right-0 h-2 bg-[#09090b]" style={{
                      clipPath: 'polygon(0 100%, 5% 0, 10% 100%, 15% 0, 20% 100%, 25% 0, 30% 100%, 35% 0, 40% 100%, 45% 0, 50% 100%, 55% 0, 60% 100%, 65% 0, 70% 100%, 75% 0, 80% 100%, 85% 0, 90% 100%, 95% 0, 100% 100%)'
                    }} />
                    
                    <div className="pt-2 font-mono text-[10px] leading-tight">
                      <div className="text-center mb-3">
                        <div className="text-[12px] font-bold uppercase tracking-wider mb-1">KITCHEN FLOW</div>
                        <div className="text-[8px]">Jl. Masa Depan No. 99</div>
                        <div className="text-[8px]">Telp: 0811-2233-4455</div>
                      </div>
                      <div className="border-t border-dashed border-gray-400 my-2"></div>
                      <table className="w-full mb-2">
                        <tbody>
                          <tr><td>No. Trx</td><td className="text-right">: {String(selectedOrder.id).padStart(6, '0')}</td></tr>
                          <tr><td>Tanggal</td><td className="text-right">: {new Date().toLocaleDateString('id-ID')}</td></tr>
                          <tr><td>Waktu</td><td className="text-right">: {new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</td></tr>
                          <tr><td>Kasir</td><td className="text-right">: {selectedOrder.kasir_nama?.substring(0, 10)}</td></tr>
                          <tr><td>Meja</td><td className="text-right">: {selectedOrder.nomor_meja}</td></tr>
                        </tbody>
                      </table>
                      <div className="border-t-2 border-dashed border-gray-400 my-2"></div>
                      <div className="text-center mb-2">
                        <div className="text-[9px] uppercase">Pelanggan</div>
                        <div className="font-bold text-[11px] uppercase">{selectedOrder.nama_pelanggan}</div>
                      </div>
                      <div className="border-t border-dashed border-gray-400 my-2"></div>
                      <table className="w-full mb-2">
                        <tbody>
                          {selectedOrder.items.map((item, idx) => (
                            <React.Fragment key={item.id}>
                              <tr><td colSpan={2} className="font-bold py-1">{item.menu.nama}</td></tr>
                              <tr><td>{item.jumlah} x {item.harga_satuan.toLocaleString('id-ID')}</td><td className="text-right">{(item.jumlah * item.harga_satuan).toLocaleString('id-ID')}</td></tr>
                              {idx < selectedOrder.items.length - 1 && <tr><td colSpan={2} className="h-1"></td></tr>}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                      <div className="border-t-2 border-dashed border-gray-400 my-2"></div>
                      <table className="w-full">
                        <tbody>
                          <tr><td className="font-bold">TOTAL</td><td className="text-right font-bold text-[12px]">Rp {selectedOrder.total_harga.toLocaleString('id-ID')}</td></tr>
                          <tr><td>Bayar ({selectedOrder.metode_pembayaran || paymentMethod})</td><td className="text-right">Rp {selectedOrder.total_harga.toLocaleString('id-ID')}</td></tr>
                          <tr><td>Kembali</td><td className="text-right">Rp 0</td></tr>
                        </tbody>
                      </table>
                      <div className="border-t-2 border-dashed border-gray-400 my-2"></div>
                      <div className="text-center mt-3">
                        <div className="font-bold text-[11px] mb-1">*** TERIMA KASIH ***</div>
                        <div className="text-[8px]">Barang yang dibeli tidak dapat</div>
                        <div className="text-[8px]">ditukar/dikembalikan</div>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#09090b]" style={{
                      clipPath: 'polygon(0 0, 5% 100%, 10% 0, 15% 100%, 20% 0, 25% 100%, 30% 0, 35% 100%, 40% 0, 45% 100%, 50% 0, 55% 100%, 60% 0, 65% 100%, 70% 0, 75% 100%, 80% 0, 85% 100%, 90% 0, 95% 100%, 100% 0)'
                    }} />
                  </motion.div>

                  <div className="flex items-center gap-3 max-w-sm mx-auto">
                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handlePrintReceipt} 
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyan-500/30 transition-all border border-cyan-400/30"
                    >
                      <Printer size={16} /> Cetak Struk
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={closeModal} 
                      className="flex-1 bg-[#27272a] text-white py-3 rounded-xl text-xs font-bold uppercase hover:bg-[#2a2a2e] transition-all border border-[#3f3f46]"
                    >
                      Selesai
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}