import { WujudDetails } from '../types';

export type WasteTargetKey =
  | 'auto'
  | 'tisu'
  | 'kardus'
  | 'tisu_masker'
  | 'botol_gelas'
  | 'baterai'
  | 'kulit_buah'
  | 'sisa_makanan'
  | 'ampas_kopi'
  | 'daun_kering'
  | 'kantong_plastik'
  | 'kertas_buku'
  | 'styrofoam'
  | 'kaleng'
  | 'lampu_rusak'
  | 'kabel_charger'
  | 'kaleng_aerosol';

export interface TargetOption {
  key: WasteTargetKey;
  label: string;
  category: 'organik' | 'anorganik' | 'b3' | 'all';
  binColor: 'hijau' | 'kuning' | 'merah' | 'stone';
  icon: string;
  hint: string;
  wujud: WujudDetails;
}

export const TARGET_OPTIONS: TargetOption[] = [
  { 
    key: 'auto', 
    label: 'Deteksi Otomatis', 
    category: 'all', 
    binColor: 'stone', 
    icon: 'Sparkles', 
    hint: 'Sinkronisasi visual wujud objek otomatis',
    wujud: {
      bentuk: 'Mendeteksi wujud geometri objek secara otomatis',
      tekstur: 'Menganalisis kepadatan & tekstur permukaan',
      ciriVisual: 'Sensor visual aktif mencocokkan ke 3 Tong Sampah',
      kondisiFisik: 'Kamera aktif memindai'
    }
  },
  { 
    key: 'botol_gelas', 
    label: 'Botol/Gelas Plastik', 
    category: 'anorganik', 
    binColor: 'kuning', 
    icon: 'Bottle', 
    hint: 'Plastik PET #1 / PP #5',
    wujud: {
      bentuk: 'Silinder berlekuk / cup minuman dengan tutup plastik',
      tekstur: 'Plastik bening / semi-transparan, elastis, dan licin',
      ciriVisual: 'Transparansi plastik, pantulan cahaya, dan kode daur ulang #1 / #5',
      kondisiFisik: 'Wadah plastik kering siap dipipihkan'
    }
  },
  { 
    key: 'tisu', 
    label: 'Tisu', 
    category: 'organik', 
    binColor: 'hijau', 
    icon: 'FileText', 
    hint: 'Serat halus, kerutan, lembut/doff',
    wujud: {
      bentuk: 'Lembaran tipis berkerut tidak beraturan / gumpalan kertas tisu',
      tekstur: 'Serat selulosa halus lembut dan permukaan doff (tidak mengkilap)',
      ciriVisual: 'Warna putih/krem doff dengan lipatan & kerutan serat lunak',
      kondisiFisik: 'Serat nabati mudah terurai mikroba tanah (Organik)'
    }
  },
  { 
    key: 'kardus', 
    label: 'Kardus', 
    category: 'anorganik', 
    binColor: 'kuning', 
    icon: 'Box', 
    hint: 'Serat karton matte/cokelat, sudut lipatan',
    wujud: {
      bentuk: 'Lembaran atau kotak karton bergelombang dengan lipatan & sudut tegas',
      tekstur: 'Serat karton tebal matte berserat kasar, kaku namun bisa dilipat',
      ciriVisual: 'Permukaan matte warna cokelat kraft atau cetakan kemasan kotak',
      kondisiFisik: 'Karton kering siap lipat dan bernilai daur ulang tinggi'
    }
  },
  { 
    key: 'tisu_masker', 
    label: 'Masker Medis & Limbah Sanitasi', 
    category: 'b3', 
    binColor: 'merah', 
    icon: 'ShieldAlert', 
    hint: 'Limbah medis infeksius & serat sintetis',
    wujud: {
      bentuk: 'Lipatan masker medis 3-ply bertali / lembar tisu basah sintetis',
      tekstur: 'Serat non-woven sintetis polipropilena, tahan sobek & tidak larut air',
      ciriVisual: 'Lapisan filter medis biru/putih, kawat hidung, atau residu cairan',
      kondisiFisik: 'Limbah medis/kebersihan sekali pakai berpotensi patogen'
    }
  },
  { 
    key: 'baterai', 
    label: 'Baterai Bekas', 
    category: 'b3', 
    binColor: 'merah', 
    icon: 'BatteryCharging', 
    hint: 'Logam berat & cairan kimia',
    wujud: {
      bentuk: 'Silinder padat kecil / tombol kancing pipih berkutub (+) dan (-)',
      tekstur: 'Logam keras seng-mangan bersegel kedap asam',
      ciriVisual: 'Kutub tonjolan tembaga/nikel, label voltase 1.5V/9V, selongsong bermerek',
      kondisiFisik: 'Sel elektrokimia berisiko korosi cairan elektrolit'
    }
  },
  { 
    key: 'kulit_buah', 
    label: 'Kulit Buah', 
    category: 'organik', 
    binColor: 'hijau', 
    icon: 'Apple', 
    hint: 'Pisang, jeruk, semangka',
    wujud: {
      bentuk: 'Kupasan melengkung tidak beraturan / kulit potongan buah',
      tekstur: 'Organik berserat alami, agak lembap dan lunak',
      ciriVisual: 'Warna kuning pisang, oranye jeruk, atau hijau semangka berpori sel',
      kondisiFisik: 'Biomassa hayati segar kaya kalium dan enzim'
    }
  },
  { 
    key: 'sisa_makanan', 
    label: 'Sisa Makanan', 
    category: 'organik', 
    binColor: 'hijau', 
    icon: 'Utensils', 
    hint: 'Nasi, lauk pauk basah',
    wujud: {
      bentuk: 'Butiran nasi, potongan sayur masak, atau tulang kecil',
      tekstur: 'Lembap, lunak, mengandung minyak dan kuah',
      ciriVisual: 'Partikel makanan olahan dapur rumah tangga',
      kondisiFisik: 'Limbah pangan mudah terurai mikroba'
    }
  },
  { 
    key: 'kaleng', 
    label: 'Kaleng Minuman', 
    category: 'anorganik', 
    binColor: 'kuning', 
    icon: 'Sparkles', 
    hint: 'Aluminium / kaleng seng',
    wujud: {
      bentuk: 'Tabung silinder logam tipis dengan tutup ring-pull tab',
      tekstur: 'Logam aluminium dingin, kaku namun dapat dipipihkan',
      ciriVisual: 'Kilap metalik, sablon grafis warna-warni, bibir kaleng melingkar',
      kondisiFisik: 'Logam murni 100% dapat didaur ulang tanpa batas'
    }
  },
  { 
    key: 'kabel_charger', 
    label: 'Kabel & Charger', 
    category: 'b3', 
    binColor: 'merah', 
    icon: 'Cable', 
    hint: 'E-waste kawat tembaga',
    wujud: {
      bentuk: 'Kabel lentur panjang memanjang dengan kepala USB / steker adaptor',
      tekstur: 'Insulator karet PVC lentur membungkus kawat tembaga halus',
      ciriVisual: 'Garis kawat memanjang, pin konektor logam emas/perak, kepala charger',
      kondisiFisik: 'Limbah elektronik berunsur tembaga dan halogen'
    }
  },
  { 
    key: 'styrofoam', 
    label: 'Styrofoam', 
    category: 'anorganik', 
    binColor: 'kuning', 
    icon: 'Box', 
    hint: 'Gabus makanan EPS #6',
    wujud: {
      bentuk: 'Kotak makan engsel putih / mangkuk gabus berongga',
      tekstur: 'Busa polistirena sangat ringan, empuk, dan berbutir padat',
      ciriVisual: 'Warna putih salju matte, mudah patah, 95% volume berisi udara',
      kondisiFisik: 'Kemasan gabus makanan polistirena tahan air'
    }
  },
  { 
    key: 'kantong_plastik', 
    label: 'Kantong Kresek', 
    category: 'anorganik', 
    binColor: 'kuning', 
    icon: 'ShoppingBag', 
    hint: 'Plastik lentur belanja',
    wujud: {
      bentuk: 'Kantong plastik tipis berkerut dengan dua pegangan kuping',
      tekstur: 'Film polietilena lentur tipis (LDPE/HDPE)',
      ciriVisual: 'Lipatan tipis transparan/berwarna, berdesir saat disentuh',
      kondisiFisik: 'Plastik sekali pakai fleksibel'
    }
  },
  { 
    key: 'daun_kering', 
    label: 'Daun Kering', 
    category: 'organik', 
    binColor: 'hijau', 
    icon: 'Leaf', 
    hint: 'Serasah gugur kebun',
    wujud: {
      bentuk: 'Lembaran daun berurat pipih dengan tepi bergerigi atau ranting kayu',
      tekstur: 'Kering, rapuh, bergemerisik saat diremas',
      ciriVisual: 'Warna cokelat tua, kuning kemerahan, atau hijau pudar',
      kondisiFisik: 'Biomassa nabati kaya serat karbon'
    }
  },
  { 
    key: 'ampas_kopi', 
    label: 'Ampas Kopi / Teh', 
    category: 'organik', 
    binColor: 'hijau', 
    icon: 'Coffee', 
    hint: 'Serbuk kopi & teh celup',
    wujud: {
      bentuk: 'Serbuk butiran halus / kantong saring kertas teh celup bertali',
      tekstur: 'Granula butir lembap berpori mikro',
      ciriVisual: 'Warna cokelat pekat kehitaman seragam',
      kondisiFisik: 'Ampas organik kaya nitrogen'
    }
  },
  { 
    key: 'lampu_rusak', 
    label: 'Lampu Rusak', 
    category: 'b3', 
    binColor: 'merah', 
    icon: 'AlertTriangle', 
    hint: 'Bohlam CFL / neon merkuri',
    wujud: {
      bentuk: 'Tabung kaca spiral melingkar atau kubah bohlam bulat berkaki ulir fitting',
      tekstur: 'Kaca silika bening/putih susu yang sangat rapuh',
      ciriVisual: 'Tabung kaca fluorescent dengan uap merkuri di dalam dan ulir logam E27',
      kondisiFisik: 'Barang pecah belah beruap raksa berbahaya'
    }
  },
  { 
    key: 'kaleng_aerosol', 
    label: 'Kaleng Aerosol', 
    category: 'b3', 
    binColor: 'merah', 
    icon: 'Flame', 
    hint: 'Semprotan bertekanan gas',
    wujud: {
      bentuk: 'Tabung silinder logam tinggi dengan tombol katup semprotan (nozzle)',
      tekstur: 'Pelat baja logam kokoh bertekanan internal',
      ciriVisual: 'Tutup spray plastik, kubah cekung bawah kaleng, label bahaya api',
      kondisiFisik: 'Tabung gas propelan reaktif mudah meledak'
    }
  },
  { 
    key: 'kertas_buku', 
    label: 'Kertas & Buku', 
    category: 'anorganik', 
    binColor: 'kuning', 
    icon: 'FileText', 
    hint: 'Kertas HVS, kardus kering',
    wujud: {
      bentuk: 'Lembaran persegi tipis bertumpuk atau jilidan buku bergaris',
      tekstur: 'Serat selulosa kayu kering dan rata',
      ciriVisual: 'Warna putih atau cokelat karton dengan cetakan teks/garis',
      kondisiFisik: 'Kertas kering bernilai daur ulang tinggi'
    }
  },
];

/**
 * Fast deterministic Computer Vision feature analyzer on Canvas ImageData:
 * Highly tuned for real-time visual synchronization of object forms (Wujud).
 */
export function analyzeImageFeatures(ctx: CanvasRenderingContext2D, width: number, height: number): WasteTargetKey {
  try {
    // Focus on center 50% box where user aims the reticle
    const startX = Math.floor(width * 0.25);
    const startY = Math.floor(height * 0.25);
    const sampleW = Math.floor(width * 0.5);
    const sampleH = Math.floor(height * 0.5);

    const imgData = ctx.getImageData(startX, startY, sampleW, sampleH);
    const data = imgData.data;

    let whitePixels = 0;
    let greenPixels = 0;
    let yellowOrangePixels = 0;
    let darkPixels = 0;
    let cyanBluePixels = 0;
    let redPixels = 0;
    let totalSamples = 0;

    let totalR = 0;
    let totalG = 0;
    let totalB = 0;

    // Sample every 2nd pixel for high accuracy and fast speed (<4ms)
    const step = 4 * 2;
    for (let i = 0; i < data.length; i += step) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      totalR += r;
      totalG += g;
      totalB += b;
      totalSamples++;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const delta = max - min;
      const brightness = (r + g + b) / 3;

      // Pure White / High Brightness (Tissue, Medical Mask, Styrofoam)
      if (brightness > 190 && delta < 35) {
        whitePixels++;
      }
      // Dark / Black (E-waste cable, Battery body, Coffee ground)
      else if (brightness < 55) {
        darkPixels++;
      } else {
        // Calculate Hue & Saturation
        let hue = 0;
        if (delta > 0) {
          if (max === r) {
            hue = ((g - b) / delta) % 6;
          } else if (max === g) {
            hue = (b - r) / delta + 2;
          } else {
            hue = (r - g) / delta + 4;
          }
          hue = Math.round(hue * 60);
          if (hue < 0) hue += 360;
        }

        const saturation = max === 0 ? 0 : delta / max;

        if (saturation > 0.18) {
          if (hue >= 65 && hue <= 165) {
            greenPixels++; // Leaves, green peels, veggies
          } else if (hue >= 25 && hue < 65) {
            yellowOrangePixels++; // Banana peel, orange, cardboard
          } else if (hue >= 170 && hue <= 250) {
            cyanBluePixels++; // Blue medical mask, clear bottle blue tint
          } else if (hue >= 340 || hue <= 20) {
            redPixels++; // Battery tips, red labels
          }
        }
      }
    }

    if (totalSamples === 0) return 'botol_gelas';

    const whiteRatio = whitePixels / totalSamples;
    const greenRatio = greenPixels / totalSamples;
    const yellowRatio = yellowOrangePixels / totalSamples;
    const darkRatio = darkPixels / totalSamples;
    const cyanRatio = cyanBluePixels / totalSamples;

    // 1. Masker Medis biru/cyan atau kombinasi masker medis
    if ((whiteRatio > 0.14 && cyanRatio > 0.12) || cyanRatio > 0.24) {
      return 'tisu_masker';
    }

    // 2. Styrofoam vs Tisu pada dominasi warna putih terang
    if (whiteRatio > 0.52) {
      return 'styrofoam';
    }
    if (whiteRatio > 0.26) {
      return 'tisu';
    }

    // 3. Kardus / Kulit Buah pada spektrum kuning-cokelat-oranye
    if (yellowRatio > 0.22) {
      return totalB > 80 && totalR > totalG && totalG > totalB ? 'kardus' : 'kulit_buah';
    }

    // 4. Daun Kering: Prominent green or earthy green-yellow
    if (greenRatio > 0.18) {
      return 'daun_kering';
    }

    // 5. Kabel Charger / Baterai: Predominantly dark or metallic
    if (darkRatio > 0.35) {
      return 'kabel_charger';
    }

    // 6. Kaleng Aluminium: High cyan/metallic contrast
    if (cyanRatio > 0.15) {
      return 'kaleng';
    }

    // Default to botol plastik for neutral translucent / plastic objects
    return 'botol_gelas';
  } catch {
    return 'botol_gelas';
  }
}
