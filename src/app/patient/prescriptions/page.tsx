import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pill } from "lucide-react";
import { format } from "date-fns";

async function getPatientId(session: any) {
    let patientId = (session.user as any).patientId;
    if (!patientId) {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { patientId: true, email: true },
        });
        patientId = user?.patientId;
        if (!patientId && user?.email) {
            const patient = await prisma.patient.findFirst({
                where: { email: user.email },
                select: { id: true },
            });
            if (patient) {
                await prisma.user.update({
                    where: { id: session.user.id },
                    data: { patientId: patient.id },
                });
                patientId = patient.id;
            }
        }
    }
    return patientId;
}

export default async function PatientPrescriptions() {
    const session = await requireRole(["patient"]);
    const patientId = await getPatientId(session);

    if (!patientId) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <p className="text-gray-500">Patient profile not linked. Contact hospital administration.</p>
            </div>
        );
    }

    const prescriptions = await prisma.prescription.findMany({
        where: { patientId },
        include: {
            doctor: { select: { name: true, specialization: true } },
        },
        orderBy: { issuedAt: "desc" },
    });

    const active = prescriptions.filter(p => p.status === "active");
    const past = prescriptions.filter(p => p.status !== "active");

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <PageHeader title="My Prescriptions" />

            {/* Active Prescriptions */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Active Prescriptions</h2>
                {active.length === 0 ? (
                    <Card><CardContent className="py-8 text-center text-gray-500 text-sm">No active prescriptions.</CardContent></Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {active.map(rx => {
                            const items = Array.isArray(rx.items) ? rx.items as any[] : [];
                            return (
                                <Card key={rx.id} className="border-l-4 border-l-green-500">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                                <Pill className="h-4 w-4 text-green-600" />
                                                Prescription
                                            </CardTitle>
                                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {rx.doctor ? `Dr. ${rx.doctor.name}` : "Unknown Doctor"}
                                            {" · "}{format(new Date(rx.issuedAt), "PPP")}
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        {items.length > 0 ? (
                                            <div className="space-y-2">
                                                {items.map((item: any, i: number) => (
                                                    <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                                                        <span className="font-medium">{item.name || item.medicine || "Medicine"}</span>
                                                        <span className="text-gray-500 text-xs">{item.dosage || item.dose || ""} {item.frequency || ""}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">No items listed</p>
                                        )}
                                        {rx.notes && <p className="text-xs text-gray-500 mt-2 italic">{rx.notes}</p>}
                                        {rx.validUntil && (
                                            <p className="text-xs text-gray-400 mt-1">Valid until: {format(new Date(rx.validUntil), "PPP")}</p>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Past Prescriptions */}
            {past.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Past Prescriptions</h2>
                    <div className="overflow-x-auto bg-white rounded-xl border shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                                <tr>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Doctor</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {past.map(rx => (
                                    <tr key={rx.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium">{format(new Date(rx.issuedAt), "PPP")}</td>
                                        <td className="py-3 px-4">{rx.doctor ? `Dr. ${rx.doctor.name}` : "N/A"}</td>
                                        <td className="py-3 px-4"><Badge variant="outline">{rx.status}</Badge></td>
                                        <td className="py-3 px-4 text-gray-500 text-xs max-w-xs truncate">{rx.notes || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
