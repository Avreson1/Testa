import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from "zod";

const registerBodySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER", "STUDENT"]),
  schoolCode: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = registerBodySchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "A user with this email address already exists" },
        { status: 400 }
      );
    }

    let schoolId: string | null = null;

    if (validatedData.role === "STUDENT" || validatedData.role === "TEACHER") {
      if (!validatedData.schoolCode) {
        return NextResponse.json(
          { success: false, error: "School code is required for student and teacher registration" },
          { status: 400 }
        );
      }

      const school = await prisma.school.findUnique({
        where: { code: validatedData.schoolCode.toUpperCase() },
      });

      if (!school) {
        return NextResponse.json(
          { success: false, error: `Invalid school code: "${validatedData.schoolCode}". Please verify with your school.` },
          { status: 400 }
        );
      }

      schoolId = school.id;
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
        schoolId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        schoolId: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: newUser,
      message: "Account created successfully",
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    console.error("Register Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}
