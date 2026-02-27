import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin", "staff"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { id } = await context.params;
    const body = await req.json();

    if (body.action === "fulfill") {
        // Fulfill request and deduct units
        const request = await prisma.bloodRequest.findUnique({ where: { id, hospitalId } });
        if (!request || request.status !== "pending") {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        // Find available units of exact type
        const units = await prisma.bloodUnit.findMany({
            where: { hospitalId, bloodGroup: request.bloodGroup, status: "available" },
            take: request.unitsNeeded,
        });

        if (units.length < request.unitsNeeded) {
            return NextResponse.json({ error: "Not enough inventory" }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
            // Mark units as used
            await tx.bloodUnit.updateMany({
                where: { id: { in: units.map(u => u.id) } },
                data: { status: "used" },
            });
            // Complete request
            await tx.bloodRequest.update({
                where: { id },
                data: { status: "fulfilled", fulfilledAt: new Date() },
            });
        });

        return NextResponse.json({ success: true, message: "Request fulfilled" });
    }

    if (body.action === "reject") {
        await prisma.bloodRequest.update({
            where: { id, hospitalId },
            data: { status: "rejected" },
        });
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
