'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, X, RotateCcw, CheckCircle2, Layers, Trash2, ZoomIn, FlipHorizontal, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface CameraScannerProps {
  onCapture: (pages: { file: File; dataUrl: string }[]) => void;
  confirmLabel?: string;
  maxPages?: number;
}

type CapturedPage = {
  id: string;
  dataUrl: string;
  file: File;
};

function pageId() {
  return Math.random().toString(36).slice(2);
}

export default function CameraScanner({ onCapture, confirmLabel = 'Evaluate Captured Pages', maxPages }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [capturedPages, setCapturedPages] = useState<CapturedPage[]>([]);
  const [previewPage, setPreviewPage] = useState<CapturedPage | null>(null);
  const [flashActive, setFlashActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isMirrored, setIsMirrored] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => { stopCamera(); };
  }, [stopCamera]);

  async function startCamera() {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      const msg =
        err?.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in browser settings and try again.'
          : err?.name === 'NotFoundError'
          ? 'No camera found on this device.'
          : 'Could not start camera. Please check camera permissions.';
      setCameraError(msg);
      setCameraActive(false);
    }
  }

  async function switchCamera() {
    stopCamera();
    const next: 'environment' | 'user' = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    setTimeout(() => startCamera(), 150);
  }

  function captureFrame() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    if (maxPages && capturedPages.length >= maxPages) {
      toast.error(`Maximum ${maxPages} page${maxPages > 1 ? 's' : ''} allowed`);
      return;
    }

    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d')!;
    if (isMirrored) {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, w, h);
    if (isMirrored) ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Flash effect
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 250);

    canvas.toBlob(
      (blob) => {
        if (!blob) { toast.error('Failed to capture image'); return; }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const file = new File([blob], `scan-page-${capturedPages.length + 1}-${timestamp}.jpg`, { type: 'image/jpeg' });
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        const page: CapturedPage = { id: pageId(), dataUrl, file };
        setCapturedPages((prev) => [...prev, page]);
        toast.success(`Page ${capturedPages.length + 1} captured`);
      },
      'image/jpeg',
      0.92
    );
  }

  function removePage(id: string) {
    setCapturedPages((prev) => prev.filter((p) => p.id !== id));
    if (previewPage?.id === id) setPreviewPage(null);
  }

  function handleConfirm() {
    if (capturedPages.length === 0) {
      toast.error('Capture at least one page first');
      return;
    }
    stopCamera();
    onCapture(capturedPages.map((p) => ({ file: p.file, dataUrl: p.dataUrl })));
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Camera viewport */}
      <div className="relative rounded-2xl overflow-hidden bg-black border border-border" style={{ aspectRatio: '16/9', minHeight: 240 }}>

        {/* Video feed */}
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: isMirrored ? 'scaleX(-1)' : 'none', display: cameraActive ? 'block' : 'none' }}
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Flash overlay */}
        {flashActive && (
          <div className="absolute inset-0 bg-white opacity-70 pointer-events-none transition-opacity" />
        )}

        {/* Corner guides (document framing) */}
        {cameraActive && (
          <div className="absolute inset-0 pointer-events-none">
            {/* top-left */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/70 rounded-tl-sm" />
            {/* top-right */}
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/70 rounded-tr-sm" />
            {/* bottom-left */}
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/70 rounded-bl-sm" />
            {/* bottom-right */}
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white/70 rounded-br-sm" />
            <p className="absolute bottom-6 left-0 right-0 text-center text-white/60 text-xs">
              Align answer paper within guides
            </p>
          </div>
        )}

        {/* Idle / error state */}
        {!cameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-muted/20">
            {cameraError ? (
              <div className="flex flex-col items-center gap-3 px-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-negative-bg flex items-center justify-center">
                  <AlertCircle size={28} className="text-negative" />
                </div>
                <p className="text-sm font-600 text-foreground">Camera unavailable</p>
                <p className="text-xs text-muted-foreground">{cameraError}</p>
                <button
                  onClick={startCamera}
                  className="mt-1 px-4 py-2 bg-primary text-primary-foreground text-sm font-600 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Camera size={32} className="text-primary" />
                </div>
                <p className="text-sm font-600 text-foreground">Camera is off</p>
                <p className="text-xs text-muted-foreground">Tap Start Camera to begin scanning</p>
              </div>
            )}
          </div>
        )}

        {/* Top controls */}
        {cameraActive && (
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={() => setIsMirrored((m) => !m)}
              title="Mirror camera"
              className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <FlipHorizontal size={16} className="text-white" />
            </button>
            <button
              onClick={switchCamera}
              title="Switch camera"
              className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <RotateCcw size={16} className="text-white" />
            </button>
            <button
              onClick={stopCamera}
              title="Turn off camera"
              className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center hover:bg-red-600/70 transition-colors"
            >
              <X size={16} className="text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        {!cameraActive ? (
          <button
            onClick={startCamera}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-600 py-3 rounded-xl hover:bg-primary/90 transition-colors text-sm"
          >
            <Camera size={18} />
            Start Camera
          </button>
        ) : (
          <>
            {/* Shutter button */}
            <button
              onClick={captureFrame}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-900 font-700 py-3 rounded-xl hover:bg-gray-100 transition-colors border-2 border-primary text-sm shadow-md"
            >
              <div className="w-5 h-5 rounded-full bg-primary" />
              Capture Page {capturedPages.length + 1}
            </button>
            <button
              onClick={stopCamera}
              className="px-4 py-3 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-600 text-muted-foreground"
            >
              Stop
            </button>
          </>
        )}
      </div>

      {/* Captured pages strip */}
      {capturedPages.length > 0 && (
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-primary" />
              <span className="text-xs font-600 text-foreground uppercase tracking-wider">
                {capturedPages.length} Page{capturedPages.length > 1 ? 's' : ''} Captured
              </span>
            </div>
          </div>

          {/* Horizontal scroll strip */}
          <div className="flex gap-3 p-3 overflow-x-auto">
            {capturedPages.map((page, idx) => (
              <div key={page.id} className="relative shrink-0 group">
                <div
                  className="w-20 h-28 rounded-lg overflow-hidden border-2 border-border cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setPreviewPage(page)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={page.dataUrl} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-primary text-white text-xs font-700 flex items-center justify-center">
                  {idx + 1}
                </div>
                <div className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => removePage(page.id)}
                    className="w-5 h-5 rounded-full bg-negative text-white flex items-center justify-center hover:bg-red-700 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </div>
                {/* View full button */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg flex items-center justify-center">
                  <ZoomIn size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 pb-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <AlertCircle size={11} className="text-warning shrink-0" />
              Tap a thumbnail to preview full size. Pages evaluated in order (1 → {capturedPages.length}).
            </p>
          </div>
        </div>
      )}

      {/* Confirm button */}
      {capturedPages.length > 0 && (
        <button
          onClick={handleConfirm}
          className="w-full flex items-center justify-center gap-2 bg-positive text-white font-600 py-3 rounded-xl hover:bg-positive/90 transition-colors text-sm"
        >
          <CheckCircle2 size={18} />
          {confirmLabel} ({capturedPages.length} page{capturedPages.length !== 1 ? 's' : ''})
        </button>
      )}

      {/* Full-size preview modal */}
      {previewPage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewPage(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewPage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 flex items-center gap-1.5 text-sm"
            >
              <X size={16} /> Close
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewPage.dataUrl}
              alt="Preview"
              className="w-full rounded-xl border border-border"
            />
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => { removePage(previewPage.id); setPreviewPage(null); }}
                className="flex items-center gap-2 px-4 py-2 bg-negative text-white rounded-lg text-sm font-600 hover:bg-red-700 transition-colors"
              >
                <Trash2 size={14} />
                Delete Page
              </button>
              <button
                onClick={() => setPreviewPage(null)}
                className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-600 hover:bg-muted transition-colors"
              >
                Keep Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
