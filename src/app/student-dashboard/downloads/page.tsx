'use client';

import React from 'react';
import { Download, FileText } from 'lucide-react';

export default function DownloadsPage() {
  return (
    <div className="px-8 py-6 max-w-screen-xl mx-auto">
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-bold text-foreground text-sm">Available Downloads</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Download your evaluated answer sheets and reports</p>
        </div>

        <div className="px-6 py-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <Download size={28} className="text-orange-400" />
          </div>
          <h3 className="font-bold text-foreground mb-2">No Downloads Available</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Evaluated answer sheets and reports will be available for download here once your teacher completes the grading.
          </p>
        </div>
      </div>
    </div>
  );
}
