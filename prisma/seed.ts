import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); // <-- Kembali simpel!

async function main() {
  console.log("🍢 Memulai proses seeding sate...");
  await prisma.menu.deleteMany();

  const menuSate = [
    { nama: "Sate Taichan Daging", harga: 25000, protein: "Ayam", level_pedas_min: 0, level_pedas_max: 5, favorit: true },
    { nama: "Sate Taichan Kulit", harga: 20000, protein: "Kulit Ayam", level_pedas_min: 0, level_pedas_max: 5, favorit: true },
    { nama: "Sate Taichan Usus", harga: 18000, protein: "Usus Ayam", level_pedas_min: 0, level_pedas_max: 5, favorit: false },
    { nama: "Sate Taichan Sapi", harga: 35000, protein: "Sapi", level_pedas_min: 0, level_pedas_max: 3, favorit: true },
    { nama: "Sate Taichan Campur", harga: 28000, protein: "Campur", level_pedas_min: 0, level_pedas_max: 5, favorit: false },
  ];

  for (const m of menuSate) {
    await prisma.menu.create({ data: m });
    console.log(`✅ Ditambahkan: ${m.nama}`);
  }
  console.log("🔥 SEEDING SELESAI!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });