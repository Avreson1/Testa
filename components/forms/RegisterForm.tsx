"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Mail, Lock, User, School, ArrowRight } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT",
    schoolCode: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleOptions = [
    { value: "STUDENT", label: "Student" },
    { value: "TEACHER", label: "Teacher / Faculty" },
    { value: "SCHOOL_ADMIN", label: "School Administrator" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (
      (formData.role === "STUDENT" || formData.role === "TEACHER") &&
      !formData.schoolCode.trim()
    ) {
      setError("School Code is required for student and teacher registrations (e.g. APEX01).");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to register account.");
      }

      addToast("Account registered successfully! Please sign in.", "success");
      router.push("/login");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed.";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      <Input
        label="Full Name"
        type="text"
        placeholder="Jane Smith"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        leftIcon={<User className="w-4 h-4" />}
        required
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="jane@apex.edu"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        leftIcon={<Mail className="w-4 h-4" />}
        required
      />

      <Select
        label="I am joining as"
        options={roleOptions}
        value={formData.role}
        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
      />

      {(formData.role === "STUDENT" || formData.role === "TEACHER") && (
        <Input
          label="School Registration Code"
          type="text"
          placeholder="e.g. APEX01 or GWD02"
          value={formData.schoolCode}
          onChange={(e) =>
            setFormData({ ...formData, schoolCode: e.target.value.toUpperCase() })
          }
          helperText="Ask your school administrator for your institution's registration code."
          leftIcon={<School className="w-4 h-4" />}
          required
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full gap-2 text-sm shadow-md shadow-indigo-600/20"
          isLoading={isLoading}
        >
          <span>Create Account</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
