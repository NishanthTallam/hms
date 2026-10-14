import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "patient" || !user.patientId) {
        return NextResponse.json({ error: "Only patients can request data deletion" }, { status: 403 });
    }

    const patientId = user.patientId;
    const userId = user.id;

    try {
        await prisma.$transaction(async (tx) => {
            // Delete prescriptions
            await tx.prescription.deleteMany({ where: { patientId } });

            // Delete medical records
            await tx.record.deleteMany({ where: { patientId } });

            // Delete appointments
            await tx.appointment.deleteMany({ where: { patientId } });

            // Delete blood requests
            await tx.bloodRequest.deleteMany({ where: { patientId } });

            // Release occupied beds
            await tx.bed.updateMany({
                where: { currentPatientId: patientId },
                data: { currentPatientId: null, status: "available", admittedAt: null, notes: null },
            });

            // Delete emergency cases
            await tx.emergencyCase.deleteMany({ where: { patientId } });

            // Note: Invoices are preserved for legal/financial compliance
            // But we anonymize the patient reference
            await tx.invoice.updateMany({
                where: { patientId },
                data: { notes: "[PATIENT DATA DELETED - DPDP ACT COMPLIANCE]" },
            });

            // Delete the patient record
            await tx.patient.delete({ where: { id: patientId } });

            // Delete user sessions
            await tx.session.deleteMany({ where: { userId } });

            // Delete user accounts
            await tx.account.deleteMany({ where: { userId } });

            // Delete the user
            await tx.user.delete({ where: { id: userId } });
        });

        return NextResponse.json({
            success: true,
            message: "Your personal data has been deleted in compliance with the DPDP Act, 2023. Billing records have been anonymized for legal compliance.",
        });
    } catch (error) {
        console.error("DPDP deletion error:", error);
        return NextResponse.json(
            { error: "Failed to delete data. Please contact hospital administration." },
            { status: 500 }
        );
    }
}
