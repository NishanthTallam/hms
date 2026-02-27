import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "doctor", "staff"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patient_id");
    const status = searchParams.get("status");

    const prescriptions = await prisma.prescription.findMany({
        where: {
            hospitalId,
            ...(patientId ? { patientId } : {}),
            ...(status ? { status } : {}),
        },
        include: {
            patient: { select: { id: true, name: true } },
            doctor: { select: { id: true, name: true, specialization: true } },
        },
        orderBy: { issuedAt: "desc" },
    });
    return NextResponse.json(prescriptions);
}

export async function POST(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const body = await req.json();

    if (!body.patientId || !body.items?.length)
        return NextResponse.json({ error: "Patient and at least one medicine required" }, { status: 400 });

    const prescription = await prisma.prescription.create({
        data: {
            hospitalId,
            patientId: body.patientId,
            doctorId: body.doctorId,
            recordId: body.recordId,
            items: body.items,
            validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
            notes: body.notes,
        },
    });
    return NextResponse.json(prescription, { status: 201 });
}
