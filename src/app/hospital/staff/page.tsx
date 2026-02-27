import { requireRole } from "@/lib/auth-utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { StaffList } from "@/components/staff/StaffList";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export default async function StaffPage() {
    const session = await requireRole(["admin", "super_admin"]);
    const hospitalId = (session.user as any).hospitalId;

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <PageHeader
                title="👥 Staff Management"
                action={
                    <Link href="/hospital/staff/new">
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2">
                            <UserPlus className="h-4 w-4" /> Add Staff Member
                        </Button>
                    </Link>
                }
            />
            <StaffList hospitalId={hospitalId} />
        </div>
    );
}
