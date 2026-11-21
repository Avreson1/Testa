import { NextResponse } from "next/server";
import { syncDatabaseAndSeed } from "@/lib/db-sync";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await syncDatabaseAndSeed();

  if (result.success) {
    return NextResponse.json({
      success: true,
      message: "Database schema successfully updated and default demo accounts are ready!",
      accounts: [
        { role: "Super Admin", email: "admin@testa.com", password: "password123" },
        { role: "Teacher", email: "math@apex.edu", password: "password123" },
        { role: "Student", email: "student@apex.edu", password: "password123" },
      ],
      logs: result.log,
    });
  } else {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to automatically synchronize database.",
        logs: result.log,
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
