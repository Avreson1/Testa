"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PageLoader } from "@/components/ui/Loader";

export default function DashboardIndexPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    const role = session.user.role;
    switch (role) {
      case "SUPER_ADMIN":
        router.replace("/dashboard/admin");
        break;
      case "SCHOOL_ADMIN":
        router.replace("/dashboard/school");
        break;
      case "TEACHER":
        router.replace("/dashboard/teacher");
        break;
      case "STUDENT":
        router.replace("/dashboard/student");
        break;
      default:
        router.replace("/dashboard/student");
    }
  }, [session, status, router]);

  return <PageLoader />;
}
