export interface BinInfo {
  category: 'organik' | 'anorganik' | 'b3';
  colorName: string;
  badgeColor: string;
  themeColor: string;
  title: string;
  subtitle: string;
  description: string;
  examples: string[];
  notAllowed: string[];
  processingMethod: string;
  impactFact: string;
  icon: string;
}

export const BIN_GUIDES: Record<'organik' | 'anorganik' | 'b3', BinInfo> = {
  organik: {
    category: 'organik',
    colorName: 'Hijau (Green)',
    badgeColor: 'bg-emerald-600 text-white',
    themeColor: 'emerald',
    title: 'Tong Sampah Organik',
    subtitle: 'Sampah Hayati Mudah Terurai',
    description: 'Dikhususkan untuk limbah yang berasal dari makhluk hidup (tumbuhan & hewan) dan dapat mengalami pembusukan alami oleh mikroorganisme tanah.',
    examples: [
      'Sisa makanan (nasi, lauk-pauk matang, tulang ikan/ayam kecil)',
      'Kulit buah (kulit pisang, kupasan jeruk, semangka, apel)',
      'Ampas kopi bubuk & ampas teh celup (lepas kawat staples)',
      'Daun kering, serasah gugur, ranting kebun, rumput potong',
      'Cangkang telur, sisa sayuran mentah, serutan kayu alami'
    ],
    notAllowed: [
      'Plastik pembungkus makanan atau kresek (masuk Kuning)',
      'Minyak jelantah dalam botol plastik',
      'Tisu basah & masker medis (masuk Merah / B3)',
      'Puntung rokok beracun'
    ],
    processingMethod: 'Dibuat kompos padat (metode Takakura/Ember Tumpuk), Lubang Biopori, Pupuk Organik Cair (POC), cairan Eco Enzyme, atau pakan larva maggot Black Soldier Fly (BSF).',
    impactFact: 'Mengomposkan sampah organik mengurangi emisi gas metana (CH4) di TPA yang 25 kali lebih kuat memerangkap panas atmosfer dibanding karbon dioksida.',
    icon: 'Leaf'
  },
  anorganik: {
    category: 'anorganik',
    colorName: 'Kuning (Yellow)',
    badgeColor: 'bg-amber-500 text-stone-900',
    themeColor: 'amber',
    title: 'Tong Sampah Anorganik',
    subtitle: 'Sampah Kering Dapat Didaur Ulang',
    description: 'Dikhususkan untuk limbah buatan manusia yang tidak dapat membusuk secara biologis namun bernilai untuk didaur ulang kembali menjadi produk baru.',
    examples: [
      'Botol & gelas plastik (cup minuman plastik boba, botol air mineral PET)',
      'Kantong plastik / kresek belanja (LDPE & HDPE)',
      'Kertas & buku bekas, kardus karton bersih, majalah, koran',
      'Styrofoam kemasan makanan (EPS #6 dibersihkan)',
      'Kaleng minuman soda aluminium, kaleng susu kental manis seng',
      'Botol kaca beling bening dan gelap'
    ],
    notAllowed: [
      'Kertas/tisu basah berminyak atau terkena kotoran biologis',
      'Baterai bekas dan lampu rusak (ini limbah B3)',
      'Kabel & charger elektronik rusak (ini limbah B3)',
      'Kaleng aerosol bertekanan gas (ini limbah B3)'
    ],
    processingMethod: 'Dicuci/dibersihkan, dipipihkan untuk hemat ruang tong, lalu disalurkan ke Bank Sampah terdekat, pemulung, atau industri peleburan daur ulang sirkular.',
    impactFact: 'Mendaur ulang 1 ton kertas menyelamatkan 17 pohon dewasa, 26.000 liter air bersih, dan 4.000 kWh listrik. Daur ulang aluminium menghemat 95% energi.',
    icon: 'Recycle'
  },
  b3: {
    category: 'b3',
    colorName: 'Merah (Red)',
    badgeColor: 'bg-red-600 text-white',
    themeColor: 'red',
    title: 'Tong Sampah B3',
    subtitle: 'Bahan Berbahaya & Beracun',
    description: 'Dikhususkan untuk limbah yang berpotensi merusak lingkungan dan membahayakan kesehatan manusia karena sifat racun, mudah meledak, korosif, atau infeksius.',
    examples: [
      'Baterai bekas segala tipe (AA, AAA, tombol kancing lithium, aki)',
      'Lampu rusak (lampu neon TL, bohlam CFL beruap raksa, lampu LED)',
      'E-waste (kabel charger HP putus, adaptor rusak, kabel listrik)',
      'Tisu basah & masker medis bekas (mengandung patogen & serat sintetis plastik)',
      'Kaleng aerosol (obat nyamuk semprot, cat pylox, deodoran spray bertekanan)',
      'Obat-obatan kedaluwarsa, botol racun serangga, jarum suntik'
    ],
    notAllowed: [
      'Sampah domestik biasa seperti botol plastik atau kantong kresek',
      'Sisa sayuran, kulit buah, dan daun kebun',
      'Kertas dan buku bekas kering'
    ],
    processingMethod: 'Wajib dipisahkan dalam wadah tertutup tahan bocor dan diserahkan ke Drop Box E-Waste resmi Dinas Lingkungan Hidup, halte Transjakarta/MRT, atau fasilitas pengolah limbah B3 berizin PPLI.',
    impactFact: 'Limbah merkuri dan timbal dari 1 buah baterai bekas dapat meresap mencemari hingga 600.000 liter air tanah yang kita konsumsi sehari-hari.',
    icon: 'AlertOctagon'
  }
};
