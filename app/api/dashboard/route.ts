import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { role, id: userId, schoolId } = session.user;

    if (role === "SUPER_ADMIN") {
      const [totalSchools, totalUsers, totalExams, totalStudents, totalTeachers] =
        await Promise.all([
          prisma.school.count(),
          prisma.user.count(),
          prisma.exam.count(),
          prisma.user.count({ where: { role: "STUDENT" } }),
          prisma.user.count({ where: { role: "TEACHER" } }),
        ]);

      const recentExams = await prisma.exam.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          subject: true,
          teacher: true,
          school: true,
          _count: { select: { questions: true, attempts: true } },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          totalSchools,
          totalUsers,
          totalExams,
          totalStudents,
          totalTeachers,
          recentExams,
        },
      });
    }

    if (role === "SCHOOL_ADMIN") {
      const targetSchoolId = schoolId || "";

      const [totalTeachers, totalStudents, totalSubjects, totalExams] =
        await Promise.all([
          prisma.user.count({ where: { schoolId: targetSchoolId, role: "TEACHER" } }),
          prisma.user.count({ where: { schoolId: targetSchoolId, role: "STUDENT" } }),
          prisma.subject.count({ where: { schoolId: targetSchoolId } }),
          prisma.exam.count({ where: { schoolId: targetSchoolId } }),
        ]);

      const recentExams = await prisma.exam.findMany({
        where: { schoolId: targetSchoolId },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          subject: true,
          teacher: true,
          _count: { select: { questions: true, attempts: true } },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          totalTeachers,
          totalStudents,
          totalSubjects,
          totalExams,
          recentExams,
        },
      });
    }

    if (role === "TEACHER") {
      const myExams = await prisma.exam.findMany({
        where: { teacherId: userId },
        include: {
          subject: true,
          teacher: true,
          _count: { select: { questions: true, attempts: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      const totalAttempts = await prisma.examAttempt.count({
        where: {
          exam: { teacherId: userId },
        },
      });

      const attempts = await prisma.examAttempt.findMany({
        where: {
          exam: { teacherId: userId },
          percentage: { not: null },
        },
        select: { percentage: true },
      });

      const averageScore =
        attempts.length > 0
          ? Math.round(
              attempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0) /
                attempts.length
            )
          : 0;

      return NextResponse.json({
        success: true,
        data: {
          totalExams: myExams.length,
          totalAttempts,
          averageScore,
          recentExams: myExams.slice(0, 5),
        },
      });
    }

    if (role === "STUDENT") {
      const [availableExams, completedAttempts] = await Promise.all([
        prisma.exam.count({
          where: {
            schoolId: schoolId || "",
            status: { in: ["ACTIVE", "PUBLISHED"] },
          },
        }),
        prisma.examAttempt.findMany({
          where: {
            studentId: userId,
            status: { in: ["GRADED", "SUBMITTED"] },
          },
          include: {
            exam: {
              include: { subject: true },
            },
            answers: {
              include: { question: true },
            },
          },
          orderBy: { submittedAt: "desc" },
        }),
      ]);

      const averageScore =
        completedAttempts.length > 0
          ? Math.round(
              completedAttempts.reduce(
                (acc, curr) => acc + (curr.percentage || 0),
                0
              ) / completedAttempts.length
            )
          : 0;

      return NextResponse.json({
        success: true,
        data: {
          availableExams,
          completedExams: completedAttempts.length,
          averageScore,
          recentAttempts: completedAttempts.slice(0, 5),
        },
      });
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (err) {
    console.error("GET /api/dashboard error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch dashboard metrics" }, { status: 500 });
  }
}
