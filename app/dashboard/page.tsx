import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardIndexPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;
  switch (role) {
    case "SUPER_ADMIN":
      redirect("/dashboard/admin");
    case "SCHOOL_ADMIN":
      redirect("/dashboard/school");
    case "TEACHER":
      redirect("/dashboard/teacher");
    case "STUDENT":
      redirect("/dashboard/student");
    default:
      redirect("/dashboard/student");
  }
}
