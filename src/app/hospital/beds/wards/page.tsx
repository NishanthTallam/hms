import { requireRole } from "@/lib/auth-utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { WardsList } from "@/components/beds/WardsList";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function WardsPage() {
    const session = await requireRole(["admin", "staff", "doctor"]);
    const hospitalId = (session.user as any).hospitalId;
    const userRole = (session.user as any).role;

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <PageHeader
                title="🏥 Wards Management"
                backHref="/hospital/beds"
                action={
                    userRole === "admin" ? (
                        <Link href="/hospital/beds/wards">
                            <Button className="bg-[#1A56DB] hover:bg-[#1E40AF] text-white">
                                + Create Ward
                            </Button>
                        </Link>
                    ) : undefined
                }
            />
            <WardsList hospitalId={hospitalId} isAdmin={userRole === "admin"} />
        </div>
    );
}
