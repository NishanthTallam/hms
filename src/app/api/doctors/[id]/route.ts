import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { id } = await params;

    const doctor = await prisma.doctor.findFirst({
        where: { id, hospitalId },
        include: {
            appointments: {
                include: { patient: { select: { name: true } } },
                orderBy: { appointmentDate: "desc" },
                take: 20,
            },
        },
    });

    if (!doctor) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    return NextResponse.json(doctor);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { id } = await params;
    const body = await req.json();

    const doctor = await prisma.doctor.updateMany({
        where: { id, hospitalId },
        data: {
            name: body.name,
            specialization: body.specialization,
            phone: body.phone,
            email: body.email,
            availableDays: body.availableDays,
            consultationFee: body.consultationFee,
        },
    });

    return NextResponse.json(doctor);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { id } = await params;

    await prisma.doctor.deleteMany({ where: { id, hospitalId } });
    return NextResponse.json({ success: true });
}
