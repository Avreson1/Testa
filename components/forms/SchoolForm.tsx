"use client";

import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { SchoolData } from "@/types";
import { Building2, Hash, MapPin, Phone, Mail } from "lucide-react";

interface SchoolFormProps {
  initialData?: SchoolData | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function SchoolForm({
  initialData,
  onSuccess,
  onCancel,
}: SchoolFormProps) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    code: initialData?.code || "",
    address: initialData?.address || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = initialData
        ? `/api/schools/${initialData.id}`
        : "/api/schools";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save school");
      }

      addToast(
        initialData ? "School updated successfully!" : "School created successfully!",
        "success"
      );
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving school";
      addToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="School Name"
        placeholder="e.g. Cambridge High School"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        leftIcon={<Building2 className="w-4 h-4" />}
        required
      />

      <Input
        label="School Code (Unique identifier)"
        placeholder="e.g. CAM01"
        value={formData.code}
        onChange={(e) =>
          setFormData({ ...formData, code: e.target.value.toUpperCase() })
        }
        helperText="Students and teachers use this code to register."
        leftIcon={<Hash className="w-4 h-4" />}
        required
      />

      <Input
        label="Physical Address"
        placeholder="e.g. 100 University Ave, Boston MA"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        leftIcon={<MapPin className="w-4 h-4" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Phone Number"
          placeholder="+1 (555) 000-0000"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          leftIcon={<Phone className="w-4 h-4" />}
        />

        <Input
          label="Administrative Email"
          type="email"
          placeholder="admin@cambridge.edu"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          leftIcon={<Mail className="w-4 h-4" />}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? "Save Changes" : "Create School"}
        </Button>
      </div>
    </form>
  );
}
