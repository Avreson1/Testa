import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["SCHOOL_ADMIN", "TEACHER", "STUDENT"]),
  schoolCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const schoolSchema = z.object({
  name: z.string().min(2, "School name must be at least 2 characters"),
  code: z.string().min(2, "School code must be at least 2 characters").max(10, "School code must be at most 10 characters"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

export const subjectSchema = z.object({
  name: z.string().min(2, "Subject name must be at least 2 characters"),
  code: z.string().min(2, "Subject code must be at least 2 characters").max(10, "Subject code must be at most 10 characters"),
});

export const examSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  duration: z.number().min(1, "Duration must be at least 1 minute").max(480, "Duration cannot exceed 8 hours"),
  totalMarks: z.number().min(1, "Total marks must be at least 1"),
  passMarks: z.number().min(0, "Pass marks must be non-negative"),
  subjectId: z.string().min(1, "Subject is required"),
  shuffleQuestions: z.boolean().default(false),
  showResults: z.boolean().default(true),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

export const questionSchema = z.object({
  text: z.string().min(3, "Question text must be at least 3 characters"),
  type: z.enum(["MCQ", "TRUE_FALSE", "FILL_BLANK"]),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  marks: z.number().min(1, "Marks must be at least 1").default(1),
  explanation: z.string().optional(),
  order: z.number().default(0),
});

export const answerSchema = z.object({
  questionId: z.string(),
  selectedAnswer: z.string(),
});

export const submitExamSchema = z.object({
  answers: z.array(answerSchema),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type SchoolInput = z.infer<typeof schoolSchema>;
export type SubjectInput = z.infer<typeof subjectSchema>;
export type ExamInput = z.infer<typeof examSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type AnswerInput = z.infer<typeof answerSchema>;
export type SubmitExamInput = z.infer<typeof submitExamSchema>;
