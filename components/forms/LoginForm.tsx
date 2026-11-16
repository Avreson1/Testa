"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        addToast(res.error, "error");
        setIsLoading(false);
        return;
      }

      addToast("Signed in successfully! Redirecting...", "success");
      router.push("/dashboard");
      router.refresh();
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

      <div className="mt-4 p-3 bg-gray-50 border border-gray-200/80 rounded-xl text-[11px] text-gray-500 space-y-1">
        <p className="font-semibold text-gray-700">Quick Demo Logins (Password: password123):</p>
        <p>• Super Admin: <span className="font-mono text-indigo-600 font-semibold">admin@testa.com</span></p>
        <p>• Apex Teacher: <span className="font-mono text-indigo-600 font-semibold">math@apex.edu</span></p>
        <p>• Apex Student: <span className="font-mono text-indigo-600 font-semibold">student@apex.edu</span></p>
      </div>
    </form>
  );
}
