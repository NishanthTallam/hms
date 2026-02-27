import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin", "staff"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { id } = await context.params;
    const body = await req.json();

    // Assign patient to bed
    if (body.action === "assign" && body.patientId) {
        await prisma.bed.updateMany({
            where: { id, hospitalId, status: "available" },
            data: {
                status: "occupied",
                currentPatientId: body.patientId,
                admittedAt: new Date(),
            },
        });
    }

    // Discharge patient from bed
    if (body.action === "discharge") {
        await prisma.bed.updateMany({
            where: { id, hospitalId },
            data: {
                status: "available",
                currentPatientId: null,
                admittedAt: null,
                notes: body.notes,
            },
        });
    }

    // Toggle maintenance
    if (body.action === "maintenance") {
        await prisma.bed.updateMany({
            where: { id, hospitalId },
            data: { status: body.maintenance ? "maintenance" : "available" },
        });
    }

    return NextResponse.json({ success: true });
}
