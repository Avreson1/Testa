"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ExamWithDetails, StudentExamQuestion } from "@/types";
import { CBTFontSize, ProctorEvent } from "@/types/cbt";
import {
  saveLocalSession,
  loadLocalSession,
  clearLocalSession,
  getQuestionStatus,
  computeServerRemainingSeconds,
} from "@/lib/cbt-engine";
import { useCBTProctor } from "@/hooks/useCBTProctor";
import CBTCalculator from "./CBTCalculator";
import CBTScratchpad from "./CBTScratchpad";
import CBTKeyboardGuide from "./CBTKeyboardGuide";
import CBTSummaryModal from "./CBTSummaryModal";
import { useToast } from "@/components/ui/Toast";
import { formatTimeRemaining, getInitials } from "@/lib/utils";
import {
  Clock,
  Calculator as CalcIcon,
  FileText,
  Keyboard,
  Maximize2,
  Minimize2,
  Strikethrough,
  RotateCcw,
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
} from "lucide-react";

interface CBTTestEnvironmentProps {
  exam: ExamWithDetails;
  initialAttempt: {
    id: string;
    startedAt: string | Date;
    strikeCount?: number;
    timeSpentSeconds?: number;
    proctorLogs?: string | null;
  };
}

export default function CBTTestEnvironment({
  exam,
  initialAttempt,
}: CBTTestEnvironmentProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { addToast } = useToast();

  const studentId = session?.user?.id || "guest_student";
  const studentName = session?.user?.name || "Student Candidate";

  // Questions setup
  const questions: StudentExamQuestion[] = exam.questions || [];

  // State Management
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [visited, setVisited] = useState<Record<string, boolean>>({});
  const [strikethroughs, setStrikethroughs] = useState<Record<string, string[]>>({});
  const [scratchpad, setScratchpad] = useState("");
  const [fontSize, setFontSize] = useState<CBTFontSize>("normal");
  const [isEliminatorActive, setIsEliminatorActive] = useState(false);

  // Tools toggles
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isKeyboardGuideOpen, setIsKeyboardGuideOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  // Time & Status State
  const initialRemaining = computeServerRemainingSeconds(
    initialAttempt.startedAt,
    exam.duration
  );
  const [secondsRemaining, setSecondsRemaining] = useState(initialRemaining);
  const [timeSpent, setTimeSpent] = useState(initialAttempt.timeSpentSeconds || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // References for unmounting/callbacks
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const timeSpentRef = useRef(timeSpent);
  timeSpentRef.current = timeSpent;

  // Proctor Anti-Cheat Hook
  const {
    isFullscreen,
    strikeCount,
    proctorLogs,
    activeWarning,
    requestFullscreen,
    dismissWarning,
  } = useCBTProctor({
    enabled: exam.strictLockdown ?? true,
    maxStrikes: exam.maxStrikes || 3,
    initialStrikes: initialAttempt.strikeCount || 0,
    onViolation: (event: ProctorEvent, remaining: number) => {
      addToast(
        `Violation logged: ${event.details} (${remaining} strikes remaining)`,
        "warning"
      );
    },
    onStrikeLimitExceeded: () => {
      handleFinalSubmit("DISQUALIFIED_STRIKE_LIMIT");
    },
  });

  const proctorLogsRef = useRef(proctorLogs);
  proctorLogsRef.current = proctorLogs;

  const strikeCountRef = useRef(strikeCount);
  strikeCountRef.current = strikeCount;

  // 1. Restore local session if exists
  useEffect(() => {
    const cached = loadLocalSession(exam.id, studentId);
    if (cached) {
      setAnswers(cached.answers || {});
      setFlagged(cached.flagged || {});
      setStrikethroughs(cached.strikethroughs || {});
      setScratchpad(cached.scratchpad || "");
      if (cached.timeSpentSeconds) setTimeSpent(cached.timeSpentSeconds);
    }
  }, [exam.id, studentId]);

  // Mark first question as visited
  useEffect(() => {
    if (questions[0]) {
      setVisited((prev) => ({ ...prev, [questions[0].id]: true }));
    }
  }, [questions]);

  // Mark current question as visited on change
  useEffect(() => {
    if (questions[currentIndex]) {
      setVisited((prev) => ({ ...prev, [questions[currentIndex].id]: true }));
    }
  }, [currentIndex, questions]);

  // 2. Periodic Local Persistence & Time Increment
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit("TIMER_EXPIRED");
          return 0;
        }
        return prev - 1;
      });

      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Save to local storage on answer/state changes
  useEffect(() => {
    saveLocalSession({
      examId: exam.id,
      studentId,
      answers,
      flagged,
      strikethroughs,
      scratchpad,
      timeSpentSeconds: timeSpent,
      proctorLogs,
      strikeCount,
      lastUpdated: Date.now(),
    });
  }, [
    answers,
    flagged,
    strikethroughs,
    scratchpad,
    timeSpent,
    proctorLogs,
    strikeCount,
    exam.id,
    studentId,
  ]);

  // 3. Server Heartbeat Sync (every 20 seconds)
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      try {
        setIsSyncing(true);
        const res = await fetch(`/api/exams/${exam.id}/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: answersRef.current,
            timeSpentSeconds: timeSpentRef.current,
            proctorLogs: proctorLogsRef.current,
            strikeCount: strikeCountRef.current,
          }),
        });

        const json = await res.json();
        if (json.success) {
          if (json.isExpired) {
            handleFinalSubmit(json.reason || "SERVER_TIMEOUT");
          } else if (typeof json.serverTimeRemaining === "number") {
            // Re-sync clock drift if off by more than 3 seconds
            setSecondsRemaining((curr) => {
              if (Math.abs(curr - json.serverTimeRemaining) > 3) {
                return json.serverTimeRemaining;
              }
              return curr;
            });
          }
        }
      } catch {
        // Soft fail for heartbeat; offline resilience remains
      } finally {
        setIsSyncing(false);
      }
    }, 20000);

    return () => clearInterval(syncInterval);
  }, [exam.id]);

  // Submit Handler
  const handleFinalSubmit = useCallback(
    async (triggerReason = "MANUAL") => {
      if (isSubmitting) return;
      setIsSubmitting(true);

      try {
        const payload = {
          answers: Object.entries(answersRef.current).map(([qId, ans]) => ({
            questionId: qId,
            selectedAnswer: ans,
          })),
          timeSpentSeconds: timeSpentRef.current,
          strikeCount: strikeCountRef.current,
          proctorLogs: proctorLogsRef.current,
        };

        const res = await fetch(`/api/exams/${exam.id}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "Failed to submit examination");
        }

        clearLocalSession(exam.id, studentId);
        addToast(
          triggerReason === "TIMER_EXPIRED"
            ? "Time elapsed! Examination auto-submitted and scored."
            : triggerReason === "DISQUALIFIED_STRIKE_LIMIT"
            ? "Disqualification: Excessive proctor strikes. Examination locked."
            : "Examination submitted successfully!",
          triggerReason === "DISQUALIFIED_STRIKE_LIMIT" ? "error" : "success"
        );

        router.push("/dashboard/student/results");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Submission error";
        addToast(msg, "error");
        setIsSubmitting(false);
      }
    },
    [exam.id, isSubmitting, studentId, addToast, router]
  );

  // Option Selection
  const handleSelectOption = (option: string) => {
    if (!questions[currentIndex]) return;
    const qId = questions[currentIndex].id;

    if (isEliminatorActive) {
      // Toggle strikethrough in eliminator mode
      setStrikethroughs((prev) => {
        const currentList = prev[qId] || [];
        const isStruck = currentList.includes(option);
        return {
          ...prev,
          [qId]: isStruck
            ? currentList.filter((o) => o !== option)
            : [...currentList, option],
        };
      });
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      [qId]: option,
    }));
  };

  // Clear current response
  const handleClearResponse = () => {
    if (!questions[currentIndex]) return;
    const qId = questions[currentIndex].id;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
  };

  // Toggle Flag
  const handleToggleFlag = () => {
    if (!questions[currentIndex]) return;
    const qId = questions[currentIndex].id;
    setFlagged((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  // Keyboard Shortcuts Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in text input, textarea or calculator
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        isCalculatorOpen
      ) {
        return;
      }

      const key = e.key.toUpperCase();

      if (key === "N" || e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
      } else if (key === "P" || e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (key === "F" || key === "R") {
        e.preventDefault();
        handleToggleFlag();
      } else if (key === "C" || e.key === "Delete") {
        e.preventDefault();
        handleClearResponse();
      } else if (key === "K") {
        e.preventDefault();
        setIsCalculatorOpen((prev) => !prev);
      } else if (key === "E") {
        e.preventDefault();
        setIsEliminatorActive((prev) => !prev);
      } else if (key === "S") {
        e.preventDefault();
        setIsSummaryModalOpen(true);
      } else if (["A", "B", "C", "D", "1", "2", "3", "4"].includes(key)) {
        const q = questions[currentIndex];
        if (q && q.type === "MCQ" && q.options) {
          let opts: string[] = [];
          try {
            opts = Array.isArray(q.options) ? q.options : JSON.parse(q.options);
          } catch {
            opts = [];
          }
          const indexMap: Record<string, number> = {
            A: 0,
            "1": 0,
            B: 1,
            "2": 1,
            C: 2,
            "3": 2,
            D: 3,
            "4": 3,
          };
          const targetIndex = indexMap[key];
          if (targetIndex !== undefined && opts[targetIndex]) {
            handleSelectOption(opts[targetIndex]);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, questions, isCalculatorOpen, isEliminatorActive]);

  // Current Question
  const currentQuestion = questions[currentIndex];
  let parsedOptions: string[] = [];
  if (currentQuestion?.options) {
    try {
      parsedOptions = Array.isArray(currentQuestion.options)
        ? currentQuestion.options
        : JSON.parse(currentQuestion.options);
    } catch {
      parsedOptions = [];
    }
  }

  const currentStrikethroughs = strikethroughs[currentQuestion?.id] || [];
  const currentAnswer = answers[currentQuestion?.id] || "";
  const isCurrentFlagged = !!flagged[currentQuestion?.id];

  // Font Size CSS Helper
  const getFontSizeClass = () => {
    switch (fontSize) {
      case "large":
        return "text-lg leading-relaxed";
      case "xlarge":
        return "text-xl leading-loose";
      default:
        return "text-base leading-normal";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-100 text-neutral-900 flex flex-col overflow-hidden font-sans select-none antialiased">
      {/* 1. TOP CANDIDATE IDENTIFICATION & SECURITY BAR */}
      <header className="bg-neutral-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-neutral-800 shrink-0 text-xs font-mono">
        {/* Candidate Profile Info */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-neutral-700 border border-neutral-600 rounded flex items-center justify-center font-bold text-emerald-400 text-sm">
            {getInitials(studentName)}
          </div>
          <div>
            <div className="font-bold text-neutral-100 flex items-center gap-2 font-sans">
              <span>{studentName}</span>
              <span className="px-1.5 py-0.2 bg-neutral-800 text-neutral-400 text-[10px] rounded border border-neutral-700">
                REG: {studentId.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <div className="text-neutral-400 text-[11px] font-sans">
              {exam.school?.name || "Affiliated Institution"} • {exam.subject.name} ({exam.subject.code})
            </div>
          </div>
        </div>

        {/* Central Title */}
        <div className="hidden md:flex flex-col items-center">
          <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
            Standard Computer-Based Assessment
          </span>
          <span className="font-sans font-bold text-sm text-neutral-200">
            {exam.title}
          </span>
        </div>

        {/* Countdown Timer Display */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded border font-mono font-bold text-sm ${
              secondsRemaining <= 60
                ? "bg-rose-950 border-rose-600 text-rose-300 animate-pulse"
                : secondsRemaining <= 300
                ? "bg-amber-950 border-amber-600 text-amber-300"
                : "bg-neutral-800 border-neutral-700 text-emerald-400"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTimeRemaining(secondsRemaining)}</span>
          </div>

          {/* Sync indicator */}
          <div
            className="flex items-center gap-1 text-[10px] text-neutral-400 font-sans"
            title="Periodic server sync heartbeat"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isSyncing ? "bg-amber-400 animate-ping" : "bg-emerald-500"
              }`}
            />
            <span className="hidden sm:inline">
              {isSyncing ? "Syncing..." : "Server Synced"}
            </span>
          </div>
        </div>
      </header>

      {/* 2. CBT UTILITY TOOLBAR */}
      <nav className="bg-neutral-200 border-b border-neutral-300 px-4 py-1.5 flex items-center justify-between text-xs font-sans text-neutral-700 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Font Resizer */}
          <div className="flex items-center border border-neutral-300 bg-white rounded overflow-hidden">
            <button
              onClick={() => setFontSize("normal")}
              className={`px-2 py-1 font-bold ${
                fontSize === "normal"
                  ? "bg-neutral-800 text-white"
                  : "hover:bg-neutral-100"
              }`}
              title="Standard Font Size"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize("large")}
              className={`px-2 py-1 font-bold ${
                fontSize === "large"
                  ? "bg-neutral-800 text-white"
                  : "hover:bg-neutral-100"
              }`}
              title="Large Font Size"
            >
              A
            </button>
            <button
              onClick={() => setFontSize("xlarge")}
              className={`px-2 py-1 font-bold ${
                fontSize === "xlarge"
                  ? "bg-neutral-800 text-white"
                  : "hover:bg-neutral-100"
              }`}
              title="Extra Large Font Size"
            >
              A+
            </button>
          </div>

          {/* Calculator Trigger */}
          {exam.enableCalculator && (
            <button
              onClick={() => setIsCalculatorOpen((prev) => !prev)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded border font-semibold ${
                isCalculatorOpen
                  ? "bg-neutral-800 text-white border-neutral-800"
                  : "bg-white border-neutral-300 hover:bg-neutral-100 text-neutral-800"
              }`}
            >
              <CalcIcon className="w-3.5 h-3.5" />
              <span>Calculator [K]</span>
            </button>
          )}

          {/* Rough Scratchpad Trigger */}
          <button
            onClick={() => setIsScratchpadOpen((prev) => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border font-semibold ${
              isScratchpadOpen
                ? "bg-neutral-800 text-white border-neutral-800"
                : "bg-white border-neutral-300 hover:bg-neutral-100 text-neutral-800"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Scratchpad</span>
          </button>

          {/* Option Eliminator Mode Toggle */}
          <button
            onClick={() => setIsEliminatorActive((prev) => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border font-semibold ${
              isEliminatorActive
                ? "bg-rose-700 text-white border-rose-800 ring-2 ring-rose-400"
                : "bg-white border-neutral-300 hover:bg-neutral-100 text-neutral-800"
            }`}
            title="Toggle cross-out mode to eliminate unlikely options"
          >
            <Strikethrough className="w-3.5 h-3.5" />
            <span>{isEliminatorActive ? "Eliminator: ACTIVE" : "Eliminator [E]"}</span>
          </button>
        </div>

        {/* Right Tools: Hotkeys & Fullscreen */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsKeyboardGuideOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-white border border-neutral-300 hover:bg-neutral-100 rounded font-semibold"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Shortcuts [?]</span>
          </button>

          <button
            onClick={requestFullscreen}
            className="flex items-center gap-1 px-2.5 py-1 bg-neutral-800 text-white rounded font-semibold hover:bg-neutral-700"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {isFullscreen ? "Fullscreen ON" : "Lock Fullscreen"}
            </span>
          </button>
        </div>
      </nav>

      {/* 3. PROCTOR INCIDENT WARNING BANNER */}
      {activeWarning && (
        <div className="bg-rose-900 text-white px-4 py-2 flex items-center justify-between text-xs font-mono font-bold border-b border-rose-950 animate-bounce">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span>{activeWarning}</span>
          </div>
          <button
            onClick={dismissWarning}
            className="px-3 py-1 bg-white text-rose-950 rounded hover:bg-rose-100 text-[11px] font-sans font-bold"
          >
            Acknowledge & Resume Fullscreen
          </button>
        </div>
      )}

      {/* 4. MAIN BODY WORKSPACE (Split Panel: Left Question Viewport, Right Question Palette) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-neutral-100">
        {/* Left Viewport: Question Body & Action Controls */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 lg:p-8 border-r border-neutral-300">
          {currentQuestion ? (
            <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col justify-between space-y-6">
              {/* Question Header */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b-2 border-neutral-300 text-xs font-mono font-bold text-neutral-600">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-neutral-900 font-sans">
                      QUESTION {currentIndex + 1} OF {questions.length}
                    </span>
                    <span className="px-2 py-0.5 bg-neutral-200 text-neutral-800 rounded">
                      SECTION: {currentQuestion.section || "General"}
                    </span>
                  </div>
                  <span className="text-neutral-700">
                    MARKS: +{currentQuestion.marks} PTS
                  </span>
                </div>

                {/* Question Prompt */}
                <div className={`mt-6 font-medium text-neutral-950 ${getFontSizeClass()}`}>
                  {currentQuestion.text}
                </div>

                {/* Multiple Choice Options */}
                {currentQuestion.type === "MCQ" && (
                  <div className="mt-8 space-y-3">
                    {parsedOptions.map((opt, idx) => {
                      const letter = String.fromCharCode(65 + idx);
                      const isSelected = currentAnswer === opt;
                      const isStruck = currentStrikethroughs.includes(opt);

                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectOption(opt)}
                          className={`flex items-start gap-3.5 p-3.5 rounded border-2 transition-all cursor-pointer ${
                            isStruck
                              ? "opacity-40 bg-neutral-200 border-neutral-300 line-through text-neutral-500"
                              : isSelected
                              ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                              : "bg-white border-neutral-300 hover:border-neutral-400 text-neutral-800 hover:bg-neutral-50"
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-mono font-bold border ${
                              isSelected
                                ? "bg-white text-neutral-950 border-white"
                                : "bg-neutral-100 text-neutral-700 border-neutral-300"
                            }`}
                          >
                            {letter}
                          </span>
                          <span className={`flex-1 text-sm pt-0.5 ${getFontSizeClass()}`}>
                            {opt}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* True / False Options */}
                {currentQuestion.type === "TRUE_FALSE" && (
                  <div className="mt-8 grid grid-cols-2 gap-4 max-w-lg">
                    {["True", "False"].map((val) => {
                      const isSelected = currentAnswer.toLowerCase() === val.toLowerCase();
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleSelectOption(val)}
                          className={`p-4 rounded border-2 font-bold text-sm tracking-wide uppercase transition-all ${
                            isSelected
                              ? "bg-neutral-900 text-white border-neutral-900 shadow-md"
                              : "bg-white border-neutral-300 hover:border-neutral-400 text-neutral-800 hover:bg-neutral-50"
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Fill in the Blank Input */}
                {currentQuestion.type === "FILL_BLANK" && (
                  <div className="mt-8 max-w-lg">
                    <label className="block text-xs font-mono font-bold text-neutral-600 mb-2 uppercase">
                      Enter Candidate Response:
                    </label>
                    <input
                      type="text"
                      value={currentAnswer}
                      onChange={(e) => handleSelectOption(e.target.value)}
                      placeholder="Type response here..."
                      className="w-full p-3 rounded border-2 border-neutral-400 bg-white text-base font-mono font-semibold focus:border-neutral-900 focus:outline-none"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* Bottom Action Strip */}
              <div className="pt-6 border-t-2 border-neutral-300 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearResponse}
                    disabled={!currentAnswer}
                    className="flex items-center gap-1.5 px-3 py-2 bg-neutral-200 hover:bg-neutral-300 disabled:opacity-40 text-neutral-800 rounded font-bold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Response [C]</span>
                  </button>

                  <button
                    onClick={handleToggleFlag}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded font-bold border transition-colors ${
                      isCurrentFlagged
                        ? "bg-amber-400 text-neutral-950 border-amber-500 font-bold"
                        : "bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    <Flag className={`w-3.5 h-3.5 ${isCurrentFlagged ? "fill-current" : ""}`} />
                    <span>{isCurrentFlagged ? "Flagged" : "Mark Review [F]"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-1 px-4 py-2 bg-neutral-200 hover:bg-neutral-300 disabled:opacity-40 text-neutral-800 rounded font-bold transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous [P]</span>
                  </button>

                  <button
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        Math.min(questions.length - 1, prev + 1)
                      )
                    }
                    disabled={currentIndex === questions.length - 1}
                    className="flex items-center gap-1 px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded font-bold shadow-sm transition-colors"
                  >
                    <span>Save & Next [N]</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center flex-1 text-neutral-500">
              No examination item selected
            </div>
          )}
        </div>

        {/* Right Palette Panel: Standard CBT Navigation Matrix */}
        <aside className="w-full lg:w-80 bg-neutral-200/80 p-4 flex flex-col justify-between overflow-y-auto shrink-0 border-t lg:border-t-0 font-sans">
          <div className="space-y-4">
            <div className="font-bold text-xs uppercase tracking-wider text-neutral-700 pb-2 border-b border-neutral-300">
              Question Palette
            </div>

            {/* Standard 5-State Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-neutral-700 bg-white p-2.5 rounded border border-neutral-300">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-emerald-600 rounded flex items-center justify-center text-white text-[8px] font-bold">
                  ✓
                </span>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-rose-100 border border-rose-400 rounded" />
                <span>Not Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-amber-400 rounded" />
                <span>Marked Review</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-blue-600 rounded" />
                <span>Ans & Marked</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2 pt-1 border-t border-neutral-200">
                <span className="w-3.5 h-3.5 bg-neutral-100 border border-neutral-300 rounded" />
                <span>Not Visited</span>
              </div>
            </div>

            {/* Matrix of Questions */}
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((q, idx) => {
                const status = getQuestionStatus(
                  q.id,
                  !!visited[q.id],
                  answers,
                  flagged
                );
                const isCurrent = idx === currentIndex;

                let stateClasses = "bg-neutral-100 text-neutral-700 border-neutral-300 hover:bg-neutral-50";

                if (status === "ANSWERED") {
                  stateClasses = "bg-emerald-600 text-white font-bold border-emerald-700";
                } else if (status === "ANSWERED_AND_FLAGGED") {
                  stateClasses = "bg-blue-600 text-white font-bold border-blue-700";
                } else if (status === "FLAGGED") {
                  stateClasses = "bg-amber-400 text-neutral-950 font-bold border-amber-500";
                } else if (status === "NOT_ANSWERED") {
                  stateClasses = "bg-rose-100 text-rose-900 border-rose-300";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 w-full rounded border text-xs font-mono font-bold transition-all flex items-center justify-center cursor-pointer ${stateClasses} ${
                      isCurrent
                        ? "ring-2 ring-offset-1 ring-neutral-950 font-black scale-105 z-10"
                        : ""
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review & Final Submit Action */}
          <div className="pt-4 border-t border-neutral-300 mt-6 space-y-2">
            <button
              onClick={() => setIsSummaryModalOpen(true)}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-mono font-bold rounded shadow transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
            >
              <Send className="w-4 h-4" />
              <span>Review & Submit [S]</span>
            </button>
          </div>
        </aside>
      </div>

      {/* 5. ON-SCREEN CBT TOOLS */}
      <CBTCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      <CBTScratchpad
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
        value={scratchpad}
        onChange={setScratchpad}
      />

      <CBTKeyboardGuide
        isOpen={isKeyboardGuideOpen}
        onClose={() => setIsKeyboardGuideOpen(false)}
      />

      {/* 6. PRE-SUBMISSION AUDIT DIALOG */}
      <CBTSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        questions={questions}
        answers={answers}
        flagged={flagged}
        visited={visited}
        onJumpToQuestion={(idx) => setCurrentIndex(idx)}
        onConfirmSubmit={() => handleFinalSubmit("MANUAL")}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
