"use client";

import React from "react";
import { X, Keyboard } from "lucide-react";

interface CBTKeyboardGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CBTKeyboardGuide({
  isOpen,
  onClose,
}: CBTKeyboardGuideProps) {
  if (!isOpen) return null;

  const hotkeys = [
    { key: "A / 1", action: "Select Option A" },
    { key: "B / 2", action: "Select Option B" },
    { key: "C / 3", action: "Select Option C" },
    { key: "D / 4", action: "Select Option D" },
    { key: "N / →", action: "Next Question (Save & Next)" },
    { key: "P / ←", action: "Previous Question" },
    { key: "F / R", action: "Flag / Mark for Review" },
    { key: "Del / Backspace", action: "Clear Selected Answer" },
    { key: "K", action: "Toggle On-Screen Calculator" },
    { key: "E", action: "Toggle Option Eliminator Mode" },
    { key: "S", action: "Open Final Submission Review" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-700 text-neutral-100 rounded-lg max-w-md w-full shadow-2xl overflow-hidden font-mono text-xs">
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-800 border-b border-neutral-700 font-sans">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Keyboard className="w-4 h-4 text-emerald-400" />
            <span>Standard CBT Keyboard Shortcuts</span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2 max-h-[70vh] overflow-y-auto">
          {hotkeys.map((h, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-1.5 border-b border-neutral-800/80 last:border-0"
            >
              <kbd className="px-2 py-1 bg-neutral-800 text-emerald-400 border border-neutral-700 rounded font-bold">
                {h.key}
              </kbd>
              <span className="text-neutral-300 font-sans">{h.action}</span>
            </div>
          ))}
        </div>

        <div className="p-3 bg-neutral-950 border-t border-neutral-800 text-center font-sans text-xs text-neutral-400">
          Press <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded">Esc</kbd> to close this guide
        </div>
      </div>
    </div>
  );
}
