import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const submitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedAnswer: z.string(),
    })
  ),
});

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
    const validated = submitSchema.parse(body);

    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
      include: {
        questions: true,
      },
    });

    if (!exam) {
      return NextResponse.json({ success: false, error: "Exam not found" }, { status: 404 });
    }

    // Find attempt
    const attempt = await prisma.examAttempt.findUnique({
      where: {
        examId_studentId: {
          examId: params.id,
          studentId: session.user.id,
        },
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { success: false, error: "No active exam attempt found to submit" },
        { status: 400 }
      );
    }

    if (attempt.status === "GRADED" || attempt.status === "SUBMITTED") {
      return NextResponse.json(
        { success: false, error: "Exam has already been submitted and graded" },
        { status: 400 }
      );
    }

    // Grade answers
    let totalScore = 0;
    const questionsMap = new Map(exam.questions.map((q) => [q.id, q]));

    const answerRecords = validated.answers.map((item) => {
      const q = questionsMap.get(item.questionId);
      if (!q) {
        return {
          attemptId: attempt.id,
          questionId: item.questionId,
          selectedAnswer: item.selectedAnswer,
          isCorrect: false,
          marksAwarded: 0,
        };
      }

      // Evaluation
      let isCorrect = false;
      const cleanSelected = (item.selectedAnswer || "").trim().toLowerCase();
      const cleanCorrect = (q.correctAnswer || "").trim().toLowerCase();

      if (q.type === "FILL_BLANK") {
        isCorrect = cleanSelected === cleanCorrect;
      } else {
        isCorrect = cleanSelected === cleanCorrect;
      }

      const marksAwarded = isCorrect ? q.marks : 0;
      totalScore += marksAwarded;

      return {
        attemptId: attempt.id,
        questionId: item.questionId,
        selectedAnswer: item.selectedAnswer,
        isCorrect,
        marksAwarded,
      };
    });

    // Delete existing answers if any and insert batch
    await prisma.answer.deleteMany({
      where: { attemptId: attempt.id },
    });

    for (const record of answerRecords) {
      await prisma.answer.create({
        data: record,
      });
    }

    const calculatedPercentage =
      exam.totalMarks > 0
        ? Math.min(100, Math.round((totalScore / exam.totalMarks) * 100 * 10) / 10)
        : 0;

    const updatedAttempt = await prisma.examAttempt.update({
      where: { id: attempt.id },
      data: {
        score: totalScore,
        totalMarks: exam.totalMarks,
        percentage: calculatedPercentage,
        status: "GRADED",
        submittedAt: new Date(),
      },
      include: {
        exam: {
          include: { subject: true },
        },
        answers: {
          include: { question: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedAttempt,
      message: "Exam submitted and graded successfully",
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.errors[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    console.error("POST /api/exams/[id]/submit error:", err);
    return NextResponse.json({ success: false, error: "Failed to submit exam" }, { status: 500 });
  }
}
