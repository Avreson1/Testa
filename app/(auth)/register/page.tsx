import Link from "next/link";
import RegisterForm from "@/components/forms/RegisterForm";
import Card from "@/components/ui/Card";
import { Sparkles } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30">
            <Sparkles className="h-6 w-6" />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Join CBT-Hub (Testa)
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Create an institutional account as an admin, teacher, or student
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <Card padding="lg" className="shadow-xl border-slate-200/80 rounded-2xl">
          <RegisterForm />
          <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
            Already have an active account?{" "}
            <Link
              href="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Sign in instead
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
