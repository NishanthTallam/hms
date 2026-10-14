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

    const requests = await prisma.bloodRequest.findMany({
        where: { hospitalId },
        include: {
            patient: { select: { name: true } },
        },
        orderBy: [
            { urgency: "desc" },
            { createdAt: "asc" }
        ]
    });

    return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId, session } = guard;
    const body = await req.json();

    if (!body.bloodGroup || !body.unitsNeeded) {
        return NextResponse.json({ error: "Blood group and units required" }, { status: 400 });
    }

    const enumKey = BLOOD_GROUP_MAP[body.bloodGroup] || body.bloodGroup;

    const request = await prisma.bloodRequest.create({
        data: {
            hospitalId,
            patientId: body.patientId || null,
            bloodGroup: enumKey as any,
            unitsNeeded: Number(body.unitsNeeded || body.unitsRequired),
            urgency: body.priority || body.urgency || "normal",
            notes: body.notes,
            status: "pending",
        }
    });

    return NextResponse.json(request, { status: 201 });
}
