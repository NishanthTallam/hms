import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getSession() {
    return await auth.api.getSession({ headers: await headers() });
}

export async function requireAuth() {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");
    return session;
}

export async function requireRole(role: string | string[]) {
    const session = await requireAuth();
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes((session.user as any).role)) throw new Error("Forbidden");
    return session;
}
