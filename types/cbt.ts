export type QuestionNavigationStatus =
  | "UNVISITED"
  | "NOT_ANSWERED"
  | "ANSWERED"
  | "FLAGGED"
  | "ANSWERED_AND_FLAGGED";

export type CBTFontSize = "normal" | "large" | "xlarge";

export interface ProctorEvent {
  timestamp: string;
  type:
    | "FULLSCREEN_EXIT"
    | "TAB_BLUR"
    | "DEVTOOLS_ATTEMPT"
    | "KEYBOARD_SHORTCUT"
    | "CLIPBOARD_BLOCKED"
    | "RELOAD_ATTEMPT";
  details: string;
}

export interface LocalCBTSession {
  examId: string;
  studentId: string;
  answers: Record<string, string>;
  flagged: Record<string, boolean>;
  strikethroughs: Record<string, string[]>; // questionId -> option strings struck through
  scratchpad: string;
  timeSpentSeconds: number;
  proctorLogs: ProctorEvent[];
  strikeCount: number;
  lastUpdated: number;
}

export interface SyncPayload {
  answers: Record<string, string>;
  timeSpentSeconds: number;
  proctorLogs: ProctorEvent[];
  strikeCount: number;
}

export interface SyncResponse {
  success: boolean;
  serverTimeRemaining: number;
  isExpired: boolean;
  strikeCount: number;
}
