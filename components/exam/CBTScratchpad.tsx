"use client";

import React from "react";
import { X, FileText, Trash2 } from "lucide-react";

interface CBTScratchpadProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (val: string) => void;
}

export default function CBTScratchpad({
  isOpen,
  onClose,
  value,
  onChange,
}: CBTScratchpadProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 w-96 bg-neutral-900 text-white rounded-lg shadow-2xl border border-neutral-700 font-mono select-none overflow-hidden text-xs">
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-800 border-b border-neutral-700">
        <div className="flex items-center gap-1.5 font-sans font-bold text-neutral-300">
          <FileText className="w-3.5 h-3.5 text-neutral-400" />
          <span>Candidate Rough Scratchpad</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChange("")}
            className="text-neutral-400 hover:text-rose-400 p-1 rounded transition-colors"
            title="Clear Scratchpad"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded transition-colors"
            title="Close Scratchpad"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-3 bg-neutral-950">
        <textarea
          rows={10}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Draft rough calculations or formula workings here (auto-saved locally)..."
          className="w-full bg-neutral-900 border border-neutral-800 text-neutral-100 rounded p-2 text-xs font-mono focus:border-neutral-600 focus:outline-none resize-none"
        />
        <div className="mt-2 text-[10px] text-neutral-500 flex items-center justify-between">
          <span>{value.length} characters</span>
          <span>Drafts are not submitted for grading</span>
        </div>
      </div>
    </div>
  );
}
