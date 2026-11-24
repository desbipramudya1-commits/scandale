import { PresetSample } from '../types';

export const PRESET_SAMPLES: PresetSample[] = [
  // --- ORGANIK (WARNA HIJAU) ---
  {
    id: 0,
    name: 'Sisa Makanan (Nasi & Lauk)',
    category: 'organik',
    binColor: 'hijau',
    iconName: 'Utensils',
    description: 'Sisa nasi dan makanan dapur hayati',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
    result: {
      itemName: 'Sisa Makanan (Nasi & Lauk Matang)',
      category: 'organik',
      binColor: 'hijau',
      binName: 'Tong Sampah Organik (Hijau)',
      confidenceScore: 98.3,
      probabilities: { organik: 98.3, anorganik: 1.2, b3: 0.5 },
      material: 'Karbohidrat & Protein Hayati Mudah Terurai',
      wujudFisik: {
        bentuk: 'Partikel butiran nasi, potongan sayur masak, atau tulang kecil',
        tekstur: 'Lembap, lunak, mengandung minyak dan kuah',
        ciriVisual: 'Partikel makanan olahan dapur rumah tangga dengan aroma khas',
        kondisiFisik: 'Limbah pangan mudah membusuk oleh mikroba tanah'
      },
      saranDaurUlang: [
        'Tiriskan kuah berlebih atau minyak goreng bekas',
        'Masukkan ke dalam wadah komposter atau lubang biopori tanah',
        'Dapat dijadikan pakan larva maggot Black Soldier Fly (BSF)',
        'Gunakan metode Takakura untuk menghasilkan pupuk kompos dalam 2-3 minggu'
      ],
      edukasiLimbah: 'Sisa makanan menyumbang porsi terbesar timbulan sampah di Indonesia. Mengomposkannya mengembalikan hara ke tanah dan mencegah terbentuknya gas metana di TPA.',
      bahayaJikaSalahBuang: 'Membusuk tanpa oksigen menghasilkan gas metana penyebab efek rumah kaca dan air lindi berbau menyengat.',
      alternatifUpcycle: 'Difermentasikan menjadi pupuk bokashi cair atau pakan maggot berprotein tinggi.',
      degradasiWaktu: '1 - 2 minggu',
      sumber: 'ai_vision'
    }
  },
  {
    id: 1,
    name: 'Kulit Buah (Pisang/Jeruk)',
    category: 'organik',
    binColor: 'hijau',
    iconName: 'Apple',
    description: 'Sisa kupasan buah kaya enzim alami',
    imageUrl: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=400&q=80',
    result: {
      itemName: 'Sisa Kulit Buah Segar',
      category: 'organik',
      binColor: 'hijau',
      binName: 'Tong Sampah Organik (Hijau)',
      confidenceScore: 97.9,
      probabilities: { organik: 97.9, anorganik: 1.7, b3: 0.4 },
      material: 'Serat Selulosa Alami (Kaya Kalium & Enzim)',
      wujudFisik: {
        bentuk: 'Kupasan melengkung / kulit potongan buah tidak beraturan',
        tekstur: 'Organik berserat alami, permukaan luar berpori mikro, bagian dalam berserat',
        ciriVisual: 'Warna kuning pisang, oranye jeruk, atau hijau semangka',
        kondisiFisik: 'Biomassa hayati segar kaya kalium, fosfor, dan enzim alami'
      },
      saranDaurUlang: [
        'Potong kulit buah menjadi bagian kecil agar lekas terdekomposisi',
        'Campurkan gula merah dan air (rasio 1:3:10) untuk membuat Eco Enzyme serbaguna',
        'Rendam kulit pisang selama 48 jam untuk dijadikan pupuk cair kalium tanaman hias',
        'Masukkan ke Tong Sampah Hijau (Organik)'
      ],
      edukasiLimbah: 'Kulit buah mengandung enzim pembersih alami. Pembuatan Eco Enzyme dari kulit buah menghasilkan cairan pembersih lantai dan piring ramah lingkungan.',
      bahayaJikaSalahBuang: 'Menimbulkan bau asam dan memancing lalat bila dibiarkan terbuka di tempat lembap.',
      alternatifUpcycle: 'Dibuat Eco Enzyme pembersih serbaguna atau pupuk cair tanaman aglonema.',
      degradasiWaktu: '2 - 4 minggu',
      sumber: 'ai_vision'
    }
  },
  {
    id: 2,
    name: 'Ampas Kopi & Ampas Teh',
    category: 'organik',
    binColor: 'hijau',
    iconName: 'Coffee',
    description: 'Serbuk kopi saring & daun teh kaya nitrogen',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
    result: {
      itemName: 'Ampas Kopi & Teh Saring',
      category: 'organik',
      binColor: 'hijau',
      binName: 'Tong Sampah Organik (Hijau)',
      confidenceScore: 98.7,
      probabilities: { organik: 98.7, anorganik: 1.0, b3: 0.3 },
      material: 'Biomassa Nabati Kaya Nitrogen Alami',
      wujudFisik: {
        bentuk: 'Serbuk butiran halus lembap / kantong kertas teh celup bertali',
        tekstur: 'Granular mikro remah, sedikit berminyak dari minyak atsiri kopi',
        ciriVisual: 'Warna cokelat tua kehitaman seragam',
        kondisiFisik: 'Ampas organik kaya nitrogen untuk penyubur tanah'
      },
      saranDaurUlang: [
        'Angin-anginkan ampas kopi/teh agar tidak lembap berjamur',
        'Lepas staples kawat pada kantong teh celup sebelum dikomposkan',
        'Taburkan langsung ke tanah pot tanaman sebagai nutrisi alami',
        'Campurkan sebagai material "Hijau" kaya nitrogen pada komposter'
      ],
      edukasiLimbah: 'Ampas kopi mengandung nitrogen 2%, kalsium, dan magnesium yang sangat disukai cacing tanah untuk aerasi dan kesuburan tanah perkebunan.',
      bahayaJikaSalahBuang: 'Jika kantong teh berstaples ikut terbuang ke tanah, kawat logamnya tidak terurai dan mencemari tanah.',
      alternatifUpcycle: 'Bagus untuk lulur alami scrub kulit mati atau penetral bau tak sedap di dalam kulkas.',
      degradasiWaktu: '1 - 3 minggu',
      sumber: 'ai_vision'
    }
  },
  {
    id: 3,
    name: 'Daun Kering & Ranting',
    category: 'organik',
    binColor: 'hijau',
    iconName: 'Leaf',
    description: 'Serasah gugur kaya unsur karbon',
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=400&q=80',
    result: {
      itemName: 'Daun Kering & Ranting Gugur',
      category: 'organik',
      binColor: 'hijau',
      binName: 'Tong Sampah Organik (Hijau)',
      confidenceScore: 99.1,
      probabilities: { organik: 99.1, anorganik: 0.7, b3: 0.2 },
      material: 'Lignin & Selulosa Nabati Alami (Kaya Karbon)',
      wujudFisik: {
        bentuk: 'Lembaran daun berurat pipih dengan tepi bergerigi atau ranting kayu kering',
        tekstur: 'Kering, rapuh, bergemerisik saat diremas tangan',
        ciriVisual: 'Warna cokelat tua, kuning kemerahan, atau hijau tua pudar',
        kondisiFisik: 'Biomassa nabati kering penyeimbang rasio C/N komposter'
      },
      saranDaurUlang: [
        'HINDARI membakar daun karena menimbulkan asap polusi PM2.5 berbahaya',
        'Cacah atau remas daun kering menjadi serpihan halus',
        'Gunakan sebagai mulsa pelindung kelembapan tanah di sekitar tanaman',
        'Campurkan sebagai lapisan cokelat penyeimbang komposter sisa makanan'
      ],
      edukasiLimbah: 'Membakar daun kering menghasilkan senyawa hidrokarbon karsinogenik yang merusak paru-paru. Mengomposkannya mengembalikan unsur hara karbon ke tanah.',
      bahayaJikaSalahBuang: 'Pembakaran liar memicu polusi udara perkotaan dan risiko kebakaran permukiman.',
      alternatifUpcycle: 'Jadikan mulsa tanah alami penjaga kelembapan akar tanaman pot.',
      degradasiWaktu: '1 - 3 bulan',
      sumber: 'ai_vision'
    }
  },

  // --- ANORGANIK (WARNA KUNING) ---
  {
    id: 4,
    name: 'Botol & Gelas Plastik',
    category: 'anorganik',
    binColor: 'kuning',
    iconName: 'Bottle',
    description: 'Plastik PET #1 / PP #5 bening bekas minuman',
    imageUrl: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=400&q=80',
    result: {
      itemName: 'Botol & Gelas Plastik Minuman',
      category: 'anorganik',
      binColor: 'kuning',
      binName: 'Tong Sampah Anorganik (Kuning)',
      confidenceScore: 98.8,
      probabilities: { organik: 0.6, anorganik: 98.8, b3: 0.6 },
      material: 'Plastik Polietilena Tereftalat (PET #1) / Polipropilena (PP #5)',
      wujudFisik: {
        bentuk: 'Silinder berlekuk botol atau cup gelas dengan bibir melingkar dan tutup berulir',
        tekstur: 'Permukaan plastik bening licin, elastis lentur, memantulkan kilau cahaya',
        ciriVisual: 'Transparansi plastik air mineral, logo daur ulang segitiga #1 PET di dasar botol',
        kondisiFisik: 'Wadah plastik kedap air, mudah diremas pipih'
      },
      saranDaurUlang: [
        'Keluarkan seluruh sisa cairan sampai benar-benar kering',
        'Lepas sedotan plastik dan tutup botol jika jenis plastiknya berbeda',
        'Remas atau injak botol/gelas hingga pipih untuk menghemat ruang tong sampah kuning',
        'Kumpulkan dalam wadah kering lalu setorkan ke Bank Sampah terdekat'
      ],
      edukasiLimbah: 'Daur ulang 1 ton botol plastik menghemat 3,8 barel minyak bumi dan mencegah penumpukan mikroplastik di lautan.',
      bahayaJikaSalahBuang: 'Memerlukan 450 tahun untuk terurai di alam dan dapat terpecah menjadi mikroplastik yang meracuni rantai makanan laut.',
      alternatifUpcycle: 'Dapat dijadikan pot gantung hidroponik mandiri, wadah bibit tanaman, atau celengan koin.',
      degradasiWaktu: '450 tahun',
      sumber: 'ai_vision'
    }
  },
  {
    id: 5,
    name: 'Kantong Plastik / Kresek',
    category: 'anorganik',
    binColor: 'kuning',
    iconName: 'ShoppingBag',
    description: 'Kantong kresek belanja LDPE / HDPE',
    imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=400&q=80',
    result: {
      itemName: 'Kantong Plastik Belanja (Kresek)',
      category: 'anorganik',
      binColor: 'kuning',
      binName: 'Tong Sampah Anorganik (Kuning)',
      confidenceScore: 97.5,
      probabilities: { organik: 1.1, anorganik: 97.5, b3: 1.4 },
      material: 'Plastik Lentur Polietilena (LDPE #4 / HDPE #2)',
      wujudFisik: {
        bentuk: 'Kantong lembaran tipis berkerut dengan dua pegangan kuping jinjing',
        tekstur: 'Film polimer sangat tipis, elastis, berdesir gemerisik saat disentuh',
        ciriVisual: 'Warna putih/hitam/merah transparan, lipatan samping gusset',
        kondisiFisik: 'Plastik pembungkus belanja lentur tahan air'
      },
      saranDaurUlang: [
        'Bersihkan kantong dari sisa debu atau cairan basah',
        'Lipat rapi berbentuk segitiga kecil agar tidak kusut berantakan',
        'Gunakan kembali berulang kali saat belanja ke pasar atau swalayan',
        'Kumpulkan bersama plastik lentur sejenis untuk disetor ke bank sampah'
      ],
      edukasiLimbah: 'Kantong plastik adalah salah satu limbah penyumbat selokan utama penyebab genangan banjir di musim hujan perkotaan.',
      bahayaJikaSalahBuang: 'Menyumbat gorong-gorong kota, memicu banjir, dan membahayakan biota laut yang mengira kresek adalah makanan.',
      alternatifUpcycle: 'Dapat dipadatkan ke botol untuk membuat ecobrick bahan konstruksi kursi taman.',
      degradasiWaktu: '20 - 50 tahun',
      sumber: 'ai_vision'
    }
  },
  {
    id: 6,
    name: 'Kertas & Buku Bekas',
    category: 'anorganik',
    binColor: 'kuning',
    iconName: 'FileText',
    description: 'Kertas HVS, buku tulis usang, kardus kering',
    imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80',
    result: {
      itemName: 'Kertas & Buku Tulis Bekas',
      category: 'anorganik',
      binColor: 'kuning',
      binName: 'Tong Sampah Anorganik (Kuning)',
      confidenceScore: 98.4,
      probabilities: { organik: 1.1, anorganik: 98.4, b3: 0.5 },
      material: 'Serat Selulosa Kertas Putih / Karton Pulp',
      wujudFisik: {
        bentuk: 'Lembaran persegi pipih bertumpuk atau jilidan buku bergaris',
        tekstur: 'Serat selulosa kayu kering, rata, mudah dilipat dan disobek',
        ciriVisual: 'Warna putih kertas atau cokelat karton dengan cetakan teks/gambar',
        kondisiFisik: 'Kering, tidak terkena minyak atau air kotor'
      },
      saranDaurUlang: [
        'Pastikan kertas dalam kondisi KERING tanpa terkena minyak makanan',
        'Lepaskan klip kertas kawat, staples besi, atau sampul mika plastik',
        'Tumpuk rapi dan ikat dengan tali secara kuat',
        'Setorkan ke Bank Sampah untuk didaur ulang menjadi bubur kertas (pulp)'
      ],
      edukasiLimbah: 'Mendaur ulang 1 ton kertas menyelamatkan 17 pohon dewasa, 26.000 liter air bersih, dan 4.000 kWh energi listrik.',
      bahayaJikaSalahBuang: 'Kertas basah berminyak akan membusuk sia-sia di TPA dan tidak dapat lagi didaur ulang di pabrik kertas.',
      alternatifUpcycle: 'Dapat diolah menjadi kertas daur ulang bertekstur estetik untuk kartu ucapan seni.',
      degradasiWaktu: '2 - 6 minggu',
      sumber: 'ai_vision'
    }
  },
  {
    id: 7,
    name: 'Styrofoam Kemasan Makanan',
    category: 'anorganik',
    binColor: 'kuning',
    iconName: 'Box',
    description: 'Kotak gabus putih polistirena berbusa (EPS #6)',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=400&q=80',
    result: {
      itemName: 'Styrofoam Kemasan Makanan (EPS #6)',
      category: 'anorganik',
      binColor: 'kuning',
      binName: 'Tong Sampah Anorganik (Kuning)',
      confidenceScore: 97.1,
      probabilities: { organik: 0.8, anorganik: 97.1, b3: 2.1 },
      material: 'Polistirena Berbusa (Expanded Polystyrene / EPS #6)',
      wujudFisik: {
        bentuk: 'Kotak makan engsel putih / mangkuk gabus tebal berongga',
        tekstur: 'Busa gabus sangat ringan, empuk, berbutir sel padat mikro',
        ciriVisual: 'Warna putih susu matte, mudah patah berderak',
        kondisiFisik: 'Wadah isolator panas makanan'
      },
      saranDaurUlang: [
        'Bersihkan seluruh sisa kuah atau minyak makanan dengan lap/air',
        'Patahkan menjadi ukuran lebih kecil tanpa meremukkannya jadi butiran halus',
        'Masukkan ke Tong Sampah Kuning dalam kantong tersendiri',
        'Bawa ke fasilitas daur ulang berteknologi densifikasi leleh busa'
      ],
      edukasiLimbah: 'Styrofoam sangat ringan (95% udara) sehingga gampang tertiup angin ke sungai dan lautan, lalu terfragmentasi menjadi mikroplastik abadi.',
      bahayaJikaSalahBuang: 'Hampir tidak pernah terurai secara alami dan dapat melepaskan senyawa benzena berbahaya saat terpapar panas terik.',
      alternatifUpcycle: 'Dapat dilarutkan sedikit dengan aseton/minyak atsiri untuk dijadikan lem perekat serbaguna.',
      degradasiWaktu: '500+ tahun (hampir tidak terurai)',
      sumber: 'ai_vision'
    }
  },
  {
    id: 8,
    name: 'Kaleng Minuman & Makanan',
    category: 'anorganik',
    binColor: 'kuning',
    iconName: 'Sparkles',
    description: 'Aluminium murni & pelat seng bernilai jual tinggi',
    imageUrl: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&w=400&q=80',
    result: {
      itemName: 'Kaleng Minuman Aluminium',
      category: 'anorganik',
      binColor: 'kuning',
      binName: 'Tong Sampah Anorganik (Kuning)',
      confidenceScore: 97.9,
      probabilities: { organik: 0.5, anorganik: 97.9, b3: 1.6 },
      material: 'Logam Aluminium Murni (100% Dapat Didaur Ulang Berkali-kali)',
      wujudFisik: {
        bentuk: 'Tabung silinder logam tipis dengan tutup ring-pull tab pembuka',
        tekstur: 'Logam aluminium dingin kaku, permukaan halus licin berlekuk',
        ciriVisual: 'Kilau metalik perak, sablon grafis warna-warni, bibir kaleng melingkar',
        kondisiFisik: 'Logam ringan siap dipipihkan'
      },
      saranDaurUlang: [
        'Bilas sisa minuman manis agar tidak mengundang semut',
        'Injak atau pipihkan kaleng secara mendatar untuk menghemat volume tempat sampah',
        'Masukkan ke Tong Sampah Kuning (Anorganik)',
        'Setorkan ke Bank Sampah atau pengepul karena nilai jual logam daur ulang sangat tinggi'
      ],
      edukasiLimbah: 'Mendaur ulang kaleng aluminium menghemat hingga 95% energi dibanding menambang bijih bauksit baru dari alam.',
      bahayaJikaSalahBuang: 'Butuh hingga 200 tahun untuk terurai di tanah dan tepi tajam kaleng terbuka dapat melukai petugas sampah.',
      alternatifUpcycle: 'Dapat diubah menjadi tempat pensil vintage, pot tanaman sukulen, atau wadah lilin aromaterapi.',
      degradasiWaktu: '80 - 200 tahun',
      sumber: 'ai_vision'
    }
  },

  // --- B3 / BAHAN BERBAHAYA & BERACUN (WARNA MERAH) ---
  {
    id: 9,
    name: 'Baterai Bekas (AA/AAA/Kancing)',
    category: 'b3',
    binColor: 'merah',
    iconName: 'BatteryCharging',
    description: 'Logam berat seng, mangan & merkuri beracun',
    imageUrl: 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=400&q=80',
    result: {
      itemName: 'Baterai Sekali Pakai Bekas (Alkaline)',
      category: 'b3',
      binColor: 'merah',
      binName: 'Tong Sampah B3 (Merah)',
      confidenceScore: 99.4,
      probabilities: { organik: 0.1, anorganik: 0.5, b3: 99.4 },
      material: 'Logam Berat Seng-Mangan & Elektrolit Kalium Hidroksida Toksik',
      wujudFisik: {
        bentuk: 'Silinder logam padat kecil berukuran 5 cm atau kancing pipih',
        tekstur: 'Selongsong logam keras kedap, agak berat padat',
        ciriVisual: 'Kutub tonjolan tembaga positif (+) di ujung dan dasar datar negatif (-)',
        kondisiFisik: 'Sel elektrokimia bekas berisiko kebocoran cairan korosif'
      },
      saranDaurUlang: [
        'DILARANG dibuang ke tong biasa apalagi dibakar (risiko korsleting dan meledak)',
        'Tutup kedua kutub positif (+) dan negatif (-) menggunakan selotip bening',
        'Simpan di wadah plastik kering kedap udara jauh dari jangkauan anak-anak',
        'Serahkan ke Drop Box E-Waste Dinas Lingkungan Hidup atau TPS 3R B3 resmi'
      ],
      edukasiLimbah: 'Satu baterai kecil yang bocor ke tanah dapat mencemari ribuan liter air tanah yang digunakan warga di sekitarnya.',
      bahayaJikaSalahBuang: 'Logam berat merkuri, timbal, dan kadmium meresap ke sumur warga dan memicu kerusakan ginjal serta sistem saraf.',
      alternatifUpcycle: 'Kategori B3 DILARANG diolah sendiri; wajib diserahkan khusus ke pengolah limbah B3 berizin.',
      degradasiWaktu: '100+ tahun (senyawa racun bertahan selamanya)',
      sumber: 'ai_vision'
    }
  },
  {
    id: 10,
    name: 'Lampu Rusak (Neon / CFL / LED)',
    category: 'b3',
    binColor: 'merah',
    iconName: 'AlertTriangle',
    description: 'Kaca rapuh & uap merkuri beracun pernapasan',
    imageUrl: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=400&q=80',
    result: {
      itemName: 'Lampu Neon Tabung / Bohlam CFL Rusak',
      category: 'b3',
      binColor: 'merah',
      binName: 'Tong Sampah B3 (Merah)',
      confidenceScore: 98.9,
      probabilities: { organik: 0.1, anorganik: 1.0, b3: 98.9 },
      material: 'Kaca Silika, Logam Wolfram, & Uap Merkuri Toksik',
      wujudFisik: {
        bentuk: 'Tabung kaca spiral melingkar CFL atau bola lampu kubah fitting E27',
        tekstur: 'Kaca silika tipis sangat rapuh mudah pecah',
        ciriVisual: 'Tabung kaca putih susu dilapisi bubuk fosfor dan gas raksa di dalam',
        kondisiFisik: 'Limbah bertekanan gas merkuri beracun'
      },
      saranDaurUlang: [
        'JANGAN sampai pecah saat menyimpan atau membuang',
        'Bungkus dengan kertas koran tebal atau masukkan ke dalam kotak karton aslinya',
        'Beri tanda "HATI-HATI: LAMPU BEKAS B3"',
        'Letakkan di Tong Sampah Merah (B3) atau drop box e-waste khusus'
      ],
      edukasiLimbah: 'Lampu fluorescent mengandung gas uap merkuri. Bila lampu pecah di ruangan tertutup, uap merkuri menguap dan sangat berbahaya bila dihirup manusia.',
      bahayaJikaSalahBuang: 'Pecahan kaca mencederai petugas persampahan dan uap raksa merusak sistem saraf serta paru-paru.',
      alternatifUpcycle: 'Dilarang dijadikan dekorasi; wajib diolah industri pemurnian merkuri tersertifikasi.',
      degradasiWaktu: 'Kaca tidak pernah terurai alami',
      sumber: 'ai_vision'
    }
  },
  {
    id: 11,
    name: 'E-Waste (Kabel & Charger Rusak)',
    category: 'b3',
    binColor: 'merah',
    iconName: 'Cable',
    description: 'Kabel data USB putus, adaptor charger HP rusak',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    result: {
      itemName: 'E-Waste (Kabel Data & Charger HP Rusak)',
      category: 'b3',
      binColor: 'merah',
      binName: 'Tong Sampah B3 (Merah)',
      confidenceScore: 98.7,
      probabilities: { organik: 0.2, anorganik: 1.1, b3: 98.7 },
      material: 'Kawat Tembaga, Selubung Insulator PVC Berhalogen, & Papan Sirkuit',
      wujudFisik: {
        bentuk: 'Kabel karet memanjang melingkar dengan konektor USB tipe C/Lightning dan kepala colokan adaptor',
        tekstur: 'Karet insulator lentur membungkus kawat tembaga berkas di dalamnya',
        ciriVisual: 'Warna putih/hitam dengan jack konektor logam perak/kuningan',
        kondisiFisik: 'Perangkat elektronik arus lemah rusak'
      },
      saranDaurUlang: [
        'Gulung kabel secara rapi dan ikat dengan karet gelang',
        'JANGAN PERNAH membakar kabel karena asap PVC menghasilkan gas dioksin beracun',
        'Pisahkan dari sampah dapur basah domestik',
        'Bawa ke drop-box E-Waste Dinas Lingkungan Hidup, halte Transjakarta/MRT, atau bank sampah elektronik'
      ],
      edukasiLimbah: 'Limbah elektronik kabel mengandung tembaga bernilai tinggi, tetapi lapisan insulatornya mengandung klorin yang sangat beracun bagi pernapasan jika dibakar.',
      bahayaJikaSalahBuang: 'Membakar kabel tembaga liar memicu polusi dioksin karsinogenik penyebab kanker paru-paru.',
      alternatifUpcycle: 'Jika adaptor hanya putus kabel, dapat diperbaiki teknisi; jika rusak total serahkan ke pengolah e-waste resmi.',
      degradasiWaktu: '80 - 100 tahun',
      sumber: 'ai_vision'
    }
  },
  {
    id: 12,
    name: 'Tisu Basah & Masker Medis',
    category: 'b3',
    binColor: 'merah',
    iconName: 'ShieldAlert',
    description: 'Serat sintetis plastik & patogen biologis infeksius',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
    result: {
      itemName: 'Tisu Basah & Masker Medis Bekas',
      category: 'b3',
      binColor: 'merah',
      binName: 'Tong Sampah B3 (Merah)',
      confidenceScore: 99.2,
      probabilities: { organik: 0.3, anorganik: 0.5, b3: 99.2 },
      material: 'Serat Sintetis Non-Woven Polipropilena & Residu Cairan Kimia/Patogen',
      wujudFisik: {
        bentuk: 'Lembaran kain tipis persegi berpori atau masker medis 3-ply berlipatan kawat hidung dan tali telinga',
        tekstur: 'Serat sintetis non-woven lembut berserat mikro, terasa basah/lembut namun tidak hancur saat ditarik',
        ciriVisual: 'Warna putih tisu atau biru/hijau muda masker medis dengan bekas pemakaian',
        kondisiFisik: 'Limbah sanitasi domestik mengandung residu biologis'
      },
      saranDaurUlang: [
        'Gunting tali masker untuk mencegah disalahgunakan pihak tak bertanggung jawab',
        'Bungkus rapat di dalam kantong plastik sebelum dibuang',
        'JANGAN DIBUANG KE KLOSET TOILET karena tisu basah tidak hancur dan menyumbat pipa septic tank',
        'Masukkan ke Tong Sampah Merah (B3 / Limbah Infeksius Domestik)'
      ],
      edukasiLimbah: 'Tisu basah dan masker terbuat dari polimer plastik sintetis yang diresapi bahan kimia pengawet dan berpotensi menjadi media penularan penyakit menular.',
      bahayaJikaSalahBuang: 'Menyumbat pipa pembuangan air limbah kota (fatberg) dan menjadi sarang kuman penyakit patogen berbahaya.',
      alternatifUpcycle: 'DILARANG KERAS dipakai ulang atau didaur ulang; wajib dimusnahkan secara aman melalui insinerator medis.',
      degradasiWaktu: '100 - 500 tahun',
      sumber: 'ai_vision'
    }
  },
  {
    id: 13,
    name: 'Kaleng Aerosol / Semprotan',
    category: 'b3',
    binColor: 'merah',
    iconName: 'Flame',
    description: 'Kaleng obat nyamuk/pylox bertekanan gas mudah meledak',
    imageUrl: 'https://images.unsplash.com/photo-1585336261026-7787df8ebf25?auto=format&fit=crop&w=400&q=80',
    result: {
      itemName: 'Kaleng Aerosol Bertekanan Gas (B3)',
      category: 'b3',
      binColor: 'merah',
      binName: 'Tong Sampah B3 (Merah)',
      confidenceScore: 98.9,
      probabilities: { organik: 0.1, anorganik: 1.0, b3: 98.9 },
      material: 'Tabung Logam Bertekanan Gas Propelan/Butana & Zat Kimia Kimiawi',
      wujudFisik: {
        bentuk: 'Tabung silinder logam ramping tinggi dengan tombol nosel katup semprotan plastik di atas',
        tekstur: 'Pelat baja logam kokoh silinder dengan dasar melengkung ke dalam (cekung kubah)',
        ciriVisual: 'Tutup spray plastik, teks peringatan api Flammable, sablon obat nyamuk / cat semprot',
        kondisiFisik: 'Limbah gas bertekanan tinggi reaktif mudah meledak'
      },
      saranDaurUlang: [
        'Pastikan gas dan cairan di dalamnya sudah benar-benar HABIS terpakai',
        'JANGAN PERNAH menusuk, melubangi, atau membakar kaleng (sangat rawan MELEDAK)',
        'Jauhkan dari sumber api, kompor, dan panas terik matahari',
        'Masukkan ke Tong Sampah Merah (B3) khusus limbah bertekanan/reaktif'
      ],
      edukasiLimbah: 'Kaleng aerosol mengandung gas propelan yang mudah meledak bila terkena tekanan mesin pemadat truk sampah atau panas matahari terik.',
      bahayaJikaSalahBuang: 'Dapat meledak dahsyat dan memicu kebakaran di dalam armada pengangkut sampah atau di TPA.',
      alternatifUpcycle: 'Dilarang dijadikan pot bunga atau dipotong mandiri sebelum didepresurisasi secara profesional.',
      degradasiWaktu: '80 - 150 tahun',
      sumber: 'ai_vision'
    }
  },
  {
    id: 14,
    name: 'Tisu Bekas (Serat Halus)',
    category: 'organik',
    binColor: 'hijau',
    iconName: 'FileText',
    description: 'Serat halus selulosa, kerutan tidak beraturan, lembut & doff',
    imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=80',
    result: {
      itemName: 'Tisu Kertas (Serat Selulosa Halus)',
      category: 'organik',
      binColor: 'hijau',
      binName: 'Tong Sampah Organik (Hijau)',
      confidenceScore: 94.5,
      probabilities: { organik: 94.5, anorganik: 4.5, b3: 1.0 },
      material: 'Serat Selulosa Kayu Halus Mudah Terurai',
      wujudFisik: {
        bentuk: 'Lembaran tipis berkerut tidak beraturan atau gumpalan kertas lunak',
        tekstur: 'Serat halus lembut dengan permukaan doff (tidak mengkilap)',
        ciriVisual: 'Warna putih/krem doff dengan lipatan kerutan lembut tanpa kilap plastik',
        kondisiFisik: 'Serat nabati ringan mudah terdegradasi mikroorganisme kompos'
      },
      saranDaurUlang: [
        'Pastikan tisu merupakan tisu kertas wajah/makan biasa (bukan tisu basah berbahan plastik sintetis)',
        'Masukkan ke Tong Sampah Organik (Hijau) sebagai campuran material cokelat penyerap kelembapan kompos',
        'Sobek kecil agar lebih cepat menyatu dengan tanah komposter',
        'Hindari mencampur tisu yang terkena bahan kimia pembersih keras atau cairan medis infeksius'
      ],
      edukasiLimbah: 'Tisu kertas kering terbuat dari bubur serat selulosa pendek yang mudah terurai di tanah dan membantu menyeimbangkan kelembapan pada komposter rumah tangga.',
      bahayaJikaSalahBuang: 'Jika dibuang bersama plastik daur ulang, serat tisu basah dapat mengontaminasi nilai daur ulang plastik.',
      alternatifUpcycle: 'Sangat baik menjadi lapisan penyerap bau dan kelembapan pada komposter bokashi atau biopori.',
      degradasiWaktu: '2 - 4 minggu',
      sumber: 'tfjs_mobilenet'
    }
  },
  {
    id: 15,
    name: 'Kardus & Karton Kemasan',
    category: 'anorganik',
    binColor: 'kuning',
    iconName: 'Box',
    description: 'Serat karton matte cokelat, lipatan & sudut struktur tegas',
    imageUrl: 'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?auto=format&fit=crop&w=400&q=80',
    result: {
      itemName: 'Kardus & Karton Bergelombang',
      category: 'anorganik',
      binColor: 'kuning',
      binName: 'Tong Sampah Anorganik (Kuning)',
      confidenceScore: 96.8,
      probabilities: { organik: 2.2, anorganik: 96.8, b3: 1.0 },
      material: 'Serat Karton Kraft Bergelombang (Corrugated Cardboard)',
      wujudFisik: {
        bentuk: 'Kotak atau lembaran tebal dengan lipatan & sudut struktur geometris tegas',
        tekstur: 'Permukaan matte berserat karton agak kasar dan kaku berlapis rongga gelombang',
        ciriVisual: 'Warna cokelat kraft alami atau cokelat tua matte dengan bekas lipatan kotak',
        kondisiFisik: 'Karton kering siap lipat pipih bernilai ekonomi daur ulang tinggi'
      },
      saranDaurUlang: [
        'Lepaskan seluruh selotip plastik, lakban, dan label pengiriman yang menempel',
        'Buka lipatan dan pipihkan kardus hingga rata agar tidak memakan ruang',
        'Jaga agar kardus tetap KERING dan bebas dari minyak makanan',
        'Masukkan ke Tong Sampah Anorganik (Kuning) atau jual ke Bank Sampah'
      ],
      edukasiLimbah: 'Serat panjang pada kardus cokelat sangat berharga di industri daur ulang kertas dan dapat diproses ulang hingga 5-7 kali menjadi kotak kemasan baru.',
      bahayaJikaSalahBuang: 'Jika dibuang tercampur sampah dapur basah, serat karton rusak, berjamur, dan menghasilkan metana saat menumpuk di TPA.',
      alternatifUpcycle: 'Dapat dikreasikan menjadi kotak penyimpanan (organizer), rumah kucing, atau alas kompos kebun bebas gulma.',
      degradasiWaktu: '2 - 3 bulan',
      sumber: 'tfjs_mobilenet'
    }
  }
];
