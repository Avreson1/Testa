import { Client } from "pg";
import bcrypt from "bcryptjs";

export async function syncDatabaseAndSeed(): Promise<{ success: boolean; log: string[] }> {
  const log: string[] = [];

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return { success: false, log: ["DATABASE_URL is not set."] };
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1")
      ? false
      : { rejectUnauthorized: false },
  });

  try {
    log.push("Connecting directly to PostgreSQL database via native client...");
    await client.connect();
    log.push("Connected successfully.");

    const fullSql = `
      -- 1. School Table & Column Alterations
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
      ALTER TABLE "School" ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL DEFAULT '';
      ALTER TABLE "School" ADD COLUMN IF NOT EXISTS "code" TEXT NOT NULL DEFAULT '';
      ALTER TABLE "School" ADD COLUMN IF NOT EXISTS "logo" TEXT;
      ALTER TABLE "School" ADD COLUMN IF NOT EXISTS "address" TEXT;
      ALTER TABLE "School" ADD COLUMN IF NOT EXISTS "phone" TEXT;
      ALTER TABLE "School" ADD COLUMN IF NOT EXISTS "email" TEXT;
      ALTER TABLE "School" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
      ALTER TABLE "School" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE "School" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

      -- 2. User Table & Column Alterations
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

      -- 3. Subject Table & Column Alterations
      CREATE TABLE IF NOT EXISTS "Subject" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "schoolId" TEXT NOT NULL,
        CONSTRAINT "Subject_code_schoolId_key" UNIQUE ("code", "schoolId")
      );
      ALTER TABLE "Subject" ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL DEFAULT '';
      ALTER TABLE "Subject" ADD COLUMN IF NOT EXISTS "code" TEXT NOT NULL DEFAULT '';
      ALTER TABLE "Subject" ADD COLUMN IF NOT EXISTS "schoolId" TEXT NOT NULL DEFAULT '';
      ALTER TABLE "Subject" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE "Subject" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

      -- 4. Exam Table & Column Alterations
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
      ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "title" TEXT NOT NULL DEFAULT '';
      ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "description" TEXT;
      ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "duration" INTEGER NOT NULL DEFAULT 60;
      ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "totalMarks" INTEGER NOT NULL DEFAULT 100;
      ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "passMarks" INTEGER NOT NULL DEFAULT 50;
      ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'DRAFT';
      ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "shuffleQuestions" BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "showResults" BOOLEAN NOT NULL DEFAULT true;
      ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "strictLockdown" BOOLEAN NOT NULL DEFAULT true;
      ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "enableCalculator" BOOLEAN NOT NULL DEFAULT true;
      ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "maxStrikes" INTEGER NOT NULL DEFAULT 3;
      ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "startTime" TIMESTAMP(3);
      ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "endTime" TIMESTAMP(3);
      ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "schoolId" TEXT NOT NULL DEFAULT '';
      ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "teacherId" TEXT NOT NULL DEFAULT '';
      ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "subjectId" TEXT NOT NULL DEFAULT '';
      ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

      -- 5. Question Table & Column Alterations
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
      ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "text" TEXT NOT NULL DEFAULT '';
      ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "section" TEXT NOT NULL DEFAULT 'General';
      ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'MCQ';
      ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "options" TEXT;
      ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "correctAnswer" TEXT NOT NULL DEFAULT '';
      ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "marks" INTEGER NOT NULL DEFAULT 1;
      ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "explanation" TEXT;
      ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "examId" TEXT NOT NULL DEFAULT '';
      ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

      -- 6. ExamAttempt Table & Column Alterations
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
      ALTER TABLE "ExamAttempt" ADD COLUMN IF NOT EXISTS "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE "ExamAttempt" ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP(3);
      ALTER TABLE "ExamAttempt" ADD COLUMN IF NOT EXISTS "score" INTEGER;
      ALTER TABLE "ExamAttempt" ADD COLUMN IF NOT EXISTS "totalMarks" INTEGER;
      ALTER TABLE "ExamAttempt" ADD COLUMN IF NOT EXISTS "percentage" DOUBLE PRECISION;
      ALTER TABLE "ExamAttempt" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS';
      ALTER TABLE "ExamAttempt" ADD COLUMN IF NOT EXISTS "strikeCount" INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE "ExamAttempt" ADD COLUMN IF NOT EXISTS "proctorLogs" TEXT;
      ALTER TABLE "ExamAttempt" ADD COLUMN IF NOT EXISTS "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE "ExamAttempt" ADD COLUMN IF NOT EXISTS "lastSyncAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE "ExamAttempt" ADD COLUMN IF NOT EXISTS "examId" TEXT NOT NULL DEFAULT '';
      ALTER TABLE "ExamAttempt" ADD COLUMN IF NOT EXISTS "studentId" TEXT NOT NULL DEFAULT '';
      ALTER TABLE "ExamAttempt" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE "ExamAttempt" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

      -- 7. Answer Table & Column Alterations
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
      ALTER TABLE "Answer" ADD COLUMN IF NOT EXISTS "selectedAnswer" TEXT NOT NULL DEFAULT '';
      ALTER TABLE "Answer" ADD COLUMN IF NOT EXISTS "isCorrect" BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE "Answer" ADD COLUMN IF NOT EXISTS "marksAwarded" INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE "Answer" ADD COLUMN IF NOT EXISTS "attemptId" TEXT NOT NULL DEFAULT '';
      ALTER TABLE "Answer" ADD COLUMN IF NOT EXISTS "questionId" TEXT NOT NULL DEFAULT '';
      ALTER TABLE "Answer" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE "Answer" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    `;

    log.push("Executing multi-statement schema migration & column sync...");
    await client.query(fullSql);
    log.push("Schema successfully migrated. All tables and columns verified.");

    // Seed default accounts
    const defaultPassword = await bcrypt.hash("password123", 10);
    const seedSql = `
      INSERT INTO "School" ("id", "name", "code", "email", "isActive", "createdAt", "updatedAt")
      VALUES ('apex-school-01', 'Apex International Academy', 'APEX01', 'info@apex.edu', true, NOW(), NOW())
      ON CONFLICT ("code") DO UPDATE SET "email" = 'info@apex.edu', "name" = 'Apex International Academy';

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

    log.push("Seeding default demo accounts...");
    await client.query(seedSql);
    log.push("Default demo accounts seeded successfully.");

    await client.end();
    return { success: true, log };
  } catch (error: unknown) {
    try {
      await client.end();
    } catch {}
    const errorMsg = error instanceof Error ? error.message : String(error);
    log.push(`Migration error: ${errorMsg}`);
    return { success: false, log };
  }
}
