import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const examIdParam = searchParams.get("examId");
    const studentIdParam = searchParams.get("studentId");
    const role = session.user.role;

    const where: Record<string, unknown> = {};

    if (role === "STUDENT") {
      where.studentId = session.user.id;
      if (examIdParam) where.examId = examIdParam;
    } else if (role === "TEACHER") {
      if (examIdParam) {
        where.examId = examIdParam;
      } else {
        where.exam = { teacherId: session.user.id };
      }
      if (studentIdParam) where.studentId = studentIdParam;
    } else {
      // SCHOOL_ADMIN / SUPER_ADMIN
      if (examIdParam) where.examId = examIdParam;
      if (studentIdParam) where.studentId = studentIdParam;
      if (role === "SCHOOL_ADMIN") {
        where.exam = { schoolId: session.user.schoolId };
      }
    }

    const attempts = await prisma.examAttempt.findMany({
      where,
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
        exam: {
          include: {
            subject: true,
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ success: true, data: attempts });
  } catch (err) {
    console.error("GET /api/results error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch exam results" }, { status: 500 });
  }
}
