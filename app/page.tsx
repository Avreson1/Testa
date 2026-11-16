import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  BarChart3,
  Building2,
  FileCheck,
} from "lucide-react";
import Button from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Testa <span className="text-indigo-600">CBT-Hub</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="md">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="md" className="gap-2 shadow-sm shadow-indigo-600/20">
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),theme(colors.slate.50))]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-semibold text-indigo-700 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Computer-Based Testing Infrastructure</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight sm:leading-tight">
            Seamless CBT Examination for{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">
              Modern Institutions
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Testa CBT-Hub delivers multi-school management, automated real-time test delivery, anti-cheat randomized question sequencing, and instant automated grading.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2 px-8 py-3.5 text-base shadow-lg shadow-indigo-600/25">
                <span>Start Free Institutional Setup</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-3.5 text-base">
                Explore Demo Environment
              </Button>
            </Link>
          </div>

          {/* Quick Demo Credentials Callout */}
          <div className="mt-12 max-w-xl mx-auto bg-white/90 border border-slate-200 rounded-2xl p-4 shadow-sm text-xs text-slate-600">
            <p className="font-semibold text-slate-800 mb-1">Preloaded Test Credentials (Password: password123):</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="block text-indigo-600 font-bold">Super Admin</span>
                admin@testa.com
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="block text-indigo-600 font-bold">Faculty Teacher</span>
                math@apex.edu
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="block text-indigo-600 font-bold">Candidate Student</span>
                student@apex.edu
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest text-indigo-600 font-bold mb-2">
              Enterprise Grade Capabilities
            </h2>
            <p className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Engineered for High-Stakes Assessments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 hover:border-indigo-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Multi-School Tenancy</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Complete institutional isolation. Schools administer their own faculty rosters, students, and distinct subjects with custom codes.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 hover:border-indigo-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-5">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Flexible Question Formats</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Create Multiple Choice (MCQ), True/False toggles, and Fill-in-the-Blank items with point allocations and solution explanations.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 hover:border-indigo-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Timed Auto-Submission</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Uncompromising examination timer with visual alerts and automated instant submission on expiration to eliminate test overrun.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 hover:border-indigo-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Instant Grading & Review</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Real-time scoring calculation, letter grade attribution, and optional immediate itemized breakdown with full answer explanations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Dedicated Portals for Every Role
            </h2>
            <p className="text-slate-600 mt-2">
              Streamlined interfaces purpose-built for each stakeholder in the testing lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 inline-block mb-4">
                  Super & School Admin
                </span>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Institutional Control</h3>
                <ul className="space-y-2.5 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Create & manage unlimited schools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Generate unique institutional codes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Oversee faculty and student registries</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border-2 border-indigo-600 shadow-lg relative flex flex-col justify-between">
              <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white uppercase tracking-wider">
                Exam Authors
              </span>
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 inline-block mb-4">
                  Teacher Portal
                </span>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Exam Authoring & Analytics</h3>
                <ul className="space-y-2.5 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Draft, publish, and activate exams</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Rich question builder with point weights</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Live submission rosters and grade tables</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 inline-block mb-4">
                  Candidate Portal
                </span>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Distraction-Free Testing</h3>
                <ul className="space-y-2.5 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Live countdown timer with alerts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Responsive question navigation palette</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Instant scorecards and performance review</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">CBT-Hub (Testa)</span>
            <span>•</span>
            <span>Production CBT Architecture</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Powered by Next.js 14 App Router, TypeScript & Prisma</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
