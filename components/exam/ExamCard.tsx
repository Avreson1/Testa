"use client";

import React from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatDuration } from "@/lib/utils";
import { ExamWithDetails } from "@/types";
import { Clock, HelpCircle, BookOpen, User, Play, Eye, FileEdit } from "lucide-react";

interface ExamCardProps {
  exam: ExamWithDetails;
  role?: string;
  hasAttempted?: boolean;
}

export default function ExamCard({ exam, role, hasAttempted = false }: ExamCardProps) {
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "PUBLISHED":
        return "info";
      case "COMPLETED":
        return "purple";
      default:
        return "default";
    }
  };

  return (
    <Card className="flex flex-col justify-between hover:shadow-md hover:border-indigo-200 transition-all duration-200 group">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700">
            <BookOpen className="w-3.5 h-3.5" />
            {exam.subject.name}
          </span>
          <Badge variant={getBadgeVariant(exam.status)}>
            {exam.status}
          </Badge>
        </div>

        {/* Title & Description */}
        <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 text-base">
          {exam.title}
        </h3>
        {exam.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
            {exam.description}
          </p>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4 py-3 border-y border-gray-100 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{formatDuration(exam.duration)}</span>
          </div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-gray-400" />
            <span>{exam._count?.questions ?? 0} Questions</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Total:</span>
            <span>{exam.totalMarks} Marks</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Pass:</span>
            <span>{exam.passMarks} Marks</span>
          </div>
        </div>

        {/* Teacher / School Info */}
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
          <User className="w-3.5 h-3.5 text-gray-400" />
          <span className="truncate">By {exam.teacher?.name || "Faculty"}</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3">
        {role === "STUDENT" ? (
          hasAttempted ? (
            <Link href={`/dashboard/student/results`} className="w-full block">
              <Button variant="secondary" size="sm" className="w-full gap-2">
                <Eye className="w-4 h-4" />
                View Attempt Result
              </Button>
            </Link>
          ) : exam.status === "ACTIVE" ? (
            <Link href={`/dashboard/student/exams/${exam.id}`} className="w-full block">
              <Button variant="primary" size="sm" className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Play className="w-4 h-4 fill-white" />
                Start Examination
              </Button>
            </Link>
          ) : (
            <Button variant="secondary" size="sm" className="w-full" disabled>
              Not Active Yet
            </Button>
          )
        ) : (
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/teacher/exams/${exam.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full gap-1.5">
                <FileEdit className="w-3.5 h-3.5" />
                Manage
              </Button>
            </Link>
            <Link href={`/dashboard/teacher/exams/${exam.id}/results`} className="flex-1">
              <Button variant="secondary" size="sm" className="w-full gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                Results ({exam._count?.attempts ?? 0})
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}
