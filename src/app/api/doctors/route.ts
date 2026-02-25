import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;

    const doctors = await prisma.doctor.findMany({
        where: { hospitalId },
        orderBy: { name: "asc" },
    });

    return NextResponse.json(doctors);
}

export async function POST(req: NextRequest) {
    const guard = await apiGuard(req, ["admin"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const body = await req.json();

    if (!body.name || !body.specialization) {
        return NextResponse.json({ error: "Name and specialization are required" }, { status: 400 });
    }

    const doctor = await prisma.doctor.create({
        data: {
            hospitalId,
            name: body.name,
            specialization: body.specialization,
            phone: body.phone || undefined,
            email: body.email || undefined,
            availableDays: body.availableDays || [],
            consultationFee: body.consultationFee || undefined,
        },
    });

    return NextResponse.json(doctor, { status: 201 });
}
