import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { id } = await params;
    const body = await req.json();

    const appointment = await prisma.appointment.updateMany({
        where: { id, hospitalId },
        data: {
            status: body.status,
            notes: body.notes,
            appointmentDate: body.appointmentDate ? new Date(body.appointmentDate) : undefined,
        },
    });

    return NextResponse.json(appointment);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin", "staff"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { id } = await params;

    await prisma.appointment.updateMany({
        where: { id, hospitalId },
        data: { status: "cancelled" },
    });

    return NextResponse.json({ success: true });
}
