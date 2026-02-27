import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";
import { CylinderStatus, CylinderSize } from "@prisma/client";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;

    const cylinders = await prisma.oxygenCylinder.findMany({
        where: { hospitalId },
        orderBy: [
            { status: "asc" },
            { id: "asc" }
        ],
    });

    return NextResponse.json(cylinders);
}

export async function POST(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const body = await req.json();

    if ((!body.cylinderNumber && !body.cylinderCode) || !body.size) {
        return NextResponse.json({ error: "Number and Size required" }, { status: 400 });
    }

    const cylinder = await prisma.oxygenCylinder.create({
        data: {
            hospitalId,
            cylinderCode: body.cylinderNumber || body.cylinderCode,
            size: body.size as CylinderSize,
            status: "full",
        }
    });

    return NextResponse.json(cylinder, { status: 201 });
}
