import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
    // Invalidate the session
    const response = await auth.api.signOut({
        headers: req.headers
    });

    // Redirect to login page
    return NextResponse.redirect(new URL("/login", req.url));
}
