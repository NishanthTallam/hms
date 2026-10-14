import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "patient" || !user.patientId) {
        return NextResponse.json({ error: "Only patients can export their data" }, { status: 403 });
    }

    const patientId = user.patientId;

    const [patient, appointments, records, prescriptions, invoices] = await Promise.all([
        prisma.patient.findUnique({
            where: { id: patientId },
            select: {
                id: true, name: true, dob: true, gender: true, phone: true,
                email: true, address: true, bloodGroup: true,
                emergencyContactName: true, emergencyContactPhone: true,
                createdAt: true,
            },
        }),
        prisma.appointment.findMany({
            where: { patientId },
            select: {
                id: true, appointmentDate: true, type: true, status: true, notes: true,
                doctor: { select: { name: true, specialization: true } },
                createdAt: true,
            },
            orderBy: { appointmentDate: "desc" },
        }),
        prisma.record.findMany({
            where: { patientId },
            select: {
                id: true, type: true, diagnosis: true, prescription: true, notes: true,
                admissionDate: true, dischargeDate: true, ward: true, roomNumber: true,
                doctor: { select: { name: true, specialization: true } },
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        }),
        prisma.prescription.findMany({
            where: { patientId },
            select: {
                id: true, items: true, status: true, issuedAt: true, validUntil: true, notes: true,
                doctor: { select: { name: true, specialization: true } },
                createdAt: true,
            },
            orderBy: { issuedAt: "desc" },
        }),
        prisma.invoice.findMany({
            where: { patientId },
            select: {
                id: true, invoiceNumber: true, items: true, subtotal: true,
                discount: true, totalAmount: true, paidAmount: true,
                status: true, dueDate: true, notes: true, createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        }),
    ]);

    if (!patient) {
        return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const exportData = {
        exportedAt: new Date().toISOString(),
        dpdpCompliance: "This data is exported in compliance with the Digital Personal Data Protection (DPDP) Act, 2023",
        patient: {
            ...patient,
            bloodGroup: patient.bloodGroup ? patient.bloodGroup.replace("_POS", "+").replace("_NEG", "-") : null,
        },
        appointments: appointments.map(a => ({
            ...a,
            appointmentDate: a.appointmentDate.toISOString(),
            createdAt: a.createdAt.toISOString(),
        })),
        medicalRecords: records.map(r => ({
            ...r,
            admissionDate: r.admissionDate?.toISOString() || null,
            dischargeDate: r.dischargeDate?.toISOString() || null,
            createdAt: r.createdAt.toISOString(),
        })),
        prescriptions: prescriptions.map(p => ({
            ...p,
            issuedAt: p.issuedAt.toISOString(),
            validUntil: p.validUntil?.toISOString() || null,
            createdAt: p.createdAt.toISOString(),
        })),
        billing: invoices.map(i => ({
            ...i,
            subtotal: Number(i.subtotal),
            discount: Number(i.discount),
            totalAmount: Number(i.totalAmount),
            paidAmount: Number(i.paidAmount),
            dueDate: i.dueDate?.toISOString() || null,
            createdAt: i.createdAt.toISOString(),
        })),
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename="health-record-${patient.name.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.json"`,
        },
    });
}
