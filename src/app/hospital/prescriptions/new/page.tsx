import { requireRole } from "@/lib/auth-utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { PrescriptionForm } from "@/components/prescriptions/PrescriptionForm";

export default async function NewPrescriptionPage() {
    const session = await requireRole(["admin", "doctor"]);
    const hospitalId = (session.user as any).hospitalId;

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <PageHeader title="New Prescription" backHref="/hospital/prescriptions" />
            <PrescriptionForm hospitalId={hospitalId} />
        </div>
    );
}
