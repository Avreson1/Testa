"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { AttemptWithDetails } from "@/types";
import { getGrade, formatDateTime } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  ArrowLeft,
  HelpCircle,
  BarChart3,
} from "lucide-react";

interface ExamResultsProps {
  attempt: AttemptWithDetails;
  backHref?: string;
}

export default function ExamResults({
  attempt,
  backHref = "/dashboard/student/results",
}: ExamResultsProps) {
  const percentage = attempt.percentage ?? 0;
  const grade = getGrade(percentage);
  const isPassed = (attempt.score ?? 0) >= (attempt.exam.passMarks ?? 0);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between">
        <Link href={backHref}>
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Exams
          </Button>
        </Link>
        <Badge variant={isPassed ? "success" : "danger"} className="text-sm px-3 py-1">
          {isPassed ? "EXAMINATION PASSED" : "FAILED PASS REQUIREMENT"}
        </Badge>
      </div>

      {/* Score Overview Card */}
      <Card className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 text-white p-8 sm:p-10 shadow-xl rounded-3xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8 text-center sm:text-left">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-md">
              {attempt.exam.subject.name}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {attempt.exam.title}
            </h1>
            <p className="text-indigo-200 text-sm flex items-center justify-center sm:justify-start gap-4 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDateTime(attempt.submittedAt || attempt.createdAt || attempt.startedAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {attempt.exam.duration} Minutes
              </span>
            </p>
          </div>

          {/* Grade Pill */}
          <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl min-w-[160px]">
            <span className="text-xs uppercase tracking-wider text-indigo-200 font-semibold mb-1">
              Final Grade
            </span>
            <span className="text-5xl font-black text-white">{grade}</span>
            <span className="text-xs text-indigo-200 mt-1">
              {percentage.toFixed(1)}% Score
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/15 text-center">
          <div>
            <p className="text-xs text-indigo-200 uppercase tracking-wider">Score Obtained</p>
            <p className="text-2xl font-bold mt-1">{attempt.score ?? 0} / {attempt.totalMarks}</p>
          </div>
          <div>
            <p className="text-xs text-indigo-200 uppercase tracking-wider">Pass Mark</p>
            <p className="text-2xl font-bold mt-1">{attempt.exam.passMarks}</p>
          </div>
          <div>
            <p className="text-xs text-indigo-200 uppercase tracking-wider">Correct Answers</p>
            <p className="text-2xl font-bold mt-1 text-emerald-300">
              {attempt.answers.filter((a) => a.isCorrect).length} / {attempt.answers.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-indigo-200 uppercase tracking-wider">Accuracy</p>
            <p className="text-2xl font-bold mt-1 text-indigo-200">{percentage.toFixed(0)}%</p>
          </div>
        </div>
      </Card>

      {/* Question by Question Review */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-gray-900">Detailed Answer Review</h2>
        </div>

        {attempt.answers.map((ans, idx) => {
          return (
            <Card
              key={ans.id}
              className={`border-l-4 transition-all ${
                ans.isCorrect ? "border-l-emerald-500 bg-emerald-50/20" : "border-l-rose-500 bg-rose-50/20"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Question {idx + 1}
                    </span>
                    <Badge variant={ans.isCorrect ? "success" : "danger"}>
                      {ans.isCorrect ? `+${ans.marksAwarded} Marks` : "0 Marks"}
                    </Badge>
                  </div>
                  <p className="text-base font-medium text-gray-900 leading-snug">
                    {ans.question.text}
                  </p>
                </div>
                {ans.isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                )}
              </div>

              {/* Answers Comparison */}
              <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-white border border-gray-200">
                  <span className="text-xs font-semibold text-gray-500 block mb-1">
                    Your Response:
                  </span>
                  <span
                    className={`font-semibold ${
                      ans.isCorrect ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {ans.selectedAnswer || "(No Answer Given)"}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-white border border-gray-200">
                  <span className="text-xs font-semibold text-gray-500 block mb-1">
                    Correct Answer:
                  </span>
                  <span className="font-semibold text-emerald-700">
                    {ans.question.correctAnswer}
                  </span>
                </div>
              </div>

              {/* Explanation */}
              {ans.question.explanation && (
                <div className="mt-3 p-3 rounded-lg bg-indigo-50/60 text-xs text-indigo-950 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Explanation: </span>
                    {ans.question.explanation}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
