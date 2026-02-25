import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "doctor", "staff"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;

    const url = new URL(req.url);
    const patientId = url.searchParams.get("patient_id");

    const where: any = { hospitalId };
    if (patientId) where.patientId = patientId;

    const records = await prisma.record.findMany({
        where,
        include: {
            patient: { select: { name: true } },
            doctor: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const body = await req.json();

    if (!body.patientId) {
        return NextResponse.json({ error: "Patient is required" }, { status: 400 });
    }

    const record = await prisma.record.create({
        data: {
            hospitalId,
            patientId: body.patientId,
            doctorId: body.doctorId || undefined,
            appointmentId: body.appointmentId || undefined,
            type: body.type || "OP",
            diagnosis: body.diagnosis || undefined,
            prescription: body.prescription || undefined,
            notes: body.notes || undefined,
            admissionDate: body.admissionDate ? new Date(body.admissionDate) : undefined,
            dischargeDate: body.dischargeDate ? new Date(body.dischargeDate) : undefined,
            ward: body.ward || undefined,
            roomNumber: body.roomNumber || undefined,
        },
    });

    return NextResponse.json(record, { status: 201 });
}
