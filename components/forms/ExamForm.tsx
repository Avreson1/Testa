"use client";

import React, { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { SubjectData, ExamWithDetails } from "@/types";
import { Clock, Award, ShieldAlert } from "lucide-react";

interface ExamFormProps {
  initialData?: ExamWithDetails | null;
  onSuccess: (savedExamId?: string) => void;
  onCancel: () => void;
}

export default function ExamForm({
  initialData,
  onSuccess,
  onCancel,
}: ExamFormProps) {
  const { addToast } = useToast();
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    subjectId: initialData?.subjectId || "",
    duration: initialData?.duration || 30,
    totalMarks: initialData?.totalMarks || 100,
    passMarks: initialData?.passMarks || 50,
    shuffleQuestions: initialData?.shuffleQuestions ?? true,
    showResults: initialData?.showResults ?? true,
  });

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const res = await fetch("/api/subjects");
        const data = await res.json();
        if (data.success && data.data) {
          setSubjects(data.data);
          if (!formData.subjectId && data.data.length > 0) {
            setFormData((prev) => ({ ...prev, subjectId: data.data[0].id }));
          }
        }
      } catch {
        addToast("Failed to fetch subjects list", "error");
      } finally {
        setIsLoadingSubjects(false);
      }
    }
    fetchSubjects();
  }, [addToast, formData.subjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subjectId) {
      addToast("Please select a valid subject", "warning");
      return;
    }

    try {
      setIsLoading(true);
      const url = initialData ? `/api/exams/${initialData.id}` : "/api/exams";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          duration: Number(formData.duration),
          totalMarks: Number(formData.totalMarks),
          passMarks: Number(formData.passMarks),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save exam");
      }

      addToast(
        initialData ? "Exam configuration updated!" : "Exam successfully created!",
        "success"
      );
      onSuccess(data.data?.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving exam";
      addToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Exam Title"
        placeholder="e.g. Advanced Trigonometry Final Examination"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />

      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Detailed Description / Instructions
        </label>
        <textarea
          rows={3}
          placeholder="Enter instructions for students (e.g. No external calculators allowed)..."
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Subject"
          options={subjects.map((s) => ({ value: s.id, label: `${s.name} (${s.code})` }))}
          value={formData.subjectId}
          onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
          placeholder={isLoadingSubjects ? "Loading subjects..." : "Select Subject"}
          required
        />

        <Input
          label="Duration (Minutes)"
          type="number"
          min="1"
          max="360"
          value={formData.duration}
          onChange={(e) =>
            setFormData({ ...formData, duration: Number(e.target.value) })
          }
          leftIcon={<Clock className="w-4 h-4" />}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Total Marks"
          type="number"
          min="1"
          value={formData.totalMarks}
          onChange={(e) =>
            setFormData({ ...formData, totalMarks: Number(e.target.value) })
          }
          leftIcon={<Award className="w-4 h-4" />}
          required
        />

        <Input
          label="Pass Marks"
          type="number"
          min="0"
          value={formData.passMarks}
          onChange={(e) =>
            setFormData({ ...formData, passMarks: Number(e.target.value) })
          }
          leftIcon={<ShieldAlert className="w-4 h-4" />}
          required
        />
      </div>

      {/* Toggles */}
      <div className="pt-2 space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.shuffleQuestions}
            onChange={(e) =>
              setFormData({ ...formData, shuffleQuestions: e.target.checked })
            }
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Randomize question order for each student
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.showResults}
            onChange={(e) =>
              setFormData({ ...formData, showResults: e.target.checked })
            }
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Show instant detailed score & corrections immediately upon submission
          </span>
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? "Save Changes" : "Create & Add Questions"}
        </Button>
      </div>
    </form>
  );
}
