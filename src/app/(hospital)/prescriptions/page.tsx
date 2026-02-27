import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default async function PrescriptionsPage() {
    const session = await requireRole(["admin", "doctor", "staff"]);
    const hospitalId = (session.user as any).hospitalId;

    const prescriptions = await prisma.prescription.findMany({
        where: { hospitalId },
        include: {
            patient: { select: { name: true } },
            doctor: { select: { name: true } },
        },
        orderBy: { issuedAt: "desc" }
    });

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <PageHeader
                title="Prescriptions"
                action={
                    <Link href="/prescriptions/new">
                        <Button>+ Issue Prescription</Button>
                    </Link>
                }
            />
            {/* List prescriptions */}
            <div className="bg-white rounded border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-gray-50 text-left text-gray-500">
                            <th className="p-4 font-medium">Date</th>
                            <th className="p-4 font-medium">Patient</th>
                            <th className="p-4 font-medium">Doctor</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prescriptions.map((p) => (
                            <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="p-4">{format(new Date(p.issuedAt), "PPP")}</td>
                                <td className="p-4 font-medium">{p.patient.name}</td>
                                <td className="p-4">{p.doctor?.name || "-"}</td>
                                <td className="p-4">
                                    <Badge variant={p.status === "active" ? "default" : p.status === "dispensed" ? "secondary" : "outline"}>
                                        {p.status}
                                    </Badge>
                                </td>
                                <td className="p-4">
                                    <Link href={`/prescriptions/${p.id}`} className="text-blue-600 hover:underline">
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {prescriptions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">No prescriptions found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
