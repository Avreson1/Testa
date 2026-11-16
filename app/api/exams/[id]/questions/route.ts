import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const questionCreateSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(3),
  type: z.enum(["MCQ", "TRUE_FALSE", "FILL_BLANK"]),
  options: z.array(z.string()).optional().nullable(),
  correctAnswer: z.string().min(1),
  marks: z.number().min(1).default(1),
  explanation: z.string().optional().nullable(),
  order: z.number().default(0),
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

    const questions = await prisma.question.findMany({
      where: { examId: params.id },
      orderBy: { order: "asc" },
    });

    if (session.user.role === "STUDENT") {
      const sanitized = questions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options,
        marks: q.marks,
        order: q.order,
      }));
      return NextResponse.json({ success: true, data: sanitized });
    }

    return NextResponse.json({ success: true, data: questions });
  } catch (err) {
    console.error("GET /api/exams/[id]/questions error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch questions" }, { status: 500 });
  }
}

export async function POST(
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
    const validated = questionCreateSchema.parse(body);

    const optionsJson = validated.options ? JSON.stringify(validated.options) : null;

    if (validated.id) {
      // Update existing
      const updated = await prisma.question.update({
        where: { id: validated.id },
        data: {
          text: validated.text,
          type: validated.type,
          options: optionsJson,
          correctAnswer: validated.correctAnswer,
          marks: validated.marks,
          explanation: validated.explanation || null,
        },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    // Determine order
    const count = await prisma.question.count({
      where: { examId: params.id },
    });

    const question = await prisma.question.create({
      data: {
        examId: params.id,
        text: validated.text,
        type: validated.type,
        options: optionsJson,
        correctAnswer: validated.correctAnswer,
        marks: validated.marks,
        explanation: validated.explanation || null,
        order: count + 1,
      },
    });

    return NextResponse.json({ success: true, data: question });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.errors[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    console.error("POST /api/exams/[id]/questions error:", err);
    return NextResponse.json({ success: false, error: "Failed to save question" }, { status: 500 });
  }
}
