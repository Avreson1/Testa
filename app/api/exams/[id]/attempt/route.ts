import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const attempt = await prisma.examAttempt.findUnique({
      where: {
        examId_studentId: {
          examId: params.id,
          studentId: session.user.id,
        },
      },
      include: {
        answers: true,
      },
    });

    return NextResponse.json({ success: true, data: attempt });
  } catch (err) {
    console.error("GET /api/exams/[id]/attempt error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch attempt" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ success: false, error: "Only students can start an exam attempt" }, { status: 403 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
      include: {
        questions: true,
      },
    });

    if (!exam) {
      return NextResponse.json({ success: false, error: "Exam not found" }, { status: 404 });
    }

    if (exam.status !== "ACTIVE" && exam.status !== "PUBLISHED") {
      return NextResponse.json(
        { success: false, error: "This exam is currently not active for testing" },
        { status: 400 }
      );
    }

    // Check if attempt already exists
    let attempt = await prisma.examAttempt.findUnique({
      where: {
        examId_studentId: {
          examId: params.id,
          studentId: session.user.id,
        },
      },
    });

    if (attempt) {
      if (attempt.status === "SUBMITTED" || attempt.status === "GRADED") {
        return NextResponse.json(
          { success: false, error: "You have already completed this examination." },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true, data: attempt });
    }

    // Create fresh attempt
    attempt = await prisma.examAttempt.create({
      data: {
        examId: params.id,
        studentId: session.user.id,
        status: "IN_PROGRESS",
        totalMarks: exam.totalMarks,
        startedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: attempt });
  } catch (err) {
    console.error("POST /api/exams/[id]/attempt error:", err);
    return NextResponse.json({ success: false, error: "Failed to initialize exam attempt" }, { status: 500 });
  }
}
