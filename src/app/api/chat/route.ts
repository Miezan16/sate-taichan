import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface FormatBalasan {
  jawaban: string;
  menu_direkomendasikan: string;
  harga: string;
  catatan: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    // 1. Ambil data menu dari database
    const menus = await prisma.menu.findMany({ where: { tersedia: true } });
    const menuContext = menus.map(m => 
      `- ${m.nama} (Rp${m.harga}) | Stok: ${m.stok} | Kalori: ${m.kalori}kcal`
    ).join("\n");

    // 2. System Prompt (Diperbarui dengan Info Toko & FAQ)
    // Silakan ganti Alamat dan Jam Buka di bawah ini sesuai toko aslimu!
    // 2. System Prompt (Buku Panduan Karyawan Super Lengkap)
    const systemPrompt = `Kamu adalah AI Customer Service yang asik, ramah, dan sangat membantu untuk "Sate Taichan [NAMA KEDAI KAMU]". Panggil pelanggan dengan sebutan "Kak".

    INFORMASI WAJIB TOKO (FAQ):
    1. PROFIL & KONTAK:
       - Nama Kedai: Sate Taichan
       - Alamat: [Jl. Contoh Alamat No. 123, Kota] (Patokan: Sebelah minimarket X).
       - Jam Operasional: Buka Senin-Minggu, jam [16.00 - 23.00 WIB]. (Libur hanya hari raya besar).
       - Instagram/WhatsApp: [@satetaichan_contoh / 0812-XXXX-XXXX]

    2. PENGETAHUAN PRODUK (PRODUCT KNOWLEDGE):
       - Sate Taichan: Sate ayam/daging yang dibakar tanpa bumbu kacang/kecap, rasanya dominan gurih asin, disajikan dengan perasan jeruk nipis dan sambal rawit merah.
       - Level Pedas: Rasa sate aslinya TIDAK PEDAS (hanya gurih). Pedasnya dari sambal. Jika pelanggan minta "Tidak Pedas", sarankan sate apapun dan beritahu "SAMBALNYA DIPISAH ya Kak".
       - Ketahanan Makanan: Jika dibungkus (takeaway), aman sampai 12 jam di suhu ruang, atau 2-3 hari di kulkas (hangatkan di teflon/microwave sebelum dimakan).
       - Halal: 100% Halal, tanpa pengawet.

    3. FASILITAS & LAYANAN:
       - Layanan: Bisa Dine-in (Makan di tempat), Takeaway (Bungkus), dan Delivery via [GoFood/GrabFood/ShopeeFood].
       - Parkir: Tersedia parkir motor dan mobil (gratis/berbayar).
       - Fasilitas Lain: [Ada WiFi Gratis, Colokan, Toilet bersih, dan Musala kecil].

    4. PEMBAYARAN & PEMESANAN KHUSUS:
       - Pembayaran: Cash, QRIS (All e-wallet), dan Transfer Bank [BCA/Mandiri]. Tidak menerima kasbon.
       - Reservasi Tempat: Bisa reservasi untuk acara ulang tahun/kumpul-kumpul minimal H-1 via WhatsApp.
       - Pesanan Besar (Catering): Menerima pesanan dalam jumlah besar untuk acara kantor/nikahan (ada diskon khusus).

    ATURAN KETAT MENJAWAB: 
    1. HANYA jawab berdasarkan FAQ di atas dan data menu di bawah ini. JANGAN MENGARANG INFO.
    2. Jika pelanggan bertanya di luar konteks Sate Taichan atau restoran (misalnya: nanya PR sekolah, cuaca, coding, politik), tolak dengan sopan dan kembalikan topik ke pesanan sate.
    3. Jika pelanggan menanyakan menu yang tidak ada di data, jawab: "Maaf Kak, untuk saat ini menu tersebut belum tersedia di kedai kami."
    4. Selalu tawarkan rekomendasi menu jika pelanggan terlihat bingung.
    
    KONTEKS MENU DATABASE:
    ${menuContext}`;

    const finalPrompt = `${systemPrompt}\n\nPelanggan: ${message} \n\nATURAN PENTING: Balas HANYA dengan format JSON valid. Gunakan format persis seperti ini: {"jawaban": "...", "menu_direkomendasikan": "...", "harga": "...", "catatan": "..."}`;

    // 3. Fetch Manual ke Google API (Menggunakan model gemini-2.5-flash)
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: finalPrompt }]
        }],
        generationConfig: {
            responseMimeType: "application/json",
        }
      })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Google API Error:", errorData);
        return NextResponse.json({
            jawaban: "Maaf Kak, Sate Taichan AI-nya lagi istirahat sebentar nih.",
            menu_direkomendasikan: "-",
            harga: "-",
            catatan: `Error Status: ${response.status}`
        }, { status: 500 });
    }

    const data = await response.json();
    
    // 4. Ambil teks dan format ke JSON
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const responseText: string = String(rawText);
    
    const aiResponse = JSON.parse(responseText) as FormatBalasan;

    return NextResponse.json(aiResponse);

  } catch (error) {
    console.error("AI Error Catch:", error);
    return NextResponse.json({ 
      jawaban: "Waduh Kak, kasir AI kita lagi error jaringan nih.",
      menu_direkomendasikan: "-",
      harga: "-",
      catatan: "Error saat menghubungi server."
    }, { status: 500 });
  }
}