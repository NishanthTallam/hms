import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

type Role = "super_admin" | "admin" | "doctor" | "staff";

export async function apiGuard(
    req: NextRequest,
    allowedRoles: Role[]
): Promise<{ session: any; hospitalId: string } | NextResponse> {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;

    if (!allowedRoles.includes(user.role as Role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const hospitalId = user.hospitalId;
    if (!hospitalId && user.role !== "super_admin") {
        return NextResponse.json({ error: "No hospital context" }, { status: 403 });
    }

    return { session, hospitalId };
}
