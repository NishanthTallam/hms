import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, Pill, Activity } from "lucide-react";
import { format } from "date-fns";
import { redirect } from "next/navigation";

export default async function PatientDashboard() {
    const session = await requireRole(["patient"]);

    // Try to get patientId from session first, then fall back to DB lookup
    let patientId = (session.user as any).patientId;

    if (!patientId) {
        // Look up the user record to get patientId
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { patientId: true, email: true },
        });
        patientId = user?.patientId;

        // If still no patientId, try to find patient by email and link them
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

    // If we still can't find a patient record, show a friendly message
    if (!patientId) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Profile Not Found</h2>
                    <p className="text-gray-500">Your account is not linked to a patient record yet. Please contact the hospital administration to set up your patient profile.</p>
                </div>
            </div>
        );
    }

    const [nextAppointment, totalVisits, activePrescriptions, recentRecords] =
        await Promise.all([
            prisma.appointment.findFirst({
                where: { patientId, status: "scheduled", appointmentDate: { gte: new Date() } },
                include: { doctor: { select: { name: true, specialization: true } } },
                orderBy: { appointmentDate: "asc" },
            }),
            prisma.appointment.count({ where: { patientId, status: "completed" } }),
            prisma.prescription.count({ where: { patientId, status: "active" } }),
            prisma.record.findMany({
                where: { patientId },
                include: { doctor: { select: { name: true } } },
                orderBy: { createdAt: "desc" },
                take: 3,
            }),
        ]);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <PageHeader title={`Welcome, ${session.user.name}`} />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        {nextAppointment ? (
                            <>
                                <div className="text-2xl font-bold">{format(new Date(nextAppointment.appointmentDate), "dd MMM yyyy")}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Dr. {nextAppointment.doctor.name} ({nextAppointment.doctor.specialization})
                                </p>
                            </>
                        ) : (
                            <div className="text-xl font-medium text-gray-400 mt-2">None scheduled</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                        <Activity className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalVisits}</div>
                        <p className="text-xs text-muted-foreground mt-1">Completed appointments</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
                        <Pill className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activePrescriptions}</div>
                        <p className="text-xs text-muted-foreground mt-1">Currently taking</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
                {/* Recent Records list */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Medical Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentRecords.map(record => (
                                <div key={record.id} className="flex items-start gap-4 p-3 rounded-lg border bg-gray-50/50">
                                    <div className="bg-blue-100 p-2 rounded-full text-blue-700">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">Diagnosis: {record.diagnosis || "General Checkup"}</h4>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {format(new Date(record.createdAt), "PPP")} &middot; Dr. {record.doctor?.name || "Unknown"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {recentRecords.length === 0 && (
                                <p className="text-sm text-gray-500 italic py-4">No recent records available.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
