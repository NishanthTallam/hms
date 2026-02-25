import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;

    const { hospitalId } = guard;

    const patients = await prisma.patient.findMany({
        where: { hospitalId },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(patients);
}

export async function POST(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff"]);
    if (guard instanceof NextResponse) return guard;

    const { hospitalId } = guard;
    const body = await req.json();

    if (!body.name || !body.phone) {
        return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }

    const patient = await prisma.patient.create({
        data: {
            hospitalId,
            name: body.name,
            phone: body.phone,
            dob: body.dob ? new Date(body.dob) : undefined,
            gender: body.gender || undefined,
            email: body.email || undefined,
            address: body.address || undefined,
            bloodGroup: body.bloodGroup || undefined,
            emergencyContactName: body.emergencyContactName || undefined,
            emergencyContactPhone: body.emergencyContactPhone || undefined,
        },
    });

    return NextResponse.json(patient, { status: 201 });
}
