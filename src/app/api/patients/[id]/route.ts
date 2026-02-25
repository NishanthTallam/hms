import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;

    const { hospitalId } = guard;
    const { id } = await params;

    const patient = await prisma.patient.findFirst({
        where: { id, hospitalId },
        include: {
            appointments: {
                include: { doctor: { select: { name: true, specialization: true } } },
                orderBy: { appointmentDate: "desc" },
                take: 20,
            },
            records: {
                include: { doctor: { select: { name: true } } },
                orderBy: { createdAt: "desc" },
                take: 20,
            },
            invoices: {
                orderBy: { createdAt: "desc" },
                take: 20,
            },
        },
    });

    if (!patient) {
        return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json(patient);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin", "staff"]);
    if (guard instanceof NextResponse) return guard;

    const { hospitalId } = guard;
    const { id } = await params;
    const body = await req.json();

    const patient = await prisma.patient.updateMany({
        where: { id, hospitalId },
        data: {
            name: body.name,
            phone: body.phone,
            dob: body.dob ? new Date(body.dob) : undefined,
            gender: body.gender,
            email: body.email,
            address: body.address,
            bloodGroup: body.bloodGroup,
            emergencyContactName: body.emergencyContactName,
            emergencyContactPhone: body.emergencyContactPhone,
        },
    });

    return NextResponse.json(patient);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin"]);
    if (guard instanceof NextResponse) return guard;

    const { hospitalId } = guard;
    const { id } = await params;

    await prisma.patient.deleteMany({
        where: { id, hospitalId },
    });

    return NextResponse.json({ success: true });
}
