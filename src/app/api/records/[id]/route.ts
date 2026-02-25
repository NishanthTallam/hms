import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { id } = await params;
    const body = await req.json();

    await prisma.record.updateMany({
        where: { id, hospitalId },
        data: {
            diagnosis: body.diagnosis,
            prescription: body.prescription,
            notes: body.notes,
            type: body.type,
            admissionDate: body.admissionDate ? new Date(body.admissionDate) : undefined,
            dischargeDate: body.dischargeDate ? new Date(body.dischargeDate) : undefined,
            ward: body.ward,
            roomNumber: body.roomNumber,
        },
    });

    return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { id } = await params;

    await prisma.record.deleteMany({ where: { id, hospitalId } });
    return NextResponse.json({ success: true });
}
