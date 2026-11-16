import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const subjectSchema = z.object({
  name: z.string().min(2, "Subject name is required"),
  code: z.string().min(2, "Subject code is required").max(10),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const schoolId = session.user.schoolId;
    const where = schoolId ? { schoolId } : {};

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        _count: {
          select: { exams: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: subjects });
  } catch (err) {
    console.error("GET /api/subjects error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch subjects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      (session.user.role !== "SUPER_ADMIN" &&
        session.user.role !== "SCHOOL_ADMIN" &&
        session.user.role !== "TEACHER")
    ) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const schoolId = session.user.schoolId;
    if (!schoolId && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "School association required to create subjects" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validated = subjectSchema.parse(body);

    const targetSchoolId = schoolId || body.schoolId;

    const existing = await prisma.subject.findFirst({
      where: {
        code: validated.code.toUpperCase(),
        schoolId: targetSchoolId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Subject code already exists in this school" },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.create({
      data: {
        name: validated.name,
        code: validated.code.toUpperCase(),
        schoolId: targetSchoolId,
      },
    });

    return NextResponse.json({ success: true, data: subject });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.errors[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    console.error("POST /api/subjects error:", err);
    return NextResponse.json({ success: false, error: "Failed to create subject" }, { status: 500 });
  }
}
