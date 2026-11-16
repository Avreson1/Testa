"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ExamTimer from "@/components/exam/ExamTimer";
import QuestionRenderer from "@/components/exam/QuestionRenderer";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { PageLoader } from "@/components/ui/Loader";
import { useToast } from "@/components/ui/Toast";
import { ExamWithDetails, StudentExamQuestion } from "@/types";
import { shuffleArray } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  AlertTriangle,
  BookOpen,
  CheckCircle,
} from "lucide-react";

export default function TakeExamPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const examId = params.id as string;

  const [exam, setExam] = useState<ExamWithDetails | null>(null);
  const [questions, setQuestions] = useState<StudentExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Initialize Exam Session
  const initExam = useCallback(async () => {
    try {
      setIsLoading(true);

      // 1. Initialize Attempt on server
      const attemptRes = await fetch(`/api/exams/${examId}/attempt`, {
        method: "POST",
      });
      const attemptJson = await attemptRes.json();

      if (!attemptRes.ok) {
        addToast(attemptJson.error || "Unable to start exam session", "error");
        router.push("/dashboard/student/exams");
        return;
      }

      // 2. Fetch Exam & Questions
      const examRes = await fetch(`/api/exams/${examId}`);
      const examJson = await examRes.json();

      if (!examJson.success || !examJson.data) {
        addToast("Exam details could not be retrieved", "error");
        router.push("/dashboard/student/exams");
        return;
      }

      const examData = examJson.data;
      let questionsList: StudentExamQuestion[] = examData.questions || [];

      if (examData.shuffleQuestions) {
        questionsList = shuffleArray(questionsList);
      }

      setExam(examData);
      setQuestions(questionsList);
    } catch {
      addToast("Failed to initialize CBT examination engine", "error");
      router.push("/dashboard/student/exams");
    } finally {
      setIsLoading(false);
    }
  }, [examId, addToast, router]);

  useEffect(() => {
    initExam();
  }, [initExam]);

  // Handle Answer Selection
  const handleAnswerChange = (val: string) => {
    if (!questions[currentIndex]) return;
    const qId = questions[currentIndex].id;
    setAnswers((prev) => ({
      ...prev,
      [qId]: val,
    }));
  };

  // Toggle Flag
  const toggleFlag = (qId: string) => {
    setFlagged((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  // Submit Exam
  const submitExam = useCallback(async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const payload = {
        answers: Object.entries(answers).map(([qId, ans]) => ({
          questionId: qId,
          selectedAnswer: ans,
        })),
      };

      const res = await fetch(`/api/exams/${examId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to submit examination");
      }

      addToast("Examination submitted and graded successfully!", "success");
      router.push("/dashboard/student/results");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission error";
      addToast(msg, "error");
      setIsSubmitting(false);
    }
  }, [answers, examId, isSubmitting, addToast, router]);

  // Ref to hold submitExam for timer
  const submitRef = useRef(submitExam);
  submitRef.current = submitExam;

  const handleTimeUp = useCallback(() => {
    addToast("Time expired! Your examination is being auto-submitted...", "warning");
    submitRef.current();
  }, [addToast]);

  if (isLoading || !exam) return <PageLoader />;

  if (questions.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900">No Questions In This Exam</h2>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          The teacher has not yet configured question items for this assessment.
        </p>
        <Link href="/dashboard/student/exams">
          <Button variant="primary">Return to Examination Hall</Button>
        </Link>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;
  const progressPercent = Math.round((answeredCount / totalCount) * 100);

  return (
    <div className="min-h-[85vh] flex flex-col space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Bar: Title, Progress & Countdown Timer */}
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/90 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 w-full sm:w-auto text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700">
              <BookOpen className="w-3.5 h-3.5" />
              {exam.subject.name}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs font-semibold text-gray-500">
              {answeredCount} of {totalCount} Answered ({progressPercent}%)
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight line-clamp-1">
            {exam.title}
          </h1>
        </div>

        {/* Live Timer */}
        <div className="shrink-0">
          <ExamTimer
            initialSeconds={exam.duration * 60}
            onTimeUp={handleTimeUp}
          />
        </div>
      </div>

      {/* Main Examination Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 items-start">
        {/* Left 3 cols: Question Area */}
        <div className="lg:col-span-3 space-y-4">
          <QuestionRenderer
            question={currentQ}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            selectedAnswer={answers[currentQ.id] || ""}
            onAnswerChange={handleAnswerChange}
          />

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <Button
              variant={flagged[currentQ.id] ? "secondary" : "ghost"}
              onClick={() => toggleFlag(currentQ.id)}
              className={`gap-1.5 text-xs ${
                flagged[currentQ.id]
                  ? "bg-amber-100 text-amber-900 font-bold"
                  : "text-gray-500 hover:text-amber-600"
              }`}
            >
              <Flag className={`w-4 h-4 ${flagged[currentQ.id] ? "fill-amber-500 text-amber-600" : ""}`} />
              <span>{flagged[currentQ.id] ? "Flagged for Review" : "Flag Question"}</span>
            </Button>

            {currentIndex < questions.length - 1 ? (
              <Button
                variant="primary"
                onClick={() =>
                  setCurrentIndex((prev) =>
                    Math.min(questions.length - 1, prev + 1)
                  )
                }
                className="gap-2 shadow-sm shadow-indigo-600/20"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="success"
                onClick={() => setIsConfirmModalOpen(true)}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
              >
                <span>Finish & Submit</span>
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Right 1 col: Question Palette Palette */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-gray-900 text-sm">Question Navigation</h3>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-500" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-gray-100 border border-gray-300" />
              <span>Unanswered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-400" />
              <span>Flagged</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md ring-2 ring-indigo-600 bg-white" />
              <span>Current</span>
            </div>
          </div>

          {/* Grid of question numbers */}
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const isAnswered = !!answers[q.id];
              const isFlagged = !!flagged[q.id];

              let bgClasses = "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100";
              if (isAnswered) bgClasses = "bg-emerald-600 text-white font-bold border-emerald-600 shadow-sm";
              if (isFlagged) bgClasses = "bg-amber-400 text-amber-950 font-bold border-amber-500";

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative flex items-center justify-center h-9 w-full rounded-lg text-xs font-bold transition-all cursor-pointer ${bgClasses} ${
                    isCurrent ? "ring-2 ring-offset-2 ring-indigo-600 scale-105 z-10" : ""
                  }`}
                >
                  {idx + 1}
                  {isFlagged && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-600 ring-1 ring-white" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Final Submit Button in Sidebar */}
          <div className="pt-4 border-t border-gray-100">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsConfirmModalOpen(true)}
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
            >
              <Send className="w-4 h-4" />
              <span>Submit Paper</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Examination Submission"
        description="Please review your attempt status before concluding your examination session."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 text-center text-sm">
            <div>
              <p className="text-xs text-gray-500">Answered</p>
              <p className="text-2xl font-bold text-emerald-600">{answeredCount} / {totalCount}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Unanswered</p>
              <p className="text-2xl font-bold text-rose-600">{totalCount - answeredCount}</p>
            </div>
          </div>

          {totalCount - answeredCount > 0 && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 text-xs text-amber-800 border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                You still have {totalCount - answeredCount} unanswered questions. Once submitted, you cannot change or resubmit your responses.
              </span>
            </div>
          )}

          <p className="text-xs text-gray-500">
            Are you sure you want to finalize and grade your examination now?
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={isSubmitting}
            >
              Return to Test
            </Button>
            <Button
              variant="success"
              onClick={submitExam}
              isLoading={isSubmitting}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Yes, Submit Now</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
