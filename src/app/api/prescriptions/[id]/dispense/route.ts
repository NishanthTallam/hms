import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

interface PrescriptionItem {
    medicineId?: string;
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    quantity: number;
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin", "staff"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;

    const { id } = await context.params;

    const prescription = await prisma.prescription.findFirst({
        where: { id, hospitalId },
    });
    if (!prescription) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (prescription.status === "dispensed")
        return NextResponse.json({ error: "Already dispensed" }, { status: 409 });

    const items = prescription.items as unknown as PrescriptionItem[];

    // Deduct stock from pharmacy for each linked medicine
    await prisma.$transaction(async (tx) => {
        for (const item of items) {
            if (item.medicineId) {
                await tx.medicine.updateMany({
                    where: { id: item.medicineId, hospitalId },
                    data: { stockQty: { decrement: item.quantity } },
                });
            }
        }
        await tx.prescription.update({
            where: { id },
            data: { status: "dispensed" },
        });
    });

    return NextResponse.json({ success: true, message: "Prescription dispensed and stock updated" });
}
