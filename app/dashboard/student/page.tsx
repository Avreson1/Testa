"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Loader";
import { AttemptWithDetails } from "@/types";
import { formatDate, getGrade } from "@/lib/utils";
import {
  ClipboardCheck,
  Award,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface StudentStats {
  availableExams: number;
  completedExams: number;
  averageScore: number;
  recentAttempts: AttemptWithDetails[];
}

export default function StudentDashboard() {
  const [stats, setStats] = useState<StudentStats | null>(null);
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
        console.error("Failed to load student stats", err);
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
            Student Examination Portal
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Access active tests, review completed scorecards, and monitor your academic progress
          </p>
        </div>
        <Link href="/dashboard/student/exams">
          <Button variant="primary" className="gap-2 shadow-sm shadow-indigo-600/20">
            <ClipboardCheck className="w-4 h-4" />
            <span>Enter Examination Hall</span>
          </Button>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Available Tests
            </span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 mt-3">
            {stats?.availableExams ?? 0}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-indigo-600 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Ready for examination</span>
          </div>
        </Card>

        <Card className="hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Completed Papers
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 mt-3">
            {stats?.completedExams ?? 0}
          </p>
          <p className="text-xs text-gray-400 mt-2">Graded submissions</p>
        </Card>

        <Card className="hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Overall Grade Point
            </span>
            <div className="h-9 w-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 mt-3">
            {stats?.averageScore ?? 0}%
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-violet-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Cumulative Average</span>
          </div>
        </Card>
      </div>

      {/* Recent Submissions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Recent Test Submissions</h2>
          <Link
            href="/dashboard/student/results"
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <span>Full Results History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats?.recentAttempts && stats.recentAttempts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.recentAttempts.map((attempt) => {
              const grade = getGrade(attempt.percentage ?? 0);
              const isPass = (attempt.score ?? 0) >= (attempt.exam.passMarks ?? 0);

              return (
                <Card
                  key={attempt.id}
                  padding="md"
                  className="rounded-2xl border-gray-200 hover:border-indigo-200 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                        {attempt.exam.subject.name}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          isPass
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        Grade {grade}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 line-clamp-1">
                      {attempt.exam.title}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Completed {formatDate(attempt.submittedAt || attempt.createdAt || attempt.startedAt)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-gray-100">
                    <span className="text-sm font-semibold text-gray-700">
                      Score: {attempt.score ?? 0} / {attempt.totalMarks} (
                      {(attempt.percentage ?? 0).toFixed(0)}%)
                    </span>
                    <Link href={`/dashboard/student/results`}>
                      <Button size="sm" variant="outline" className="text-xs">
                        Review Paper
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
            <ClipboardCheck className="w-10 h-10 text-gray-300 mx-auto mb-2 stroke-1" />
            <p className="text-sm font-semibold text-gray-700">No tests taken yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Head over to the Examination Hall to take available tests.
            </p>
            <Link href="/dashboard/student/exams" className="mt-3 inline-block">
              <Button size="sm" variant="primary">
                View Available Exams
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
