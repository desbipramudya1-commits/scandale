export type BinCategory = 'organik' | 'anorganik' | 'b3';
export type BinColor = 'hijau' | 'kuning' | 'merah';

export interface WasteProbabilities {
  organik: number;
  anorganik: number;
  b3: number;
}

export interface WujudDetails {
  bentuk: string;
  tekstur: string;
  ciriVisual: string;
  kondisiFisik: string;
}

export interface WasteScanResult {
  itemName: string;
  category: BinCategory;
  binColor: BinColor;
  binName: string;
  confidenceScore: number;
  probabilities: WasteProbabilities;
  material: string;
  saranDaurUlang: string[];
  edukasiLimbah: string;
  bahayaJikaSalahBuang: string;
  alternatifUpcycle: string;
  degradasiWaktu: string;
  wujudFisik?: WujudDetails;
  mlReason?: string;
  mlModelName?: string;
  sumber?: 'tfjs_mobilenet' | 'tfjs_teachable_machine' | 'ai_vision' | 'fallback_engine';
  imageUrl?: string;
  scannedAt?: string;
}

export interface ScanHistoryItem extends WasteScanResult {
  id: string;
  timestamp: number;
}

export interface PresetSample {
  id: number;
  name: string;
  category: BinCategory;
  binColor: BinColor;
  iconName: string;
  description: string;
  imageUrl: string;
  result: WasteScanResult;
}
