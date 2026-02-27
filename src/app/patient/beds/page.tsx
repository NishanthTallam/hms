import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bed as BedIcon } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

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

const BED_COLORS: Record<string, string> = {
    available: "bg-green-100 text-green-800",
    occupied: "bg-red-100 text-red-800",
    maintenance: "bg-yellow-100 text-yellow-800",
    reserved: "bg-blue-100 text-blue-800",
};

export default async function PatientBeds() {
    const session = await requireRole(["patient"]);
    const patientId = await getPatientId(session);

    if (!patientId) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <p className="text-gray-500">Patient profile not linked. Contact hospital administration.</p>
            </div>
        );
    }

    // Find current and past bed assignments for this patient
    const beds = await prisma.bed.findMany({
        where: { currentPatientId: patientId },
        include: {
            ward: { select: { name: true, floor: true } },
        },
    });

    // Also look at IP records for historical bed info
    const ipRecords = await prisma.record.findMany({
        where: { patientId, type: "IP" },
        include: { doctor: { select: { name: true } } },
        orderBy: { admissionDate: "desc" },
    });

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <PageHeader title="My Beds" />

            {/* Current Bed Assignment */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Current Bed Assignment</h2>
                {beds.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-gray-500">
                            <BedIcon className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                            <p className="text-sm">You are not currently assigned to any bed.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {beds.map(bed => (
                            <Card key={bed.id} className="border-l-4 border-l-blue-500">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <BedIcon className="h-5 w-5 text-blue-600" />
                                            <span className="text-lg font-bold">{bed.bedNumber}</span>
                                        </div>
                                        <Badge className={BED_COLORS[bed.status] || ""}>{bed.status}</Badge>
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p><span className="font-medium text-gray-800">Ward:</span> {bed.ward.name}</p>
                                        {bed.ward.floor && <p><span className="font-medium text-gray-800">Floor:</span> {bed.ward.floor}</p>}
                                        <p><span className="font-medium text-gray-800">Type:</span> {bed.type.replace("_", " ")}</p>
                                        {bed.admittedAt && (
                                            <p><span className="font-medium text-gray-800">Admitted:</span> {format(new Date(bed.admittedAt), "PPP")} ({formatDistanceToNow(new Date(bed.admittedAt))} ago)</p>
                                        )}
                                    </div>
                                    {bed.notes && <p className="text-xs text-gray-400 mt-2 italic">{bed.notes}</p>}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Admission History */}
            {ipRecords.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Admission History</h2>
                    <div className="overflow-x-auto bg-white rounded-xl border shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                                <tr>
                                    <th className="py-3 px-4">Admitted</th>
                                    <th className="py-3 px-4">Discharged</th>
                                    <th className="py-3 px-4">Ward / Room</th>
                                    <th className="py-3 px-4">Doctor</th>
                                    <th className="py-3 px-4">Diagnosis</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {ipRecords.map(record => (
                                    <tr key={record.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium">
                                            {record.admissionDate ? format(new Date(record.admissionDate), "PPP") : "—"}
                                        </td>
                                        <td className="py-3 px-4">
                                            {record.dischargeDate ? format(new Date(record.dischargeDate), "PPP") : (
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Current</Badge>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-gray-500">{record.ward || "—"} {record.roomNumber ? `/ ${record.roomNumber}` : ""}</td>
                                        <td className="py-3 px-4">{record.doctor ? `Dr. ${record.doctor.name}` : "N/A"}</td>
                                        <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{record.diagnosis || "—"}</td>
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
