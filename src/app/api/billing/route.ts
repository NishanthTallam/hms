import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;

    const url = new URL(req.url);
    const statusParam = url.searchParams.get("status");

    const where: any = { hospitalId };
    if (statusParam && statusParam !== "all") {
        where.status = statusParam;
    }

    const invoices = await prisma.invoice.findMany({
        where,
        include: {
            patient: { select: { name: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const body = await req.json();

    if (!body.patientId) {
        return NextResponse.json({ error: "Patient is required" }, { status: 400 });
    }

    // Auto-generate invoice number
    const count = await prisma.invoice.count({ where: { hospitalId } });
    const year = new Date().getFullYear();
    const invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, "0")}`;

    const items = body.items || [];
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.qty * item.unitPrice), 0);
    const discount = body.discount || 0;
    const totalAmount = subtotal - discount;

    const invoice = await prisma.invoice.create({
        data: {
            hospitalId,
            patientId: body.patientId,
            appointmentId: body.appointmentId || undefined,
            invoiceNumber,
            items,
            subtotal,
            discount,
            totalAmount,
            paidAmount: 0,
            dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
            notes: body.notes || undefined,
        },
    });

    return NextResponse.json(invoice, { status: 201 });
}
