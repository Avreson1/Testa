"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ExamForm from "@/components/forms/ExamForm";
import { ArrowLeft } from "lucide-react";

export default function CreateExamPage() {
  const router = useRouter();

  const handleSuccess = (newExamId?: string) => {
    if (newExamId) {
      router.push(`/dashboard/teacher/exams/${newExamId}`);
    } else {
      router.push("/dashboard/teacher/exams");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/teacher/exams">
          <Button variant="ghost" size="sm" className="gap-1.5 text-gray-500">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Exams</span>
          </Button>
        </Link>
      </div>

      <div className="pb-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Create New Examination
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Set up title, discipline, time limits, and evaluation rules. You can add questions next.
        </p>
      </div>

      <Card padding="lg" className="rounded-2xl shadow-sm border-gray-200">
        <ExamForm
          onSuccess={handleSuccess}
          onCancel={() => router.push("/dashboard/teacher/exams")}
        />
      </Card>
    </div>
  );
}
