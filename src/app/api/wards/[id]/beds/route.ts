import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin"]);
    if (guard instanceof NextResponse) return guard;
    const { id: wardId } = await context.params;

    const ward = await prisma.ward.findFirst({
        where: { id: wardId, hospitalId: guard.hospitalId }
    });
    if (!ward) return NextResponse.json({ error: "Ward not found" }, { status: 404 });

    const data = await req.json();

    // Support bulk creation: { count: 5, prefix: "A" } creates A-01..A-05
    if (data.count && data.prefix) {
        const existing = await prisma.bed.count({ where: { wardId, hospitalId: guard.hospitalId } });
        const beds = [];
        for (let i = 1; i <= data.count; i++) {
            const num = (existing + i).toString().padStart(2, "0");
            beds.push({
                hospitalId: guard.hospitalId,
                wardId,
                bedNumber: `${data.prefix}-${num}`,
                type: data.type || "general",
                status: "available" as const,
            });
        }
        await prisma.bed.createMany({ data: beds });
        // Update ward totalBeds
        await prisma.ward.update({
            where: { id: wardId },
            data: { totalBeds: { increment: data.count } }
        });
        return NextResponse.json({ created: data.count });
    }

    // Single bed creation
    const bed = await prisma.bed.create({
        data: {
            hospitalId: guard.hospitalId,
            wardId,
            bedNumber: data.bedNumber,
            type: data.type || "general",
            status: "available",
        }
    });
    await prisma.ward.update({
        where: { id: wardId },
        data: { totalBeds: { increment: 1 } }
    });
    return NextResponse.json(bed);
}
