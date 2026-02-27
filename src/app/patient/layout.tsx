import { PatientSidebar } from "@/components/layout/PatientSidebar";
import { requireRole } from "@/lib/auth-utils";

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
    await requireRole(["patient"]);
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <PatientSidebar />
            <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
                {children}
            </main>
        </div>
    );
}
