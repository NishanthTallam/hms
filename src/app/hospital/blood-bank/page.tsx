import { requireRole } from "@/lib/auth-utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { BloodBankDashboard } from "@/components/blood-bank/BloodBankDashboard";

export default async function BloodBankPage() {
    const session = await requireRole(["admin", "doctor", "staff"]);
    const hospitalId = (session.user as any).hospitalId;

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <PageHeader title="🩸 Blood Bank" />
            <BloodBankDashboard hospitalId={hospitalId} />
        </div>
    );
}
