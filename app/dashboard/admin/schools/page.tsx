"use client";

import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import DataTable, { Column } from "@/components/ui/DataTable";
import SchoolForm from "@/components/forms/SchoolForm";
import { PageLoader } from "@/components/ui/Loader";
import { useToast } from "@/components/ui/Toast";
import { SchoolData } from "@/types";
import { Plus, Edit2, Trash2, Building2, Hash, Users, BookOpen } from "lucide-react";

export default function SchoolsManagementPage() {
  const { addToast } = useToast();
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolData | null>(null);

  const fetchSchools = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/schools");
      const json = await res.json();
      if (json.success && json.data) {
        setSchools(json.data);
      }
    } catch {
      addToast("Failed to fetch schools directory", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleDelete = async (schoolId: string, schoolName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${schoolName}"? All affiliated students, teachers, and exams will be deleted.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/schools/${schoolId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete school");
      addToast(`School "${schoolName}" deleted successfully`, "success");
      fetchSchools();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting school";
      addToast(msg, "error");
    }
  };

  const columns: Column<SchoolData>[] = [
    {
      key: "name",
      header: "Institution Name",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{item.name}</p>
            <p className="text-xs text-gray-400">{item.email || item.address || "No contact info"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "code",
      header: "School Code",
      render: (item) => (
        <span className="inline-flex items-center gap-1 font-mono font-bold text-xs bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md border border-gray-200">
          <Hash className="w-3 h-3 text-gray-400" />
          {item.code}
        </span>
      ),
    },
    {
      key: "metrics",
      header: "Affiliates",
      render: (item) => (
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1" title="Users">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            {item._count?.users ?? 0}
          </span>
          <span className="flex items-center gap-1" title="Subjects">
            <BookOpen className="w-3.5 h-3.5 text-gray-400" />
            {item._count?.subjects ?? 0}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <Badge variant={item.isActive ? "success" : "default"}>
          {item.isActive ? "Active" : "Disabled"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (item) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => {
              setEditingSchool(item);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors"
            title="Edit School"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(item.id, item.name)}
            className="p-1.5 text-gray-500 hover:text-rose-600 rounded-lg hover:bg-gray-100 transition-colors"
            title="Delete School"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Institution Directory
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, update, and manage member schools across the platform
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingSchool(null);
            setIsModalOpen(true);
          }}
          className="gap-2 shadow-sm shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New School</span>
        </Button>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : (
        <DataTable
          columns={columns}
          data={schools}
          emptyMessage="No schools have been created yet. Click 'Add New School' to register your first institution."
        />
      )}

      {/* Modal for Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSchool ? "Edit Institution Profile" : "Register New Institution"}
        description={editingSchool ? "Update school contact and configuration details." : "Enter institution name and unique student/faculty signup code."}
      >
        <SchoolForm
          initialData={editingSchool}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchSchools();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
