"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import DataTable, { Column } from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import ExamResults from "@/components/exam/ExamResults";
import { PageLoader } from "@/components/ui/Loader";
import { useToast } from "@/components/ui/Toast";
import { AttemptWithDetails, ExamWithDetails } from "@/types";
import { formatDateTime, getGrade, getInitials } from "@/lib/utils";
import { ArrowLeft, Users, Award, TrendingUp, Eye, CheckCircle2 } from "lucide-react";

export default function ExamResultsPage() {
  const params = useParams();
  const { addToast } = useToast();
  const examId = params.id as string;

  const [exam, setExam] = useState<ExamWithDetails | null>(null);
  const [attempts, setAttempts] = useState<AttemptWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState<AttemptWithDetails | null>(null);

  const fetchResults = useCallback(async () => {
    try {
      setIsLoading(true);
      const [examRes, attemptsRes] = await Promise.all([
        fetch(`/api/exams/${examId}`),
        fetch(`/api/results?examId=${examId}`),
      ]);

      const examJson = await examRes.json();
      const attemptsJson = await attemptsRes.json();

      if (examJson.success) setExam(examJson.data);
      if (attemptsJson.success) setAttempts(attemptsJson.data || []);
    } catch {
      addToast("Failed to fetch assessment results", "error");
    } finally {
      setIsLoading(false);
    }
  }, [examId, addToast]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Compute Analytics
  const totalSubmissions = attempts.length;
  const avgPercentage =
    totalSubmissions > 0
      ? Math.round(
          attempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0) /
            totalSubmissions
        )
      : 0;

  const passedCount = attempts.filter(
    (a) => (a.score ?? 0) >= (exam?.passMarks ?? 0)
  ).length;

  const passRate =
    totalSubmissions > 0
      ? Math.round((passedCount / totalSubmissions) * 100)
      : 0;

  const highestScore = attempts.reduce(
    (max, curr) => Math.max(max, curr.score || 0),
    0
  );

  const columns: Column<AttemptWithDetails>[] = [
    {
      key: "student",
      header: "Candidate Name",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs">
            {item.student?.name ? getInitials(item.student.name) : "S"}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{item.student?.name || "Student"}</p>
            <p className="text-xs text-gray-400 font-mono">{item.student?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "score",
      header: "Score / Total",
      render: (item) => (
        <span className="font-bold text-gray-900">
          {item.score ?? 0} <span className="text-gray-400 font-normal">/ {item.totalMarks}</span>
        </span>
      ),
    },
    {
      key: "percentage",
      header: "Percentage",
      render: (item) => (
        <span className="font-semibold text-indigo-600">
          {(item.percentage ?? 0).toFixed(1)}%
        </span>
      ),
    },
    {
      key: "grade",
      header: "Grade",
      render: (item) => {
        const grade = getGrade(item.percentage ?? 0);
        const isPass = (item.score ?? 0) >= (exam?.passMarks ?? 0);
        return (
          <Badge variant={isPass ? "success" : "danger"}>
            Grade {grade}
          </Badge>
        );
      },
    },
    {
      key: "submittedAt",
      header: "Submitted At",
      render: (item) => (
        <span className="text-xs text-gray-500">
          {item.submittedAt ? formatDateTime(item.submittedAt) : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Audit",
      className: "text-right",
      render: (item) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setSelectedAttempt(item)}
          className="gap-1 text-xs"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Review Paper</span>
        </Button>
      ),
    },
  ];

  if (isLoading || !exam) return <PageLoader />;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <Link href={`/dashboard/teacher/exams/${examId}`}>
          <Button variant="ghost" size="sm" className="gap-1.5 text-gray-500">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Exam Studio</span>
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
          Assessment Gradebook
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
          {exam.title} - Results
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Subject: {exam.subject.name} • Total Marks: {exam.totalMarks} • Pass Requirement: {exam.passMarks}
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <Card className="hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Submissions
            </span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{totalSubmissions}</p>
        </Card>

        <Card className="hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Average Score
            </span>
            <div className="h-8 w-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{avgPercentage}%</p>
        </Card>

        <Card className="hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Pass Rate
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{passRate}%</p>
        </Card>

        <Card className="hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Highest Score
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{highestScore} <span className="text-xs text-gray-400 font-normal">pts</span></p>
        </Card>
      </div>

      {/* DataTable */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Candidate Grade Sheet</h2>
        <DataTable
          columns={columns}
          data={attempts}
          emptyMessage="No student attempts submitted yet for this exam."
        />
      </div>

      {/* Review Modal */}
      {selectedAttempt && (
        <Modal
          isOpen={!!selectedAttempt}
          onClose={() => setSelectedAttempt(null)}
          title={`Candidate Submission Review - ${selectedAttempt.student?.name}`}
          size="xl"
        >
          <ExamResults attempt={selectedAttempt} backHref={`#`} />
        </Modal>
      )}
    </div>
  );
}
