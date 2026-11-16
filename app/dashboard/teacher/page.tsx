"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ExamCard from "@/components/exam/ExamCard";
import { PageLoader } from "@/components/ui/Loader";
import { ExamWithDetails } from "@/types";
import {
  FileSpreadsheet,
  Users,
  Award,
  PlusCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface TeacherStats {
  totalExams: number;
  totalAttempts: number;
  averageScore: number;
  recentExams: ExamWithDetails[];
}

export default function TeacherDashboard() {
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/dashboard");
        const json = await res.json();
        if (json.success && json.data) {
          setStats(json.data);
        }
      } catch (err) {
        console.error("Failed to load teacher stats", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Teacher Workspace
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Author assessments, monitor live testing sessions, and inspect student performance
          </p>
        </div>
        <Link href="/dashboard/teacher/exams/create">
          <Button variant="primary" className="gap-2 shadow-sm shadow-indigo-600/20">
            <PlusCircle className="w-4 h-4" />
            <span>Create New Exam</span>
          </Button>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Authored Exams
            </span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 mt-3">
            {stats?.totalExams ?? 0}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-indigo-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Total assessments created</span>
          </div>
        </Card>

        <Card className="hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Student Submissions
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 mt-3">
            {stats?.totalAttempts ?? 0}
          </p>
          <p className="text-xs text-gray-400 mt-2">Completed evaluations</p>
        </Card>

        <Card className="hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Class Average
            </span>
            <div className="h-9 w-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 mt-3">
            {stats?.averageScore ?? 0}%
          </p>
          <p className="text-xs text-gray-400 mt-2">Overall cohort accuracy</p>
        </Card>
      </div>

      {/* Recent Exams Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Recent Examinations</h2>
          <Link
            href="/dashboard/teacher/exams"
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <span>View All Exams</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats?.recentExams && stats.recentExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.recentExams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} role="TEACHER" />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
            <FileSpreadsheet className="w-10 h-10 text-gray-400 mx-auto mb-2 stroke-1" />
            <p className="text-sm font-medium text-gray-600">No exams authored yet.</p>
            <Link href="/dashboard/teacher/exams/create" className="mt-3 inline-block">
              <Button size="sm" variant="primary">
                Create First Exam
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
