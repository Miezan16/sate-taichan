import { NextResponse } from "next/server";
// Sesuaikan path import prisma dengan struktur folder Kakak
import prisma from "@/lib/prisma"; 

export async function GET() {
  try {
    // Mengambil semua data menu dari database
    // Kakak bisa tambahkan order/filter jika perlu (misal: order by kategori)
    const menus = await prisma.menu.findMany({
      orderBy: {
        nama: 'asc', // Mengurutkan menu berdasarkan nama (Alphabet)
      },
    });

    return NextResponse.json({
      success: true,
      message: "Berhasil mengambil data menu",
      data: menus,
    }, { status: 200 });

  } catch (error) {
    console.error("Gagal mengambil menu:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Terjadi kesalahan pada server saat mengambil menu." 
    }, { status: 500 });
  }
}