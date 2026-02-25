import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["super_admin"]);
    if (guard instanceof NextResponse) return guard;

    const { id } = await params;

    const hospital = await prisma.hospital.findUnique({
        where: { id },
        include: {
            _count: { select: { patients: true, doctors: true, users: true, appointments: true } },
            users: { where: { role: "admin" }, select: { id: true, name: true, email: true } },
        },
    });

    if (!hospital) {
        return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
    }

    return NextResponse.json(hospital);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["super_admin"]);
    if (guard instanceof NextResponse) return guard;

    const { id } = await params;
    const body = await req.json();

    const hospital = await prisma.hospital.update({
        where: { id },
        data: {
            name: body.name,
            email: body.email,
            phone: body.phone,
            address: body.address,
            isActive: body.isActive,
        },
    });

    return NextResponse.json(hospital);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["super_admin"]);
    if (guard instanceof NextResponse) return guard;

    const { id } = await params;

    await prisma.hospital.update({
        where: { id },
        data: { isActive: false },
    });

    return NextResponse.json({ success: true });
}
