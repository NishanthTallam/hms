import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin", "staff"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { id } = await params;
    const body = await req.json();

    // Support quick stock update (+/- buttons)
    if (body.stockDelta !== undefined) {
        const medicine = await prisma.medicine.findFirst({ where: { id, hospitalId } });
        if (!medicine) return NextResponse.json({ error: "Medicine not found" }, { status: 404 });

        const newQty = Math.max(0, medicine.stockQty + body.stockDelta);
        await prisma.medicine.updateMany({
            where: { id, hospitalId },
            data: { stockQty: newQty },
        });
        return NextResponse.json({ success: true, stockQty: newQty });
    }

    await prisma.medicine.updateMany({
        where: { id, hospitalId },
        data: {
            name: body.name,
            genericName: body.genericName,
            category: body.category,
            unit: body.unit,
            stockQty: body.stockQty,
            minThreshold: body.minThreshold,
            expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
            batchNumber: body.batchNumber,
            supplierName: body.supplierName,
            supplierContact: body.supplierContact,
            purchasePrice: body.purchasePrice,
            sellingPrice: body.sellingPrice,
        },
    });

    return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { id } = await params;

    await prisma.medicine.deleteMany({ where: { id, hospitalId } });
    return NextResponse.json({ success: true });
}
