import { requireRole } from "@/lib/auth-utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { WardBedGrid } from "@/components/beds/WardBedGrid";

export default async function WardDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await requireRole(["admin", "staff", "doctor"]);
    const hospitalId = (session.user as any).hospitalId;
    const userRole = (session.user as any).role;
    const { id } = await params;

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <PageHeader
                title="🛏️ Ward Bed Grid"
                backHref="/hospital/beds/wards"
            />
            <WardBedGrid wardId={id} hospitalId={hospitalId} isAdmin={userRole === "admin"} />
        </div>
    );
}
