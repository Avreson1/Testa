"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import CBTTestEnvironment from "@/components/exam/CBTTestEnvironment";
import { PageLoader } from "@/components/ui/Loader";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ExamWithDetails, StudentExamQuestion } from "@/types";
import { shuffleArray } from "@/lib/utils";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function TakeExamPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const examId = params.id as string;

  const [exam, setExam] = useState<ExamWithDetails | null>(null);
  const [initialAttempt, setInitialAttempt] = useState<{
    id: string;
    startedAt: string;
    strikeCount?: number;
    timeSpentSeconds?: number;
    proctorLogs?: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initExamSession = useCallback(async () => {
    try {
      setIsLoading(true);

      // 1. Initialize or resume active attempt
      const attemptRes = await fetch(`/api/exams/${examId}/attempt`, {
        method: "POST",
      });
      const attemptJson = await attemptRes.json();

      if (!attemptRes.ok) {
        addToast(attemptJson.error || "Unable to start exam attempt", "error");
        router.push("/dashboard/student/exams");
        return;
      }

      // 2. Fetch exam configuration and questions
      const examRes = await fetch(`/api/exams/${examId}`);
      const examJson = await examRes.json();

      if (!examJson.success || !examJson.data) {
        addToast("Exam details could not be retrieved", "error");
        router.push("/dashboard/student/exams");
        return;
      }

      const examData: ExamWithDetails = examJson.data;
      let questionsList: StudentExamQuestion[] = examData.questions || [];

      if (examData.shuffleQuestions) {
        questionsList = shuffleArray(questionsList);
      }

      setExam({ ...examData, questions: questionsList });
      setInitialAttempt(attemptJson.data);
    } catch {
      addToast("Failed to initialize CBT engine session", "error");
      router.push("/dashboard/student/exams");
    } finally {
      setIsLoading(false);
    }
  }, [examId, addToast, router]);

  useEffect(() => {
    initExamSession();
  }, [initExamSession]);

  if (isLoading || !exam || !initialAttempt) return <PageLoader />;

  if (!exam.questions || exam.questions.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-24 bg-white rounded-2xl border border-dashed border-gray-300 p-8">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900">No Assessment Questions</h2>
        <p className="text-sm text-gray-500 mt-2 mb-6">
          This examination has not yet been loaded with questions by the faculty administrator.
        </p>
        <Link href="/dashboard/student/exams">
          <Button variant="primary" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Hall</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <CBTTestEnvironment
      exam={exam}
      initialAttempt={initialAttempt}
    />
  );
}
