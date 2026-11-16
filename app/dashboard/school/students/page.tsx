"use client";

import React, { useEffect, useState } from "react";
import DataTable, { Column } from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Loader";
import { useToast } from "@/components/ui/Toast";
import { UserData } from "@/types";
import { formatDate, getInitials } from "@/lib/utils";
import { Mail, UserPlus, Lock } from "lucide-react";

export default function StudentsPage() {
  const { addToast } = useToast();
  const [students, setStudents] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/users?role=STUDENT");
      const json = await res.json();
      if (json.success && json.data) {
        setStudents(json.data);
      }
    } catch {
      addToast("Failed to fetch students roster", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: "STUDENT" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to register student");
      addToast("Student enrolled successfully!", "success");
      setIsModalOpen(false);
      setFormData({ name: "", email: "", password: "" });
      fetchStudents();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error enrolling student";
      addToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<UserData>[] = [
    {
      key: "name",
      header: "Candidate Name",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
            {getInitials(item.name)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{item.name}</p>
            <p className="text-xs text-gray-400">{item.school?.name || "Affiliated Candidate"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Student Email",
      render: (item) => (
        <span className="text-xs text-gray-600 font-mono">{item.email}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Enrollment Date",
      render: (item) => (
        <span className="text-xs text-gray-500">{formatDate(item.createdAt)}</span>
      ),
    },
    {
      key: "status",
      header: "Account Status",
      render: (item) => (
        <Badge variant={item.isActive ? "success" : "default"}>
          {item.isActive ? "Eligible" : "Suspended"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Student Roster
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Registered examination candidates eligible to undertake CBT tests
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="gap-2 shadow-sm shadow-indigo-600/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Enroll New Student</span>
        </Button>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : (
        <DataTable
          columns={columns}
          data={students}
          emptyMessage="No students currently enrolled. Students can self-register using your school code or be enrolled directly."
        />
      )}

      {/* Add Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Enroll Student Candidate"
        description="Create credentials for a new examination candidate."
      >
        <form onSubmit={handleAddStudent} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Michael Faraday"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="michael@student.apex.edu"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />
          <Input
            label="Initial Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Enroll Student
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
