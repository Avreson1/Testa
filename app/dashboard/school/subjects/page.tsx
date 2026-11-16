"use client";

import React, { useEffect, useState } from "react";
import DataTable, { Column } from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { PageLoader } from "@/components/ui/Loader";
import { useToast } from "@/components/ui/Toast";
import { SubjectData } from "@/types";
import { formatDate } from "@/lib/utils";
import { BookOpen, Hash, Plus, FileSpreadsheet } from "lucide-react";

export default function SubjectsPage() {
  const { addToast } = useToast();
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", code: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSubjects = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/subjects");
      const json = await res.json();
      if (json.success && json.data) {
        setSubjects(json.data);
      }
    } catch {
      addToast("Failed to fetch subjects catalog", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create subject");
      addToast("Subject added successfully!", "success");
      setIsModalOpen(false);
      setFormData({ name: "", code: "" });
      fetchSubjects();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating subject";
      addToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<SubjectData>[] = [
    {
      key: "name",
      header: "Subject Title",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{item.name}</p>
            <p className="text-xs text-gray-400">Added {formatDate(item.createdAt)}</p>
          </div>
        </div>
      ),
    },
    {
      key: "code",
      header: "Course Code",
      render: (item) => (
        <span className="inline-flex items-center gap-1 font-mono font-bold text-xs bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md border border-gray-200">
          <Hash className="w-3 h-3 text-gray-400" />
          {item.code}
        </span>
      ),
    },
    {
      key: "exams",
      header: "Examinations",
      render: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
          <span>{item._count?.exams ?? 0} Exams</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Subject Catalog
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Standardized academic subjects and discipline codes used for organizing examinations
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="gap-2 shadow-sm shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </Button>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : (
        <DataTable
          columns={columns}
          data={subjects}
          emptyMessage="No subjects registered in catalog yet. Click 'Add Subject' to create courses."
        />
      )}

      {/* Add Subject Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Academic Subject"
        description="Register a course discipline and code."
      >
        <form onSubmit={handleAddSubject} className="space-y-4">
          <Input
            label="Subject Name"
            placeholder="e.g. Advanced Organic Chemistry"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Subject Code"
            placeholder="e.g. CHM201"
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value.toUpperCase() })
            }
            required
          />
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Register Subject
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
