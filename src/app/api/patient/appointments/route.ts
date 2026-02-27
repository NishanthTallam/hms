import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || session.user.role !== "patient")
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // SECURITY: patientId always from session — never trust URL or request body
    const patientId = (session.user as any).patientId;
    if (!patientId)
        return NextResponse.json({ error: "No patient profile linked" }, { status: 403 });

    const appointments = await prisma.appointment.findMany({
        where: { patientId }, // scoped to this patient only
        include: {
            doctor: { select: { name: true, specialization: true } },
        },
        orderBy: { appointmentDate: "desc" },
    });
    return NextResponse.json(appointments);
}
