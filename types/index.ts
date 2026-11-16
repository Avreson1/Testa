export type Role = "SUPER_ADMIN" | "SCHOOL_ADMIN" | "TEACHER" | "STUDENT";
export type ExamStatus = "DRAFT" | "PUBLISHED" | "ACTIVE" | "COMPLETED";
export type QuestionType = "MCQ" | "TRUE_FALSE" | "FILL_BLANK";
export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "GRADED";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardStats {
  totalSchools?: number;
  totalUsers?: number;
  totalExams?: number;
  totalStudents?: number;
  totalTeachers?: number;
  totalSubjects?: number;
  activeExams?: number;
  completedExams?: number;
  averageScore?: number;
  recentExams?: ExamWithDetails[];
  recentAttempts?: AttemptWithDetails[];
}

export interface SchoolData {
  id: string;
  name: string;
  code: string;
  logo: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: {
    users: number;
    subjects: number;
    exams: number;
  };
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string | null;
  isActive: boolean;
  schoolId: string | null;
  createdAt: string;
  school?: {
    id: string;
    name: string;
    code: string;
  } | null;
}

export interface SubjectData {
  id: string;
  name: string;
  code: string;
  schoolId: string;
  createdAt: string;
  _count?: {
    exams: number;
  };
}

export interface ExamWithDetails {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  totalMarks: number;
  passMarks: number;
  status: ExamStatus;
  shuffleQuestions: boolean;
  showResults: boolean;
  strictLockdown?: boolean;
  enableCalculator?: boolean;
  maxStrikes?: number;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  schoolId: string;
  teacherId: string;
  subjectId: string;
  questions?: (QuestionData | StudentExamQuestion)[];
  school?: {
    name: string;
    code: string;
  };
  subject: {
    id: string;
    name: string;
    code: string;
  };
  teacher: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    questions: number;
    attempts: number;
  };
}

export interface QuestionData {
  id: string;
  text: string;
  section?: string;
  type: QuestionType;
  options: string[] | null;
  correctAnswer: string;
  marks: number;
  explanation: string | null;
  order: number;
  examId: string;
}

export interface StudentExamQuestion {
  id: string;
  text: string;
  section?: string;
  type: QuestionType;
  options: string[] | null;
  marks: number;
  order: number;
}

export interface AnswerSubmission {
  questionId: string;
  selectedAnswer: string;
}

export interface AttemptWithDetails {
  id: string;
  examId: string;
  studentId: string;
  startedAt: string;
  submittedAt: string | null;
  createdAt?: string;
  score: number | null;
  totalMarks: number | null;
  percentage: number | null;
  status: AttemptStatus;
  strikeCount?: number;
  proctorLogs?: string | null;
  timeSpentSeconds?: number;
  student?: {
    id: string;
    name: string;
    email: string;
  };
  exam: {
    id: string;
    title: string;
    duration: number;
    totalMarks: number;
    passMarks: number;
    showResults: boolean;
    subject: {
      name: string;
      code: string;
    };
  };
  answers: {
    id: string;
    selectedAnswer: string;
    isCorrect: boolean;
    marksAwarded: number;
    question: {
      id: string;
      text: string;
      type: QuestionType;
      options: string[] | null;
      correctAnswer: string;
      marks: number;
      explanation: string | null;
    };
  }[];
}
