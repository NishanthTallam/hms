import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;

    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "available";

    // Group by blood type
    const inventory = await prisma.bloodUnit.groupBy({
        by: ["bloodGroup"],
        where: { hospitalId, status: status as any },
        _count: { id: true },
    });

    return NextResponse.json(inventory);
}

export async function POST(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const body = await req.json();

    if (!body.bloodGroup || !body.donorName || !body.expiryDate) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const unit = await prisma.bloodUnit.create({
        data: {
            hospitalId,
            bloodGroup: body.bloodGroup,
            donorName: body.donorName,
            donorContact: body.donorPhone,
            collectedAt: new Date(),
            expiryDate: new Date(body.expiryDate),
            units: Number(body.units) || 1,
            status: "available",
        }
    });

    return NextResponse.json(unit, { status: 201 });
}
