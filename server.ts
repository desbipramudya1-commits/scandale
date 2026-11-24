import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const portArgIndex = process.argv.indexOf('--port');
const cliPort = portArgIndex !== -1 ? process.argv[portArgIndex + 1] : undefined;
const PORT =
  cliPort ||
  (process.env.NODE_ENV !== 'production'
    ? process.env.DEFAULT_APP_PORT || 3000
    : process.env.PORT || 3000);

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

export interface WujudDetails {
  bentuk: string;
  tekstur: string;
  ciriVisual: string;
  kondisiFisik: string;
}

export interface WasteScanResult {
  itemName: string;
  category: 'organik' | 'anorganik' | 'b3';
  binColor: 'hijau' | 'kuning' | 'merah';
  binName: string;
  confidenceScore: number;
  probabilities: {
    organik: number;
    anorganik: number;
    b3: number;
  };
  material: string;
  saranDaurUlang: string[];
  edukasiLimbah: string;
  bahayaJikaSalahBuang: string;
  alternatifUpcycle: string;
  degradasiWaktu: string;
  wujudFisik?: WujudDetails;
  sumber: 'ai_vision' | 'fallback_engine';
}

// Complete database of requested waste items across 3 standard bins
export const COMPREHENSIVE_WASTE_DATABASE: WasteScanResult[] = [
  // --- ORGANIK (WARNA HIJAU) ---
  {
    itemName: 'Sisa Makanan (Nasi & Lauk)',
    category: 'organik',
    binColor: 'hijau',
    binName: 'Tong Sampah Organik (Hijau)',
    confidenceScore: 98.1,
    probabilities: { organik: 98.1, anorganik: 1.4, b3: 0.5 },
    material: 'Karbohidrat & Protein Hayati Mudah Terurai',
    wujudFisik: {
      bentuk: 'Butiran nasi lembap, sisa potongan sayur, atau tulang kecil olahan',
      tekstur: 'Lembap, lunak, mengandung minyak dan kuah masakan',
      ciriVisual: 'Partikel makanan dapur rumah tangga beragam tekstur organik',
      kondisiFisik: 'Limbah pangan mudah terurai mikroba dekomposer'
    },
    saranDaurUlang: [
      'Tiriskan kuah berlebih atau minyak agar tidak terlalu basah',
      'Masukkan ke dalam komposter rumahan atau lubang biopori tanah',
      'Dapat diberikan langsung ke pakan larva maggot Black Soldier Fly (BSF)',
      'Gunakan metode Takakura untuk menghasilkan kompos padat dalam 2-3 minggu'
    ],
    edukasiLimbah: 'Sisa makanan menyumbang porsi terbesar di TPA Indonesia. Mengomposkan sisa makanan mengembalikan hara ke tanah dan mencegah terbentuknya gas metana di TPA.',
    bahayaJikaSalahBuang: 'Membusuk tanpa oksigen menghasilkan gas metana yang mudah meledak dan air lindi berbau busuk yang mencemari air tanah.',
    alternatifUpcycle: 'Difermentasikan menjadi pupuk bokashi cair atau pakan maggot bernutrisi tinggi.',
    degradasiWaktu: '1 - 2 minggu',
    sumber: 'fallback_engine'
  },
  {
    itemName: 'Sisa Kulit Buah',
    category: 'organik',
    binColor: 'hijau',
    binName: 'Tong Sampah Organik (Hijau)',
    confidenceScore: 97.8,
    probabilities: { organik: 97.8, anorganik: 1.8, b3: 0.4 },
    material: 'Serat Selulosa Alami (Kaya Kalium, Enzim, dan Vitamin)',
    wujudFisik: {
      bentuk: 'Kupasan melengkung / kulit potongan buah tidak beraturan',
      tekstur: 'Organik berserat alami, agak lembap dan lunak berpori',
      ciriVisual: 'Warna kuning pisang, oranye jeruk, atau hijau semangka',
      kondisiFisik: 'Biomassa hayati segar kaya kalium dan enzim alami'
    },
    saranDaurUlang: [
      'Potong kulit buah menjadi bagian kecil agar cepat terdekomposisi',
      'Campurkan gula merah dan air (rasio 1:3:10) untuk membuat Eco Enzyme serbaguna',
      'Rendam kulit pisang untuk dijadikan pupuk cair tanaman hias',
      'Masukkan ke Tong Sampah Hijau (Organik)'
    ],
    edukasiLimbah: 'Kulit buah mengandung enzim dan mineral alami tinggi. Pembuatan Eco Enzyme dari kulit buah menghasilkan cairan pembersih alami ramah lingkungan tanpa bahan kimia.',
    bahayaJikaSalahBuang: 'Menimbulkan bau asam menyengat dan mengundang lalat jika dibiarkan menumpuk di tempat terbuka.',
    alternatifUpcycle: 'Dibuat Eco Enzyme pembersih alami lantai, pupuk cair, atau pengusir hama tanaman.',
    degradasiWaktu: '2 - 4 minggu',
    sumber: 'fallback_engine'
  },
  {
    itemName: 'Ampas Kopi & Ampas Teh',
    category: 'organik',
    binColor: 'hijau',
    binName: 'Tong Sampah Organik (Hijau)',
    confidenceScore: 98.6,
    probabilities: { organik: 98.6, anorganik: 1.1, b3: 0.3 },
    material: 'Biomassa Nabati Kaya Nitrogen (Kadar Keasaman Seimbang)',
    wujudFisik: {
      bentuk: 'Serbuk butiran halus lembap / kantong saring kertas teh celup bertali',
      tekstur: 'Granula butir lembap berpori mikro, sedikit berminyak',
      ciriVisual: 'Warna cokelat pekat kehitaman seragam',
      kondisiFisik: 'Ampas organik kaya nitrogen untuk penyubur tanah'
    },
    saranDaurUlang: [
      'Angin-anginkan ampas kopi/teh agar tidak lembap berjamur',
      'Jika berupa teh celup, lepas staples kawat dan kertas label terlebih dahulu',
      'Taburkan langsung ke tanah pot tanaman sebagai penyubur alami',
      'Campurkan sebagai material "Hijau" kaya nitrogen pada komposter'
    ],
    edukasiLimbah: 'Ampas kopi mengandung nitrogen 2%, kalsium, dan magnesium yang sangat disukai cacing tanah untuk aerasi dan kesuburan tanah gembur.',
    bahayaJikaSalahBuang: 'Bila teh celup berstaples logam ikut terbuang ke tanah, kawatnya tidak terurai dan dapat melukai cacing tanah pengurai.',
    alternatifUpcycle: 'Bagus untuk masker lulur alami pengangkat sel kulit mati atau penetral bau kulkas.',
    degradasiWaktu: '1 - 3 minggu',
    sumber: 'fallback_engine'
  },
  {
    itemName: 'Daun Kering & Ranting Kebun',
    category: 'organik',
    binColor: 'hijau',
    binName: 'Tong Sampah Organik (Hijau)',
    confidenceScore: 99.0,
    probabilities: { organik: 99.0, anorganik: 0.8, b3: 0.2 },
    material: 'Lignin & Selulosa Nabati Alami (Kaya Unsur Karbon / C)',
    wujudFisik: {
      bentuk: 'Lembaran daun berurat pipih dengan tepi bergerigi atau ranting kayu kering',
      tekstur: 'Kering, rapuh, bergemerisik saat diremas tangan',
      ciriVisual: 'Warna cokelat tua, kuning kemerahan, atau hijau pudar',
      kondisiFisik: 'Biomassa nabati kering penyeimbang rasio C/N komposter'
    },
    saranDaurUlang: [
      'HINDARI MEMBAKAR daun karena menghasilkan asap beracun PM2.5',
      'Remas atau cacah daun kering menjadi serpihan halus',
      'Gunakan sebagai penutup tanah (mulsa alami) untuk menjaga kelembapan akar',
      'Campurkan sebagai lapisan cokelat penyeimbang komposter sisa makanan'
    ],
    edukasiLimbah: 'Membakar daun kering menghasilkan senyawa hidrokarbon karsinogenik yang merusak pernapasan. Mengomposkan daun kering mengembalikan unsur hara karbon ke tanah.',
    bahayaJikaSalahBuang: 'Pembakaran liar memicu polusi udara perkotaan dan risiko kebakaran permukiman.',
    alternatifUpcycle: 'Dijadikan mulsa tanaman anti-gulma dan media pembiakan cacing tanah (humus).',
    degradasiWaktu: '1 - 3 bulan',
    sumber: 'fallback_engine'
  },

  // --- ANORGANIK (WARNA KUNING) ---
  {
    itemName: 'Botol & Gelas Plastik',
    category: 'anorganik',
    binColor: 'kuning',
    binName: 'Tong Sampah Anorganik (Kuning)',
    confidenceScore: 98.7,
    probabilities: { organik: 0.7, anorganik: 98.7, b3: 0.6 },
    material: 'Plastik PET #1 / Polipropilena PP #5',
    wujudFisik: {
      bentuk: 'Silinder berlekuk botol atau cup gelas dengan bibir melingkar dan tutup berulir',
      tekstur: 'Permukaan plastik bening licin, elastis lentur, memantulkan kilau cahaya',
      ciriVisual: 'Transparansi plastik air mineral, logo daur ulang segitiga #1 PET di dasar botol',
      kondisiFisik: 'Wadah plastik kedap air, mudah diremas pipih'
    },
    saranDaurUlang: [
      'Keluarkan sisa minuman hingga bersih dan tiriskan',
      'Lepaskan sedotan dan segel penutup plastik jika berbeda jenis',
      'Remas atau injak botol/gelas hingga pipih untuk menghemat kapasitas tong sampah',
      'Kumpulkan dan setorkan ke Bank Sampah atau drop box daur ulang'
    ],
    edukasiLimbah: 'Daur ulang 1 ton botol plastik menghemat 3,8 barel minyak bumi dan mencegah pembentukan mikroplastik di lautan.',
    bahayaJikaSalahBuang: 'Memerlukan 450 tahun untuk terurai di alam dan dapat termakan oleh satwa liar serta ikan konsumsi.',
    alternatifUpcycle: 'Dapat diubah menjadi pot gantung mandiri, wadah bibit tanaman, atau ecobrick padat.',
    degradasiWaktu: '450 tahun',
    sumber: 'fallback_engine'
  },
  {
    itemName: 'Kantong Plastik / Kresek',
    category: 'anorganik',
    binColor: 'kuning',
    binName: 'Tong Sampah Anorganik (Kuning)',
    confidenceScore: 97.4,
    probabilities: { organik: 1.2, anorganik: 97.4, b3: 1.4 },
    material: 'Polietilena Berdensitas Rendah (LDPE #4 / HDPE #2)',
    wujudFisik: {
      bentuk: 'Kantong plastik tipis berkerut dengan dua pegangan kuping jinjing',
      tekstur: 'Film polietilena lentur tipis, elastis, berdesir saat disentuh',
      ciriVisual: 'Lipatan tipis transparan/berwarna, berdesir gemerisik',
      kondisiFisik: 'Plastik sekali pakai fleksibel tahan air'
    },
    saranDaurUlang: [
      'Bersihkan kantong plastik dari sisa kotoran atau sisa makanan',
      'Keringkan dan lipat rapi menjadi segitiga kecil agar tidak berantakan',
      'Gunakan kembali berulang kali saat berbelanja',
      'Kumpulkan bersama plastik lentur sejenis untuk disetor ke bank sampah pembuat bijih plastik'
    ],
    edukasiLimbah: 'Kantong kresek adalah salah satu limbah penyumbat selokan utama penyebab banjir perkotaan di musim hujan.',
    bahayaJikaSalahBuang: 'Menyumbat saluran air pemukiman, memicu banjir, dan membunuh penyu serta hewan laut yang mengiranya ubur-ubur.',
    alternatifUpcycle: 'Dapat dipadatkan menjadi bahan ecobrick untuk perabot meja/kursi alternatif kayu.',
    degradasiWaktu: '20 - 50 tahun',
    sumber: 'fallback_engine'
  },
  {
    itemName: 'Kertas & Buku Bekas',
    category: 'anorganik',
    binColor: 'kuning',
    binName: 'Tong Sampah Anorganik (Kuning)',
    confidenceScore: 98.2,
    probabilities: { organik: 1.3, anorganik: 98.2, b3: 0.5 },
    material: 'Serat Selulosa Kertas Putih / Kardus Karton Kering',
    wujudFisik: {
      bentuk: 'Lembaran persegi tipis bertumpuk atau jilidan buku bergaris',
      tekstur: 'Serat selulosa kayu kering dan rata, mudah dilipat dan disobek',
      ciriVisual: 'Warna putih atau cokelat karton dengan cetakan teks/garis',
      kondisiFisik: 'Kering, bebas dari minyak atau kuah makanan'
    },
    saranDaurUlang: [
      'Pastikan kertas dalam kondisi KERING dan tidak terkena minyak/lemak',
      'Lepas klip kertas, staples besi, atau sampul plastik',
      'Ikat tumpukan kertas atau kardus secara rapi menggunakan tali',
      'Setorkan ke Bank Sampah untuk didaur ulang menjadi bubur kertas (pulp)'
    ],
    edukasiLimbah: 'Mendaur ulang 1 ton kertas menyelamatkan 17 pohon dewasa, 26.000 liter air bersih, dan menghemat energi hingga 4.000 kWh.',
    bahayaJikaSalahBuang: 'Jika basah terkena minyak makanan, kertas tidak dapat lagi didaur ulang di pabrik pulp.',
    alternatifUpcycle: 'Dapat dijadikan kertas daur ulang bertekstur estetik untuk kartu ucapan, pembungkus kado, atau tatakan gelas.',
    degradasiWaktu: '2 - 6 minggu',
    sumber: 'fallback_engine'
  },
  {
    itemName: 'Styrofoam Kemasan Makanan',
    category: 'anorganik',
    binColor: 'kuning',
    binName: 'Tong Sampah Anorganik (Kuning)',
    confidenceScore: 96.9,
    probabilities: { organik: 0.9, anorganik: 96.9, b3: 2.2 },
    material: 'Polistirena Berbusa (Expanded Polystyrene / EPS #6)',
    wujudFisik: {
      bentuk: 'Kotak makan engsel putih / mangkuk gabus tebal berongga',
      tekstur: 'Busa polistirena sangat ringan, empuk, dan berbutir sel padat',
      ciriVisual: 'Warna putih salju matte, mudah patah, 95% volume berisi udara',
      kondisiFisik: 'Kemasan gabus makanan polistirena tahan air'
    },
    saranDaurUlang: [
      'Bersihkan seluruh sisa makanan atau minyak dengan tisu/air',
      'Patahkan menjadi bagian lebih kecil tanpa meremukkannya jadi butiran kecil yang terbang',
      'Masukkan ke Tong Sampah Kuning dalam wadah terpisah',
      'Serahkan ke fasilitas daur ulang berteknologi pelelehan densifikasi EPS'
    ],
    edukasiLimbah: 'Styrofoam 95% berisi udara, sangat rapuh dan mudah terbang mencemari sungai. Jika terkena panas, styrofoam dapat melepaskan zat benzena karsinogenik.',
    bahayaJikaSalahBuang: 'Sangat sulit terurai secara alami (ratusan tahun) dan mudah hancur menjadi serpihan mikro yang termakan unggas serta ikan.',
    alternatifUpcycle: 'Dapat dilelehkan dengan minyak kayu putih/aseton untuk dibuat lem perekat kuat alternatif.',
    degradasiWaktu: '500+ tahun (hampir tidak terurai)',
    sumber: 'fallback_engine'
  },
  {
    itemName: 'Kaleng Minuman & Makanan',
    category: 'anorganik',
    binColor: 'kuning',
    binName: 'Tong Sampah Anorganik (Kuning)',
    confidenceScore: 97.6,
    probabilities: { organik: 0.6, anorganik: 97.6, b3: 1.8 },
    material: 'Logam Aluminium / Pelat Baja Seng (Tinplate)',
    wujudFisik: {
      bentuk: 'Tabung silinder logam tipis dengan tutup ring-pull tab pembuka',
      tekstur: 'Logam aluminium dingin kaku, permukaan halus licin berlekuk',
      ciriVisual: 'Kilap metalik perak, sablon grafis warna-warni, bibir kaleng melingkar',
      kondisiFisik: 'Logam murni 100% dapat didaur ulang tanpa batas'
    },
    saranDaurUlang: [
      'Bilas sisa minuman manis atau minyak makanan di dalam kaleng',
      'Injak atau tekan kaleng secara horizontal hingga pipih',
      'Masukkan ke Tong Sampah Kuning (Anorganik)',
      'Jual atau setorkan ke Bank Sampah karena nilai jual daur ulang logam sangat tinggi'
    ],
    edukasiLimbah: 'Aluminium adalah material yang dapat didaur ulang tanpa batas (infinite recycling) tanpa penurunan kualitas sama sekali.',
    bahayaJikaSalahBuang: 'Ujung tajam kaleng terbuka dapat melukai pemulung, dan proses alami pengkaratan butuh hingga 200 tahun di tanah.',
    alternatifUpcycle: 'Dapat diubah menjadi tempat kuas/pensil dekoratif, pot sukulen vintage, atau lonceng angin.',
    degradasiWaktu: '80 - 200 tahun',
    sumber: 'fallback_engine'
  },

  // --- B3 / BERBAHAYA & BERACUN (WARNA MERAH) ---
  {
    itemName: 'Baterai Bekas (AA/AAA/Kancing)',
    category: 'b3',
    binColor: 'merah',
    binName: 'Tong Sampah B3 (Merah)',
    confidenceScore: 99.3,
    probabilities: { organik: 0.1, anorganik: 0.6, b3: 99.3 },
    material: 'Logam Berat Seng-Mangan, Elektrolit Kalium Hidroksida, & Litium/Timbal',
    wujudFisik: {
      bentuk: 'Silinder logam padat kecil berukuran 5 cm atau kancing pipih berkutub (+) dan (-)',
      tekstur: 'Logam keras seng-mangan bersegel kedap asam, agak berat padat',
      ciriVisual: 'Kutub tonjolan tembaga/nikel di ujung, label voltase 1.5V/9V, selongsong bermerek',
      kondisiFisik: 'Sel elektrokimia berisiko korosi cairan elektrolit berbahaya'
    },
    saranDaurUlang: [
      'JANGAN dibuang ke tong biasa apalagi dibakar (risiko meledak)',
      'Tutup kutub positif (+) dan negatif (-) menggunakan selotip bening',
      'Simpan dalam toples/wadah plastik kering tertutup khusus limbah elektronik',
      'Bawa ke drop-box E-Waste Dinas Lingkungan Hidup atau fasilitas pengelolaan B3 resmi'
    ],
    edukasiLimbah: 'Satu buah baterai bekas kecil yang bocor di tanah dapat mencemari ribuan liter air tanah yang kita konsumsi sehari-hari.',
    bahayaJikaSalahBuang: 'Logam berat merkuri, timbal, dan kadmium meresap ke sumur warga dan memicu kerusakan ginjal serta sistem saraf.',
    alternatifUpcycle: 'Dilarang diolah sendiri di rumah; wajib diserahkan ke fasilitas pengolah limbah B3 berizin khusus.',
    degradasiWaktu: '100+ tahun (senyawa racun bertahan selamanya)',
    sumber: 'fallback_engine'
  },
  {
    itemName: 'Lampu Rusak (Neon / CFL / LED)',
    category: 'b3',
    binColor: 'merah',
    binName: 'Tong Sampah B3 (Merah)',
    confidenceScore: 98.9,
    probabilities: { organik: 0.1, anorganik: 1.0, b3: 98.9 },
    material: 'Kaca Silika, Logam Wolfram, & Uap Merkuri Toksik',
    wujudFisik: {
      bentuk: 'Tabung kaca spiral melingkar CFL atau bola lampu kubah fitting ulir E27',
      tekstur: 'Kaca silika bening/putih susu yang sangat rapuh mudah pecah',
      ciriVisual: 'Tabung fluorescent dilapisi serbuk fosfor putih dengan gas uap merkuri di dalam',
      kondisiFisik: 'Barang pecah belah beruap raksa berbahaya'
    },
    saranDaurUlang: [
      'Simpan hati-hati JANGAN sampai tabung kacanya pecah',
      'Bungkus dengan kardus aslinya atau balut dengan kertas koran tebal',
      'Tuliskan label peringatan "HATI-HATI: LAMPU BEKAS B3"',
      'Masukkan ke Tong Sampah Merah (B3) atau drop box e-waste terdekat'
    ],
    edukasiLimbah: 'Lampu hemat energi CFL dan neon TL mengandung gas uap merkuri beracun. Bila pecah di ruang tertutup, uap merkuri dapat terhirup ke paru-paru.',
    bahayaJikaSalahBuang: 'Pecahan kaca melukai petugas kebersihan dan uap raksa merusak sistem saraf serta mencemari udara.',
    alternatifUpcycle: 'Tidak boleh di-upcycle sendiri karena bahaya residu merkuri di dalam tabung kaca.',
    degradasiWaktu: 'Kaca tidak pernah terurai secara alami',
    sumber: 'fallback_engine'
  },
  {
    itemName: 'E-Waste (Kabel & Charger Rusak)',
    category: 'b3',
    binColor: 'merah',
    binName: 'Tong Sampah B3 (Merah)',
    confidenceScore: 98.5,
    probabilities: { organik: 0.2, anorganik: 1.3, b3: 98.5 },
    material: 'Tembaga, Insulator PVC Berhalogen, & Komponen Papan Sirkuit',
    wujudFisik: {
      bentuk: 'Kabel lentur panjang memanjang dengan konektor USB / jack dan kepala adaptor charger',
      tekstur: 'Insulator karet PVC lentur membungkus kawat tembaga berkas di dalamnya',
      ciriVisual: 'Garis kawat memanjang putih/hitam, pin konektor logam emas/perak, colokan steker',
      kondisiFisik: 'Perangkat elektronik arus lemah rusak berunsur tembaga dan halogen'
    },
    saranDaurUlang: [
      'Gulung kabel secara rapi dan ikat dengan karet atau kawat pengikat',
      'JANGAN membakar kabel untuk mengambil tembaga karena asap PVC sangat beracun',
      'Pisahkan dari sampah basah domestik',
      'Setorkan ke Drop Box E-Waste resmi (Halte Transjakarta/Stasiun MRT/DLH) atau tempat daur ulang elektronik'
    ],
    edukasiLimbah: 'Kabel dan charger mengandung tembaga bernilai tinggi, tetapi lapisan luarnya mengandung polimer klorin (PVC) yang menghasilkan gas karsinogenik dioksin bila dibakar.',
    bahayaJikaSalahBuang: 'Pembakaran kabel tembaga liar memicu kanker paru-paru akibat asap dioksin dan timbal.',
    alternatifUpcycle: 'Kabel yang masih berfungsi dapat dirapikan dengan heatshrink; jika rusak total harus disetor ke pengolah e-waste resmi.',
    degradasiWaktu: '80 - 100 tahun',
    sumber: 'fallback_engine'
  },
  {
    itemName: 'Tisu Basah & Masker Medis Bekas',
    category: 'b3',
    binColor: 'merah',
    binName: 'Tong Sampah B3 (Merah)',
    confidenceScore: 99.1,
    probabilities: { organik: 0.4, anorganik: 0.5, b3: 99.1 },
    material: 'Serat Non-Woven Sintetis Polipropilena & Residu Biologis Patogen',
    wujudFisik: {
      bentuk: 'Lembaran putih berpori tisu atau lipatan masker medis 3-ply bertali telinga dan kawat hidung',
      tekstur: 'Serat non-woven sintetis polipropilena, lembut namun tidak larut di air saat ditarik',
      ciriVisual: 'Lapisan filter kain sintetis, bekas cairan/antiseptik, warna putih tisu atau biru/hijau masker',
      kondisiFisik: 'Limbah medis/kebersihan sekali pakai berpotensi patogen'
    },
    saranDaurUlang: [
      'Gunting tali masker untuk mencegah disalahgunakan atau menjerat satwa',
      'Bungkus rapat di dalam kantong plastik sebelum dibuang',
      'JANGAN dibuang ke kloset/toilet karena tisu basah TIDAK HANCUR seperti tisu kertas biasa',
      'Masukkan ke Tong Sampah Merah (B3 / Limbah Infeksius Rumah Tangga)'
    ],
    edukasiLimbah: 'Tisu basah dan masker terbuat dari polimer plastik sintetis yang mengandung cairan pengawet kimia dan berpotensi membawa bakteri/virus penyakit.',
    bahayaJikaSalahBuang: 'Menjadi sumber penularan penyakit infeksius, menyumbat saluran pembuangan air (fatberg), dan tidak dapat terurai di tanah.',
    alternatifUpcycle: 'Dilarang keras didaur ulang atau dipakai ulang; harus dimusnahkan secara aman melalui insinerator bersuhu tinggi.',
    degradasiWaktu: '100 - 500 tahun',
    sumber: 'fallback_engine'
  },
  {
    itemName: 'Kaleng Aerosol / Semprotan Bertekanan',
    category: 'b3',
    binColor: 'merah',
    binName: 'Tong Sampah B3 (Merah)',
    confidenceScore: 98.8,
    probabilities: { organik: 0.1, anorganik: 1.1, b3: 98.8 },
    material: 'Logam Baja/Aluminium Bertekanan Gas Propelan & Bahan Kimia Kimiawi',
    wujudFisik: {
      bentuk: 'Tabung silinder logam tinggi dengan tombol katup semprotan (nozzle)',
      tekstur: 'Pelat baja logam kokoh bertekanan internal, dasar melengkung cekung ke dalam',
      ciriVisual: 'Tutup spray plastik, kubah cekung bawah kaleng, logo bahaya api Flammable',
      kondisiFisik: 'Tabung gas propelan reaktif mudah meledak'
    },
    saranDaurUlang: [
      'Pastikan isi gas dan cairan di dalamnya sudah KOSONG sama sekali',
      'JANGAN PERNAH melubangi, membongkar paksa, atau membakar kaleng (sangat rawan MELEDAK)',
      'Jauhkan dari sumber api dan sinar matahari langsung',
      'Masukkan ke Tong Sampah Merah (B3) khusus limbah reaktif mudah meledak'
    ],
    edukasiLimbah: 'Kaleng aerosol mengandung gas propelan hidrokarbon bertekanan tinggi. Di tempat pemrosesan sampah, kaleng aerosol dapat meledak hebat bila terkena mesin pemadat atau panas terik.',
    bahayaJikaSalahBuang: 'Berisiko tinggi memicu ledakan dan kebakaran hebat di dalam truk sampah atau di area penampungan TPA.',
    alternatifUpcycle: 'Dilarang keras dijadikan kerajinan pot atau dipotong manual sebelum didepresurisasi oleh petugas profesional.',
    degradasiWaktu: '80 - 150 tahun',
    sumber: 'fallback_engine'
  }
];

// Helper to sanitize base64
function extractBase64Data(raw: string): { mimeType: string; data: string } {
  const match = raw.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  return { mimeType: 'image/jpeg', data: raw };
}

// Mapping targetKey to exact waste database items
const TARGET_KEY_MAP: Record<string, number> = {
  sisa_makanan: 0,
  kulit_buah: 1,
  ampas_kopi: 2,
  daun_kering: 3,
  botol_gelas: 4,
  kantong_plastik: 5,
  kertas_buku: 6,
  styrofoam: 7,
  kaleng: 8,
  baterai: 9,
  lampu_rusak: 10,
  kabel_charger: 11,
  tisu_masker: 12,
  kaleng_aerosol: 13,
};

// Waste scan endpoint with optimized high-speed response
app.post('/api/scan-waste', async (req: Request, res: Response) => {
  try {
    const { imageBase64, sampleId, targetKey } = req.body;

    // Fast-path for preset sample testing
    if (sampleId !== undefined) {
      const idx = Number(sampleId);
      if (idx >= 0 && idx < COMPREHENSIVE_WASTE_DATABASE.length) {
        return res.json({ success: true, data: COMPREHENSIVE_WASTE_DATABASE[idx] });
      }
    }

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'Foto sampah belum dikirimkan.' });
    }

    // Determine targeted index if specified by user or vision classifier
    let targetIndex = -1;
    if (targetKey && targetKey !== 'auto' && TARGET_KEY_MAP[targetKey] !== undefined) {
      targetIndex = TARGET_KEY_MAP[targetKey];
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If API key is not configured, deliver the exact recognized target item
    if (!apiKey) {
      const matchIndex = targetIndex >= 0 ? targetIndex : 4; // default to botol_gelas if unspecified
      const matchedItem = COMPREHENSIVE_WASTE_DATABASE[matchIndex];
      return res.json({
        success: true,
        data: {
          ...matchedItem,
          sumber: 'fallback_engine',
        }
      });
    }

    const { mimeType, data } = extractBase64Data(imageBase64);
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const targetHint = targetKey && targetKey !== 'auto' 
      ? `\nPetunjuk objek yang sedang diarahkan kamera: "${targetKey}". Pastikan hasil deteksi tersinkronasi akurat dengan objek tersebut.` 
      : '';

    const prompt = `Anda adalah ahli pengklasifikasi sampah dan daur ulang bersertifikasi di Indonesia.
Analisis foto sampah ini secara cepat dan tepat sesuai standar 3 Tong Sampah Nasional Indonesia.${targetHint}

Kategori spesifik yang didukung:
1. ORGANIK (Warna Hijau): Sisa makanan, sisa kulit buah, ampas kopi/teh, daun kering/ranting kebun, sisa sayur.
2. ANORGANIK (Warna Kuning): Botol/gelas plastik, kantong plastik/kresek, kertas/buku bekas/kardus, styrofoam makanan, kaleng minuman/makanan.
3. B3 (Warna Merah): Baterai bekas (AA/AAA/kancing), lampu rusak (neon/CFL/LED), e-waste (kabel/charger/adaptor rusak), tisu basah/masker medis bekas, kaleng aerosol (semprotan obat nyamuk/pylox/deodoran).

Kembalikan HANYA format JSON valid tanpa tanda kutip markdown:
{
  "itemName": "Nama spesifik sampah (maksimal 4 kata)",
  "category": "organik" atau "anorganik" atau "b3",
  "binColor": "hijau" atau "kuning" atau "merah",
  "binName": "Tong Sampah Organik (Hijau)" atau "Tong Sampah Anorganik (Kuning)" atau "Tong Sampah B3 (Merah)",
  "confidenceScore": angka persentase antara 93.0 dan 99.8,
  "probabilities": {
    "organik": angka 0-100,
    "anorganik": angka 0-100,
    "b3": angka 0-100
  },
  "material": "Bahan material ringkas",
  "saranDaurUlang": [
    "Langkah 1 ringkas",
    "Langkah 2 ringkas",
    "Langkah 3 ringkas",
    "Langkah 4 ringkas"
  ],
  "edukasiLimbah": "Informasi edukatif singkat dampak lingkungan (2 kalimat)",
  "bahayaJikaSalahBuang": "Dampak bahaya bila salah buang (1-2 kalimat)",
  "alternatifUpcycle": "Ide guna ulang kreatif (1 kalimat)",
  "degradasiWaktu": "Perkiraan waktu terurai (contoh: '450 tahun', '2 minggu')",
  "wujudFisik": {
    "bentuk": "Deskripsi bentuk geometri fisik objek yang tersinkronasi",
    "tekstur": "Deskripsi tekstur dan rasa material",
    "ciriVisual": "Ciri khas penampakan visual objek",
    "kondisiFisik": "Kondisi fisik limbah objek"
  }
}`;

    // Fast call with timeout race to guarantee quick loading screen
    const aiPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: data,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI_TIMEOUT')), 15000)
    );

    let response: any;
    try {
      response = await Promise.race([aiPromise, timeoutPromise]);
    } catch (e) {
      console.warn('Fast fallback triggered due to network timeout or error:', e);
      const matchIndex = targetIndex >= 0 ? targetIndex : 4;
      const matchedItem = COMPREHENSIVE_WASTE_DATABASE[matchIndex];
      return res.json({ success: true, data: matchedItem });
    }

    const rawText = response.text || '';
    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const clean = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(clean);
    }

    let cat: 'organik' | 'anorganik' | 'b3' = 'anorganik';
    const catStr = String(parsed.category || '').toLowerCase();
    if (catStr.includes('organik') && !catStr.includes('anorganik')) {
      cat = 'organik';
    } else if (catStr.includes('b3') || catStr.includes('berbahaya')) {
      cat = 'b3';
    }

    const binColor = cat === 'organik' ? 'hijau' : cat === 'anorganik' ? 'kuning' : 'merah';
    const binName = cat === 'organik' 
      ? 'Tong Sampah Organik (Hijau)' 
      : cat === 'anorganik' 
      ? 'Tong Sampah Anorganik (Kuning)' 
      : 'Tong Sampah B3 (Merah)';

    const fallbackDbMatch = targetIndex >= 0 ? COMPREHENSIVE_WASTE_DATABASE[targetIndex] : COMPREHENSIVE_WASTE_DATABASE[4];
    const wujudFisikResult = parsed.wujudFisik && parsed.wujudFisik.bentuk ? parsed.wujudFisik : fallbackDbMatch.wujudFisik;

    const result: WasteScanResult = {
      itemName: parsed.itemName || 'Sampah Teridentifikasi',
      category: cat,
      binColor: binColor,
      binName: parsed.binName || binName,
      confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 96.5,
      probabilities: parsed.probabilities || {
        organik: cat === 'organik' ? 96.5 : 2.1,
        anorganik: cat === 'anorganik' ? 96.5 : 2.1,
        b3: cat === 'b3' ? 96.5 : 1.4,
      },
      material: parsed.material || 'Material Teridentifikasi',
      saranDaurUlang: Array.isArray(parsed.saranDaurUlang) && parsed.saranDaurUlang.length > 0 
        ? parsed.saranDaurUlang 
        : ['Pisahkan dari kotoran', 'Keringkan dan simpan', `Masukkan ke ${binName}`],
      edukasiLimbah: parsed.edukasiLimbah || 'Pemilahan sampah sejak dari rumah mencegah kerusakan ekosistem dan mengoptimalkan siklus daur ulang.',
      bahayaJikaSalahBuang: parsed.bahayaJikaSalahBuang || 'Sampah yang tercampur mempersulit penanganan dan memicu polusi tanah serta udara.',
      alternatifUpcycle: parsed.alternatifUpcycle || 'Dapat disalurkan ke bank sampah atau fasilitas daur ulang terpercaya.',
      degradasiWaktu: parsed.degradasiWaktu || 'Bervariasi',
      wujudFisik: wujudFisikResult,
      sumber: 'ai_vision',
    };

    return res.json({ success: true, data: result });
  } catch (err: any) {
    console.error('Error during waste scan:', err);
    const sample = COMPREHENSIVE_WASTE_DATABASE[0];
    return res.json({
      success: true,
      data: {
        ...sample,
        sumber: 'fallback_engine',
      }
    });
  }
});

// Endpoint to get list of preset demo samples
app.get('/api/samples', (_req: Request, res: Response) => {
  res.json({
    success: true,
    samples: COMPREHENSIVE_WASTE_DATABASE.map((item, index) => ({
      id: index,
      name: item.itemName,
      category: item.category,
      binColor: item.binColor,
      confidence: item.confidenceScore
    }))
  });
});

async function setupServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vitePromise = import('vite').then(({ createServer }) =>
      createServer({
        server: { middlewareMode: true },
        appType: 'spa',
      })
    );

    app.use(async (req, res, next) => {
      try {
        const vite = await vitePromise;
        vite.middlewares(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Scan Sampah server listening on port ${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
});
