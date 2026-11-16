import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const schoolCreateSchema = z.object({
  name: z.string().min(2, "School name is required"),
  code: z.string().min(2, "School code must be at least 2 characters").max(10),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const schools = await prisma.school.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            users: true,
            subjects: true,
            exams: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: schools });
  } catch (err) {
    console.error("GET /api/schools error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch schools" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Super Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = schoolCreateSchema.parse(body);

    const existingCode = await prisma.school.findUnique({
      where: { code: validated.code.toUpperCase() },
    });

    if (existingCode) {
      return NextResponse.json(
        { success: false, error: "A school with this code already exists" },
        { status: 400 }
      );
    }

    const school = await prisma.school.create({
      data: {
        name: validated.name,
        code: validated.code.toUpperCase(),
        address: validated.address || null,
        phone: validated.phone || null,
        email: validated.email || null,
      },
    });

    return NextResponse.json({ success: true, data: school });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.errors[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    console.error("POST /api/schools error:", err);
    return NextResponse.json({ success: false, error: "Failed to create school" }, { status: 500 });
  }
}
