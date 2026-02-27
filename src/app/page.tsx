import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-utils";

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role === "super_admin") {
    redirect("/super-admin/dashboard");
  } else if (role === "patient") {
    redirect("/patient/dashboard");
  } else {
    redirect("/hospital/dashboard");
  }
}
