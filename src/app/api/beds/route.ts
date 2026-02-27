import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";
import { BedStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { searchParams } = new URL(req.url);
    const wardId = searchParams.get("ward_id");
    const status = searchParams.get("status");

    const beds = await prisma.bed.findMany({
        where: {
            hospitalId,
            ...(wardId ? { wardId } : {}),
            ...(status ? { status: status as BedStatus } : {}),
        },
        include: {
            ward: { select: { id: true, name: true, floor: true } },
            currentPatient: { select: { id: true, name: true, phone: true } },
        },
        orderBy: [{ ward: { name: "asc" } }, { bedNumber: "asc" }],
    });
    return NextResponse.json(beds);
}
