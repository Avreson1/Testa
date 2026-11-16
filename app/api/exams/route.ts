import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const examCreateSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  subjectId: z.string().min(1),
  duration: z.number().min(1),
  totalMarks: z.number().min(1),
  passMarks: z.number().min(0),
  shuffleQuestions: z.boolean().default(false),
  showResults: z.boolean().default(true),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");

    const role = session.user.role;
    const schoolId = session.user.schoolId;

    const where: Record<string, unknown> = {};

    if (role === "STUDENT") {
      // Students only see ACTIVE or PUBLISHED exams for their school
      where.schoolId = schoolId;
      if (statusParam) {
        where.status = statusParam;
      } else {
        where.status = { in: ["ACTIVE", "PUBLISHED"] };
      }
    } else if (role === "TEACHER") {
      // Teachers see exams they created or exams in their school
      where.schoolId = schoolId;
      if (statusParam) where.status = statusParam;
    } else if (role === "SCHOOL_ADMIN") {
      where.schoolId = schoolId;
      if (statusParam) where.status = statusParam;
    } else {
      // SUPER_ADMIN
      if (statusParam) where.status = statusParam;
    }

    const exams = await prisma.exam.findMany({
      where,
      include: {
        subject: {
          select: { id: true, name: true, code: true },
        },
        teacher: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: exams });
  } catch (err) {
    console.error("GET /api/exams error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch exams" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      (session.user.role !== "TEACHER" &&
        session.user.role !== "SCHOOL_ADMIN" &&
        session.user.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validated = examCreateSchema.parse(body);

    const schoolId = session.user.schoolId;
    if (!schoolId && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "School association required" }, { status: 400 });
    }

    const newExam = await prisma.exam.create({
      data: {
        title: validated.title,
        description: validated.description || null,
        subjectId: validated.subjectId,
        duration: validated.duration,
        totalMarks: validated.totalMarks,
        passMarks: validated.passMarks,
        shuffleQuestions: validated.shuffleQuestions,
        showResults: validated.showResults,
        status: "DRAFT",
        schoolId: schoolId || body.schoolId,
        teacherId: session.user.id,
      },
      include: {
        subject: true,
        teacher: true,
      },
    });

    return NextResponse.json({ success: true, data: newExam });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.errors[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    console.error("POST /api/exams error:", err);
    return NextResponse.json({ success: false, error: "Failed to create exam" }, { status: 500 });
  }
}
