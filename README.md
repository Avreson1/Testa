# CBT-Hub (Testa) 🎓⚡
> **Enterprise-Ready Multi-School Computer-Based Testing (CBT) Platform**

![Next.js 14](https://img.shields.io/badge/Next.js-14.2_App_Router-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)
![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4.24-green?style=for-the-badge)

CBT-Hub (Testa) is a full-featured, production-ready, multi-tenant computer-based testing system architected for institutions, educational boards, universities, and high schools. It supports isolated school administration, faculty test authoring, strict candidate examination delivery with cheat-deterrent randomization, live countdown timers, and immediate automated grading.

---

## 🌟 Key Platform Features

### 🏛️ Multi-School Institutional Tenancy
- **Super Administrator Console**: Register, activate, monitor, and manage institutions with unique school registration codes (e.g., `APEX01`, `GWD02`).
- **School Admin Portal**: Full autonomy over faculty teacher rosters, student registrations, course subjects, and departmental exam catalogs.

### 📝 Flexible Assessment Studio
- **Question Formats Supported**:
  - **Multiple Choice Questions (MCQ)**: Configurable answer options (A, B, C, D) with single-correct marking.
  - **True / False**: Binary toggle evaluation.
  - **Fill-in-the-Blank**: Normalized text entry with case-insensitive matching.
- **Configurable Examination Rules**:
  - Customizable time limit duration (in minutes).
  - Configurable passing threshold and total points score.
  - Optional anti-cheat question randomization (`shuffleQuestions`).
  - Instant scorecard release flag (`showResults`).
- **Status Lifecycle**: `DRAFT` ➔ `PUBLISHED` ➔ `ACTIVE` (live test taking) ➔ `COMPLETED`.

### ⏱️ Distraction-Free Candidate Examination Hall
- **Live Auto-Submitting Countdown Timer**: Constant visual timekeeper with yellow (< 5 min) and pulsing red (< 1 min) warning states.
- **Dynamic Question Palette**: Color-coded tracking for *Current*, *Answered*, *Unanswered*, and *Flagged for Review* questions.
- **Resilient Local Answer Caching**: Instant state retention while traversing question items.
- **Automated Graceful Submission**: Instant batch submission and grading upon clock expiration.

### 📊 Instant Grading & Performance Review
- **Automatic Score Evaluation**: Server-side grading of student responses with percentage calculation and standard letter grades (`A+`, `A`, `B+`, `B`, `C`, `D`, `F`).
- **Detailed Question Review**: Item-by-item analysis displaying the student's response versus the correct solution and educator explanations.
- **Teacher & Admin Gradebook**: Cohort statistics including submission counts, class average accuracy, pass rates, and highest scores.

---

## 👥 Default Demo Credentials

All test accounts use the password: `password123`

| Role | Account Email | Purpose |
| :--- | :--- | :--- |
| **Super Admin** | `admin@testa.com` | Global platform administration, institution onboarding |
| **School Admin** | `admin@apex.edu` | Apex Academy management, faculty & student registries |
| **Teacher (Math)** | `math@apex.edu` | Exam authoring, question builder, and grade sheets |
| **Teacher (Science)** | `science@apex.edu` | Science department exam manager |
| **Student** | `student@apex.edu` | Active candidate taking live tests and reviewing scorecards |
| **Student** | `sarah@apex.edu` | Candidate enrolled at Apex Academy |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17+ or 20+
- npm, pnpm, or yarn

### 1. Installation
```bash
git clone https://github.com/Avreson1/Testa.git
cd Testa
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory (or copy `.env.example`):
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="cbt-hub-testa-super-secret-key-change-in-production-2024"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Initialization & Seeding
Push the Prisma schema to your SQLite database and populate realistic demo institutions, exams, and candidate data:
```bash
# Push database schema
npm run db:push

# Seed comprehensive test database
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 🏗️ Architecture & Project Directory Structure

```
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx               # Authentication portal
│   │   └── register/page.tsx            # Self-registration with school codes
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth session handler
│   │   ├── auth/register/route.ts       # User registration endpoint
│   │   ├── dashboard/route.ts           # Role-based aggregate metrics
│   │   ├── exams/                       # Exams CRUD & status management
│   │   │   ├── [id]/attempt/route.ts    # Start & resume exam session
│   │   │   ├── [id]/questions/route.ts  # Question bank authoring
│   │   │   └── [id]/submit/route.ts     # Grading and evaluation engine
│   │   ├── results/route.ts             # Student scorecards & transcripts
│   │   ├── schools/route.ts             # Multi-tenant school directory
│   │   ├── subjects/route.ts            # Academic discipline catalog
│   │   └── users/route.ts               # Student & faculty directories
│   ├── dashboard/
│   │   ├── admin/                       # Super Administrator views
│   │   ├── school/                      # School Administrator views
│   │   ├── teacher/                     # Faculty exam authoring & results
│   │   └── student/                     # Candidate hall & live exam engine
│   ├── globals.css                      # Tailwind styling directives
│   ├── layout.tsx                       # Root layout with session providers
│   ├── page.tsx                         # SaaS landing page
│   └── providers.tsx                    # NextAuth & Toast context providers
├── components/
│   ├── exam/
│   │   ├── ExamCard.tsx                 # Assessment preview card
│   │   ├── ExamResults.tsx              # Itemized performance review
│   │   ├── ExamTimer.tsx                # Auto-submit countdown timer
│   │   └── QuestionRenderer.tsx         # MCQ, True/False & Fill-blank renderer
│   ├── forms/                           # Reusable validated form controls
│   ├── layout/                          # Sidebar, Header, DashboardShell
│   └── ui/                              # Atoms: Button, Input, Modal, DataTable, Toast
├── lib/
│   ├── auth.ts                          # NextAuth credential provider
│   ├── prisma.ts                        # Prisma ORM client singleton
│   ├── utils.ts                         # Formatting, grading, and helpers
│   └── validations.ts                   # Zod schemas for input validation
├── prisma/
│   ├── schema.prisma                    # Data models: School, User, Exam, Question, Attempt
│   └── seed.ts                          # Database seeder with realistic test data
└── types/                               # TypeScript domain model interfaces
```

---

## 🔒 Security & Role-Based Access Control

- **Password Security**: Passwords salted and hashed with `bcryptjs` (10 rounds).
- **Route Protection**: Next.js middleware guards `/dashboard/*` with role enforcement (Super Admin, School Admin, Teacher, Student).
- **Assessment Integrity**: Examination answers sanitized on the server—students cannot inspect correct answers before completing and submitting tests.
- **Tenant Isolation**: School-scoped queries ensure educators and students only access data within their assigned institution.

---

## 📄 License
MIT License. Built by [Avreson1](https://github.com/Avreson1).
