import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

// Map display blood group strings to Prisma enum keys
const BLOOD_GROUP_MAP: Record<string, string> = {
    "A+": "A_POS", "A-": "A_NEG",
    "B+": "B_POS", "B-": "B_NEG",
    "AB+": "AB_POS", "AB-": "AB_NEG",
    "O+": "O_POS", "O-": "O_NEG",
};

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;

    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "available";
    const view = url.searchParams.get("view");

    // Return individual units list
    if (view === "list") {
        const units = await prisma.bloodUnit.findMany({
            where: { hospitalId },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(units);
    }

    // Group by blood type (default)
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

    const enumKey = BLOOD_GROUP_MAP[body.bloodGroup] || body.bloodGroup;

    const unit = await prisma.bloodUnit.create({
        data: {
            hospitalId,
            bloodGroup: enumKey as any,
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
