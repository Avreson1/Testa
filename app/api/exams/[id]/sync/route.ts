import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { computeServerRemainingSeconds } from "@/lib/cbt-engine";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { answers, timeSpentSeconds, proctorLogs, strikeCount } = body;

    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
      include: { questions: true },
    });

    if (!exam) {
      return NextResponse.json({ success: false, error: "Exam not found" }, { status: 404 });
    }

    const attempt = await prisma.examAttempt.findUnique({
      where: {
        examId_studentId: {
          examId: params.id,
          studentId: session.user.id,
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ success: false, error: "No active attempt found" }, { status: 400 });
    }

    if (attempt.status === "GRADED" || attempt.status === "SUBMITTED") {
      return NextResponse.json({
        success: true,
        isExpired: true,
        serverTimeRemaining: 0,
        strikeCount: attempt.strikeCount,
        message: "Attempt has already been finalized",
      });
    }

    // Compute server authoritative remaining time
    const serverRemaining = computeServerRemainingSeconds(
      attempt.startedAt,
      exam.duration
    );

    const isTimedOut = serverRemaining <= 0;
    const isDisqualified = (strikeCount || 0) >= exam.maxStrikes;

    // Checkpoint answers in background
    if (answers && typeof answers === "object") {
      for (const [qId, ansVal] of Object.entries(answers)) {
        if (typeof ansVal === "string") {
          await prisma.answer.upsert({
            where: {
              attemptId_questionId: {
                attemptId: attempt.id,
                questionId: qId,
              },
            },
            create: {
              attemptId: attempt.id,
              questionId: qId,
              selectedAnswer: ansVal,
            },
            update: {
              selectedAnswer: ansVal,
            },
          });
        }
      }
    }

    // Check if auto-submit triggered by timeout or security violation
    if (isTimedOut || isDisqualified) {
      // Grade attempt immediately
      const questionsMap = new Map(exam.questions.map((q) => [q.id, q]));
      let totalScore = 0;

      for (const [qId, ansVal] of Object.entries(answers || {})) {
        const q = questionsMap.get(qId);
        if (q && typeof ansVal === "string") {
          const isCorrect =
            ansVal.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
          const marks = isCorrect ? q.marks : 0;
          totalScore += marks;

          await prisma.answer.upsert({
            where: {
              attemptId_questionId: {
                attemptId: attempt.id,
                questionId: qId,
              },
            },
            create: {
              attemptId: attempt.id,
              questionId: qId,
              selectedAnswer: ansVal,
              isCorrect,
              marksAwarded: marks,
            },
            update: {
              selectedAnswer: ansVal,
              isCorrect,
              marksAwarded: marks,
            },
          });
        }
      }

      const percentage =
        exam.totalMarks > 0
          ? Math.min(100, Math.round((totalScore / exam.totalMarks) * 100 * 10) / 10)
          : 0;

      await prisma.examAttempt.update({
        where: { id: attempt.id },
        data: {
          score: totalScore,
          percentage,
          status: "GRADED",
          submittedAt: new Date(),
          strikeCount: strikeCount ?? attempt.strikeCount,
          timeSpentSeconds: timeSpentSeconds ?? attempt.timeSpentSeconds,
          proctorLogs: proctorLogs ? JSON.stringify(proctorLogs) : attempt.proctorLogs,
        },
      });

      return NextResponse.json({
        success: true,
        isExpired: true,
        serverTimeRemaining: 0,
        strikeCount: strikeCount ?? attempt.strikeCount,
        reason: isDisqualified ? "STRIKE_LIMIT_EXCEEDED" : "TIMEOUT",
      });
    }

    // Normal heartbeat update
    await prisma.examAttempt.update({
      where: { id: attempt.id },
      data: {
        lastSyncAt: new Date(),
        strikeCount: strikeCount ?? attempt.strikeCount,
        timeSpentSeconds: timeSpentSeconds ?? attempt.timeSpentSeconds,
        proctorLogs: proctorLogs ? JSON.stringify(proctorLogs) : attempt.proctorLogs,
      },
    });

    return NextResponse.json({
      success: true,
      isExpired: false,
      serverTimeRemaining: serverRemaining,
      strikeCount: strikeCount ?? attempt.strikeCount,
    });
  } catch (err) {
    console.error("POST /api/exams/[id]/sync error:", err);
    return NextResponse.json({ success: false, error: "Sync failure" }, { status: 500 });
  }
}
