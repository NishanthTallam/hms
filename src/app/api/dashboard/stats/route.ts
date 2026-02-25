import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const [
        totalPatients,
        patientsToday,
        appointmentsToday,
        appointmentsScheduled,
        pendingInvoices,
        paidThisMonth,
        lowStockMedicines,
        expiringSoon,
    ] = await Promise.all([
        prisma.patient.count({ where: { hospitalId } }),
        prisma.patient.count({ where: { hospitalId, createdAt: { gte: today, lt: tomorrow } } }),
        prisma.appointment.count({ where: { hospitalId, appointmentDate: { gte: today, lt: tomorrow } } }),
        prisma.appointment.count({ where: { hospitalId, status: "scheduled" } }),
        prisma.invoice.findMany({ where: { hospitalId, status: { in: ["pending", "partial"] } }, select: { totalAmount: true, paidAmount: true } }),
        prisma.invoice.findMany({
            where: {
                hospitalId,
                status: "paid",
                updatedAt: { gte: new Date(today.getFullYear(), today.getMonth(), 1) },
            },
            select: { totalAmount: true },
        }),
        prisma.medicine.count({
            where: {
                hospitalId,
                stockQty: { lt: 10 }, // approximate: ideally compare to minThreshold
            },
        }),
        prisma.medicine.count({
            where: {
                hospitalId,
                expiryDate: { gte: today, lte: thirtyDaysFromNow },
            },
        }),
    ]);

    const pendingAmount = pendingInvoices.reduce((sum, inv) =>
        sum + (Number(inv.totalAmount) - Number(inv.paidAmount)), 0
    );

    const revenueThisMonth = paidThisMonth.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

    // Weekly appointments for chart
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 6);
    const weeklyAppointments = await prisma.appointment.groupBy({
        by: ["appointmentDate"],
        where: {
            hospitalId,
            appointmentDate: { gte: weekStart, lt: tomorrow },
        },
        _count: true,
    });

    return NextResponse.json({
        total_patients: totalPatients,
        patients_today: patientsToday,
        appointments_today: appointmentsToday,
        appointments_scheduled: appointmentsScheduled,
        pending_bills: pendingInvoices.length,
        pending_amount: pendingAmount,
        low_stock_count: lowStockMedicines,
        expiring_soon_count: expiringSoon,
        revenue_this_month: revenueThisMonth,
        appointments_this_week: weeklyAppointments.map(a => ({
            date: a.appointmentDate.toISOString().split("T")[0],
            count: a._count,
        })),
    });
}
