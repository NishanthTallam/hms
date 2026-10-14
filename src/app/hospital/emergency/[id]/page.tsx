import { requireRole } from "@/lib/auth-utils";
import { EmergencyCaseDetail } from "@/components/emergency/EmergencyCaseDetail";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EmergencyCaseDetailPage({ params }: Props) {
    await requireRole(["admin", "doctor", "staff"]);
    const { id } = await params;

    return <EmergencyCaseDetail caseId={id} />;
}
