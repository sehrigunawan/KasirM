export const DEFAULT_STORE_SETTINGS = {
  name: "Kopi & Resto Pintar",
  address: "Jl. Pemuda No. 45, Kebayoran Baru, Jakarta Selatan",
  phone: "0857-5243-4322",
  receiptFooter: "Terima kasih atas kunjungan Anda!\nFollow IG: @kopirestopintar",
  paperSize: "58mm", // 58mm or 80mm
  showLogo: true,
  taxRate: 0, // % optional tax
  serviceRate: 0, // % optional service fee
  enableAutoStock: true
};

export const INITIAL_PRODUCTS = [
  {
    id: "PROD-001",
    name: "Kopi Susu Aren",
    category: "Minuman",
    costPrice: 8000,
    price: 18000,
    stock: 45,
    minStock: 10,
    unit: "cup",
    sku: "KSA-01",
    aliases: ["kopi susu aren", "kopi aren", "koparen", "kopi susu"]
  },
  {
    id: "PROD-002",
    name: "Americano / Espresso Hot/Ice",
    category: "Minuman",
    costPrice: 5000,
    price: 15000,
    stock: 60,
    minStock: 10,
    unit: "cup",
    sku: "AME-02",
    aliases: ["americano", "espresso", "kopi hitam", "ice americano"]
  },
  {
    id: "PROD-003",
    name: "Matcha Latte Creamy",
    category: "Minuman",
    costPrice: 9000,
    price: 22000,
    stock: 25,
    minStock: 5,
    unit: "cup",
    sku: "MAT-03",
    aliases: ["matcha", "matcha latte", "es matcha"]
  },
  {
    id: "PROD-004",
    name: "Roti Bakar Cokelat Keju",
    category: "Makanan",
    costPrice: 8000,
    price: 20000,
    stock: 18,
    minStock: 5,
    unit: "porsi",
    sku: "RBCK-04",
    aliases: ["roti bakar cokelat keju", "roti bakar", "rotbak", "roti keju"]
  },
  {
    id: "PROD-005",
    name: "Nasi Goreng Spesial Telur",
    category: "Makanan",
    costPrice: 12000,
    price: 25000,
    stock: 30,
    minStock: 5,
    unit: "porsi",
    sku: "NGS-05",
    aliases: ["nasi goreng", "nasgor", "nasgor spesial", "nasi goreng telur"]
  },
  {
    id: "PROD-006",
    name: "Dimsum Ayam Mentai (4pcs)",
    category: "Snack",
    costPrice: 10000,
    price: 22000,
    stock: 8,
    minStock: 5,
    unit: "porsi",
    sku: "DIM-06",
    aliases: ["dimsum", "dimsum ayam", "dimsum mentai"]
  },
  {
    id: "PROD-007",
    name: "French Fries Crispy",
    category: "Snack",
    costPrice: 6000,
    price: 15000,
    stock: 40,
    minStock: 10,
    unit: "porsi",
    sku: "FFC-07",
    aliases: ["french fries", "kentang goreng", "fries", "kentang"]
  },
  {
    id: "PROD-008",
    name: "Es Teh Manis Jumbo",
    category: "Minuman",
    costPrice: 2000,
    price: 6000,
    stock: 100,
    minStock: 15,
    unit: "cup",
    sku: "ETM-08",
    aliases: ["es teh", "es teh manis", "teh manis", "esteh"]
  }
];

export const SAMPLE_WA_MESSAGES = [
  {
    title: "Pesanan Kopi & Roti (Standard)",
    text: `Halo Kak, mau pesan ya:
Nama: Kak Budi Santoso
Alamat: Jl. Anggrek No. 12, RT 02/05
Pesanan:
- 2 Kopi Susu Aren
- 1 Roti Bakar Cokelat Keju
- 2 Es Teh Manis Jumbo
Catatan: Kopi susu nya less ice ya kak
Metode Bayar: Transfer BCA
Ongkir: 10000`
  },
  {
    title: "Pesanan Makan Siang Kantor (Banyak Item)",
    text: `Halo Admin Kasir Pintar,
Pesanan atas nama: Siska (Kantor Melati)
Pesan:
2x Nasi Goreng Spesial Telur
2x Dimsum Ayam Mentai
3x Kopi Susu Aren
1x French Fries Crispy
Catatan: Nasgor yang 1 pedas banget, yang 1 sedang.
Pembayaran: QRIS (Sudah Lunas)`
  },
  {
    title: "Pesanan Format Kasual / Singkat",
    text: `Pagi kak, mau order buat delivery:
Nama: Mas Rendy
1 Kopi Susu Aren
1 Americano
1 French Fries
Alamat: Patung Kuda Blok C3
Metode: COD (Bayar Cash)`
  }
];
