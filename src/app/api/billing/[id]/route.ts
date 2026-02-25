import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin", "staff"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { id } = await params;

    const invoice = await prisma.invoice.findFirst({
        where: { id, hospitalId },
        include: {
            patient: true,
            appointment: { include: { doctor: { select: { name: true } } } },
        },
    });

    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    return NextResponse.json(invoice);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin", "staff"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { id } = await params;
    const body = await req.json();

    const invoice = await prisma.invoice.findFirst({ where: { id, hospitalId } });
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    const paidAmount = body.paidAmount !== undefined ? body.paidAmount : Number(invoice.paidAmount);
    const totalAmount = Number(invoice.totalAmount);

    let status = "pending";
    if (paidAmount >= totalAmount) status = "paid";
    else if (paidAmount > 0) status = "partial";

    await prisma.invoice.updateMany({
        where: { id, hospitalId },
        data: {
            paidAmount,
            status: status as any,
            notes: body.notes !== undefined ? body.notes : undefined,
        },
    });

    return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { id } = await params;

    await prisma.invoice.deleteMany({ where: { id, hospitalId } });
    return NextResponse.json({ success: true });
}
