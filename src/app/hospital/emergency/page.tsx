import { requireRole } from "@/lib/auth-utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmergencyBoard } from "@/components/emergency/EmergencyBoard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function EmergencyPage() {
    const session = await requireRole(["admin", "doctor", "staff"]);
    const hospitalId = (session.user as any).hospitalId;

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 h-full flex flex-col">
            <PageHeader
                title="🚨 Emergency Department"
                action={
                    <Link href="/emergency/new">
                        <Button variant="destructive" className="font-bold">
                            <Plus className="mr-2 h-4 w-4" /> Fast Intake
                        </Button>
                    </Link>
                }
            />
            <div className="flex-1 min-h-0 bg-gray-100 rounded-lg p-4 overflow-hidden">
                <EmergencyBoard hospitalId={hospitalId} />
            </div>
        </div>
    );
}
