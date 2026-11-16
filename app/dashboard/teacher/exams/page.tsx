"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ExamCard from "@/components/exam/ExamCard";
import Button from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Loader";
import { useToast } from "@/components/ui/Toast";
import { ExamWithDetails } from "@/types";
import { PlusCircle, FileSpreadsheet, Search } from "lucide-react";

export default function TeacherExamsPage() {
  const { addToast } = useToast();
  const [exams, setExams] = useState<ExamWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchExams = async () => {
    try {
      setIsLoading(true);
      const url = statusFilter !== "ALL" ? `/api/exams?status=${statusFilter}` : "/api/exams";
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setExams(json.data);
      }
    } catch {
      addToast("Failed to fetch exams", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [statusFilter]);

  const filteredExams = exams.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Exam Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Author questions, publish tests, and review student grades
          </p>
        </div>
        <Link href="/dashboard/teacher/exams/create">
          <Button variant="primary" className="gap-2 shadow-sm shadow-indigo-600/20">
            <PlusCircle className="w-4 h-4" />
            <span>Create New Exam</span>
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl overflow-x-auto w-full sm:w-auto">
          {["ALL", "ACTIVE", "PUBLISHED", "DRAFT", "COMPLETED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab === "ALL" ? "All Statuses" : tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search exams or subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-300 focus:border-indigo-500 focus:outline-none bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <PageLoader />
      ) : filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} role="TEACHER" />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-3 stroke-1" />
          <p className="text-sm font-semibold text-gray-700">No exams found</p>
          <p className="text-xs text-gray-400 mt-1">
            {searchQuery
              ? "No exams match your search criteria."
              : "No exams under this status filter."}
          </p>
        </div>
      )}
    </div>
  );
}
