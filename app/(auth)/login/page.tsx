import Link from "next/link";
import LoginForm from "@/components/forms/LoginForm";
import Card from "@/components/ui/Card";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30">
            <Sparkles className="h-6 w-6" />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome to CBT-Hub
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Sign in to access your testing dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card padding="lg" className="shadow-xl border-slate-200/80 rounded-2xl">
          <LoginForm />
          <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Register here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
