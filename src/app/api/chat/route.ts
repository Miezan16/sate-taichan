import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const userMsg = message.toLowerCase();

    // Default fallback (Jika user ngelantur atau nanya hal di luar restoran)
    let jawaban = "Waduh Kak, AI KitchenFlow kurang paham maksudnya. Tapi kalau soal Sate Taichan Premium (Menu, Lontong, Promo, atau Delivery), saya jagonya! Ada yang bisa dibantu? 🍢";
    let menu_direkomendasikan = "-";
    let harga = "-";
    let catatan = "-";

    // --- FUNGSI PEMBANTU ---
    const match = (words: string[]) => words.some(word => userMsg.includes(word));

    // ==========================================
    // 1. SAPAAN & BASA-BASI
    // ==========================================
    if (match(["halo", "hi", "hai", "pagi", "siang", "sore", "malam", "p", "bot", "ai", "bro", "min", "punten", "assalamualaikum"])) {
      jawaban = "Halo Kak! ✨ AI Taichan Premium siap membantu. Mau pesan makan di tempat, bungkus, atau mau tanya-tanya menu best seller kami dulu?";
      catatan = "Ketik 'rekomendasi' untuk melihat menu favorit.";
    }
    else if (match(["terima kasih", "makasih", "thanks", "tq", "oke", "sip", "mantap"])) {
      jawaban = "Sama-sama Kak! Ditunggu pesanannya ya. Kalau butuh bantuan lagi, jangan sungkan chat saya. Selamat menikmati! 🙏";
    }

    // ==========================================
    // 2. CARA PESAN & METODE PEMBAYARAN
    // ==========================================
    else if (match(["pesan", "order", "checkout", "cara beli", "gimana"])) {
      jawaban = "Gampang banget! 📱\n1. Pilih menu di sebelah kiri.\n2. Klik 'Tambah' ke keranjang.\n3. Masukkan Nama & Pilih Nomor Meja.\n4. Kirim pesanan dan tunggu Kasir klik 'Terima'.";
    }
    else if (match(["bayar", "qris", "cash", "tunai", "kasir", "ewallet", "dana", "shopeepay", "gopay", "ovo", "transfer", "kartu", "kredit", "debit"])) {
      jawaban = "Pembayaran dilakukan di kasir ya Kak! Kami menerima: ✅ Cash/Tunai, ✅ QRIS (Semua E-Wallet/M-Banking), dan ✅ Debit/Kredit Card.";
      catatan = "Bayar setelah pesanan selesai makan juga boleh!";
    }
    else if (match(["split", "pisah", "patungan", "bill"])) {
      jawaban = "Mau bayar misah (Split Bill)? Tentu bisa Kak! Nanti infoin aja ke kakak Kasir kami waktu mau bayar ya. 💳";
    }

    // ==========================================
    // 3. MENU KARBOHIDRAT (Lontong & Nasi)
    // ==========================================
    else if (match(["lontong", "nasi", "karbo", "lapar", "kenyang"])) {
      jawaban = "Makan sate kurang afdol tanpa karbo! Kami menyediakan **Lontong Daun** yang pulen wangi, dan **Nasi Putih** hangat. Tinggal pilih aja di menu ya Kak!";
      menu_direkomendasikan = "Lontong Daun Spesial";
      harga = "5.000";
      catatan = "Saran: Lontong lebih mantap buat nyerap sambal taichan! 🍚";
    }

    // ==========================================
    // 4. MENU DAGING & VARIAN SPESIFIK
    // ==========================================
    else if (match(["sapi", "wagyu", "premium", "jumbo"])) {
      jawaban = "Sate Taichan Jumbo Wagyu kami pakai daging sapi Wagyu asli dengan marbling tinggi! Lumer di mulut tanpa perlu banyak tenaga ngunyah. Porsi sultan!";
      menu_direkomendasikan = "Taichan Jumbo Wagyu";
      harga = "75.000";
    }
    else if (match(["kulit", "crispy", "renyah", "goreng", "gurih"])) {
      jawaban = "Kulit Ayam Crispy kami digoreng garing sempurna! Gurihnya dapet, renyahnya awet. Paling cocok buat temen makan sate dada ayamnya.";
      menu_direkomendasikan = "Kulit Ayam Crispy";
      harga = "18.000";
    }
    else if (match(["ayam", "dada", "original", "biasa"])) {
      jawaban = "Menu legendaris kami: Taichan Original! Menggunakan 100% daging dada filet montok tanpa lemak berlebih. Dibakar gurih, disiram jeruk nipis.";
      menu_direkomendasikan = "Taichan Original";
      harga = "28.000";
    }
    else if (match(["minum", "haus", "es", "jeruk", "kelapa", "teh", "air", "segar", "manis"])) {
      jawaban = "Pereda pedas terbaik: Es Jeruk Kelapa atau Es Teh Manis Jumbo. Kami pakai jeruk peras asli dan kelapa muda segar Kak!";
      menu_direkomendasikan = "Es Jeruk Kelapa";
      harga = "15.000";
    }
    else if (match(["rekomendasi", "best seller", "enak", "menu", "daftar", "makanan", "favorit", "andalan", "top", "laris", "bingung"])) {
      jawaban = "Top 3 Best Seller kami:\n🥇 Taichan Original (Buat pencinta dada ayam)\n🥈 Taichan Jumbo Wagyu (Buat si pencari daging lumer)\n🥉 Kulit Ayam Crispy (Buat tim kriuk-kriuk)";
      menu_direkomendasikan = "Taichan Original + Lontong";
      harga = "Mulai dari Rp 28.000";
    }

    // ==========================================
    // 5. CUSTOM ORDER & KEPEDASAN
    // ==========================================
    else if (match(["pedas", "pedes", "sambal", "sambel", "cabe", "cabai", "level", "korek", "asam", "jeruk nipis"])) {
      jawaban = "Sambal kami terkenal NENDANG Kak! Dibuat dari cabai rawit merah setan segar + perasan jeruk nipis. Sambal selalu disajikan **terpisah** di piring, jadi aman bisa atur pedas sendiri.";
      catatan = "Tidak ada level pedas, murni pedas asli rawit! 🔥";
    }
    else if (match(["pisah", "gabung", "jangan pedas", "gak pedas", "anak", "balita", "alergi", "kacang"])) {
      jawaban = "Tenang Kak! Taichan kami **BEBAS KACANG** (tidak pakai bumbu kacang sama sekali) jadi aman dari alergi kacang. Sambalnya juga pisah, jadi sangat aman untuk anak-anak atau yang nggak suka pedas! 👶";
    }
    else if (match(["matang", "gosong", "mentah", "kering"])) {
      jawaban = "Sate kami dibakar 'Well Done' (Matang Sempurna) tapi tetap juicy. Kalau mau *request* dibakar agak kering/garing, bisa kasih notes ke kasir atau pelayan ya!";
    }

    // ==========================================
    // 6. GIZI, PROTEIN, & DIET
    // ==========================================
    else if (match(["protein", "gizi", "sehat", "kalori", "diet", "gym", "otot", "gemuk", "kurus", "lemak", "bersih"])) {
      jawaban = "Cocok banget buat diet & bulking! Taichan Original kami pakai **Dada Ayam Filet** tinggi protein. Bakarnya nggak pakai kecap manis, kalorinya sangat terjaga. Real food!";
      menu_direkomendasikan = "Taichan Dada Ayam (Tanpa Lontong/Nasi)";
      harga = "28.000";
      catatan = "Kandungan protein: ±25-30g per porsi dada ayam. 💪";
    }

    // ==========================================
    // 7. WAKTU TUNGGU & ANTRIAN
    // ==========================================
    else if (match(["lama", "berapa lama", "tunggu", "waktu", "jam berapa jadi", "antre", "rame"])) {
      jawaban = "Waktu panggang sate normalnya butuh **10-15 menit** biar matang merata sampai ke dalam. Kalau lagi rame/antre, maksimal 20-25 menit ya Kak. Mohon ditunggu, koki kami ngebut kok! 👨‍🍳";
      catatan = "Kualitas pembakaran butuh waktu agar daging tetap juicy.";
    }

    // ==========================================
    // 8. TAKEAWAY & DELIVERY
    // ==========================================
    else if (match(["bungkus", "bawa pulang", "take away", "takeaway", "kardus", "kotak"])) {
      jawaban = "Bisa banget dibungkus Kak! Sate, sambal, dan jeruk nipisnya akan kami packing aman terpisah supaya tetap *fresh* sampai rumah.";
      catatan = "Infoin aja di pesanan kasir kalau mau di-takeaway ya! 🥡";
    }
    else if (match(["delivery", "gofood", "grabfood", "shopeefood", "ojol", "pesan antar", "gojek", "grab"])) {
      jawaban = "Mager keluar rumah? Kami sudah tersedia di **GoFood, GrabFood, dan ShopeeFood**. Ketik aja 'Sate Taichan Premium' di aplikasi ojol kesayangan Kakak! 🛵";
    }

    // ==========================================
    // 9. PROMO & DISKON
    // ==========================================
    else if (match(["promo", "diskon", "murah", "potongan", "pelajar", "gratis", "free", "voucher"])) {
      jawaban = "Buat update Promo/Diskon bulanan, Kakak bisa cek dan follow Instagram kami di **@taichan_premium**. Biasanya ada promo bundling tiap akhir pekan loh! 🎉";
    }

    // ==========================================
    // 10. BOOKING, ACARA & FRANCHISE
    // ==========================================
    else if (match(["booking", "reservasi", "rombongan", "acara", "ulang tahun", "ultah", "kantor", "kumpul"])) {
      jawaban = "Bisa banget buat acara rombongan Kak! Supaya dapat meja dan sate cepat disajikan, kami sarankan reservasi H-1 via WA kami ya.";
      catatan = "WA Reservasi: 0812-XXXX-XXXX";
    }
    else if (match(["franchise", "mitra", "kemitraan", "cabang lain", "buka cabang", "investasi"])) {
      jawaban = "Wah, tertarik jadi mitra kami? Kami sedang membuka peluang franchise. Silakan DM Instagram kami atau hubungi WA manajemen untuk proposal lengkapnya! 🤝";
    }

    // ==========================================
    // 11. OPERASIONAL (Jam, Lokasi, Fasilitas)
    // ==========================================
    else if (match(["lokasi", "dimana", "alamat", "map", "gmaps", "tempat"])) {
      jawaban = "Kedai pusat kami ada di **Jl. Sate Enak No. 123, Kuliner Kota, Jawa Barat 40111**. Tinggal cari 'Sate Taichan Premium' di Google Maps, langsung ketemu!";
    }
    else if (match(["jam", "buka", "tutup", "operasional", "hari ini", "jadwal", "libur"])) {
      jawaban = "Kami **BUKA SETIAP HARI** tanpa libur! Mulai dari jam **16.00 Sore sampai 23.00 Malam**. Asik banget kan buat makan malam? 🌙";
    }
    else if (match(["parkir", "mobil", "motor", "wifi", "toilet", "mushola", "halal", "colokan"])) {
      jawaban = "Kedai kami **100% Halal**. Fasilitas super lengkap: ✅ Parkir Luas (Mobil/Motor), ✅ Free WiFi, ✅ Colokan Tiap Meja, ✅ Toilet Bersih, dan ✅ Mushola.";
    }
    else if (match(["nomor", "wa", "whatsapp", "hubungi", "telepon", "kontak", "admin"])) {
      jawaban = "Customer Service / WA Admin kami: **0812-XXXX-XXXX** (Fast response di jam operasional).";
    }

    // ==========================================
    // 12. COMPLAINT & BARANG TERTINGGAL
    // ==========================================
    else if (match(["hilang", "ketinggalan", "tertinggal", "lupa", "barang saya", "dompet", "hp", "kunci"])) {
      jawaban = "Waduh! Jangan panik Kak. Barang yang tertinggal di kedai pasti akan diamankan oleh staf/kasir kami. Segera hubungi WA admin kami (0812-XXXX-XXXX) atau datang kembali ke kasir ya!";
      catatan = "Sebutkan nomor meja atau jam kedatangan Kakak.";
    }
    else if (match(["jelek", "kecewa", "keras", "dingin", "batal", "komplain", "parah", "bau"])) {
      jawaban = "Ya ampun, mohon maaf sebesar-besarnya atas ketidaknyamanannya Kak! 😭 Tolong segera panggil pelayan/kasir kami, **KAMI AKAN GANTI BARU** pesanan Kakak tanpa biaya tambahan.";
      catatan = "Kepuasan Kakak adalah nomor satu buat kami! 🙏";
    }

    // ==========================================
    // RETURN DATA
    // ==========================================
    return NextResponse.json({ jawaban, menu_direkomendasikan, harga, catatan });

  } catch (error) {
    return NextResponse.json({ 
      jawaban: "Aduh, koneksi AI kami lagi putus nyambung nih Kak. Coba ketik ulang pertanyaannya atau langsung sapa kakak pelayan di sana ya! 🙏",
      menu_direkomendasikan: "-",
      harga: "-",
      catatan: "Sistem Sedang Sibuk"
    }, { status: 500 });
  }
}