"use client";

import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { QuestionData } from "@/types";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";

interface QuestionFormProps {
  examId: string;
  initialData?: QuestionData | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function QuestionForm({
  examId,
  initialData,
  onSuccess,
  onCancel,
}: QuestionFormProps) {
  const { addToast } = useToast();

  const getInitialOptions = (): string[] => {
    if (!initialData?.options) return ["Option A", "Option B", "Option C", "Option D"];
    if (Array.isArray(initialData.options)) return initialData.options;
    try {
      return JSON.parse(initialData.options);
    } catch {
      return ["Option A", "Option B", "Option C", "Option D"];
    }
  };

  const [formData, setFormData] = useState({
    text: initialData?.text || "",
    type: initialData?.type || "MCQ",
    options: getInitialOptions(),
    correctAnswer: initialData?.correctAnswer || "",
    marks: initialData?.marks || 5,
    explanation: initialData?.explanation || "",
    order: initialData?.order || 0,
  });

  const [isLoading, setIsLoading] = useState(false);

  const typeOptions = [
    { value: "MCQ", label: "Multiple Choice (MCQ)" },
    { value: "TRUE_FALSE", label: "True / False" },
    { value: "FILL_BLANK", label: "Fill-in-the-Blank" },
  ];

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...formData.options];
    updated[index] = value;
    setFormData({ ...formData, options: updated });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, `Option ${String.fromCharCode(65 + formData.options.length)}`],
    });
  };

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) {
      addToast("MCQ must have at least 2 options", "warning");
      return;
    }
    const updated = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.text.trim()) {
      addToast("Please provide question text", "warning");
      return;
    }

    if (!formData.correctAnswer.trim()) {
      addToast("Please specify the correct answer", "warning");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`/api/exams/${examId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: initialData?.id,
          ...formData,
          marks: Number(formData.marks),
          options: formData.type === "MCQ" ? formData.options : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save question");
      }

      addToast("Question saved successfully!", "success");
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving question";
      addToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question Prompt / Text
        </label>
        <textarea
          rows={3}
          placeholder="e.g. Which planetary body in our solar system possesses the highest orbital eccentricity?"
          value={formData.text}
          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Question Type"
          options={typeOptions}
          value={formData.type}
          onChange={(e) => {
            const newType = e.target.value as "MCQ" | "TRUE_FALSE" | "FILL_BLANK";
            setFormData({
              ...formData,
              type: newType,
              correctAnswer: newType === "TRUE_FALSE" ? "True" : "",
            });
          }}
        />

        <Input
          label="Points / Marks Awarded"
          type="number"
          min="1"
          value={formData.marks}
          onChange={(e) =>
            setFormData({ ...formData, marks: Number(e.target.value) })
          }
          required
        />
      </div>

      {/* MCQ Options Builder */}
      {formData.type === "MCQ" && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Multiple Choice Options
            </label>
            <button
              type="button"
              onClick={addOption}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Option</span>
            </button>
          </div>

          <div className="space-y-2">
            {formData.options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <button
                  type="button"
                  title="Mark as correct answer"
                  onClick={() => setFormData({ ...formData, correctAnswer: opt })}
                  className={`p-2 rounded-lg border transition-colors ${
                    formData.correctAnswer === opt
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-gray-100 text-gray-400 hover:text-gray-600 border-gray-200"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeOption(idx)}
                  className="p-2 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500">
            Click the checkmark icon next to the option that is the correct answer.
          </p>
        </div>
      )}

      {/* True/False selection */}
      {formData.type === "TRUE_FALSE" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Correct Answer
          </label>
          <div className="grid grid-cols-2 gap-3">
            {["True", "False"].map((val) => (
              <button
                type="button"
                key={val}
                onClick={() => setFormData({ ...formData, correctAnswer: val })}
                className={`py-3 rounded-lg border font-semibold text-sm transition-all ${
                  formData.correctAnswer === val
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fill In Blank */}
      {formData.type === "FILL_BLANK" && (
        <Input
          label="Correct Word / Text (Case insensitive)"
          placeholder="e.g. Mitochondria"
          value={formData.correctAnswer}
          onChange={(e) =>
            setFormData({ ...formData, correctAnswer: e.target.value })
          }
          helperText="Student submissions matching this exact text will receive full marks."
          required
        />
      )}

      {/* Explanation */}
      <div className="w-full pt-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Explanation / Solution Notes (Shown in results)
        </label>
        <textarea
          rows={2}
          placeholder="Explain why this answer is correct..."
          value={formData.explanation}
          onChange={(e) =>
            setFormData({ ...formData, explanation: e.target.value })
          }
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? "Update Question" : "Save Question"}
        </Button>
      </div>
    </form>
  );
}
