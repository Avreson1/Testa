"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Mail, Lock, ArrowRight, ShieldCheck, GraduationCap, School } from "lucide-react";

export default function LoginForm() {
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword) {
      setError("Please provide both email and password.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await signIn("credentials", {
        email: cleanEmail,
        password: cleanPassword,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        addToast(res.error, "error");
        setIsLoading(false);
        return;
      }

      if (res?.ok) {
        addToast("Signed in successfully! Redirecting to dashboard...", "success");
        // Use full document navigation to guarantee fresh session cookie hydration
        window.location.href = "/dashboard";
      } else {
        setError("Unable to authenticate credentials.");
        setIsLoading(false);
      }
    } catch {
      setError("An unexpected error occurred during sign-in.");
      addToast("Failed to authenticate. Please check your network.", "error");
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
        label="Email Address"
        type="email"
        placeholder="you@school.edu"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={<Mail className="w-4 h-4" />}
        required
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        leftIcon={<Lock className="w-4 h-4" />}
        required
      />

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full gap-2 text-sm shadow-md shadow-indigo-600/20"
          isLoading={isLoading}
        >
          <span>Sign In to CBT-Hub</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick 1-Click Demo Logins */}
      <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
            Quick 1-Click Demo Accounts
          </p>
          <span className="text-[10px] text-slate-400 font-mono">pwd: password123</span>
        </div>
        
        <div className="grid grid-cols-1 gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => fillDemo("admin@testa.com")}
            className="flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-slate-700 transition-all text-left"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Super Admin</span>
            </span>
            <span className="font-mono text-[11px] text-indigo-600 font-semibold">admin@testa.com</span>
          </button>

          <button
            type="button"
            onClick={() => fillDemo("math@apex.edu")}
            className="flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-slate-700 transition-all text-left"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <School className="w-3.5 h-3.5 text-violet-600" />
              <span>Teacher (Apex)</span>
            </span>
            <span className="font-mono text-[11px] text-violet-600 font-semibold">math@apex.edu</span>
          </button>

          <button
            type="button"
            onClick={() => fillDemo("student@apex.edu")}
            className="flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-slate-700 transition-all text-left"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Student (Apex)</span>
            </span>
            <span className="font-mono text-[11px] text-emerald-600 font-semibold">student@apex.edu</span>
          </button>
        </div>
      </div>
    </form>
  );
}
