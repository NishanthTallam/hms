import { requireRole } from "@/lib/auth-utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { FastIntakeForm } from "@/components/emergency/FastIntakeForm";

export default async function NewEmergencyCasePage() {
    const session = await requireRole(["admin", "doctor", "staff"]);
    const hospitalId = (session.user as any).hospitalId;

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <PageHeader title="New Emergency Case" backHref="/emergency" />
            <FastIntakeForm hospitalId={hospitalId} />
        </div>
    );
}
