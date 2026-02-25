import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-utils";

type Role = "super_admin" | "admin" | "doctor" | "staff";

export async function requirePage(allowedRoles: Role[]) {
    const session = await getSession();

    if (!session) redirect("/login");

    if (!allowedRoles.includes((session.user as any).role as Role)) {
        redirect("/hospital/dashboard");
    }

    return session;
}
