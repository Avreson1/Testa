"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import QuestionForm from "@/components/forms/QuestionForm";
import ExamForm from "@/components/forms/ExamForm";
import { PageLoader } from "@/components/ui/Loader";
import { useToast } from "@/components/ui/Toast";
import { ExamWithDetails, QuestionData } from "@/types";
import { formatDuration } from "@/lib/utils";
import {
  ArrowLeft,
  Plus,
  Clock,
  Award,
  BookOpen,
  Edit2,
  Trash2,
  CheckCircle2,
  Play,
  Check,
  Eye,
  HelpCircle,
  FileSpreadsheet,
} from "lucide-react";

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const examId = params.id as string;

  const [exam, setExam] = useState<ExamWithDetails | null>(null);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isEditExamModalOpen, setIsEditExamModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionData | null>(null);

  const fetchExamDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/exams/${examId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setExam(json.data);
        setQuestions(json.data.questions || []);
      } else {
        addToast("Exam not found", "error");
        router.push("/dashboard/teacher/exams");
      }
    } catch {
      addToast("Failed to fetch exam details", "error");
    } finally {
      setIsLoading(false);
    }
  }, [examId, addToast, router]);

  useEffect(() => {
    fetchExamDetails();
  }, [fetchExamDetails]);

  const updateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/exams/${examId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update exam status");
      addToast(`Exam status changed to ${newStatus}`, "success");
      fetchExamDetails();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating status";
      addToast(msg, "error");
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      await fetch(`/api/exams/${examId}/questions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: qId }),
      });
      addToast("Question removed", "success");
      fetchExamDetails();
    } catch {
      addToast("Failed to delete question", "error");
    }
  };

  if (isLoading || !exam) return <PageLoader />;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/teacher/exams">
          <Button variant="ghost" size="sm" className="gap-1.5 text-gray-500">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Exams</span>
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/teacher/exams/${examId}/results`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Eye className="w-4 h-4" />
              <span>View Results ({exam._count?.attempts ?? 0})</span>
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditExamModalOpen(true)}
            className="gap-1.5"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Exam Settings</span>
          </Button>
        </div>
      </div>

      {/* Overview Banner Card */}
      <Card padding="lg" className="border-gray-200/90 shadow-sm rounded-2xl bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700">
                <BookOpen className="w-3.5 h-3.5" />
                {exam.subject.name} ({exam.subject.code})
              </span>
              <Badge
                variant={
                  exam.status === "ACTIVE"
                    ? "success"
                    : exam.status === "PUBLISHED"
                    ? "info"
                    : exam.status === "COMPLETED"
                    ? "purple"
                    : "default"
                }
              >
                {exam.status}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {exam.title}
            </h1>
            {exam.description && (
              <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
                {exam.description}
              </p>
            )}
          </div>

          {/* Status Changer Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {exam.status === "DRAFT" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => updateStatus("PUBLISHED")}
                className="gap-1.5 bg-sky-600 hover:bg-sky-700"
              >
                <Check className="w-4 h-4" />
                <span>Publish Exam</span>
              </Button>
            )}

            {(exam.status === "DRAFT" || exam.status === "PUBLISHED") && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => updateStatus("ACTIVE")}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Activate for Students</span>
              </Button>
            )}

            {exam.status === "ACTIVE" && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => updateStatus("COMPLETED")}
                className="gap-1.5"
              >
                <span>End Examination</span>
              </Button>
            )}

            {exam.status === "COMPLETED" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateStatus("ACTIVE")}
                className="gap-1.5 text-xs"
              >
                <span>Re-open for Testing</span>
              </Button>
            )}
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4 text-indigo-600" />
            <div>
              <p className="text-xs text-gray-400">Duration</p>
              <p className="font-semibold text-gray-900">{formatDuration(exam.duration)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Award className="w-4 h-4 text-indigo-600" />
            <div>
              <p className="text-xs text-gray-400">Total Marks</p>
              <p className="font-semibold text-gray-900">{exam.totalMarks} Points</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <div>
              <p className="text-xs text-gray-400">Pass Mark</p>
              <p className="font-semibold text-gray-900">{exam.passMarks} Points</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <div>
              <p className="text-xs text-gray-400">Questions Count</p>
              <p className="font-semibold text-gray-900">{questions.length} Items</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Questions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Question Bank</h2>
            <p className="text-xs text-gray-500">
              Itemized assessment questions with point allocations and solutions
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              setEditingQuestion(null);
              setIsQuestionModalOpen(true);
            }}
            className="gap-2 shadow-sm shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </Button>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-3 stroke-1" />
            <p className="text-sm font-semibold text-gray-700">No questions added yet</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Click &quot;Add Question&quot; to author Multiple Choice, True/False, or Fill-in-the-Blank items.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingQuestion(null);
                setIsQuestionModalOpen(true);
              }}
              className="mt-4 gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Question</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => {
              let parsedOptions: string[] = [];
              if (q.options) {
                if (Array.isArray(q.options)) parsedOptions = q.options;
                else {
                  try {
                    parsedOptions = JSON.parse(q.options);
                  } catch {
                    parsedOptions = [];
                  }
                }
              }

              return (
                <Card
                  key={q.id}
                  padding="md"
                  className="rounded-xl border-gray-200 hover:border-indigo-200 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center h-6 w-6 rounded-md bg-indigo-100 text-indigo-700 font-bold text-xs">
                          {idx + 1}
                        </span>
                        <Badge variant="default" className="text-[10px]">
                          {q.type}
                        </Badge>
                        <span className="text-xs font-semibold text-gray-500">
                          {q.marks} {q.marks === 1 ? "Mark" : "Marks"}
                        </span>
                      </div>
                      <p className="text-base font-semibold text-gray-900 leading-snug">
                        {q.text}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingQuestion(q);
                          setIsQuestionModalOpen(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Edit Question"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Options Display for MCQ */}
                  {q.type === "MCQ" && parsedOptions.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100 text-xs">
                      {parsedOptions.map((opt, oIdx) => {
                        const isCorrect = opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-lg border flex items-center justify-between ${
                              isCorrect
                                ? "bg-emerald-50/70 border-emerald-200 text-emerald-900 font-semibold"
                                : "bg-gray-50/60 border-gray-100 text-gray-700"
                            }`}
                          >
                            <span>
                              <strong className="mr-1.5 font-bold">
                                {String.fromCharCode(65 + oIdx)}.
                              </strong>
                              {opt}
                            </span>
                            {isCorrect && (
                              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                                Correct
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Non-MCQ Correct Answer Banner */}
                  {q.type !== "MCQ" && (
                    <div className="mt-3 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2">
                      <span className="text-gray-500 font-normal">Expected Answer:</span>
                      <span>{q.correctAnswer}</span>
                    </div>
                  )}

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="mt-2.5 text-xs text-gray-500 italic bg-gray-50 p-2 rounded-lg">
                      <span className="font-semibold text-gray-700 not-italic">Note: </span>
                      {q.explanation}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Question Modal */}
      <Modal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        title={editingQuestion ? "Edit Question" : "Add Question to Exam"}
        description="Specify question prompt, answer format, and correct response."
        size="lg"
      >
        <QuestionForm
          examId={examId}
          initialData={editingQuestion}
          onSuccess={() => {
            setIsQuestionModalOpen(false);
            fetchExamDetails();
          }}
          onCancel={() => setIsQuestionModalOpen(false)}
        />
      </Modal>

      {/* Edit Exam Details Modal */}
      <Modal
        isOpen={isEditExamModalOpen}
        onClose={() => setIsEditExamModalOpen(false)}
        title="Edit Exam Configuration"
        description="Adjust duration, marks, or shuffling options."
        size="lg"
      >
        <ExamForm
          initialData={exam}
          onSuccess={() => {
            setIsEditExamModalOpen(false);
            fetchExamDetails();
          }}
          onCancel={() => setIsEditExamModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
