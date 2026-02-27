import { requireRole } from "@/lib/auth-utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { BedMap } from "@/components/beds/BedMap";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Settings } from "lucide-react";

export default async function BedsPage() {
    const session = await requireRole(["admin", "doctor", "staff"]);
    const hospitalId = (session.user as any).hospitalId;
    const userRole = (session.user as any).role;

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <PageHeader
                title="🛏️ Hospital Bed Overview"
                action={
                    userRole === "admin" ? (
                        <Link href="/hospital/beds/wards">
                            <Button variant="outline" className="flex items-center gap-2 bg-white hover:bg-gray-50">
                                <Settings className="w-4 h-4" /> Manage Wards & Beds
                            </Button>
                        </Link>
                    ) : undefined
                }
            />
            <BedMap hospitalId={hospitalId} />
        </div>
    );
}
