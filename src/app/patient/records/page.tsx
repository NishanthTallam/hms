import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Stethoscope } from "lucide-react";
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

export default async function PatientRecords() {
    const session = await requireRole(["patient"]);
    const patientId = await getPatientId(session);

    if (!patientId) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <p className="text-gray-500">Patient profile not linked. Contact hospital administration.</p>
            </div>
        );
    }

    const records = await prisma.record.findMany({
        where: { patientId },
        include: {
            doctor: { select: { name: true, specialization: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <PageHeader title="Medical Records" />

            {records.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                        <FileText className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                        <p className="text-sm">No medical records found.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {records.map(record => (
                        <Card key={record.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <div className="bg-blue-100 p-2 rounded-full text-blue-700">
                                            <Stethoscope className="h-4 w-4" />
                                        </div>
                                        {record.diagnosis || "General Checkup"}
                                    </CardTitle>
                                    <Badge variant="outline">{record.type}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500 block text-xs font-medium">Date</span>
                                        <span className="text-gray-900">{format(new Date(record.createdAt), "PPP")}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs font-medium">Doctor</span>
                                        <span className="text-gray-900">
                                            {record.doctor ? `Dr. ${record.doctor.name} (${record.doctor.specialization})` : "N/A"}
                                        </span>
                                    </div>
                                    {record.type === "IP" && (
                                        <div>
                                            <span className="text-gray-500 block text-xs font-medium">Admission</span>
                                            <span className="text-gray-900">
                                                {record.admissionDate ? format(new Date(record.admissionDate), "PPP") : "—"}
                                                {record.dischargeDate ? ` → ${format(new Date(record.dischargeDate), "PPP")}` : " (Ongoing)"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {record.notes && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                                        <span className="font-medium text-gray-700">Notes: </span>{record.notes}
                                    </div>
                                )}
                                {record.prescription && (
                                    <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                                        <span className="font-medium">Prescription: </span>{record.prescription}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
