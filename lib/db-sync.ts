import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function syncDatabaseAndSeed(): Promise<{ success: boolean; log: string[] }> {
  const log: string[] = [];

  try {
    log.push("Starting direct SQL schema migration...");

    // 1. Create School Table
    await prisma.$executeRawUnsafe(`
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
    `);
    log.push("Verified table: School");

    // 2. Create User Table
    await prisma.$executeRawUnsafe(`
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
    `);
    log.push("Verified table: User");

    // 3. Ensure all columns exist on User (specifically User.name which was missing!)
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL DEFAULT '';`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "email" TEXT NOT NULL DEFAULT '';`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT NOT NULL DEFAULT '';`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'STUDENT';`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "schoolId" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatar" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP(3);`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;`);
    log.push("Verified all User columns including User.name");

    // 4. Create Subject Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Subject" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "schoolId" TEXT NOT NULL,
        CONSTRAINT "Subject_code_schoolId_key" UNIQUE ("code", "schoolId")
      );
    `);
    log.push("Verified table: Subject");

    // 5. Create Exam Table
    await prisma.$executeRawUnsafe(`
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
    `);
    log.push("Verified table: Exam");

    // 6. Create Question Table
    await prisma.$executeRawUnsafe(`
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
    `);
    log.push("Verified table: Question");

    // 7. Create ExamAttempt Table
    await prisma.$executeRawUnsafe(`
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
    `);
    log.push("Verified table: ExamAttempt");

    // 8. Create Answer Table
    await prisma.$executeRawUnsafe(`
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
    `);
    log.push("Verified table: Answer");

    // 9. Seed Default Accounts
    const defaultPassword = await bcrypt.hash("password123", 10);

    // Super Admin
    await prisma.$executeRawUnsafe(`
      INSERT INTO "User" ("id", "name", "email", "password", "role", "isActive", "createdAt", "updatedAt")
      VALUES ('admin-01', 'Dominic Avreson', 'admin@testa.com', '${defaultPassword}', 'SUPER_ADMIN', true, NOW(), NOW())
      ON CONFLICT ("email") DO UPDATE SET "password" = '${defaultPassword}', "name" = 'Dominic Avreson';
    `);
    log.push("Seeded Super Admin: admin@testa.com");

    // School
    await prisma.$executeRawUnsafe(`
      INSERT INTO "School" ("id", "name", "code", "email", "isActive", "createdAt", "updatedAt")
      VALUES ('apex-school-01', 'Apex International Academy', 'APEX01', 'info@apex.edu', true, NOW(), NOW())
      ON CONFLICT ("code") DO NOTHING;
    `);
    log.push("Seeded School: Apex International Academy (APEX01)");

    // Teacher
    await prisma.$executeRawUnsafe(`
      INSERT INTO "User" ("id", "name", "email", "password", "role", "isActive", "schoolId", "createdAt", "updatedAt")
      VALUES ('teacher-01', 'Prof. David Miller', 'math@apex.edu', '${defaultPassword}', 'TEACHER', true, 'apex-school-01', NOW(), NOW())
      ON CONFLICT ("email") DO UPDATE SET "password" = '${defaultPassword}';
    `);
    log.push("Seeded Teacher: math@apex.edu");

    // Student
    await prisma.$executeRawUnsafe(`
      INSERT INTO "User" ("id", "name", "email", "password", "role", "isActive", "schoolId", "createdAt", "updatedAt")
      VALUES ('student-01', 'Alex Johnson', 'student@apex.edu', '${defaultPassword}', 'STUDENT', true, 'apex-school-01', NOW(), NOW())
      ON CONFLICT ("email") DO UPDATE SET "password" = '${defaultPassword}';
    `);
    log.push("Seeded Student: student@apex.edu");

    return { success: true, log };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log.push(`Migration error: ${errorMsg}`);
    return { success: false, log };
  }
}
