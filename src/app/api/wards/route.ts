import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;

    const wards = await prisma.ward.findMany({
        where: { hospitalId: guard.hospitalId },
        include: {
            _count: {
                select: { beds: true }
            }
        },
        orderBy: { name: "asc" }
    });

    return NextResponse.json(wards);
}

export async function POST(req: NextRequest) {
    const guard = await apiGuard(req, ["admin"]);
    if (guard instanceof NextResponse) return guard;

    try {
        const data = await req.json();
        const ward = await prisma.ward.create({
            data: {
                hospitalId: guard.hospitalId,
                name: data.name,
                floor: data.floor,
                totalBeds: data.totalBeds || 0,
            }
        });
        return NextResponse.json(ward);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
