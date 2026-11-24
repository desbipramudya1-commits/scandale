import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { ML_CONFIG, getTeachableMachineUrl } from '../config/mlConfig';
import { WasteTargetKey, TARGET_OPTIONS } from './visionClassifier';

export type MLEngineStatus = 'idle' | 'loading' | 'ready' | 'teachable_machine' | 'fallback';

export interface SurfaceStructureFeatures {
  whiteRatio: number;
  matteWhiteRatio: number;
  specularGlossRatio: number;
  wrinkleIrregularityScore: number;
  microporeDensityScore: number;
  kraftBrownRatio: number;
  structuralEdgeFoldRatio: number;
  greenRatio: number;
  yellowOrangeRatio: number;
  cyanBlueRatio: number;
  darkMetallicRatio: number;
  redRatio: number;
}

export interface MLDetectionOutput {
  targetKey: WasteTargetKey;
  materialName: string;
  confidence: number; // 0 - 100
  binCategory: 'organik' | 'anorganik' | 'b3';
  binLabel: string;
  reason: string;
  rawClass: string;
  modelSource: 'tfjs_teachable_machine' | 'tfjs_mobilenet';
  modelDisplayName: string;
}

interface CustomTMModelState {
  url: string;
  model: tf.LayersModel;
  labels: string[];
  imageSize: number;
}

let mobilenetModelPromise: Promise<mobilenet.MobileNet | null> | null = null;
let cocoSsdModelPromise: Promise<cocoSsd.ObjectDetection | null> | null = null;
let loadedMobileNet: mobilenet.MobileNet | null = null;
let loadedCocoSsd: cocoSsd.ObjectDetection | null = null;
let customTMState: CustomTMModelState | null = null;
let currentEngineStatus: MLEngineStatus = 'idle';

const statusListeners = new Set<(status: MLEngineStatus) => void>();

function notifyStatus(status: MLEngineStatus) {
  currentEngineStatus = status;
  statusListeners.forEach((cb) => cb(status));
}

export function subscribeMLEngineStatus(cb: (status: MLEngineStatus) => void): () => void {
  statusListeners.add(cb);
  cb(currentEngineStatus);
  return () => {
    statusListeners.delete(cb);
  };
}

export function getCurrentMLEngineStatus(): MLEngineStatus {
  return currentEngineStatus;
}

/**
 * Muat model Teachable Machine custom dari URL ekspor TensorFlow.js
 */
export async function loadCustomTeachableMachine(url: string): Promise<boolean> {
  if (!url) {
    customTMState = null;
    if (loadedMobileNet || loadedCocoSsd) {
      notifyStatus('ready');
    }
    return false;
  }

  try {
    notifyStatus('loading');
    await tf.ready();

    const metaRes = await fetch(`${url}metadata.json`);
    if (!metaRes.ok) {
      throw new Error(`Gagal memuat metadata.json (HTTP ${metaRes.status})`);
    }
    const metadata = await metaRes.json();
    const labels: string[] = Array.isArray(metadata.labels) ? metadata.labels : [];
    const imageSize: number = typeof metadata.imageSize === 'number' ? metadata.imageSize : 224;

    const model = await tf.loadLayersModel(`${url}model.json`);
    customTMState = { url, model, labels, imageSize };
    notifyStatus('teachable_machine');
    return true;
  } catch (err) {
    console.warn('Custom Teachable Machine gagal dimuat, kembali ke MobileNet + COCO-SSD:', err);
    customTMState = null;
    await initBrowserMLModels();
    return false;
  }
}

/**
 * Inisialisasi TensorFlow.js + MobileNet v2 + COCO-SSD ringan di browser
 */
export async function initBrowserMLModels(): Promise<MLEngineStatus> {
  const customUrl = getTeachableMachineUrl();
  if (customUrl) {
    if (customTMState && customTMState.url === customUrl) {
      notifyStatus('teachable_machine');
      return 'teachable_machine';
    }
    const ok = await loadCustomTeachableMachine(customUrl);
    if (ok) return 'teachable_machine';
  }

  if (loadedMobileNet && loadedCocoSsd) {
    notifyStatus('ready');
    return 'ready';
  }

  notifyStatus('loading');
  try {
    await tf.ready();

    if (!mobilenetModelPromise) {
      mobilenetModelPromise = mobilenet
        .load({ version: 2, alpha: 0.5 })
        .then((m) => {
          loadedMobileNet = m;
          return m;
        })
        .catch((err) => {
          console.warn('MobileNet load failed:', err);
          return null;
        });
    }

    if (!cocoSsdModelPromise) {
      cocoSsdModelPromise = cocoSsd
        .load({ base: 'lite_mobilenet_v2' })
        .then((c) => {
          loadedCocoSsd = c;
          return c;
        })
        .catch((err) => {
          console.warn('COCO-SSD load failed:', err);
          return null;
        });
    }

    const [mn, coco] = await Promise.all([mobilenetModelPromise, cocoSsdModelPromise]);
    if (mn || coco) {
      notifyStatus('ready');
      return 'ready';
    }
    notifyStatus('fallback');
    return 'fallback';
  } catch (err) {
    console.warn('TF.js initialization fallback:', err);
    notifyStatus('fallback');
    return 'fallback';
  }
}

/**
 * Analisis fitur visual tekstur, kerutan/serat, pantulan cahaya/kilap, pori, dan lipatan struktur
 */
export function extractSurfaceStructureFeatures(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): SurfaceStructureFeatures {
  const startX = Math.floor(width * 0.18);
  const startY = Math.floor(height * 0.18);
  const sampleW = Math.max(16, Math.floor(width * 0.64));
  const sampleH = Math.max(16, Math.floor(height * 0.64));

  const imgData = ctx.getImageData(startX, startY, sampleW, sampleH);
  const data = imgData.data;

  let whitePixels = 0;
  let matteWhitePixels = 0;
  let specularGlossPixels = 0;
  let wrinkleContrastAccumulator = 0;
  let microporeGrainCount = 0;
  let kraftBrownPixels = 0;
  let structuralEdgeFoldCount = 0;
  let greenPixels = 0;
  let yellowOrangePixels = 0;
  let cyanBluePixels = 0;
  let darkMetallicPixels = 0;
  let redPixels = 0;
  let totalSamples = 0;

  // Stride 2x2 piksel agar tetap < 4ms
  for (let y = 1; y < sampleH - 1; y += 2) {
    for (let x = 1; x < sampleW - 1; x += 2) {
      const idx = (y * sampleW + x) * 4;
      const rightIdx = (y * sampleW + (x + 1)) * 4;
      const downIdx = ((y + 1) * sampleW + x) * 4;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const brightness = (r + g + b) / 3;
      const rightBr = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;
      const downBr = (data[downIdx] + data[downIdx + 1] + data[downIdx + 2]) / 3;

      const gx = Math.abs(brightness - rightBr);
      const gy = Math.abs(brightness - downBr);
      const gradient = gx + gy;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const delta = max - min;
      const saturation = max === 0 ? 0 : delta / max;

      totalSamples++;

      // 1. Pantulan cahaya tajam / Specular Highlight (Plastik bening glossy / Botol / Kaleng)
      if (brightness > 228 && gradient > 22) {
        specularGlossPixels++;
      }

      // 2. Permukaan putih: bedakan putih lembut berkerut (Tisu) vs putih padat berpori halus (Styrofoam)
      if (brightness > 175 && delta < 36) {
        whitePixels++;
        if (brightness < 238 && gradient >= 5 && gradient <= 24) {
          // Kerutan halus & serat lembut tidak beraturan (Tisu)
          matteWhitePixels++;
          wrinkleContrastAccumulator += gradient;
        } else if (brightness >= 195 && gradient > 3 && gradient < 12) {
          // Pori-pori padat seragam khas gabus EPS (Styrofoam)
          microporeGrainCount++;
        }
      }

      // 3. Sudut & lipatan struktur tegas (Kardus / Kemasan kotak)
      if ((gx > 28 && gy < 10) || (gy > 28 && gx < 10) || gradient > 42) {
        structuralEdgeFoldCount++;
      }

      // 4. Gelap / Logam berat / Kabel E-Waste / Baterai
      if (brightness < 58) {
        darkMetallicPixels++;
      }

      // 5. Hue analysis
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

      // Warna cokelat karton kraft matte (Kardus): R > G > B, saturasi sedang, tidak mengkilap
      if (
        r > 85 &&
        r < 215 &&
        r > g + 8 &&
        g > b + 6 &&
        hue >= 18 &&
        hue <= 48 &&
        saturation >= 0.14 &&
        saturation <= 0.56 &&
        gradient < 34
      ) {
        kraftBrownPixels++;
      }

      if (saturation > 0.18) {
        if (hue >= 68 && hue <= 165) {
          greenPixels++;
        } else if (hue >= 22 && hue < 68) {
          yellowOrangePixels++;
        } else if (hue >= 172 && hue <= 248) {
          cyanBluePixels++;
        } else if (hue >= 340 || hue <= 18) {
          redPixels++;
        }
      }
    }
  }

  const denom = Math.max(1, totalSamples);
  return {
    whiteRatio: whitePixels / denom,
    matteWhiteRatio: matteWhitePixels / denom,
    specularGlossRatio: specularGlossPixels / denom,
    wrinkleIrregularityScore: Math.min(1, wrinkleContrastAccumulator / (denom * 6.5)),
    microporeDensityScore: microporeGrainCount / denom,
    kraftBrownRatio: kraftBrownPixels / denom,
    structuralEdgeFoldRatio: structuralEdgeFoldCount / denom,
    greenRatio: greenPixels / denom,
    yellowOrangeRatio: yellowOrangePixels / denom,
    cyanBlueRatio: cyanBluePixels / denom,
    darkMetallicRatio: darkMetallicPixels / denom,
    redRatio: redPixels / denom,
  };
}

interface MappedCategoryInfo {
  targetKey: WasteTargetKey;
  materialName: string;
  binCategory: 'organik' | 'anorganik' | 'b3';
  binLabel: string;
  reason: string;
}

function getTargetMetadata(key: WasteTargetKey): {
  materialName: string;
  binCategory: 'organik' | 'anorganik' | 'b3';
  binLabel: string;
} {
  const opt = TARGET_OPTIONS.find((t) => t.key === key);
  const cat = opt && opt.category !== 'all' ? opt.category : 'anorganik';
  const binLabel =
    cat === 'organik'
      ? 'ORGANIK (Hijau)'
      : cat === 'b3'
      ? 'B3 (Merah)'
      : 'ANORGANIK (Kuning)';
  return {
    materialName: opt?.label || 'Botol Plastik',
    binCategory: cat,
    binLabel,
  };
}

/**
 * Memetakan label kelas dari model TF.js (MobileNet / COCO-SSD / Teachable Machine)
 * digabungkan dengan fitur tekstur permukaan menjadi kategori sampah presisi.
 */
function mapSemanticAndSurface(
  semanticLabels: Array<{ label: string; score: number }>,
  features: SurfaceStructureFeatures,
  manualOverride?: WasteTargetKey
): MappedCategoryInfo & { confidence: number; rawClass: string } {
  if (manualOverride && manualOverride !== 'auto') {
    const meta = getTargetMetadata(manualOverride);
    const reasonMap: Partial<Record<WasteTargetKey, string>> = {
      tisu: 'Serat selulosa halus, kerutan tidak beraturan, tekstur lembut & doff',
      kardus: 'Serat karton matte cokelat dengan lipatan & sudut struktur tegas',
      botol_gelas: 'Permukaan plastik licin, transparan/mengkilap dengan pantulan cahaya tajam',
      styrofoam: 'Tekstur gabus putih padat berpori halus & ringan (EPS #6)',
      baterai: 'Komponen sel logam berat bersegel kutub (+/-) berisiko korosi toksik (B3)',
      kaleng_aerosol: 'Tabung logam bertekanan gas propelan & nozzle semprotan mudah meledak (B3)',
      tisu_masker: 'Serat sintetis non-woven polipropilena & limbah medis berpotensi patogen (B3)',
      kabel_charger: 'Limbah elektronik kawat tembaga & isolator PVC berhalogen (B3)',
      lampu_rusak: 'Tabung kaca rapuh berpotensi mengandung uap merkuri berbahaya (B3)',
    };
    const opt = TARGET_OPTIONS.find((t) => t.key === manualOverride);
    return {
      targetKey: manualOverride,
      materialName: meta.materialName,
      binCategory: meta.binCategory,
      binLabel: meta.binLabel,
      reason: reasonMap[manualOverride] || opt?.wujud.tekstur || 'Sesuai fokus material yang dipilih',
      confidence: 95,
      rawClass: `Target: ${meta.materialName}`,
    };
  }

  const combinedText = semanticLabels.map((s) => s.label.toLowerCase()).join(' | ');
  const topSemantic = semanticLabels[0] || { label: 'visual_material', score: 0.72 };
  const topScorePct = Math.round(Math.min(98, Math.max(68, topSemantic.score * 100)));

  // 1. Deteksi B3 Spesifik (Baterai, Aerosol, Elektronik/Kabel, Lampu, Masker Medis)
  if (
    /battery|cell phone|cellular telephone|ipod|remote|mouse|keyboard|laptop|monitor|modem|hard disc|plug|power cord|adapter|toaster|iron|electric/.test(
      combinedText
    )
  ) {
    const isBattery = /battery/.test(combinedText);
    return {
      targetKey: isBattery ? 'baterai' : 'kabel_charger',
      materialName: isBattery ? 'Baterai Bekas' : 'Limbah Elektronik (E-Waste)',
      binCategory: 'b3',
      binLabel: 'B3 (Merah)',
      reason: isBattery
        ? 'Silinder logam padat berkutub dengan bahan kimia elektrolit berbahaya (B3)'
        : 'Komponen sirkuit, kabel PVC & logam berat elektronik (B3)',
      confidence: Math.max(84, topScorePct),
      rawClass: topSemantic.label,
    };
  }

  if (/aerosol|hair spray|perfume|spray|torch|lighter|gas/.test(combinedText)) {
    return {
      targetKey: 'kaleng_aerosol',
      materialName: 'Kaleng Aerosol / Semprotan',
      binCategory: 'b3',
      binLabel: 'B3 (Merah)',
      reason: 'Tabung logam silinder bertekanan gas & bahan kimia reaktif mudah meledak (B3)',
      confidence: Math.max(86, topScorePct),
      rawClass: topSemantic.label,
    };
  }

  if (/lamp|spotlight|bulb|fluorescent|syringe|mask|stethoscope|band aid/.test(combinedText)) {
    const isLamp = /lamp|spotlight|bulb|fluorescent/.test(combinedText);
    return {
      targetKey: isLamp ? 'lampu_rusak' : 'tisu_masker',
      materialName: isLamp ? 'Lampu Rusak (CFL/Neon)' : 'Masker Medis / Limbah Sanitasi',
      binCategory: 'b3',
      binLabel: 'B3 (Merah)',
      reason: isLamp
        ? 'Kaca silika rapuh & filamen berpotensi mengandung uap merkuri beracun (B3)'
        : 'Serat sintetis non-woven & limbah medis berpotensi patogen infeksius (B3)',
      confidence: Math.max(85, topScorePct),
      rawClass: topSemantic.label,
    };
  }

  // 2. Deteksi Tisu (serat halus, kerutan tidak beraturan, lembut/doff) -> ORGANIK (Hijau)
  if (
    /toilet tissue|paper towel|handkerchief|napkin|tissue|bib|diaper|towel/.test(combinedText) ||
    (features.whiteRatio > 0.24 &&
      features.matteWhiteRatio > 0.14 &&
      features.wrinkleIrregularityScore > 0.26 &&
      features.specularGlossRatio < 0.045)
  ) {
    const boost = features.wrinkleIrregularityScore > 0.28 ? 8 : 2;
    return {
      targetKey: 'tisu',
      materialName: 'Tisu',
      binCategory: 'organik',
      binLabel: 'ORGANIK (Hijau)',
      reason: 'Serat selulosa halus dengan kerutan tidak beraturan & tekstur lembut/doff',
      confidence: Math.min(97, Math.max(82, topScorePct + boost)),
      rawClass: topSemantic.label,
    };
  }

  // 3. Deteksi Kardus (serat karton, permukaan matte/cokelat, lipatan/sudut struktur) -> ANORGANIK (Kuning)
  if (
    /carton|cardboard|crate|mailbox|packet|envelope|book jacket|corrugated|box/.test(combinedText) ||
    (features.kraftBrownRatio > 0.19 && features.structuralEdgeFoldRatio > 0.09)
  ) {
    const boost = features.kraftBrownRatio > 0.16 ? 7 : 2;
    return {
      targetKey: 'kardus',
      materialName: 'Kardus',
      binCategory: 'anorganik',
      binLabel: 'ANORGANIK (Kuning)',
      reason: 'Serat karton permukaan matte/cokelat dengan lipatan & sudut struktur tegas',
      confidence: Math.min(98, Math.max(84, topScorePct + boost)),
      rawClass: topSemantic.label,
    };
  }

  // 4. Deteksi Plastik & Botol Plastik (permukaan licin, transparan/mengkilap/glossy, pantulan cahaya tajam)
  if (
    /water bottle|pop bottle|pill bottle|wine bottle|beer bottle|bottle|cup|jug|plastic bag|bucket|pitcher|beaker/.test(
      combinedText
    ) ||
    (features.specularGlossRatio >= 0.05 && features.kraftBrownRatio < 0.15)
  ) {
    const isBag = /plastic bag|shopping/.test(combinedText);
    const hasGloss = features.specularGlossRatio >= 0.035;
    return {
      targetKey: isBag ? 'kantong_plastik' : 'botol_gelas',
      materialName: isBag ? 'Kantong Plastik' : 'Botol Plastik',
      binCategory: 'anorganik',
      binLabel: 'ANORGANIK (Kuning)',
      reason: hasGloss
        ? 'Permukaan licin transparan/mengkilap (glossy) dengan pantulan cahaya tajam'
        : 'Struktur silinder polimer plastik licin siap daur ulang',
      confidence: Math.min(98, Math.max(86, topScorePct + (hasGloss ? 6 : 2))),
      rawClass: topSemantic.label,
    };
  }

  // 5. Deteksi Styrofoam (tekstur gabus putih padat berpori halus) -> ANORGANIK (Kuning)
  if (
    /foam|tray|plate|bowl|styrofoam|sponge/.test(combinedText) ||
    (features.whiteRatio > 0.44 && features.microporeDensityScore > 0.16 && features.specularGlossRatio < 0.04)
  ) {
    return {
      targetKey: 'styrofoam',
      materialName: 'Styrofoam',
      binCategory: 'anorganik',
      binLabel: 'ANORGANIK (Kuning)',
      reason: 'Tekstur gabus putih padat berpori halus & permukaan matte ringan (EPS #6)',
      confidence: Math.min(96, Math.max(83, topScorePct + 5)),
      rawClass: topSemantic.label,
    };
  }

  // 6. Kaleng Minuman Aluminium
  if (/can|tin|beer glass|soda|pop/.test(combinedText) || (features.cyanBlueRatio > 0.14 && features.specularGlossRatio > 0.04)) {
    return {
      targetKey: 'kaleng',
      materialName: 'Kaleng Aluminium',
      binCategory: 'anorganik',
      binLabel: 'ANORGANIK (Kuning)',
      reason: 'Permukaan logam mengkilap silindris dengan pantulan kilau metalik tajam',
      confidence: Math.min(96, Math.max(84, topScorePct + 4)),
      rawClass: topSemantic.label,
    };
  }

  // 7. Bahan Organik Lain (Kulit buah, sisa makanan, ampas kopi, daun kering)
  if (/banana|orange|lemon|apple|pineapple|strawberry|mango|fruit|peel/.test(combinedText) || features.yellowOrangeRatio > 0.24) {
    return {
      targetKey: 'kulit_buah',
      materialName: 'Kulit Buah / Sisa Buah',
      binCategory: 'organik',
      binLabel: 'ORGANIK (Hijau)',
      reason: 'Pigmen alami buah & serat selulosa basah kaya enzim mudah terurai',
      confidence: Math.min(97, Math.max(85, topScorePct + 5)),
      rawClass: topSemantic.label,
    };
  }

  if (/leaf|leaves|broccoli|cabbage|lettuce|plant|flower|herb|grass/.test(combinedText) || features.greenRatio > 0.20) {
    return {
      targetKey: 'daun_kering',
      materialName: 'Daun / Serasah Tanaman',
      binCategory: 'organik',
      binLabel: 'ORGANIK (Hijau)',
      reason: 'Struktur lembaran nabati berurat serat selulosa & klorofil alami',
      confidence: Math.min(96, Math.max(84, topScorePct + 4)),
      rawClass: topSemantic.label,
    };
  }

  if (/espresso|coffee|tea/.test(combinedText)) {
    return {
      targetKey: 'ampas_kopi',
      materialName: 'Ampas Kopi / Teh',
      binCategory: 'organik',
      binLabel: 'ORGANIK (Hijau)',
      reason: 'Granula serbuk nabati kaya nitrogen yang cepat terurai kompos',
      confidence: Math.min(96, Math.max(84, topScorePct + 4)),
      rawClass: topSemantic.label,
    };
  }

  if (/rice|plate|food|pizza|sandwich|bread|meat|vegetable/.test(combinedText)) {
    return {
      targetKey: 'sisa_makanan',
      materialName: 'Sisa Makanan',
      binCategory: 'organik',
      binLabel: 'ORGANIK (Hijau)',
      reason: 'Material organik pangan lembap bertekstur lunak mudah membusuk',
      confidence: Math.min(95, Math.max(83, topScorePct + 4)),
      rawClass: topSemantic.label,
    };
  }

  // 8. Kertas / Buku
  if (/book|notebook|paper|newspaper|magazine/.test(combinedText)) {
    return {
      targetKey: 'kertas_buku',
      materialName: 'Kertas & Buku Bekas',
      binCategory: 'anorganik',
      binLabel: 'ANORGANIK (Kuning)',
      reason: 'Lembaran selulosa datar kering dengan cetakan teks siap daur ulang',
      confidence: Math.min(95, Math.max(82, topScorePct + 3)),
      rawClass: topSemantic.label,
    };
  }

  // 9. Fallback berbasis fitur tekstur permukaan murni jika kelas semantic netral
  if ((features.whiteRatio > 0.14 && features.cyanBlueRatio > 0.12) || features.cyanBlueRatio > 0.24) {
    return {
      targetKey: 'tisu_masker',
      materialName: 'Masker Medis (B3)',
      binCategory: 'b3',
      binLabel: 'B3 (Merah)',
      reason: 'Warna medis biru/putih dengan lipatan serat non-woven sintetis (B3)',
      confidence: 86,
      rawClass: 'surface:medical_mask',
    };
  }

  if (features.kraftBrownRatio > 0.14) {
    return {
      targetKey: 'kardus',
      materialName: 'Kardus',
      binCategory: 'anorganik',
      binLabel: 'ANORGANIK (Kuning)',
      reason: 'Permukaan cokelat matte berserat karton & tepi sudut lipatan',
      confidence: 85,
      rawClass: 'surface:kraft_cardboard',
    };
  }

  if (features.whiteRatio > 0.36 && features.specularGlossRatio < 0.04) {
    if (features.wrinkleIrregularityScore > 0.24) {
      return {
        targetKey: 'tisu',
        materialName: 'Tisu',
        binCategory: 'organik',
        binLabel: 'ORGANIK (Hijau)',
        reason: 'Serat halus lembut dengan kerutan tidak beraturan & permukaan doff',
        confidence: 84,
        rawClass: 'surface:matte_tissue',
      };
    }
    return {
      targetKey: 'styrofoam',
      materialName: 'Styrofoam',
      binCategory: 'anorganik',
      binLabel: 'ANORGANIK (Kuning)',
      reason: 'Tekstur gabus putih padat berpori halus & matte ringan',
      confidence: 84,
      rawClass: 'surface:eps_styrofoam',
    };
  }

  if (features.darkMetallicRatio > 0.38) {
    return {
      targetKey: 'baterai',
      materialName: 'Komponen B3 / E-Waste',
      binCategory: 'b3',
      binLabel: 'B3 (Merah)',
      reason: 'Permukaan gelap metalik berkerapatan tinggi indikasi komponen baterai/elektronik',
      confidence: 81,
      rawClass: 'surface:metallic_b3',
    };
  }

  return {
    targetKey: 'botol_gelas',
    materialName: 'Plastik / Botol Plastik',
    binCategory: 'anorganik',
    binLabel: 'ANORGANIK (Kuning)',
    reason:
      features.specularGlossRatio > 0.03
        ? 'Permukaan licin dengan pantulan cahaya tajam khas plastik PET/PP'
        : 'Struktur polimer plastik ringan bernilai daur ulang',
    confidence: Math.max(76, Math.min(92, topScorePct)),
    rawClass: topSemantic.label,
  };
}

/**
 * Memetakan label kelas dari Teachable Machine custom user ke struktur sampah SCANDALE
 */
function mapTeachableMachineLabel(
  label: string,
  confidencePct: number,
  features: SurfaceStructureFeatures
): MLDetectionOutput {
  const lower = label.toLowerCase();
  let key: WasteTargetKey = 'botol_gelas';
  let binCategory: 'organik' | 'anorganik' | 'b3' = 'anorganik';
  let reason = `Terbaca oleh model Teachable Machine custom (${label})`;

  if (lower.includes('tisu') && !lower.includes('basah')) {
    key = 'tisu';
    binCategory = 'organik';
    reason = 'Serat halus, kerutan tidak beraturan, tekstur lembut/doff';
  } else if (lower.includes('kardus') || lower.includes('karton') || lower.includes('cardboard')) {
    key = 'kardus';
    binCategory = 'anorganik';
    reason = 'Serat karton, permukaan matte/cokelat, lipatan & sudut struktur';
  } else if (lower.includes('styrofoam') || lower.includes('gabus')) {
    key = 'styrofoam';
    binCategory = 'anorganik';
    reason = 'Tekstur gabus putih padat berpori halus (EPS #6)';
  } else if (
    lower.includes('b3') ||
    lower.includes('baterai') ||
    lower.includes('aerosol') ||
    lower.includes('masker') ||
    lower.includes('lampu') ||
    lower.includes('kabel') ||
    lower.includes('medis')
  ) {
    binCategory = 'b3';
    if (lower.includes('baterai')) key = 'baterai';
    else if (lower.includes('aerosol')) key = 'kaleng_aerosol';
    else if (lower.includes('lampu')) key = 'lampu_rusak';
    else if (lower.includes('kabel')) key = 'kabel_charger';
    else key = 'tisu_masker';
    reason = 'Komponen limbah berbahaya & beracun (B3) perlu pemisahan khusus';
  } else if (
    lower.includes('organik') ||
    lower.includes('buah') ||
    lower.includes('daun') ||
    lower.includes('makanan') ||
    lower.includes('kopi')
  ) {
    binCategory = 'organik';
    if (lower.includes('buah')) key = 'kulit_buah';
    else if (lower.includes('daun')) key = 'daun_kering';
    else if (lower.includes('kopi')) key = 'ampas_kopi';
    else key = 'sisa_makanan';
    reason = 'Material biomassa organik alami mudah terurai mikroba';
  } else if (lower.includes('kaleng')) {
    key = 'kaleng';
    binCategory = 'anorganik';
    reason = 'Silinder logam aluminium mengkilap dapat didaur ulang';
  } else if (lower.includes('kertas')) {
    key = 'kertas_buku';
    binCategory = 'anorganik';
    reason = 'Serat selulosa kertas kering bernilai daur ulang';
  } else {
    key = 'botol_gelas';
    binCategory = 'anorganik';
    reason =
      features.specularGlossRatio > 0.03
        ? 'Permukaan licin transparan/mengkilap dengan pantulan cahaya tajam'
        : 'Material polimer plastik dapat didaur ulang';
  }

  const binLabel =
    binCategory === 'organik'
      ? 'ORGANIK (Hijau)'
      : binCategory === 'b3'
      ? 'B3 (Merah)'
      : 'ANORGANIK (Kuning)';

  return {
    targetKey: key,
    materialName: label,
    confidence: Math.round(confidencePct),
    binCategory,
    binLabel,
    reason,
    rawClass: label,
    modelSource: 'tfjs_teachable_machine',
    modelDisplayName: 'Teachable Machine Custom (TF.js)',
  };
}

/**
 * Jalankan klasifikasi Machine Learning lengkap pada elemen canvas / video / image
 */
export async function classifyWithBrowserML(
  source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
  samplingCanvas: HTMLCanvasElement,
  manualOverride?: WasteTargetKey
): Promise<MLDetectionOutput> {
  // Gambar ke canvas standar untuk analisis piksel & input model
  const targetW = 256;
  const targetH = 192;
  samplingCanvas.width = targetW;
  samplingCanvas.height = targetH;
  const ctx = samplingCanvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    return {
      targetKey: 'botol_gelas',
      materialName: 'Botol Plastik',
      confidence: 82,
      binCategory: 'anorganik',
      binLabel: 'ANORGANIK (Kuning)',
      reason: 'Permukaan plastik licin transparan siap daur ulang',
      rawClass: 'fallback',
      modelSource: 'tfjs_mobilenet',
      modelDisplayName: 'TF.js Surface Analyzer',
    };
  }

  ctx.drawImage(source, 0, 0, targetW, targetH);
  const features = extractSurfaceStructureFeatures(ctx, targetW, targetH);

  // Jika user memilih target spesifik (selain 'auto'), tetap hormati pilihan dengan reasoning ML tekstur
  if (manualOverride && manualOverride !== 'auto') {
    const mapped = mapSemanticAndSurface([], features, manualOverride);
    return {
      ...mapped,
      modelSource: customTMState ? 'tfjs_teachable_machine' : 'tfjs_mobilenet',
      modelDisplayName: customTMState
        ? 'Teachable Machine Custom'
        : 'TF.js MobileNet + Struktur Permukaan',
    };
  }

  // 1. Jika Custom Teachable Machine URL aktif dan berhasil dimuat
  if (customTMState) {
    try {
      const { model, labels, imageSize } = customTMState;
      const probs = await tf.tidy(() => {
        const input = tf.browser
          .fromPixels(samplingCanvas)
          .resizeBilinear([imageSize, imageSize])
          .toFloat()
          .div(127.5)
          .sub(1)
          .expandDims(0);
        return model.predict(input) as tf.Tensor;
      });
      const data = await probs.data();
      probs.dispose();

      let bestIdx = 0;
      let bestScore = 0;
      for (let i = 0; i < data.length; i++) {
        if (data[i] > bestScore) {
          bestScore = data[i];
          bestIdx = i;
        }
      }
      const bestLabel = labels[bestIdx] || `Kelas ${bestIdx + 1}`;
      return mapTeachableMachineLabel(bestLabel, Math.min(99, Math.max(50, bestScore * 100)), features);
    } catch (err) {
      console.warn('Error inferring with Teachable Machine model:', err);
    }
  }

  // 2. Jalankan MobileNet v2 + COCO-SSD secara paralel di browser
  const semanticLabels: Array<{ label: string; score: number }> = [];

  try {
    const tasks: Array<Promise<void>> = [];

    if (loadedMobileNet) {
      tasks.push(
        loadedMobileNet
          .classify(samplingCanvas, 4)
          .then((preds) => {
            preds.forEach((p) => {
              if (p.probability >= 0.08) {
                semanticLabels.push({ label: p.className, score: p.probability });
              }
            });
          })
          .catch(() => {})
      );
    }

    if (loadedCocoSsd) {
      tasks.push(
        loadedCocoSsd
          .detect(samplingCanvas, 3, ML_CONFIG.MIN_CONFIDENCE_THRESHOLD)
          .then((detections) => {
            detections.forEach((d) => {
              semanticLabels.push({ label: d.class, score: d.score });
            });
          })
          .catch(() => {})
      );
    }

    if (tasks.length > 0) {
      await Promise.all(tasks);
      semanticLabels.sort((a, b) => b.score - a.score);
    }
  } catch {
    // Tetap aman dengan fitur tekstur permukaan
  }

  const mapped = mapSemanticAndSurface(semanticLabels, features);
  return {
    ...mapped,
    modelSource: 'tfjs_mobilenet',
    modelDisplayName:
      loadedMobileNet || loadedCocoSsd
        ? 'TensorFlow.js (MobileNet + COCO-SSD)'
        : 'Computer Vision Tekstur Permukaan',
  };
}

/**
 * Penstabil Hasil Deteksi Multi-Frame (Rolling Majority Vote)
 * Mencegah label berkedip-kedip saat kamera digoyangkan.
 */
export class StabilizedPredictionBuffer {
  private buffer: MLDetectionOutput[] = [];
  private maxSize: number;

  constructor(maxSize: number = ML_CONFIG.STABILIZATION_WINDOW_FRAMES) {
    this.maxSize = maxSize;
  }

  public clear() {
    this.buffer = [];
  }

  public push(prediction: MLDetectionOutput): MLDetectionOutput {
    this.buffer.push(prediction);
    if (this.buffer.length > this.maxSize) {
      this.buffer.shift();
    }

    // Hitung voting terbobot berdasarkan confidence masing-masing frame
    const scoresByKey = new Map<
      WasteTargetKey,
      { totalWeight: number; count: number; latest: MLDetectionOutput; sumConf: number }
    >();

    for (const item of this.buffer) {
      const entry = scoresByKey.get(item.targetKey);
      if (entry) {
        entry.totalWeight += item.confidence;
        entry.count += 1;
        entry.sumConf += item.confidence;
        entry.latest = item;
      } else {
        scoresByKey.set(item.targetKey, {
          totalWeight: item.confidence,
          count: 1,
          latest: item,
          sumConf: item.confidence,
        });
      }
    }

    let winner: {
      totalWeight: number;
      count: number;
      latest: MLDetectionOutput;
      sumConf: number;
    } | null = null;

    for (const val of scoresByKey.values()) {
      if (!winner || val.totalWeight > winner.totalWeight) {
        winner = val;
      }
    }

    if (!winner) return prediction;

    const avgConf = Math.round(winner.sumConf / winner.count);
    return {
      ...winner.latest,
      confidence: Math.min(99, Math.max(70, avgConf)),
    };
  }
}
