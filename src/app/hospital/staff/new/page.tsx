import { requireRole } from "@/lib/auth-utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { StaffForm } from "@/components/staff/StaffForm";

export default async function NewStaffPage() {
    await requireRole(["admin", "super_admin"]);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-2xl mx-auto">
            <PageHeader
                title="Add New Staff Member"
                backHref="/hospital/staff"
            />
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <StaffForm />
            </div>
        </div>
    );
}
