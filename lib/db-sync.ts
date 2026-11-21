import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function syncDatabaseAndSeed(): Promise<{ success: boolean; log: string[] }> {
  const log: string[] = [];

  try {
    log.push("Starting direct SQL schema migration...");

    // Deallocate any cached prepared statements from connection pool
    try {
      await prisma.$executeRawUnsafe(`DEALLOCATE ALL;`);
      log.push("Prepared statements deallocated from session pool.");
    } catch {
      // Ignore if unsupported or no prepared statements exist
    }

    // Execute complete table definitions and column alterations in a single batch
    const schemaSql = `
      CREATE TABLE IF NOT EXISTS "School" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "code" TEXT UNIQUE NOT NULL,
        "logo" TEXT,
        "address" TEXT,
        "phone" TEXT,
        "email" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL DEFAULT '',
        "email" TEXT UNIQUE NOT NULL,
        "password" TEXT NOT NULL DEFAULT '',
        "role" TEXT NOT NULL DEFAULT 'STUDENT',
        "avatar" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "emailVerified" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "schoolId" TEXT
      );

      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL DEFAULT '';
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "email" TEXT NOT NULL DEFAULT '';
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT NOT NULL DEFAULT '';
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'STUDENT';
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "schoolId" TEXT;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatar" TEXT;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP(3);
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

      CREATE TABLE IF NOT EXISTS "Subject" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "schoolId" TEXT NOT NULL,
        CONSTRAINT "Subject_code_schoolId_key" UNIQUE ("code", "schoolId")
      );

      CREATE TABLE IF NOT EXISTS "Exam" (
        "id" TEXT PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "duration" INTEGER NOT NULL,
        "totalMarks" INTEGER NOT NULL DEFAULT 100,
        "passMarks" INTEGER NOT NULL DEFAULT 50,
        "status" TEXT NOT NULL DEFAULT 'DRAFT',
        "shuffleQuestions" BOOLEAN NOT NULL DEFAULT false,
        "showResults" BOOLEAN NOT NULL DEFAULT true,
        "strictLockdown" BOOLEAN NOT NULL DEFAULT true,
        "enableCalculator" BOOLEAN NOT NULL DEFAULT true,
        "maxStrikes" INTEGER NOT NULL DEFAULT 3,
        "startTime" TIMESTAMP(3),
        "endTime" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "schoolId" TEXT NOT NULL,
        "teacherId" TEXT NOT NULL,
        "subjectId" TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "Question" (
        "id" TEXT PRIMARY KEY,
        "text" TEXT NOT NULL,
        "section" TEXT NOT NULL DEFAULT 'General',
        "type" TEXT NOT NULL DEFAULT 'MCQ',
        "options" TEXT,
        "correctAnswer" TEXT NOT NULL,
        "marks" INTEGER NOT NULL DEFAULT 1,
        "explanation" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "examId" TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "ExamAttempt" (
        "id" TEXT PRIMARY KEY,
        "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "submittedAt" TIMESTAMP(3),
        "score" INTEGER,
        "totalMarks" INTEGER,
        "percentage" DOUBLE PRECISION,
        "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
        "strikeCount" INTEGER NOT NULL DEFAULT 0,
        "proctorLogs" TEXT,
        "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
        "lastSyncAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "examId" TEXT NOT NULL,
        "studentId" TEXT NOT NULL,
        CONSTRAINT "ExamAttempt_examId_studentId_key" UNIQUE ("examId", "studentId")
      );

      CREATE TABLE IF NOT EXISTS "Answer" (
        "id" TEXT PRIMARY KEY,
        "selectedAnswer" TEXT NOT NULL,
        "isCorrect" BOOLEAN NOT NULL DEFAULT false,
        "marksAwarded" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "attemptId" TEXT NOT NULL,
        "questionId" TEXT NOT NULL,
        CONSTRAINT "Answer_attemptId_questionId_key" UNIQUE ("attemptId", "questionId")
      );
    `;

    await prisma.$executeRawUnsafe(schemaSql);
    log.push("All database tables and User columns verified successfully.");

    // Seed default accounts in a single batch
    const defaultPassword = await bcrypt.hash("password123", 10);
    const seedSql = `
      INSERT INTO "School" ("id", "name", "code", "email", "isActive", "createdAt", "updatedAt")
      VALUES ('apex-school-01', 'Apex International Academy', 'APEX01', 'info@apex.edu', true, NOW(), NOW())
      ON CONFLICT ("code") DO NOTHING;

      INSERT INTO "User" ("id", "name", "email", "password", "role", "isActive", "createdAt", "updatedAt")
      VALUES ('admin-01', 'Dominic Avreson', 'admin@testa.com', '${defaultPassword}', 'SUPER_ADMIN', true, NOW(), NOW())
      ON CONFLICT ("email") DO UPDATE SET "password" = '${defaultPassword}', "name" = 'Dominic Avreson';

      INSERT INTO "User" ("id", "name", "email", "password", "role", "isActive", "schoolId", "createdAt", "updatedAt")
      VALUES ('teacher-01', 'Prof. David Miller', 'math@apex.edu', '${defaultPassword}', 'TEACHER', true, 'apex-school-01', NOW(), NOW())
      ON CONFLICT ("email") DO UPDATE SET "password" = '${defaultPassword}';

      INSERT INTO "User" ("id", "name", "email", "password", "role", "isActive", "schoolId", "createdAt", "updatedAt")
      VALUES ('student-01', 'Alex Johnson', 'student@apex.edu', '${defaultPassword}', 'STUDENT', true, 'apex-school-01', NOW(), NOW())
      ON CONFLICT ("email") DO UPDATE SET "password" = '${defaultPassword}';
    `;

    await prisma.$executeRawUnsafe(seedSql);
    log.push("Default demo accounts (admin, teacher, student) seeded successfully.");

    return { success: true, log };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log.push(`Migration error: ${errorMsg}`);
    return { success: false, log };
  }
}
