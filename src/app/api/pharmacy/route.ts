import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;

    const medicines = await prisma.medicine.findMany({
        where: { hospitalId },
        orderBy: { name: "asc" },
    });

    return NextResponse.json(medicines);
}

export async function POST(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const body = await req.json();

    if (!body.name) {
        return NextResponse.json({ error: "Medicine name is required" }, { status: 400 });
    }

    const medicine = await prisma.medicine.create({
        data: {
            hospitalId,
            name: body.name,
            genericName: body.genericName || undefined,
            category: body.category || undefined,
            unit: body.unit || "strips",
            stockQty: body.stockQty || 0,
            minThreshold: body.minThreshold || 10,
            expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
            batchNumber: body.batchNumber || undefined,
            supplierName: body.supplierName || undefined,
            supplierContact: body.supplierContact || undefined,
            purchasePrice: body.purchasePrice || undefined,
            sellingPrice: body.sellingPrice || undefined,
        },
    });

    return NextResponse.json(medicine, { status: 201 });
}
