import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || session.user.role !== "patient")
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const patientId = (session.user as any).patientId;
    if (!patientId)
        return NextResponse.json({ error: "No patient profile linked" }, { status: 403 });

    const prescriptions = await prisma.prescription.findMany({
        where: { patientId },
        include: {
            doctor: { select: { name: true, specialization: true } },
        },
        orderBy: { issuedAt: "desc" },
    });
    return NextResponse.json(prescriptions);
}
