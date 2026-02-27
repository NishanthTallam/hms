import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;

    const url = new URL(req.url);
    const role = url.searchParams.get("role") || "admin";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Default admin stats
    let stats: any = {};

    if (role === "admin" || role === "receptionist" || role === "accountant") {
        const [
            totalPatients,
            patientsToday,
            appointmentsToday,
            appointmentsScheduled,
            pendingInvoices,
            paidThisMonth,
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
        ]);

        const pendingAmount = pendingInvoices.reduce((sum, inv) =>
            sum + (Number(inv.totalAmount) - Number(inv.paidAmount)), 0
        );

        const revenueThisMonth = paidThisMonth.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

        stats = {
            ...stats,
            total_patients: totalPatients,
            patients_today: patientsToday,
            appointments_today: appointmentsToday,
            appointments_scheduled: appointmentsScheduled,
            pending_bills: pendingInvoices.length,
            pending_amount: pendingAmount,
            revenue_this_month: revenueThisMonth,
        };
    }

    if (role === "admin" || role === "pharmacist") {
        const [lowStockMedicines, expiringSoon, totalMedicines, dispensedToday] = await Promise.all([
            prisma.medicine.count({ where: { hospitalId, stockQty: { lt: 10 } } }),
            prisma.medicine.count({ where: { hospitalId, expiryDate: { gte: today, lte: thirtyDaysFromNow } } }),
            prisma.medicine.count({ where: { hospitalId } }),
            prisma.prescription.count({ where: { hospitalId, status: "dispensed", updatedAt: { gte: today, lt: tomorrow } } })
        ]);

        const pendingPrescriptions = await prisma.prescription.count({ where: { hospitalId, status: "pending" } });

        stats = {
            ...stats,
            low_stock_count: lowStockMedicines,
            expiring_soon_count: expiringSoon,
            total_medicines: totalMedicines,
            dispensed_today: dispensedToday,
            pending_prescriptions: pendingPrescriptions,
        };
    }

    if (role === "nurse" || role === "ward_boy") {
        const [totalBeds, availableBeds, occupiedBeds, maintenanceBeds] = await Promise.all([
            prisma.bed.count({ where: { ward: { hospitalId } } }),
            prisma.bed.count({ where: { ward: { hospitalId }, status: "available" } }),
            prisma.bed.count({ where: { ward: { hospitalId }, status: "occupied" } }),
            prisma.bed.count({ where: { ward: { hospitalId }, status: "maintenance" } })
        ]);

        const admittedPatients = await prisma.bed.count({
            where: { hospitalId, status: "occupied", currentPatientId: { not: null } }
        });

        stats = {
            ...stats,
            total_beds: totalBeds,
            available_beds: availableBeds,
            occupied_beds: occupiedBeds,
            maintenance_beds: maintenanceBeds,
            admitted_patients: admittedPatients,
        };
    }

    if (role === "admin") {
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

        stats.appointments_this_week = weeklyAppointments.map(a => ({
            date: a.appointmentDate.toISOString().split("T")[0],
            count: a._count,
        }));
    }

    return NextResponse.json(stats);
}
