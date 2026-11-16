"use client";

import React, { useState, useEffect, useRef } from "react";
import { formatTimeRemaining, cn } from "@/lib/utils";
import { Clock, AlertTriangle } from "lucide-react";

interface ExamTimerProps {
  initialSeconds: number;
  onTimeUp: () => void;
  className?: string;
}

export default function ExamTimer({
  initialSeconds,
  onTimeUp,
  className,
}: ExamTimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    if (secondsRemaining <= 0) {
      onTimeUpRef.current();
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsRemaining]);

  const isLowTime = secondsRemaining <= 300; // < 5 mins
  const isCriticalTime = secondsRemaining <= 60; // < 1 min

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 px-4 py-2 rounded-xl font-mono text-base font-bold shadow-sm transition-all duration-300 border",
        isCriticalTime
          ? "bg-rose-50 border-rose-300 text-rose-700 animate-pulse ring-2 ring-rose-500/30"
          : isLowTime
          ? "bg-amber-50 border-amber-300 text-amber-700 ring-2 ring-amber-500/20"
          : "bg-white border-gray-200 text-gray-800",
        className
      )}
    >
      {isCriticalTime ? (
        <AlertTriangle className="w-5 h-5 text-rose-600 animate-bounce" />
      ) : (
        <Clock
          className={cn(
            "w-5 h-5",
            isLowTime ? "text-amber-600" : "text-indigo-600"
          )}
        />
      )}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-sans tracking-wider font-semibold text-gray-500 leading-none">
          Time Remaining
        </span>
        <span className="leading-tight mt-0.5">
          {formatTimeRemaining(secondsRemaining)}
        </span>
      </div>
    </div>
  );
}
