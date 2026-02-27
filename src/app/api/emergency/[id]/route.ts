import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;

    const { id } = await context.params;
    const body = await req.json();

    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.assignedDoctorId) updateData.assignedDoctorId = body.assignedDoctorId;
    if (body.assignedBedId) updateData.assignedBedId = body.assignedBedId;
    if (body.notes) updateData.notes = body.notes;

    if (body.status === "in_treatment") updateData.treatmentStartAt = new Date();
    if (["discharged", "admitted", "referred", "deceased"].includes(body.status))
        updateData.resolvedAt = new Date();

    await prisma.emergencyCase.updateMany({
        where: { id, hospitalId },
        data: updateData,
    });

    return NextResponse.json({ success: true });
}
