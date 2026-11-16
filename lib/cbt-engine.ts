import { LocalCBTSession, QuestionNavigationStatus } from "@/types/cbt";

const STORAGE_PREFIX = "cbt_hub_engine_session_";

export function getSessionStorageKey(examId: string, studentId: string): string {
  return `${STORAGE_PREFIX}${examId}_${studentId}`;
}

export function saveLocalSession(session: LocalCBTSession): void {
  if (typeof window === "undefined") return;
  try {
    const key = getSessionStorageKey(session.examId, session.studentId);
    window.localStorage.setItem(
      key,
      JSON.stringify({
        ...session,
        lastUpdated: Date.now(),
      })
    );
  } catch (err) {
    console.warn("Failed to persist CBT local session", err);
  }
}

export function loadLocalSession(
  examId: string,
  studentId: string
): LocalCBTSession | null {
  if (typeof window === "undefined") return null;
  try {
    const key = getSessionStorageKey(examId, studentId);
    const data = window.localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data) as LocalCBTSession;
  } catch {
    return null;
  }
}

export function clearLocalSession(examId: string, studentId: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = getSessionStorageKey(examId, studentId);
    window.localStorage.removeItem(key);
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Calculates standardized CBT question palette status:
 * - ANSWERED_AND_FLAGGED: answered and flagged for later review
 * - ANSWERED: has answer, not flagged
 * - FLAGGED: visited, no answer, marked for review
 * - NOT_ANSWERED: visited, no answer, not flagged
 * - UNVISITED: candidate has never reached this question
 */
export function getQuestionStatus(
  questionId: string,
  hasVisited: boolean,
  answers: Record<string, string>,
  flagged: Record<string, boolean>
): QuestionNavigationStatus {
  const isAnswered = !!answers[questionId] && answers[questionId].trim().length > 0;
  const isFlagged = !!flagged[questionId];

  if (isAnswered && isFlagged) return "ANSWERED_AND_FLAGGED";
  if (isAnswered) return "ANSWERED";
  if (isFlagged) return "FLAGGED";
  if (hasVisited) return "NOT_ANSWERED";
  return "UNVISITED";
}

/**
 * Computes exact authoritative server seconds remaining
 */
export function computeServerRemainingSeconds(
  startedAt: string | Date,
  durationMinutes: number
): number {
  const startMs = new Date(startedAt).getTime();
  const totalMs = durationMinutes * 60 * 1000;
  const elapsedMs = Date.now() - startMs;
  const remainingMs = totalMs - elapsedMs;
  return Math.max(0, Math.floor(remainingMs / 1000));
}
