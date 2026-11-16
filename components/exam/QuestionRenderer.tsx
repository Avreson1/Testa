"use client";

import React from "react";
import { StudentExamQuestion, QuestionData } from "@/types";
import { cn } from "@/lib/utils";
import { Check, CheckCircle2 } from "lucide-react";

interface QuestionRendererProps {
  question: StudentExamQuestion | QuestionData;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string;
  onAnswerChange: (answer: string) => void;
}

export default function QuestionRenderer({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerChange,
}: QuestionRendererProps) {
  let parsedOptions: string[] = [];
  if (question.options) {
    if (Array.isArray(question.options)) {
      parsedOptions = question.options;
    } else if (typeof question.options === "string") {
      try {
        parsedOptions = JSON.parse(question.options);
      } catch {
        parsedOptions = [];
      }
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 sm:p-8">
      {/* Question Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-600 text-white font-bold text-sm">
            {questionNumber}
          </span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            of {totalQuestions} Questions
          </span>
        </div>
        <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
          {question.marks} {question.marks === 1 ? "Mark" : "Marks"}
        </span>
      </div>

      {/* Question Prompt */}
      <h2 className="text-lg sm:text-xl font-medium text-gray-900 leading-relaxed mb-8">
        {question.text}
      </h2>

      {/* Options according to type */}
      {question.type === "MCQ" && (
        <div className="space-y-3">
          {parsedOptions.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D

            return (
              <label
                key={idx}
                onClick={() => onAnswerChange(option)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer select-none",
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/50 shadow-sm shadow-indigo-600/10"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/60"
                )}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition-colors",
                    isSelected
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-gray-300 bg-white text-gray-600"
                  )}
                >
                  {isSelected ? <Check className="w-4 h-4" /> : optionLetter}
                </div>
                <span
                  className={cn(
                    "text-sm sm:text-base leading-snug flex-1",
                    isSelected ? "font-semibold text-indigo-950" : "text-gray-700"
                  )}
                >
                  {option}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {question.type === "TRUE_FALSE" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["True", "False"].map((opt) => {
            const isSelected = selectedAnswer.toLowerCase() === opt.toLowerCase();

            return (
              <button
                type="button"
                key={opt}
                onClick={() => onAnswerChange(opt)}
                className={cn(
                  "flex items-center justify-center gap-3 p-5 rounded-xl border-2 font-semibold text-base transition-all cursor-pointer",
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/60 text-indigo-900 shadow-sm shadow-indigo-600/10"
                    : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      )}

      {question.type === "FILL_BLANK" && (
        <div className="max-w-md">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Type your answer below:
          </label>
          <input
            type="text"
            value={selectedAnswer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Type answer here..."
            className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-base text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-0 shadow-sm"
            autoFocus
          />
          <p className="mt-2 text-xs text-gray-400">
            Ensure spelling matches the expected answer. Case is usually insensitive.
          </p>
        </div>
      )}
    </div>
  );
}
