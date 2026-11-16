import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const examUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional().nullable(),
  subjectId: z.string().min(1).optional(),
  duration: z.number().min(1).optional(),
  totalMarks: z.number().min(1).optional(),
  passMarks: z.number().min(0).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ACTIVE", "COMPLETED"]).optional(),
  shuffleQuestions: z.boolean().optional(),
  showResults: z.boolean().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
      include: {
        subject: true,
        teacher: { select: { id: true, name: true, email: true } },
        questions: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: { attempts: true },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ success: false, error: "Exam not found" }, { status: 404 });
    }

    // Hide correct answers if requested by a student during an ongoing active exam
    if (session.user.role === "STUDENT") {
      const sanitizedQuestions = exam.questions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options,
        marks: q.marks,
        order: q.order,
      }));

      return NextResponse.json({
        success: true,
        data: {
          ...exam,
          questions: sanitizedQuestions,
        },
      });
    }

    return NextResponse.json({ success: true, data: exam });
  } catch (err) {
    console.error("GET /api/exams/[id] error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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
    const validated = examUpdateSchema.parse(body);

    const updated = await prisma.exam.update({
      where: { id: params.id },
      data: {
        ...(validated.title && { title: validated.title }),
        description: validated.description,
        ...(validated.subjectId && { subjectId: validated.subjectId }),
        ...(validated.duration && { duration: validated.duration }),
        ...(validated.totalMarks && { totalMarks: validated.totalMarks }),
        ...(validated.passMarks !== undefined && { passMarks: validated.passMarks }),
        ...(validated.status && { status: validated.status }),
        ...(validated.shuffleQuestions !== undefined && { shuffleQuestions: validated.shuffleQuestions }),
        ...(validated.showResults !== undefined && { showResults: validated.showResults }),
      },
      include: {
        subject: true,
        teacher: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.errors[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    console.error("PUT /api/exams/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to update exam" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    await prisma.exam.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Exam deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/exams/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete exam" }, { status: 500 });
  }
}
