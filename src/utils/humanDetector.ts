/**
 * Real-time Human and Face Detection Utility
 * Combines native browser FaceDetector API with high-precision
 * skin-tone and facial proportion cluster analysis fallback.
 */

// Native Shape Detection API singleton if supported by browser
let nativeFaceDetector: any = null;
if (typeof window !== 'undefined' && 'FaceDetector' in window) {
  try {
    nativeFaceDetector = new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 3 });
  } catch {
    nativeFaceDetector = null;
  }
}

/**
 * Checks if a pixel matches human skin chromaticity across fair, medium,
 * olive, tan, brown, and dark skin complexions.
 */
function isHumanSkinPixel(r: number, g: number, b: number): boolean {
  // YCbCr transformation
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
  const cr = 0.5 * r - 0.418688 * g - 0.081312 * b + 128;

  // Normalized RGB
  const total = r + g + b + 0.001;
  const normR = r / total;
  const normG = g / total;

  // Standard skin locus in YCbCr & normalized RGB
  const isYCbCrSkin = cb >= 75 && cb <= 130 && cr >= 132 && cr <= 175 && y > 35;
  const isNormRgbSkin =
    normR > 0.34 &&
    normR < 0.62 &&
    normG > 0.25 &&
    normG < 0.39 &&
    normR > normG &&
    r > 55 &&
    (r - g) > 7;

  return isYCbCrSkin || isNormRgbSkin;
}

/**
 * Analyzes video element or canvas image data to detect human/face presence
 */
export async function detectHumanPresence(
  video: HTMLVideoElement,
  samplingCanvas?: HTMLCanvasElement | null
): Promise<boolean> {
  // 1. Try Native Browser FaceDetector API first (high accuracy, GPU-accelerated)
  if (nativeFaceDetector && video.readyState >= 2) {
    try {
      const faces = await nativeFaceDetector.detect(video);
      if (faces && faces.length > 0) {
        // Face confirmed by native browser engine
        return true;
      }
    } catch {
      // Fallback to computer vision heuristic below
    }
  }

  // 2. High-speed Computer Vision Heuristic on downsampled frame
  try {
    const canvas = samplingCanvas || document.createElement('canvas');
    const width = 160;
    const height = 120;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return false;

    // Draw frame scaled to 160x120
    ctx.drawImage(video, 0, 0, width, height);
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let totalSkinPixels = 0;
    let centralSkinPixels = 0;

    // Bounding box estimation for skin cluster
    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;

    // Focus analysis region (center 70% where face/human sits in camera)
    const roiLeft = Math.floor(width * 0.15);
    const roiRight = Math.floor(width * 0.85);
    const roiTop = Math.floor(height * 0.10);
    const roiBottom = Math.floor(height * 0.90);

    for (let y = 0; y < height; y += 2) { // 2px stride for sub-millisecond execution
      for (let x = 0; x < width; x += 2) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        if (isHumanSkinPixel(r, g, b)) {
          totalSkinPixels++;

          if (x >= roiLeft && x <= roiRight && y >= roiTop && y <= roiBottom) {
            centralSkinPixels++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
    }

    const totalSampled = (width / 2) * (height / 2);
    const roiSampled = ((roiRight - roiLeft) / 2) * ((roiBottom - roiTop) / 2);

    const skinRatio = totalSkinPixels / totalSampled;
    const centralSkinRatio = centralSkinPixels / roiSampled;

    // Check cluster geometry (face/head proportions)
    const clusterW = maxX > minX ? maxX - minX : 0;
    const clusterH = maxY > minY ? maxY - minY : 0;
    const isHumanClusterProportions =
      clusterW >= 24 &&
      clusterH >= 24 &&
      clusterH / (clusterW + 0.01) >= 0.7 && // Face/head is tall or square-ish, not a flat line
      clusterH / (clusterW + 0.01) <= 2.2;

    // Human detected if:
    // - Significant skin presence in the central frame (> 12% skin in central zone with head/face proportions)
    // - Or dominant human presence in frame (> 18% total skin)
    if ((centralSkinRatio >= 0.12 && isHumanClusterProportions) || centralSkinRatio >= 0.20 || skinRatio >= 0.22) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
