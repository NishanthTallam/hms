import { requireRole } from "@/lib/auth-utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { OxygenGrid } from "@/components/oxygen/OxygenGrid";
import { Button } from "@/components/ui/button";

export default async function OxygenPage() {
    const session = await requireRole(["admin", "doctor", "staff"]);
    const hospitalId = (session.user as any).hospitalId;

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <PageHeader
                title="🛢️ Oxygen Cylinders"
                action={<Button>+ Register Cylinder</Button>}
            />
            <OxygenGrid hospitalId={hospitalId} />
        </div>
    );
}
