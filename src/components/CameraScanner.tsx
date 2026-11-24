import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Camera, 
  CameraOff, 
  RefreshCw, 
  Upload, 
  Zap, 
  ZapOff, 
  Sparkles, 
  AlertCircle, 
  FlipHorizontal, 
  Target, 
  Check, 
  Usb, 
  Video, 
  X, 
  Settings2,
  ChevronDown,
  Leaf,
  Recycle,
  AlertOctagon,
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  Cpu,
  Power
} from 'lucide-react';
import { playShutterSound } from '../utils/audio';
import { TARGET_OPTIONS, WasteTargetKey, analyzeImageFeatures } from '../utils/visionClassifier';
import { detectHumanPresence } from '../utils/humanDetector';
import { ML_CONFIG, getTeachableMachineUrl, setTeachableMachineUrl } from '../config/mlConfig';
import {
  classifyWithBrowserML,
  initBrowserMLModels,
  loadCustomTeachableMachine,
  MLDetectionOutput,
  MLEngineStatus,
  StabilizedPredictionBuffer,
  subscribeMLEngineStatus
} from '../utils/mlVisionEngine';

interface CameraScannerProps {
  onScan: (imageBase64: string, targetKey?: WasteTargetKey, mlDetection?: MLDetectionOutput) => void;
  isAnalyzing: boolean;
  soundEnabled: boolean;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onScan,
  isAnalyzing,
  soundEnabled
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mlCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [activeTarget, setActiveTarget] = useState<WasteTargetKey>('auto');
  const [liveDetectedKey, setLiveDetectedKey] = useState<WasteTargetKey>('botol_gelas');
  const [isHumanDetected, setIsHumanDetected] = useState(false);
  const humanDetectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Browser Machine Learning States
  const [mlStatus, setMlStatus] = useState<MLEngineStatus>('idle');
  const [liveDetection, setLiveDetection] = useState<MLDetectionOutput | null>(null);
  const [isResultLocked, setIsResultLocked] = useState(false);
  const stabilizerRef = useRef<StabilizedPredictionBuffer>(
    new StabilizedPredictionBuffer(ML_CONFIG.STABILIZATION_WINDOW_FRAMES)
  );
  const isInferringRef = useRef(false);

  // Teachable Machine Custom Model Modal States
  const [isModelConfigOpen, setIsModelConfigOpen] = useState(false);
  const [tmUrlInput, setTmUrlInput] = useState<string>(() => getTeachableMachineUrl());
  const [tmFeedback, setTmFeedback] = useState<string | null>(null);
  const [isLoadingTM, setIsLoadingTM] = useState(false);

  // USB & Custom Camera Selection States
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('scan_sampah_selected_camera_id') || null;
    } catch {
      return null;
    }
  });
  const [activeDeviceLabel, setActiveDeviceLabel] = useState<string>('Kamera Bawaan');
  const [isDevicePickerOpen, setIsDevicePickerOpen] = useState(false);
  const [isScanningDevices, setIsScanningDevices] = useState(false);

  const [isMirrored, setIsMirrored] = useState<boolean>(() => {
    try {
      return localStorage.getItem('scan_sampah_mirror_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Horizontal Slidable Running Text Refs and State
  const chipsScrollRef = useRef<HTMLDivElement | null>(null);
  const isPointerDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const isDraggingRef = useRef(false);
  const userInteractedTimeoutRef = useRef<number | null>(null);
  const [isUserSliding, setIsUserSliding] = useState(false);

  // Smooth auto-scroll that can be paused and freely slided left or right by user
  useEffect(() => {
    let animId: number;
    const scrollContainer = chipsScrollRef.current;
    if (!scrollContainer) return;

    const step = () => {
      if (!isUserSliding && chipsScrollRef.current) {
        chipsScrollRef.current.scrollLeft += 0.45;
        // Halfway wrap for infinite continuous loop
        if (chipsScrollRef.current.scrollLeft >= chipsScrollRef.current.scrollWidth / 2) {
          chipsScrollRef.current.scrollLeft -= chipsScrollRef.current.scrollWidth / 2;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isUserSliding]);

  const pauseAutoScrollTemporarily = () => {
    setIsUserSliding(true);
    if (userInteractedTimeoutRef.current) {
      window.clearTimeout(userInteractedTimeoutRef.current);
    }
    userInteractedTimeoutRef.current = window.setTimeout(() => {
      setIsUserSliding(false);
    }, 2800);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = chipsScrollRef.current;
    if (!container) return;
    isPointerDownRef.current = true;
    isDraggingRef.current = false;
    startXRef.current = e.clientX;
    startScrollLeftRef.current = container.scrollLeft;
    pauseAutoScrollTemporarily();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    const container = chipsScrollRef.current;
    if (!container) return;
    const dx = e.clientX - startXRef.current;
    if (Math.abs(dx) > 4) {
      isDraggingRef.current = true;
    }
    container.scrollLeft = startScrollLeftRef.current - dx;
    pauseAutoScrollTemporarily();
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 60);
  };

  const handleSlideLeft = () => {
    if (!chipsScrollRef.current) return;
    pauseAutoScrollTemporarily();
    chipsScrollRef.current.scrollBy({ left: -160, behavior: 'smooth' });
  };

  const handleSlideRight = () => {
    if (!chipsScrollRef.current) return;
    pauseAutoScrollTemporarily();
    chipsScrollRef.current.scrollBy({ left: 160, behavior: 'smooth' });
  };

  // Enumerate all connected cameras (USB and built-in)
  const enumerateCameras = useCallback(async () => {
    setIsScanningDevices(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = allDevices.filter(d => d.kind === 'videoinput');
        setVideoDevices(videoInputs);
        return videoInputs;
      }
    } catch (err) {
      console.warn('Error enumerating camera devices:', err);
    } finally {
      setIsScanningDevices(false);
    }
    return [];
  }, []);

  // Start Camera Stream (supports specific USB deviceId or facingMode)
  const startCamera = useCallback(async (deviceIdToUse?: string | null, facing?: 'environment' | 'user') => {
    setIsInitializing(true);
    setCameraError(null);

    // Stop any existing stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser tidak mendukung akses kamera langsung. Gunakan fitur unggah foto.');
      }

      let constraints: MediaStreamConstraints;
      if (deviceIdToUse) {
        constraints = {
          video: {
            deviceId: { exact: deviceIdToUse },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };
      } else {
        constraints = {
          video: {
            facingMode: { ideal: facing || facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };
      }

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play().catch(() => {
          // autoplay policy catch
        });
      }

      // Check current active track settings and label
      const currentTrack = newStream.getVideoTracks()[0];
      const trackSettings = currentTrack ? currentTrack.getSettings() : {};
      const actualDeviceId = trackSettings.deviceId || deviceIdToUse || null;
      setSelectedDeviceId(actualDeviceId);

      // Re-enumerate to get labels after permission is granted
      const devs = await enumerateCameras();
      const currentDev = devs.find(d => d.deviceId === actualDeviceId);
      if (currentDev && currentDev.label) {
        setActiveDeviceLabel(currentDev.label);
      } else if (currentTrack && currentTrack.label) {
        setActiveDeviceLabel(currentTrack.label);
      } else {
        setActiveDeviceLabel(deviceIdToUse ? 'Kamera USB Terhubung' : 'Kamera Bawaan');
      }

      // Check torch capability
      if (currentTrack) {
        const capabilities: any = currentTrack.getCapabilities ? currentTrack.getCapabilities() : {};
        setHasTorch(Boolean(capabilities.torch));
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      // If exact device failed (e.g. unplugged USB camera), fallback to default
      if (deviceIdToUse) {
        console.log('USB device unavailable, falling back to default camera...');
        setSelectedDeviceId(null);
        try {
          localStorage.removeItem('scan_sampah_selected_camera_id');
        } catch {}
        startCamera(null, facing || 'environment');
        return;
      }

      let msg = 'Izin kamera belum diizinkan atau kamera tidak tersedia.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Izin akses kamera ditolak. Silakan izinkan akses kamera di peramban Anda atau gunakan unggah foto.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'Perangkat kamera tidak ditemukan pada port USB atau komputer ini.';
      }
      setCameraError(msg);
    } finally {
      setIsInitializing(false);
    }
  }, [facingMode, stream, enumerateCameras]);

  // Initialize camera and TensorFlow.js ML models on mount
  useEffect(() => {
    const unsubscribeML = subscribeMLEngineStatus((status) => {
      setMlStatus(status);
    });
    initBrowserMLModels();
    startCamera(selectedDeviceId, facingMode);

    return () => {
      unsubscribeML();
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Stop or restart camera cleanly for "Aktifkan Scan Kamera" toggle
  const handleToggleCameraPower = () => {
    if (isCameraActive && stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsCameraActive(false);
      setCameraError(null);
      setIsInitializing(false);
    } else {
      setIsCameraActive(true);
      startCamera(selectedDeviceId, facingMode);
    }
  };

  // Save & load custom Teachable Machine URL
  const handleSaveTeachableMachine = async () => {
    setIsLoadingTM(true);
    setTmFeedback(null);
    const saved = setTeachableMachineUrl(tmUrlInput);
    stabilizerRef.current.clear();

    if (!saved) {
      await loadCustomTeachableMachine('');
      setTmFeedback('Model kembali ke TensorFlow.js MobileNet + COCO-SSD bawaan.');
      setIsLoadingTM(false);
      return;
    }

    const ok = await loadCustomTeachableMachine(saved);
    if (ok) {
      setTmFeedback('Model Teachable Machine custom berhasil dimuat dan aktif!');
    } else {
      setTmFeedback('Gagal memuat URL model. Pastikan URL valid & mengarah ke model Teachable Machine TF.js.');
    }
    setIsLoadingTM(false);
  };

  // Listen to USB camera hotplug / unplug events
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
      const handleDeviceChange = () => {
        enumerateCameras();
      };
      navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      };
    }
  }, [enumerateCameras]);

  // Handle selecting a specific camera (USB or internal)
  const handleSelectDevice = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    try {
      localStorage.setItem('scan_sampah_selected_camera_id', deviceId);
    } catch {}
    startCamera(deviceId);
    setIsDevicePickerOpen(false);
  };

  // Switch to Next Camera (cycles through all available cameras including USB webcams)
  const handleSwitchCamera = () => {
    if (videoDevices.length > 1) {
      const currentIndex = videoDevices.findIndex(d => d.deviceId === selectedDeviceId);
      const nextIndex = (currentIndex + 1) % videoDevices.length;
      const nextDevice = videoDevices[nextIndex];
      if (nextDevice && nextDevice.deviceId) {
        handleSelectDevice(nextDevice.deviceId);
        return;
      }
    }

    // Default toggle between environment and user
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    setSelectedDeviceId(null);
    startCamera(null, nextFacing);
  };

  // Toggle Torch/Flashlight
  const handleToggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track && hasTorch) {
      try {
        const nextState = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchOn(nextState);
      } catch (e) {
        console.warn('Torch constraint error:', e);
      }
    }
  };

  // Toggle Camera Mirror Mode (Horizontal Flip)
  const handleToggleMirror = () => {
    setIsMirrored((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('scan_sampah_mirror_mode', String(next));
      } catch {
        // Ignore storage error
      }
      return next;
    });
  };

  // Helper to downscale and analyze images for fast, synchronized scanning
  const processImageAndAnalyze = (
    source: HTMLVideoElement | HTMLImageElement,
    isMirror: boolean,
    targetMode: WasteTargetKey
  ): { dataUrl: string; detectedKey: WasteTargetKey } => {
    const canvas = canvasRef.current || document.createElement('canvas');
    const origW = (source as HTMLVideoElement).videoWidth || (source as HTMLImageElement).naturalWidth || 640;
    const origH = (source as HTMLVideoElement).videoHeight || (source as HTMLImageElement).naturalHeight || 480;

    const maxDimension = 640;
    let targetW = origW;
    let targetH = origH;

    if (origW > maxDimension || origH > maxDimension) {
      if (origW > origH) {
        targetH = Math.round((origH * maxDimension) / origW);
        targetW = maxDimension;
      } else {
        targetW = Math.round((origW * maxDimension) / origH);
        targetH = maxDimension;
      }
    }

    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { dataUrl: '', detectedKey: 'botol_gelas' };

    if (isMirror) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(source, 0, 0, targetW, targetH);

    // If target is auto, run deterministic computer vision pixel analysis
    let finalKey = targetMode;
    if (targetMode === 'auto') {
      finalKey = analyzeImageFeatures(ctx, targetW, targetH);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
    return { dataUrl, detectedKey: finalKey };
  };

  // Real-time TensorFlow.js + Surface Structure live ML inference loop with multi-frame stabilization
  useEffect(() => {
    if (!stream || !isCameraActive || isAnalyzing || isResultLocked) return;

    let cancelled = false;
    if (!mlCanvasRef.current) {
      mlCanvasRef.current = document.createElement('canvas');
    }

    const runLiveInference = async () => {
      if (cancelled || isInferringRef.current) return;
      if (!videoRef.current || videoRef.current.readyState < 2) return;

      isInferringRef.current = true;
      try {
        const override = activeTarget !== 'auto' ? activeTarget : undefined;
        const rawPred = await classifyWithBrowserML(
          videoRef.current,
          mlCanvasRef.current!,
          override
        );
        if (cancelled) return;

        const stabilized = override ? rawPred : stabilizerRef.current.push(rawPred);
        setLiveDetection(stabilized);
        setLiveDetectedKey(stabilized.targetKey);
      } catch {
        // Ignore single frame errors
      } finally {
        isInferringRef.current = false;
      }
    };

    runLiveInference();
    const intervalId = setInterval(runLiveInference, ML_CONFIG.LIVE_INFERENCE_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [stream, isCameraActive, isAnalyzing, isResultLocked, activeTarget]);

  // Real-time human face and body detection to automatically clear text from camera
  useEffect(() => {
    if (!stream || !isCameraActive || isAnalyzing) {
      setIsHumanDetected(false);
      return;
    }

    let isMounted = true;
    const detectorCanvas = document.createElement('canvas');

    const checkHuman = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;
      try {
        const detected = await detectHumanPresence(videoRef.current, detectorCanvas);
        if (!isMounted) return;

        if (detected) {
          setIsHumanDetected(true);
          if (humanDetectionTimeoutRef.current) {
            clearTimeout(humanDetectionTimeoutRef.current);
            humanDetectionTimeoutRef.current = null;
          }
        } else {
          // Debounce release by 600ms to avoid rapid flickering on micro movements
          if (!humanDetectionTimeoutRef.current) {
            humanDetectionTimeoutRef.current = setTimeout(() => {
              if (isMounted) {
                setIsHumanDetected(false);
              }
              humanDetectionTimeoutRef.current = null;
            }, 600);
          }
        }
      } catch {
        // Ignore detection errors
      }
    };

    const intervalId = setInterval(checkHuman, 250);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      if (humanDetectionTimeoutRef.current) {
        clearTimeout(humanDetectionTimeoutRef.current);
      }
    };
  }, [stream, isCameraActive, isAnalyzing]);

  // Capture frame from video with TensorFlow.js ML classification (or locked result)
  const handleCapture = async () => {
    if (isAnalyzing || !videoRef.current) return;
    if (soundEnabled) playShutterSound();

    const targetMode =
      activeTarget !== 'auto'
        ? activeTarget
        : liveDetection?.targetKey || liveDetectedKey;
    const { dataUrl, detectedKey } = processImageAndAnalyze(videoRef.current, isMirrored, targetMode);

    let finalDetection = liveDetection;
    if (!isResultLocked && videoRef.current) {
      try {
        if (!mlCanvasRef.current) mlCanvasRef.current = document.createElement('canvas');
        finalDetection = await classifyWithBrowserML(
          videoRef.current,
          mlCanvasRef.current,
          activeTarget !== 'auto' ? activeTarget : undefined
        );
      } catch {
        // Use current liveDetection if single-frame classify fails
      }
    }

    if (dataUrl) {
      onScan(dataUrl, finalDetection?.targetKey || detectedKey, finalDetection || undefined);
    }
  };

  // Handle manual file upload ("Upload Foto") from disk or gallery with browser ML analysis
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (soundEnabled) playShutterSound();

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) return;

      const img = new Image();
      img.onload = async () => {
        const { dataUrl, detectedKey } = processImageAndAnalyze(img, false, activeTarget);
        let mlOutput: MLDetectionOutput | undefined;
        try {
          if (!mlCanvasRef.current) mlCanvasRef.current = document.createElement('canvas');
          mlOutput = await classifyWithBrowserML(
            img,
            mlCanvasRef.current,
            activeTarget !== 'auto' ? activeTarget : undefined
          );
        } catch {
          mlOutput = undefined;
        }
        onScan(dataUrl || rawDataUrl, mlOutput?.targetKey || detectedKey, mlOutput);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  const effectiveTargetKey =
    activeTarget !== 'auto'
      ? activeTarget
      : liveDetection?.targetKey || liveDetectedKey;
  const effectiveTargetObj = TARGET_OPTIONS.find(t => t.key === effectiveTargetKey) || TARGET_OPTIONS[1];
  const activeTargetObj = TARGET_OPTIONS.find(t => t.key === activeTarget) || TARGET_OPTIONS[0];

  const isUsbCameraActive = activeDeviceLabel.toLowerCase().includes('usb') || 
    activeDeviceLabel.toLowerCase().includes('webcam') || 
    activeDeviceLabel.toLowerCase().includes('uvc') ||
    activeDeviceLabel.toLowerCase().includes('external');

  const getBinBadgeTheme = (cat?: 'organik' | 'anorganik' | 'b3') => {
    if (cat === 'organik') return 'bg-emerald-500 text-white border-emerald-300';
    if (cat === 'b3') return 'bg-rose-600 text-white border-rose-300';
    return 'bg-amber-400 text-stone-950 border-amber-200';
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-900 shadow-md transition-colors">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file input for photo upload across all devices (HP & Laptop) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Camera Viewport */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full bg-stone-950 flex items-center justify-center overflow-hidden">
        {/* Live Video with optional mirror horizontal flip */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }}
          className={`h-full w-full object-cover transition-all duration-300 ${
            cameraError || isInitializing ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Minimalist Viewfinder Reticle Overlay */}
        {!cameraError && !isInitializing && isCameraActive && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6">
            {/* Soft Focus Frame */}
            <div className="relative h-44 w-44 sm:h-56 sm:w-56 border border-white/30 rounded-2xl flex items-center justify-center -mt-10 sm:-mt-8">
              {/* Sleek Corner brackets */}
              <div className="absolute -top-1 -left-1 h-5 w-5 border-t-2 border-l-2 border-emerald-400 rounded-tl-md" />
              <div className="absolute -top-1 -right-1 h-5 w-5 border-t-2 border-r-2 border-emerald-400 rounded-tr-md" />
              <div className="absolute -bottom-1 -left-1 h-5 w-5 border-b-2 border-l-2 border-emerald-400 rounded-bl-md" />
              <div className="absolute -bottom-1 -right-1 h-5 w-5 border-b-2 border-r-2 border-emerald-400 rounded-br-md" />

              {/* Scanning laser line */}
              {isAnalyzing && (
                <div className="absolute inset-x-2 h-0.5 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse top-1/2 -translate-y-1/2" />
              )}

              {/* Live Center Material Pill (Hidden when human/face is detected) */}
              {!isAnalyzing && !isHumanDetected && (
                <div className="flex flex-col items-center gap-1 max-w-[205px] text-center px-2 animate-fade-in">
                  <div className="flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1 backdrop-blur-md border border-white/15 shadow-sm text-white">
                    <Target className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold tracking-wide truncate">
                      {liveDetection ? liveDetection.materialName : effectiveTargetObj.label}
                    </span>
                    {liveDetection && (
                      <span className="rounded-full bg-emerald-500/25 px-1.5 py-0.2 text-[10px] font-extrabold text-emerald-300 tabular-nums">
                        {liveDetection.confidence}%
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Real-Time ML Detection Readout Card (Hidden when human/face is detected) */}
            {!isAnalyzing && !isHumanDetected && (
              <div className="absolute bottom-2.5 inset-x-2.5 sm:inset-x-4 pointer-events-auto flex justify-center animate-fade-in">
                <div className="w-full max-w-xl rounded-2xl bg-black/80 px-3 py-2 sm:px-4 sm:py-2.5 border border-white/15 backdrop-blur-md shadow-xl text-white">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`h-2 w-2 rounded-full shrink-0 ${
                          isResultLocked ? 'bg-amber-400' : 'bg-emerald-400 animate-ping'
                        }`}
                      />
                      <span className="text-xs sm:text-sm font-bold text-white truncate">
                        {liveDetection ? liveDetection.materialName : effectiveTargetObj.label}
                      </span>
                      <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-emerald-300 tabular-nums">
                        {liveDetection ? `${liveDetection.confidence}%` : '88%'}
                      </span>
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-extrabold tracking-wide uppercase ${getBinBadgeTheme(
                          liveDetection?.binCategory ||
                            (effectiveTargetObj.category === 'all' ? 'anorganik' : effectiveTargetObj.category)
                        )}`}
                      >
                        {liveDetection
                          ? liveDetection.binLabel
                          : effectiveTargetObj.category === 'organik'
                          ? 'ORGANIK (Hijau)'
                          : effectiveTargetObj.category === 'b3'
                          ? 'B3 (Merah)'
                          : 'ANORGANIK (Kuning)'}
                      </span>
                    </div>

                    {/* Tombol Kunci Hasil Scan */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsResultLocked((prev) => {
                          if (prev) stabilizerRef.current.clear();
                          return !prev;
                        });
                      }}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] sm:text-[11px] font-bold transition-all border cursor-pointer ${
                        isResultLocked
                          ? 'border-amber-400 bg-amber-400 text-stone-950 shadow-sm'
                          : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                      }`}
                      title="Kunci hasil deteksi agar label tidak berubah saat kamera bergerak"
                    >
                      {isResultLocked ? (
                        <>
                          <Lock className="h-3 w-3" />
                          <span>Hasil Terkunci</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="h-3 w-3 text-emerald-400" />
                          <span>Kunci Hasil Scan</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Alasan singkat berbasis struktur & tekstur permukaan */}
                  <p className="mt-1 text-[10px] sm:text-[11px] text-stone-300 leading-snug line-clamp-1">
                    {liveDetection
                      ? liveDetection.reason
                      : effectiveTargetObj.wujud.tekstur}
                  </p>
                </div>
              </div>
            )}

            {/* Top Bar: Camera HUD Controls (All text hidden when human/face detected) */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto gap-2">
              {/* Active Camera Device Indicator (Clickable to switch USB/internal) */}
              <button
                type="button"
                onClick={() => {
                  enumerateCameras();
                  setIsDevicePickerOpen(true);
                }}
                className={`flex items-center gap-1.5 rounded-full bg-black/65 ${
                  isHumanDetected ? 'p-2' : 'px-3 py-1.5'
                } backdrop-blur-md hover:bg-black/85 transition-all text-white border border-white/10`}
                title="Pilih Kamera Port USB atau Kamera Bawaan"
              >
                {isUsbCameraActive ? (
                  <Usb className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Camera className="h-3.5 w-3.5 text-emerald-400" />
                )}
                {!isHumanDetected && (
                  <>
                    <span className="line-clamp-1 max-w-[120px] sm:max-w-[150px] text-[11px] font-medium text-left">
                      {activeDeviceLabel}
                    </span>
                    <ChevronDown className="h-3 w-3 opacity-70" />
                  </>
                )}
              </button>

              {/* Actions: ML Model Config, Mirror Mode & Flashlight */}
              <div className="flex items-center gap-1.5">
                {/* Browser ML Status & Teachable Machine Slot Button */}
                <button
                  type="button"
                  onClick={() => setIsModelConfigOpen(true)}
                  className={`flex items-center gap-1.5 rounded-full ${
                    isHumanDetected ? 'p-2' : 'px-2.5 py-1.5'
                  } text-[11px] font-semibold backdrop-blur-md transition-all border border-white/10 bg-black/65 text-white hover:bg-black/85 cursor-pointer`}
                  title="Konfigurasi Model Machine Learning (TensorFlow.js / Teachable Machine)"
                >
                  <Cpu
                    className={`h-3.5 w-3.5 ${
                      mlStatus === 'teachable_machine'
                        ? 'text-amber-300'
                        : mlStatus === 'ready'
                        ? 'text-emerald-400'
                        : mlStatus === 'loading'
                        ? 'text-sky-300 animate-pulse'
                        : 'text-stone-300'
                    }`}
                  />
                  {!isHumanDetected && (
                    <span className="hidden xs:inline">
                      {mlStatus === 'teachable_machine'
                        ? 'Model TM'
                        : mlStatus === 'ready'
                        ? 'TF.js Aktif'
                        : mlStatus === 'loading'
                        ? 'Memuat ML...'
                        : 'CV Aktif'}
                    </span>
                  )}
                </button>

                {/* Mirror Toggle Button */}
                <button
                  type="button"
                  onClick={handleToggleMirror}
                  className={`flex items-center gap-1.5 rounded-full ${
                    isHumanDetected ? 'p-2' : 'px-2.5 py-1.5'
                  } text-xs font-semibold backdrop-blur-md transition-all border border-white/10 ${
                    isMirrored
                      ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-white/40'
                      : 'bg-black/65 text-white/90 hover:bg-black/85'
                  }`}
                  title={isMirrored ? 'Mode Cermin Aktif (Klik untuk tampilan normal)' : 'Aktifkan Mode Cermin (Mirror)'}
                  aria-label="Cermin Kamera"
                >
                  <FlipHorizontal className="h-3.5 w-3.5" />
                  {!isHumanDetected && (
                    <span className="text-[11px]">Cermin</span>
                  )}
                </button>

                {/* Flash/Torch Button (if available) */}
                {hasTorch && (
                  <button
                    onClick={handleToggleTorch}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur-md hover:bg-black/85 transition-colors border border-white/10"
                    title="Flashlight"
                  >
                    {torchOn ? <Zap className="h-4 w-4 text-amber-300" /> : <ZapOff className="h-4 w-4 text-white" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Fallback / Inactive Screen: When Camera is turned off, not allowed, or initializing */}
        {(cameraError || isInitializing || !isCameraActive) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-stone-900/95">
            {isInitializing ? (
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="h-8 w-8 animate-spin text-emerald-400" />
                <p className="text-sm font-medium text-stone-200">Menghubungkan ke kamera Anda...</p>
              </div>
            ) : (
              <div className="max-w-sm flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-800 text-emerald-400">
                  {cameraError ? <CameraOff className="h-6 w-6 text-stone-400" /> : <Camera className="h-6 w-6" />}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {cameraError ? 'Kamera Belum Terhubung' : 'Kamera Scan Dijeda'}
                  </h3>
                  <p className="mt-1 text-xs text-stone-400 leading-relaxed">
                    {cameraError || 'Klik "Aktifkan Scan Kamera" untuk mulai memindai langsung, atau gunakan "Upload Foto".'}
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCameraActive(true);
                      startCamera(selectedDeviceId, facingMode);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-sm cursor-pointer"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Aktifkan Scan Kamera
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      enumerateCameras();
                      setIsDevicePickerOpen(true);
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-800 px-3.5 py-2 text-xs font-semibold text-stone-200 hover:bg-stone-700 transition-colors cursor-pointer"
                  >
                    <Usb className="h-3.5 w-3.5 text-emerald-400" />
                    Ganti Kamera
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-800 px-3.5 py-2 text-xs font-semibold text-stone-200 hover:bg-stone-700 transition-colors cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload Foto
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Compact Full Screen Loading Screen Featuring the 3 Waste Bin Logos */}
        {isAnalyzing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            {/* Elegant Compact Floating Card Modal */}
            <div className="flex flex-col items-center rounded-3xl border border-stone-800 bg-stone-900/95 p-4 sm:p-5 shadow-2xl backdrop-blur-xl max-w-xs sm:max-w-sm w-full mx-auto text-center text-white">
              {/* The 3 Waste Logos Trio (Organik, Anorganik, B3) - Sized compactly */}
              <div className="relative mb-3.5 flex items-center justify-center gap-2.5 sm:gap-3.5">
                {/* Logo 1: Organik (Hijau) */}
                <div className="flex flex-col items-center">
                  <div className="relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border border-emerald-400 bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-bounce [animation-duration:1.2s] [animation-delay:0s]">
                    <Leaf className="h-5.5 w-5.5" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-300 text-[8px] font-black text-emerald-950 shadow-xs">
                      1
                    </span>
                  </div>
                  <span className="mt-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    Organik
                  </span>
                  <span className="text-[9px] text-stone-400 font-medium">Tong Hijau</span>
                </div>

                {/* Connecting scanner pulse dot */}
                <div className="h-1 w-2 rounded-full bg-stone-700 animate-pulse" />

                {/* Logo 2: Anorganik (Kuning) */}
                <div className="flex flex-col items-center">
                  <div className="relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border border-amber-300 bg-amber-400 text-stone-950 shadow-[0_0_15px_rgba(251,191,36,0.4)] animate-bounce [animation-duration:1.2s] [animation-delay:0.2s]">
                    <Recycle className="h-5.5 w-5.5 stroke-[2.2]" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-200 text-[8px] font-black text-amber-950 shadow-xs">
                      2
                    </span>
                  </div>
                  <span className="mt-1 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                    Anorganik
                  </span>
                  <span className="text-[9px] text-stone-400 font-medium">Tong Kuning</span>
                </div>

                {/* Connecting scanner pulse dot */}
                <div className="h-1 w-2 rounded-full bg-stone-700 animate-pulse" />

                {/* Logo 3: B3 (Merah) */}
                <div className="flex flex-col items-center">
                  <div className="relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border border-rose-400 bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-bounce [animation-duration:1.2s] [animation-delay:0.4s]">
                    <AlertOctagon className="h-5.5 w-5.5" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-300 text-[8px] font-black text-rose-950 shadow-xs">
                      3
                    </span>
                  </div>
                  <span className="mt-1 text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                    Limbah B3
                  </span>
                  <span className="text-[9px] text-stone-400 font-medium">Tong Merah</span>
                </div>
              </div>

              {/* Status Heading */}
              <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Mencocokkan ke 3 Tong Sampah...
              </h4>

              {/* Tri-Color Segmented Progress Bar */}
              <div className="mt-2.5 w-48 sm:w-56 overflow-hidden rounded-full bg-stone-800 border border-stone-700/80 p-0.5 shadow-inner">
                <div className="flex h-1.5 w-full gap-1">
                  <div className="h-full flex-1 rounded-l-full bg-emerald-500 animate-pulse" />
                  <div className="h-full flex-1 bg-amber-400 animate-pulse [animation-delay:150ms]" />
                  <div className="h-full flex-1 rounded-r-full bg-rose-500 animate-pulse [animation-delay:300ms]" />
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-stone-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-semibold text-white">
                  Objek: {activeTargetObj.label}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-stone-400 max-w-xs">
                Validasi jenis sampah Organik · Anorganik · B3
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Target Focus Selector Strip */}
      <div className="border-t border-stone-800 bg-stone-950 px-3 py-2.5 sm:px-4">
        <div className="mb-2 flex items-center justify-center text-center">
          <span className="text-[11px] font-semibold tracking-wide text-stone-400 flex items-center justify-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-emerald-400" />
            <span>Pilih Objek Yang Sedang Diarahkan:</span>
          </span>
        </div>

        {/* Specific Waste Item Chips with Running Text that can also be slided left & right */}
        <div className="relative group/chips overflow-hidden w-full py-1">
          {/* Slide Navigation Buttons (Kiri & Kanan) */}
          <button
            type="button"
            onClick={handleSlideLeft}
            aria-label="Geser ke kiri"
            className="absolute left-1 top-1/2 -translate-y-1/2 z-20 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-stone-900/90 text-stone-200 border border-stone-700 shadow-md opacity-80 hover:opacity-100 hover:bg-stone-800 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Geser Pilihan ke Kiri"
          >
            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>

          <button
            type="button"
            onClick={handleSlideRight}
            aria-label="Geser ke kanan"
            className="absolute right-1 top-1/2 -translate-y-1/2 z-20 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-stone-900/90 text-stone-200 border border-stone-700 shadow-md opacity-80 hover:opacity-100 hover:bg-stone-800 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Geser Pilihan ke Kanan"
          >
            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>

          {/* Subtle gradient fades on edges */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-stone-950 via-stone-950/60 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-stone-950 via-stone-950/60 to-transparent z-10" />

          {/* Slidable running text container (bisa di-slide/drag kanan & kiri, auto-run pelan saat diam) */}
          <div
            ref={chipsScrollRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={pauseAutoScrollTemporarily}
            onTouchStart={pauseAutoScrollTemporarily}
            className="flex items-center gap-1.5 overflow-x-auto py-1 px-8 no-scrollbar scrollbar-none cursor-grab active:cursor-grabbing select-none"
            style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
          >
            {[...TARGET_OPTIONS, ...TARGET_OPTIONS].map((opt, idx) => {
              const isSelected = activeTarget === opt.key;
              
              let badgeClass = 'border-stone-800 bg-stone-900/80 text-stone-300 hover:bg-stone-800 hover:text-white';
              if (isSelected) {
                if (opt.binColor === 'hijau') {
                  badgeClass = 'border-emerald-500 bg-emerald-600 text-white font-bold shadow-xs';
                } else if (opt.binColor === 'kuning') {
                  badgeClass = 'border-amber-400 bg-amber-400 text-stone-950 font-bold shadow-xs';
                } else if (opt.binColor === 'merah') {
                  badgeClass = 'border-rose-500 bg-rose-600 text-white font-bold shadow-xs';
                } else {
                  badgeClass = 'border-emerald-500/80 bg-emerald-600/90 text-white font-bold shadow-xs';
                }
              }

              return (
                <button
                  key={`${opt.key}-${idx}`}
                  type="button"
                  onClick={() => {
                    if (isDraggingRef.current) return;
                    setActiveTarget(opt.key);
                  }}
                  className={`shrink-0 flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs transition-all cursor-pointer ${badgeClass}`}
                  title={opt.hint}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Control Bar Below Viewport */}
      <div className="flex flex-wrap items-center justify-between border-t border-stone-800 bg-stone-900 px-3 py-2.5 sm:px-5 sm:py-3 gap-2">
        {/* Left: Upload Foto & Aktifkan/Jeda Scan Kamera */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 rounded-xl border border-stone-700/80 bg-stone-800/80 px-2.5 py-2 sm:px-3.5 sm:py-2.5 text-xs font-semibold text-stone-200 hover:bg-stone-700 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
            title="Upload foto sampah dari galeri HP atau komputer"
          >
            <Upload className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Upload Foto</span>
          </button>

          <button
            type="button"
            onClick={handleToggleCameraPower}
            disabled={isAnalyzing}
            className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-2 sm:px-3 sm:py-2.5 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer ${
              isCameraActive && stream
                ? 'border-emerald-700/70 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60'
                : 'border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-500'
            }`}
            title={isCameraActive && stream ? 'Kamera aktif (klik untuk menjeda)' : 'Aktifkan Scan Kamera langsung'}
          >
            <Power className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden md:inline">
              {isCameraActive && stream ? 'Kamera Aktif' : 'Aktifkan Scan Kamera'}
            </span>
          </button>
        </div>

        {/* Center: Tactile Shutter Button */}
        <button
          type="button"
          onClick={handleCapture}
          disabled={isAnalyzing || !stream || !isCameraActive}
          aria-label="Pindai Sampah Sekarang"
          className="group relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-emerald-500 p-1 shadow-lg shadow-emerald-500/30 transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <span className="flex h-full w-full items-center justify-center rounded-full border-2 border-white/70 bg-gradient-to-b from-emerald-500 to-emerald-600 group-hover:from-emerald-400 group-hover:to-emerald-500 transition-colors shadow-inner">
            <Camera className="h-6 w-6 text-white stroke-[2.2]" />
          </span>
          <span className="sr-only">Pindai Sampah</span>
        </button>

        {/* Right: Kunci Hasil & Ganti Kamera */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setIsModelConfigOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-stone-700/80 bg-stone-800/80 px-2.5 py-2 sm:px-3 sm:py-2.5 text-xs font-semibold text-stone-200 hover:bg-stone-700 hover:text-white transition-all cursor-pointer"
            title="Pengaturan Model Machine Learning (TensorFlow.js & Teachable Machine)"
          >
            <Settings2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="hidden lg:inline">Model ML</span>
          </button>

          <button
            type="button"
            onClick={handleSwitchCamera}
            disabled={isAnalyzing || !stream || !isCameraActive}
            className="flex items-center gap-1.5 rounded-xl border border-stone-700/80 bg-stone-800/80 px-2.5 py-2 sm:px-3.5 sm:py-2.5 text-xs font-semibold text-stone-200 hover:bg-stone-700 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
            title="Ganti ke kamera lain (belakang/depan atau kamera USB)"
          >
            <RefreshCw className="h-4 w-4 text-stone-300 shrink-0" />
            <span className="hidden sm:inline">Ganti Kamera</span>
            {videoDevices.length > 1 && (
              <span className="rounded-full bg-stone-700 px-1.5 py-0.2 text-[10px] text-emerald-300 font-bold tabular-nums">
                {videoDevices.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* USB & Custom Camera Selector Modal */}
      {isDevicePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xl transition-colors">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                  <Usb className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Pilih Kamera Input (Port USB)</h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">Pilih webcam eksternal atau kamera bawaan</p>
                </div>
              </div>
              <button
                onClick={() => setIsDevicePickerOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Device List Body */}
            <div className="p-4 space-y-3 max-h-[350px] overflow-y-auto">
              <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400 mb-1">
                <span>Daftar Perangkat Terdeteksi ({videoDevices.length}):</span>
                <button
                  onClick={enumerateCameras}
                  disabled={isScanningDevices}
                  className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${isScanningDevices ? 'animate-spin' : ''}`} />
                  <span>Pindai Ulang USB</span>
                </button>
              </div>

              {videoDevices.length === 0 ? (
                <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 p-4 text-center">
                  <Video className="mx-auto h-7 w-7 text-stone-400 mb-1.5" />
                  <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">Tidak ada perangkat video tambahan</p>
                  <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                    Colokkan kamera USB / webcam ke port komputer Anda, lalu klik "Pindai Ulang USB".
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {videoDevices.map((dev, idx) => {
                    const isSelected = selectedDeviceId === dev.deviceId;
                    const label = dev.label || `Kamera ${idx + 1}`;
                    const isUsb = label.toLowerCase().includes('usb') || 
                                  label.toLowerCase().includes('webcam') || 
                                  label.toLowerCase().includes('uvc') ||
                                  label.toLowerCase().includes('external');

                    return (
                      <button
                        key={dev.deviceId || idx}
                        type="button"
                        onClick={() => handleSelectDevice(dev.deviceId)}
                        className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/60 shadow-xs'
                            : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            isUsb 
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' 
                              : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                          }`}>
                            {isUsb ? <Usb className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                          </div>
                          <div>
                            <span className="line-clamp-1 text-xs font-bold text-stone-900 dark:text-stone-100">
                              {label}
                            </span>
                            <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                              {isUsb ? '🔌 Perangkat Port USB Eksternal' : '📷 Kamera Bawaan / Terintegrasi'}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* USB Hotplug Tip */}
              <div className="rounded-xl border border-emerald-100 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30 p-3 text-xs text-emerald-950 dark:text-emerald-200">
                <span className="font-bold">💡 Tips Kamera USB:</span>
                <p className="mt-0.5 text-[11px] text-emerald-900 dark:text-emerald-300 leading-relaxed">
                  Anda dapat menggunakan webcam USB eksternal, kamera endoskop/mikroskop USB, atau capture card HDMI USB. Cukup tancapkan ke port USB dan pilih dari daftar di atas.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-5 py-3 text-right">
              <button
                type="button"
                onClick={() => setIsDevicePickerOpen(false)}
                className="rounded-xl bg-stone-900 dark:bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800 dark:hover:bg-emerald-500 transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Browser ML & Teachable Machine Custom Model Config Modal */}
      {isModelConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xl transition-colors">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    Konfigurasi Model ML Browser
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    TensorFlow.js Client-Side (MobileNet + COCO-SSD / Teachable Machine)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModelConfigOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">Status Engine Aktif:</span>
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                    {mlStatus === 'teachable_machine'
                      ? 'Teachable Machine Custom'
                      : mlStatus === 'ready'
                      ? 'TF.js MobileNet + COCO-SSD'
                      : mlStatus === 'loading'
                      ? 'Memuat Model...'
                      : 'Surface Computer Vision'}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                  Berjalan 100% langsung di browser HP/Laptop tanpa server backend (aman untuk Vercel & GitHub Pages HTTPS).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                  URL Model Teachable Machine Custom (Opsional)
                </label>
                <input
                  type="url"
                  value={tmUrlInput}
                  onChange={(e) => setTmUrlInput(e.target.value)}
                  placeholder="https://teachablemachine.withgoogle.com/models/XXXX/"
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none"
                />
                <p className="mt-1.5 text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                  Kosongkan untuk menggunakan model bawaan MobileNet v2 + COCO-SSD + Analisis Tekstur Permukaan (Tisu, Kardus, Plastik, Styrofoam, B3).
                </p>
              </div>

              {tmFeedback && (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 text-[11px] font-medium text-emerald-900 dark:text-emerald-200">
                  {tmFeedback}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-5 py-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTmUrlInput('');
                  setTeachableMachineUrl('');
                  loadCustomTeachableMachine('');
                  setTmFeedback('Menggunakan model MobileNet + COCO-SSD bawaan.');
                }}
                className="rounded-xl border border-stone-300 dark:border-stone-700 px-3 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Reset Default
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModelConfigOpen(false)}
                  className="rounded-xl px-3 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  disabled={isLoadingTM}
                  onClick={handleSaveTeachableMachine}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isLoadingTM ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Memuat...</span>
                    </>
                  ) : (
                    <span>Simpan & Aktifkan</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
