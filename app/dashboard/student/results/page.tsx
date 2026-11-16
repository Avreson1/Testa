"use client";

import React, { useEffect, useState } from "react";
import DataTable, { Column } from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import ExamResults from "@/components/exam/ExamResults";
import { PageLoader } from "@/components/ui/Loader";
import { useToast } from "@/components/ui/Toast";
import { AttemptWithDetails } from "@/types";
import { formatDateTime, getGrade } from "@/lib/utils";
import { Eye, BookOpen } from "lucide-react";

export default function StudentResultsPage() {
  const { addToast } = useToast();
  const [attempts, setAttempts] = useState<AttemptWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState<AttemptWithDetails | null>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/results");
        const json = await res.json();
        if (json.success && json.data) {
          setAttempts(json.data);
        }
      } catch {
        addToast("Failed to fetch examination results", "error");
      } finally {
        setIsLoading(false);
      }
    }
    fetchResults();
  }, [addToast]);

  const columns: Column<AttemptWithDetails>[] = [
    {
      key: "exam",
      header: "Assessment & Discipline",
      render: (item) => (
        <div className="space-y-0.5">
          <p className="font-bold text-gray-900">{item.exam.title}</p>
          <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{item.exam.subject.name}</span>
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
        const isPass = (item.score ?? 0) >= (item.exam.passMarks ?? 0);
        return (
          <Badge variant={isPass ? "success" : "danger"}>
            Grade {grade}
          </Badge>
        );
      },
    },
    {
      key: "submittedAt",
      header: "Completion Date",
      render: (item) => (
        <span className="text-xs text-gray-500">
          {item.submittedAt ? formatDateTime(item.submittedAt) : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Review",
      className: "text-right",
      render: (item) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setSelectedAttempt(item)}
          className="gap-1 text-xs"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Scorecard</span>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Performance & Results
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Complete academic transcript of your submitted examinations with detailed item corrections
          </p>
        </div>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : (
        <DataTable
          columns={columns}
          data={attempts}
          emptyMessage="No examination attempts recorded yet. As you complete tests, your performance cards will appear here."
        />
      )}

      {/* Review Paper Modal */}
      {selectedAttempt && (
        <Modal
          isOpen={!!selectedAttempt}
          onClose={() => setSelectedAttempt(null)}
          title={`Scorecard Review - ${selectedAttempt.exam.title}`}
          size="xl"
        >
          <ExamResults attempt={selectedAttempt} backHref="#" />
        </Modal>
      )}
    </div>
  );
}
