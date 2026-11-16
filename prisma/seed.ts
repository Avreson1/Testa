import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding CBT-Hub (Testa) database...");

  // Clean existing records
  await prisma.answer.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.question.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();

  const defaultPassword = await bcrypt.hash("password123", 10);

  // 1. Create Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      name: "Dominic Avreson",
      email: "admin@testa.com",
      password: defaultPassword,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });
  console.log(`Created Super Admin: ${superAdmin.email}`);

  // 2. Create Apex High School
  const apexSchool = await prisma.school.create({
    data: {
      name: "Apex International Academy",
      code: "APEX01",
      address: "124 Innovation Way, Tech District",
      phone: "+1 (555) 234-5678",
      email: "info@apex.edu",
      isActive: true,
    },
  });

  // 3. Create Greenwood College
  const greenwoodSchool = await prisma.school.create({
    data: {
      name: "Greenwood College of Science",
      code: "GWD02",
      address: "450 Academic Boulevard, Silicon Valley",
      phone: "+1 (555) 876-5432",
      email: "contact@greenwood.edu",
      isActive: true,
    },
  });
  console.log("Created 2 schools: APEX01, GWD02");

  // 4. Create Apex School Admin
  const apexAdmin = await prisma.user.create({
    data: {
      name: "Dr. Victoria Chase",
      email: "admin@apex.edu",
      password: defaultPassword,
      role: "SCHOOL_ADMIN",
      schoolId: apexSchool.id,
      isActive: true,
    },
  });

  // 5. Create Teachers
  const teacherMath = await prisma.user.create({
    data: {
      name: "Prof. Alan Turing",
      email: "math@apex.edu",
      password: defaultPassword,
      role: "TEACHER",
      schoolId: apexSchool.id,
      isActive: true,
    },
  });

  const teacherScience = await prisma.user.create({
    data: {
      name: "Dr. Marie Curie",
      email: "science@apex.edu",
      password: defaultPassword,
      role: "TEACHER",
      schoolId: apexSchool.id,
      isActive: true,
    },
  });

  const greenwoodTeacher = await prisma.user.create({
    data: {
      name: "Ada Lovelace",
      email: "cs@greenwood.edu",
      password: defaultPassword,
      role: "TEACHER",
      schoolId: greenwoodSchool.id,
      isActive: true,
    },
  });

  // 6. Create Students
  const student1 = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "student@apex.edu",
      password: defaultPassword,
      role: "STUDENT",
      schoolId: apexSchool.id,
      isActive: true,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: "Sarah Connor",
      email: "sarah@apex.edu",
      password: defaultPassword,
      role: "STUDENT",
      schoolId: apexSchool.id,
      isActive: true,
    },
  });

  const student3 = await prisma.user.create({
    data: {
      name: "Marcus Aurelius",
      email: "marcus@apex.edu",
      password: defaultPassword,
      role: "STUDENT",
      schoolId: apexSchool.id,
      isActive: true,
    },
  });

  console.log("Created users for Apex and Greenwood");

  // 7. Create Subjects
  const mathSubject = await prisma.subject.create({
    data: {
      name: "Mathematics",
      code: "MTH101",
      schoolId: apexSchool.id,
    },
  });

  const physicsSubject = await prisma.subject.create({
    data: {
      name: "General Physics",
      code: "PHY101",
      schoolId: apexSchool.id,
    },
  });

  const chemSubject = await prisma.subject.create({
    data: {
      name: "Introductory Chemistry",
      code: "CHM101",
      schoolId: apexSchool.id,
    },
  });

  const csSubject = await prisma.subject.create({
    data: {
      name: "Computer Science",
      code: "CSC101",
      schoolId: greenwoodSchool.id,
    },
  });

  // 8. Create Exams
  const mathExam = await prisma.exam.create({
    data: {
      title: "Calculus & Algebra Mid-Term Examination",
      description: "Comprehensive testing covering linear equations, matrix operations, quadratic formulas, and basic derivatives.",
      duration: 30, // 30 minutes
      totalMarks: 50,
      passMarks: 25,
      status: "ACTIVE",
      shuffleQuestions: true,
      showResults: true,
      schoolId: apexSchool.id,
      teacherId: teacherMath.id,
      subjectId: mathSubject.id,
    },
  });

  const physicsExam = await prisma.exam.create({
    data: {
      title: "Classical Mechanics & Thermodynamics",
      description: "Covers Newton's laws of motion, kinetic energy, gravitational potential, and thermodynamic cycles.",
      duration: 45,
      totalMarks: 40,
      passMarks: 20,
      status: "PUBLISHED",
      shuffleQuestions: false,
      showResults: true,
      schoolId: apexSchool.id,
      teacherId: teacherScience.id,
      subjectId: physicsSubject.id,
    },
  });

  const chemExam = await prisma.exam.create({
    data: {
      title: "Chemical Bonding & Stoichiometry Quiz",
      description: "Quick evaluation on atomic orbital theory, covalent vs ionic bonding, and molecular molarity.",
      duration: 15,
      totalMarks: 20,
      passMarks: 10,
      status: "COMPLETED",
      shuffleQuestions: true,
      showResults: true,
      schoolId: apexSchool.id,
      teacherId: teacherScience.id,
      subjectId: chemSubject.id,
    },
  });

  // 9. Add Questions to Math Exam
  const mathQuestions = [
    {
      text: "What is the solution to the quadratic equation x^2 - 5x + 6 = 0?",
      type: "MCQ",
      options: JSON.stringify(["x = 2 and x = 3", "x = -2 and x = -3", "x = 1 and x = 6", "x = -1 and x = 6"]),
      correctAnswer: "x = 2 and x = 3",
      marks: 5,
      explanation: "Factoring the equation gives (x - 2)(x - 3) = 0, therefore x = 2 or x = 3.",
      order: 1,
    },
    {
      text: "What is the derivative of f(x) = 3x^3 + 2x^2 - 5x + 7 with respect to x?",
      type: "MCQ",
      options: JSON.stringify(["9x^2 + 4x - 5", "9x^3 + 4x - 5", "6x^2 + 2x - 5", "3x^2 + 4x + 7"]),
      correctAnswer: "9x^2 + 4x - 5",
      marks: 5,
      explanation: "Using the power rule: d/dx(3x^3) = 9x^2, d/dx(2x^2) = 4x, d/dx(-5x) = -5.",
      order: 2,
    },
    {
      text: "The matrix multiplication of an (m x n) matrix and an (n x p) matrix results in an (m x p) matrix.",
      type: "TRUE_FALSE",
      options: JSON.stringify(["True", "False"]),
      correctAnswer: "True",
      marks: 5,
      explanation: "Matrix multiplication requires the inner dimensions to match (n) and the result takes the outer dimensions (m x p).",
      order: 3,
    },
    {
      text: "Evaluate the limit: lim(x -> 0) of (sin(x) / x).",
      type: "FILL_BLANK",
      options: null,
      correctAnswer: "1",
      marks: 5,
      explanation: "By L'Hopital's rule or standard trigonometric limits, lim(x->0) sin(x)/x = 1.",
      order: 4,
    },
    {
      text: "Which of the following is the value of the determinant of a 2x2 identity matrix?",
      type: "MCQ",
      options: JSON.stringify(["1", "0", "-1", "2"]),
      correctAnswer: "1",
      marks: 5,
      explanation: "det([[1,0],[0,1]]) = (1)(1) - (0)(0) = 1.",
      order: 5,
    },
    {
      text: "If vector A = (3, 4), what is the magnitude ||A||?",
      type: "FILL_BLANK",
      options: null,
      correctAnswer: "5",
      marks: 5,
      explanation: "||A|| = sqrt(3^2 + 4^2) = sqrt(9 + 16) = sqrt(25) = 5.",
      order: 6,
    },
    {
      text: "Every square matrix is invertible.",
      type: "TRUE_FALSE",
      options: JSON.stringify(["True", "False"]),
      correctAnswer: "False",
      marks: 5,
      explanation: "A square matrix is invertible if and only if its determinant is non-zero.",
      order: 7,
    },
    {
      text: "What is the slope of the line perpendicular to y = 2x + 4?",
      type: "MCQ",
      options: JSON.stringify(["-1/2", "2", "-2", "1/2"]),
      correctAnswer: "-1/2",
      marks: 5,
      explanation: "Perpendicular lines have negative reciprocal slopes. m = -1/2.",
      order: 8,
    },
    {
      text: "Euler's formula states that e^(i*pi) + 1 equals:",
      type: "FILL_BLANK",
      options: null,
      correctAnswer: "0",
      marks: 5,
      explanation: "Euler's identity: e^(i*pi) + 1 = 0.",
      order: 9,
    },
    {
      text: "In probability theory, the sum of probabilities of all mutually exclusive elementary events is 1.",
      type: "TRUE_FALSE",
      options: JSON.stringify(["True", "False"]),
      correctAnswer: "True",
      marks: 5,
      explanation: "The total probability space always sums up to 1 (100%).",
      order: 10,
    },
  ];

  for (const q of mathQuestions) {
    await prisma.question.create({
      data: {
        ...q,
        examId: mathExam.id,
      },
    });
  }

  // 10. Add Questions to Chem Exam
  const chemQuestions = [
    {
      text: "What is the atomic number of Carbon?",
      type: "FILL_BLANK",
      options: null,
      correctAnswer: "6",
      marks: 5,
      explanation: "Carbon has 6 protons, giving it atomic number 6.",
      order: 1,
    },
    {
      text: "Which of the following bonds involves the sharing of electron pairs?",
      type: "MCQ",
      options: JSON.stringify(["Covalent Bond", "Ionic Bond", "Metallic Bond", "Hydrogen Bond"]),
      correctAnswer: "Covalent Bond",
      marks: 5,
      explanation: "Covalent bonds form when atoms share electron pairs.",
      order: 2,
    },
    {
      text: "Water (H2O) has a bent molecular geometry due to lone pair repulsion on the oxygen atom.",
      type: "TRUE_FALSE",
      options: JSON.stringify(["True", "False"]),
      correctAnswer: "True",
      marks: 5,
      explanation: "Oxygen has two lone pairs in H2O, giving it a bent shape (approx 104.5 degrees).",
      order: 3,
    },
    {
      text: "What is the pH value of pure distilled water at 25 degrees Celsius?",
      type: "FILL_BLANK",
      options: null,
      correctAnswer: "7",
      marks: 5,
      explanation: "Neutral pH is exactly 7.",
      order: 4,
    },
  ];

  const createdChemQuestions = [];
  for (const q of chemQuestions) {
    const createdQ = await prisma.question.create({
      data: {
        ...q,
        examId: chemExam.id,
      },
    });
    createdChemQuestions.push(createdQ);
  }

  // 11. Create Sample Completed Attempt for Student 1 on Chem Exam
  const attempt = await prisma.examAttempt.create({
    data: {
      examId: chemExam.id,
      studentId: student1.id,
      score: 20,
      totalMarks: 20,
      percentage: 100,
      status: "GRADED",
      submittedAt: new Date(),
    },
  });

  for (const q of createdChemQuestions) {
    await prisma.answer.create({
      data: {
        attemptId: attempt.id,
        questionId: q.id,
        selectedAnswer: q.correctAnswer,
        isCorrect: true,
        marksAwarded: q.marks,
      },
    });
  }

  console.log("Seeded database successfully with realistic data!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
