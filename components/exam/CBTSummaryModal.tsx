"use client";

import React from "react";
import { StudentExamQuestion } from "@/types";
import { X, CheckCircle2, AlertTriangle } from "lucide-react";

interface CBTSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: StudentExamQuestion[];
  answers: Record<string, string>;
  flagged: Record<string, boolean>;
  visited: Record<string, boolean>;
  onJumpToQuestion: (index: number) => void;
  onConfirmSubmit: () => void;
  isSubmitting: boolean;
}

export default function CBTSummaryModal({
  isOpen,
  onClose,
  questions,
  answers,
  flagged,
  visited,
  onJumpToQuestion,
  onConfirmSubmit,
  isSubmitting,
}: CBTSummaryModalProps) {
  if (!isOpen) return null;

  const totalQuestions = questions.length;
  const answeredCount = questions.filter((q) => !!answers[q.id]?.trim()).length;
  const flaggedCount = questions.filter((q) => !!flagged[q.id]).length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-700 text-neutral-100 rounded-lg max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-800 border-b border-neutral-700">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide uppercase">
              Examination Paper Submission Summary
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Review your question responses before final grading. Click any row to revise.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-neutral-950 border-b border-neutral-800 text-center font-mono">
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded">
            <span className="text-[10px] uppercase text-neutral-400 block">Total Answered</span>
            <span className="text-xl font-bold text-emerald-400">{answeredCount}</span>
            <span className="text-[10px] text-neutral-500 block">of {totalQuestions} questions</span>
          </div>
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded">
            <span className="text-[10px] uppercase text-neutral-400 block">Unanswered</span>
            <span className={`text-xl font-bold ${unansweredCount > 0 ? "text-rose-400" : "text-neutral-300"}`}>
              {unansweredCount}
            </span>
            <span className="text-[10px] text-neutral-500 block">missing responses</span>
          </div>
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded">
            <span className="text-[10px] uppercase text-neutral-400 block">Flagged for Review</span>
            <span className="text-xl font-bold text-amber-400">{flaggedCount}</span>
            <span className="text-[10px] text-neutral-500 block">marked items</span>
          </div>
        </div>

        {/* Audit List */}
        <div className="p-4 overflow-y-auto flex-1 font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead className="bg-neutral-800/80 sticky top-0 text-[11px] text-neutral-400 uppercase tracking-wider">
              <tr>
                <th className="p-2 border-b border-neutral-700">Q#</th>
                <th className="p-2 border-b border-neutral-700">Type</th>
                <th className="p-2 border-b border-neutral-700">Status</th>
                <th className="p-2 border-b border-neutral-700">Recorded Response</th>
                <th className="p-2 border-b border-neutral-700 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id]?.trim();
                const isFlagged = !!flagged[q.id];
                const isVisited = !!visited[q.id];

                let statusBadge = (
                  <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[10px]">
                    Not Visited
                  </span>
                );

                if (isAnswered && isFlagged) {
                  statusBadge = (
                    <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 text-[10px] font-bold">
                      Answered & Flagged
                    </span>
                  );
                } else if (isAnswered) {
                  statusBadge = (
                    <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 text-[10px] font-bold">
                      Answered
                    </span>
                  );
                } else if (isFlagged) {
                  statusBadge = (
                    <span className="px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 text-[10px] font-bold">
                      Flagged
                    </span>
                  );
                } else if (isVisited) {
                  statusBadge = (
                    <span className="px-2 py-0.5 rounded bg-rose-900/40 text-rose-300 text-[10px]">
                      Not Answered
                    </span>
                  );
                }

                return (
                  <tr
                    key={q.id}
                    onClick={() => {
                      onJumpToQuestion(idx);
                      onClose();
                    }}
                    className="hover:bg-neutral-800/50 cursor-pointer transition-colors"
                  >
                    <td className="p-2 font-bold text-white">Question {idx + 1}</td>
                    <td className="p-2 text-neutral-400">{q.type}</td>
                    <td className="p-2">{statusBadge}</td>
                    <td className="p-2 text-neutral-300 truncate max-w-xs">
                      {answers[q.id] || (
                        <span className="text-neutral-600 italic">No response</span>
                      )}
                    </td>
                    <td className="p-2 text-right">
                      <span className="text-emerald-400 hover:text-emerald-300 text-[11px] underline">
                        Jump →
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Warning & Submit Action */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-neutral-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Once submitted, all responses are permanently locked and sent for immediate grading.
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-mono font-bold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
            >
              Back to Test
            </button>
            <button
              onClick={onConfirmSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-mono font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded shadow transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Finalizing..." : "Confirm & Finalize Submission"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
