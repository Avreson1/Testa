"use client";

import React, { useEffect, useState } from "react";
import ExamCard from "@/components/exam/ExamCard";
import { PageLoader } from "@/components/ui/Loader";
import { useToast } from "@/components/ui/Toast";
import { ExamWithDetails, AttemptWithDetails } from "@/types";
import { ClipboardCheck, Search } from "lucide-react";

export default function StudentExamsPage() {
  const { addToast } = useToast();
  const [exams, setExams] = useState<ExamWithDetails[]>([]);
  const [attempts, setAttempts] = useState<AttemptWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [examsRes, attemptsRes] = await Promise.all([
          fetch("/api/exams"),
          fetch("/api/results"),
        ]);

        const examsJson = await examsRes.json();
        const attemptsJson = await attemptsRes.json();

        if (examsJson.success && examsJson.data) setExams(examsJson.data);
        if (attemptsJson.success && attemptsJson.data) setAttempts(attemptsJson.data);
      } catch {
        addToast("Failed to fetch available exams", "error");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [addToast]);

  const attemptedExamIds = new Set(attempts.map((a) => a.examId));

  const filteredExams = exams.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Examination Hall
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Current and upcoming assessments scheduled for your institution
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search exams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-300 focus:border-indigo-500 focus:outline-none bg-white shadow-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              role="STUDENT"
              hasAttempted={attemptedExamIds.has(exam.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-3 stroke-1" />
          <p className="text-sm font-semibold text-gray-700">No active tests available</p>
          <p className="text-xs text-gray-400 mt-1">
            {searchQuery
              ? "No exams match your search query."
              : "Check back later when teachers schedule and publish assessments."}
          </p>
        </div>
      )}
    </div>
  );
}
