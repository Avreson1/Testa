"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Loader";
import {
  Building2,
  Users,
  GraduationCap,
  FileSpreadsheet,
  Plus,
  ArrowRight,
  TrendingUp,
  School as SchoolIcon,
} from "lucide-react";

interface AdminStats {
  totalSchools: number;
  totalUsers: number;
  totalExams: number;
  totalStudents: number;
  totalTeachers: number;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/dashboard");
        const json = await res.json();
        if (json.success && json.data) {
          setStats(json.data);
        }
      } catch (err) {
        console.error("Failed to load admin stats", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Super Administrator Console
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Global management of multi-tenant institutions, users, and platform activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin/schools">
            <Button variant="primary" className="gap-2 shadow-sm shadow-indigo-600/20">
              <Plus className="w-4 h-4" />
              <span>Register New School</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Schools
            </span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 mt-3">
            {stats?.totalSchools ?? 0}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active Tenants</span>
          </div>
        </Card>

        <Card className="hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Registered Students
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 mt-3">
            {stats?.totalStudents ?? 0}
          </p>
          <p className="text-xs text-gray-400 mt-2">Across all institutions</p>
        </Card>

        <Card className="hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Faculty Teachers
            </span>
            <div className="h-9 w-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 mt-3">
            {stats?.totalTeachers ?? 0}
          </p>
          <p className="text-xs text-gray-400 mt-2">Exam authors & evaluators</p>
        </Card>

        <Card className="hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Examinations
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 mt-3">
            {stats?.totalExams ?? 0}
          </p>
          <p className="text-xs text-gray-400 mt-2">Created assessments</p>
        </Card>
      </div>

      {/* Quick Launchpad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <SchoolIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">School Directory & Setup</h3>
              <p className="text-xs text-gray-500">
                Configure school names, generate registration codes, and activate/deactivate access.
              </p>
            </div>
          </div>
          <Link href="/dashboard/admin/schools">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <span>Manage Institutions</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">User & Roster Audit</h3>
              <p className="text-xs text-gray-500">
                Inspect registered students and teachers across all affiliated schools.
              </p>
            </div>
          </div>
          <Link href="/dashboard/school/students">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <span>View Global Student Directory</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
