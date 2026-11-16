"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ProctorEvent } from "@/types/cbt";

interface UseCBTProctorProps {
  enabled: boolean;
  maxStrikes: number;
  initialStrikes?: number;
  onViolation?: (event: ProctorEvent, strikesRemaining: number) => void;
  onStrikeLimitExceeded?: () => void;
}

export function useCBTProctor({
  enabled,
  maxStrikes,
  initialStrikes = 0,
  onViolation,
  onStrikeLimitExceeded,
}: UseCBTProctorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [strikeCount, setStrikeCount] = useState(initialStrikes);
  const [proctorLogs, setProctorLogs] = useState<ProctorEvent[]>([]);
  const [activeWarning, setActiveWarning] = useState<string | null>(null);

  const onViolationRef = useRef(onViolation);
  onViolationRef.current = onViolation;

  const onLimitExceededRef = useRef(onStrikeLimitExceeded);
  onLimitExceededRef.current = onStrikeLimitExceeded;

  const recordIncident = useCallback(
    (type: ProctorEvent["type"], details: string) => {
      const event: ProctorEvent = {
        timestamp: new Date().toISOString(),
        type,
        details,
      };

      setProctorLogs((prev) => [...prev, event]);

      setStrikeCount((prevStrikes) => {
        const nextStrikes = prevStrikes + 1;
        const remaining = Math.max(0, maxStrikes - nextStrikes);

        setActiveWarning(
          `SECURITY INCIDENT [Strike ${nextStrikes}/${maxStrikes}]: ${details}. ${
            remaining === 0
              ? "STRIKE LIMIT EXCEEDED. EXAM AUTO-SUBMITTING."
              : `${remaining} strike(s) remaining before automated disqualification.`
          }`
        );

        if (onViolationRef.current) {
          onViolationRef.current(event, remaining);
        }

        if (nextStrikes >= maxStrikes && onLimitExceededRef.current) {
          onLimitExceededRef.current();
        }

        return nextStrikes;
      });
    },
    [maxStrikes]
  );

  // Request Fullscreen
  const requestFullscreen = useCallback(async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
      setActiveWarning(null);
    } catch {
      // User or browser denied fullscreen
    }
  }, []);

  // Exit warning dismiss
  const dismissWarning = useCallback(() => {
    setActiveWarning(null);
    requestFullscreen();
  }, [requestFullscreen]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // 1. Fullscreen changes
    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (!active) {
        recordIncident(
          "FULLSCREEN_EXIT",
          "Candidate exited locked fullscreen view"
        );
      }
    };

    // 2. Visibility / Tab switch / Window Blur
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        recordIncident(
          "TAB_BLUR",
          "Candidate switched tab or minimized browser window"
        );
      }
    };

    const handleWindowBlur = () => {
      recordIncident(
        "TAB_BLUR",
        "Candidate focused an external desktop application"
      );
    };

    // 3. Right Click Context Menu Suppression
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      recordIncident("DEVTOOLS_ATTEMPT", "Right-click context menu suppressed");
    };

    // 4. Clipboard Blocking
    const handleCopyCutPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      recordIncident(
        "CLIPBOARD_BLOCKED",
        `Candidate attempted ${e.type} operation`
      );
    };

    // 5. Forbidden Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F12, Ctrl+Shift+I, Ctrl+U (DevTools)
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j")) ||
        (e.ctrlKey && (e.key === "U" || e.key === "u"))
      ) {
        e.preventDefault();
        e.stopPropagation();
        recordIncident("DEVTOOLS_ATTEMPT", `Attempted inspector key shortcut (${e.key})`);
        return;
      }

      // Block Ctrl+C, Ctrl+V, Ctrl+P, Ctrl+S
      if (
        e.ctrlKey &&
        (e.key === "c" ||
          e.key === "C" ||
          e.key === "v" ||
          e.key === "V" ||
          e.key === "p" ||
          e.key === "P" ||
          e.key === "s" ||
          e.key === "S")
      ) {
        e.preventDefault();
        e.stopPropagation();
        recordIncident("KEYBOARD_SHORTCUT", `Blocked prohibited shortcut (Ctrl+${e.key})`);
        return;
      }

      // Block Alt+Tab detection when Alt is pressed
      if (e.altKey && e.key === "Tab") {
        e.preventDefault();
        recordIncident("KEYBOARD_SHORTCUT", "Prohibited window switch key (Alt+Tab)");
      }
    };

    // 6. BeforeUnload / Reload Interception
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Leaving this page will terminate your examination session.";
      return e.returnValue;
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopyCutPaste);
    document.addEventListener("cut", handleCopyCutPaste);
    document.addEventListener("paste", handleCopyCutPaste);
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopyCutPaste);
      document.removeEventListener("cut", handleCopyCutPaste);
      document.removeEventListener("paste", handleCopyCutPaste);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled, recordIncident]);

  return {
    isFullscreen,
    strikeCount,
    proctorLogs,
    activeWarning,
    requestFullscreen,
    dismissWarning,
  };
}
