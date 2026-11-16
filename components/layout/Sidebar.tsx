"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn, getInitials, getRoleLabel, getRoleBadgeColor } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  FileSpreadsheet,
  PlusCircle,
  Award,
  LogOut,
  Sparkles,
  ClipboardCheck,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const getNavLinks = () => {
    switch (role) {
      case "SUPER_ADMIN":
        return [
          { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
          { href: "/dashboard/admin/schools", label: "Manage Schools", icon: Building2 },
          { href: "/dashboard/school/students", label: "Global Users", icon: Users },
        ];
      case "SCHOOL_ADMIN":
        return [
          { href: "/dashboard/school", label: "Overview", icon: LayoutDashboard },
          { href: "/dashboard/school/teachers", label: "Teachers", icon: Users },
          { href: "/dashboard/school/students", label: "Students", icon: GraduationCap },
          { href: "/dashboard/school/subjects", label: "Subjects", icon: BookOpen },
          { href: "/dashboard/teacher/exams", label: "All Exams", icon: FileSpreadsheet },
        ];
      case "TEACHER":
        return [
          { href: "/dashboard/teacher", label: "Overview", icon: LayoutDashboard },
          { href: "/dashboard/teacher/exams", label: "My Exams", icon: FileSpreadsheet },
          { href: "/dashboard/teacher/exams/create", label: "Create Exam", icon: PlusCircle },
          { href: "/dashboard/school/students", label: "Students", icon: GraduationCap },
        ];
      case "STUDENT":
        return [
          { href: "/dashboard/student", label: "Overview", icon: LayoutDashboard },
          { href: "/dashboard/student/exams", label: "Available Exams", icon: ClipboardCheck },
          { href: "/dashboard/student/results", label: "My Results", icon: Award },
        ];
      default:
        return [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-gray-900">
                Testa <span className="text-indigo-600">CBT</span>
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-wider text-gray-400">
                Multi-School Hub
              </span>
            </div>
          </Link>
        </div>

        {/* User Card */}
        <div className="border-b border-gray-100 bg-gray-50/60 p-4 mx-3 my-3 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm">
              {session?.user?.name ? getInitials(session.user.name) : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">
                {session?.user?.name || "User"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={cn(
                    "inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full",
                    role ? getRoleBadgeColor(role) : "bg-gray-100 text-gray-800"
                  )}
                >
                  {role ? getRoleLabel(role) : "Member"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-3 py-2 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Navigation
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href + "/"));

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-150 group-hover:scale-105",
                    isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                  )}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="border-t border-gray-100 p-4">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="h-5 w-5 text-rose-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
