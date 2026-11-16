"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, Bell, Shield, LogOut } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const getPageTitle = (path: string): string => {
    if (path === "/dashboard") return "Dashboard Overview";
    if (path.includes("/admin/schools")) return "School Directory";
    if (path.includes("/admin")) return "Super Admin Console";
    if (path.includes("/school/teachers")) return "Teacher Roster";
    if (path.includes("/school/students")) return "Student Directory";
    if (path.includes("/school/subjects")) return "Subject Catalog";
    if (path.includes("/school")) return "School Administration";
    if (path.includes("/teacher/exams/create")) return "Create New Exam";
    if (path.includes("/teacher/exams")) return "Exam Management";
    if (path.includes("/teacher")) return "Teacher Portal";
    if (path.includes("/student/exams")) return "Examination Hall";
    if (path.includes("/student/results")) return "Performance & Results";
    if (path.includes("/student")) return "Student Portal";
    return "Dashboard";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 tracking-tight sm:text-xl">
          {getPageTitle(pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
          <Shield className="w-3.5 h-3.5 text-indigo-600" />
          <span>Active Session</span>
        </div>

        <button
          className="relative rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white" />
        </button>

        <div className="h-6 w-px bg-gray-200 mx-1" />

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold text-xs shadow-sm shadow-indigo-600/30">
            {session?.user?.name ? getInitials(session.user.name) : "U"}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-rose-600 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
