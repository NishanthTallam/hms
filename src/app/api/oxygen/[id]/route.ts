import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";
import { CylinderStatus } from "@prisma/client";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { id } = await context.params;
    const body = await req.json();

    const updateData: any = {};

    if (body.action === "assign") {
        updateData.status = "in_use" as CylinderStatus;
        updateData.assignedRoomId = body.roomId;
        updateData.lastFilledAt = new Date(); // approximate track
    } else if (body.action === "empty") {
        updateData.status = "empty" as CylinderStatus;
        updateData.assignedRoomId = null;
    } else if (body.action === "refill") {
        updateData.status = "full" as CylinderStatus;
        updateData.lastFilledAt = new Date();
    } else if (body.action === "maintenance") {
        updateData.status = "maintenance" as CylinderStatus;
        updateData.assignedRoomId = null;
    }

    await prisma.oxygenCylinder.updateMany({
        where: { id, hospitalId },
        data: updateData,
    });

    return NextResponse.json({ success: true });
}
