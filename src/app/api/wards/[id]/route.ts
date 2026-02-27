import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { id } = await context.params;

    const ward = await prisma.ward.findFirst({
        where: { id, hospitalId: guard.hospitalId },
        include: {
            beds: {
                include: {
                    currentPatient: { select: { id: true, name: true, phone: true } },
                },
                orderBy: { bedNumber: "asc" }
            },
            _count: { select: { beds: true } }
        }
    });

    if (!ward) return NextResponse.json({ error: "Ward not found" }, { status: 404 });
    return NextResponse.json(ward);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin"]);
    if (guard instanceof NextResponse) return guard;
    const { id } = await context.params;
    const data = await req.json();

    const ward = await prisma.ward.updateMany({
        where: { id, hospitalId: guard.hospitalId },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.floor !== undefined && { floor: data.floor }),
            ...(data.totalBeds !== undefined && { totalBeds: data.totalBeds }),
        }
    });

    return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin"]);
    if (guard instanceof NextResponse) return guard;
    const { id } = await context.params;

    await prisma.ward.deleteMany({
        where: { id, hospitalId: guard.hospitalId }
    });

    return NextResponse.json({ success: true });
}
