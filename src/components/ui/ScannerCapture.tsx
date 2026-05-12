'use client';

import React, { useRef, useState } from 'react';
import { Printer, Plus, Trash2, CheckCircle2, Layers, FileImage, AlertCircle, Move } from 'lucide-react';
import toast from 'react-hot-toast';

interface ScannerCaptureProps {
  /** Called when user confirms — passes one File per page */
  onCapture: (pages: File[]) => void;
  /** Max pages allowed (default unlimited) */
  maxPages?: number;
  /** Label shown on the confirm button */
  confirmLabel?: string;
}

type PageItem = {
  id: string;
  file: File;
  preview: string;
};

function fileId() {
  return Math.random().toString(36).slice(2);
}

export default function ScannerCapture({ onCapture, maxPages, confirmLabel = 'Evaluate Scanned Pages' }: ScannerCaptureProps) {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

  async function addFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    const valid = arr.filter((f) => ACCEPTED.includes(f.type));
    const invalid = arr.length - valid.length;

    if (invalid > 0) toast.error(`${invalid} file${invalid > 1 ? 's' : ''} skipped — only JPG, PNG, WEBP, PDF allowed`);
    if (valid.length === 0) return;

    if (maxPages && pages.length + valid.length > maxPages) {
      toast.error(`Maximum ${maxPages} page${maxPages > 1 ? 's' : ''} allowed`);
      return;
    }

    const newItems: PageItem[] = await Promise.all(
      valid.map(async (file) => {
        const preview = await new Promise<string>((resolve) => {
          if (file.type === 'application/pdf') {
            resolve('');
            return;
          }
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
        return { id: fileId(), file, preview };
      })
    );

    setPages((prev) => [...prev, ...newItems]);
    toast.success(`${newItems.length} page${newItems.length > 1 ? 's' : ''} added`);
  }

  function removePage(id: string) {
    setPages((prev) => prev.filter((p) => p.id !== id));
  }

  function movePage(id: string, direction: 'up' | 'down') {
    setPages((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= next.length) return prev;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  }

  function handleConfirm() {
    if (pages.length === 0) {
      toast.error('Add at least one scanned page first');
      return;
    }
    onCapture(pages.map((p) => p.file));
  }

  const totalSize = pages.reduce((s, p) => s + p.file.size, 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Instructions banner */}
      <div className="flex items-start gap-3 p-4 bg-secondary/60 border border-primary/20 rounded-xl">
        <Printer size={20} className="text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-700 text-foreground">How to import scanner output</p>
          <ol className="text-xs text-muted-foreground mt-1 space-y-0.5 list-decimal list-inside">
            <li>Place the answer sheet in your scanner (HP / Canon / Epson / any brand)</li>
            <li>Scan each page — the scanner saves JPG or PDF files to your computer</li>
            <li>Click <strong className="text-foreground">Add Scanned Pages</strong> below and select those files</li>
            <li>Pages are evaluated in order — add them all before confirming</li>
          </ol>
        </div>
      </div>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          dragging
            ? 'border-primary bg-primary/5'
            : pages.length > 0
            ? 'border-positive/50 bg-positive-bg/50'
            : 'border-border hover:border-primary/50 hover:bg-muted/30'
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files?.length) { addFiles(e.target.files); e.target.value = ''; } }}
        />

        {pages.length === 0 ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileImage size={28} className="text-primary" />
            </div>
            <div>
              <p className="font-600 text-foreground">Drop scanned files here</p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse · JPG, PNG, WEBP, PDF · Multiple files at once
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <Plus size={18} className="text-primary" />
            <span className="text-sm font-600 text-primary">Add more scanned pages</span>
          </div>
        )}
      </div>

      {/* Page list */}
      {pages.length > 0 && (
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-primary" />
              <span className="text-xs font-600 text-foreground uppercase tracking-wider">
                {pages.length} Page{pages.length > 1 ? 's' : ''} Ready
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {(totalSize / 1024 / 1024).toFixed(1)} MB total
            </span>
          </div>

          <div className="divide-y divide-border">
            {pages.map((page, idx) => (
              <div key={page.id} className="flex items-center gap-3 px-4 py-2.5 group hover:bg-muted/20 transition-colors">
                {/* Thumbnail */}
                <div className="w-12 h-16 rounded-lg overflow-hidden border border-border shrink-0 bg-muted/30 flex items-center justify-center">
                  {page.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={page.preview} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <FileImage size={18} className="text-muted-foreground" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary text-white text-xs font-700 flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-600 text-foreground truncate">{page.file.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 ml-7">
                    {page.file.type === 'application/pdf' ? 'PDF' : page.file.type.replace('image/', '').toUpperCase()} ·{' '}
                    {(page.file.size / 1024).toFixed(0)} KB
                  </p>
                </div>

                {/* Reorder + Delete */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => movePage(page.id, 'up')}
                    disabled={idx === 0}
                    title="Move up"
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30"
                  >
                    <Move size={12} className="text-muted-foreground rotate-90" />
                  </button>
                  <button
                    onClick={() => movePage(page.id, 'down')}
                    disabled={idx === pages.length - 1}
                    title="Move down"
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30"
                  >
                    <Move size={12} className="text-muted-foreground -rotate-90" />
                  </button>
                  <button
                    onClick={() => removePage(page.id)}
                    title="Remove page"
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-negative-bg transition-colors"
                  >
                    <Trash2 size={12} className="text-negative" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary / tip */}
      {pages.length > 0 && (
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <AlertCircle size={13} className="shrink-0 mt-0.5 text-warning" />
          <span>
            Pages will be evaluated in order (1 → {pages.length}). Drag pages up/down on hover to reorder.
            AI evaluates all pages as one answer sheet.
          </span>
        </div>
      )}

      {/* Confirm button */}
      <button
        onClick={handleConfirm}
        disabled={pages.length === 0}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-600 py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
      >
        <CheckCircle2 size={18} />
        {confirmLabel} ({pages.length} page{pages.length !== 1 ? 's' : ''})
      </button>
    </div>
  );
}
