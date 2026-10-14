import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Calendar, Stethoscope, Pill } from "lucide-react";
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

export default async function LastVisited() {
    const session = await requireRole(["patient"]);
    const patientId = await getPatientId(session);

    if (!patientId) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <p className="text-gray-500">Patient profile not linked. Contact hospital administration.</p>
            </div>
        );
    }

    // Get last completed appointment
    const lastAppointment = await prisma.appointment.findFirst({
        where: { patientId, status: "completed" },
        include: { doctor: { select: { name: true, specialization: true } } },
        orderBy: { appointmentDate: "desc" },
    });

    // Get most recent record
    const lastRecord = await prisma.record.findFirst({
        where: { patientId },
        include: { doctor: { select: { name: true, specialization: true } } },
        orderBy: { createdAt: "desc" },
    });

    // Get most recent prescription
    const lastPrescription = await prisma.prescription.findFirst({
        where: { patientId },
        include: { doctor: { select: { name: true } } },
        orderBy: { issuedAt: "desc" },
    });

    // Get recent activity timeline (last 10 items across all types)
    const recentAppointments = await prisma.appointment.findMany({
        where: { patientId },
        include: { doctor: { select: { name: true } } },
        orderBy: { appointmentDate: "desc" },
        take: 5,
    });

    const recentRecords = await prisma.record.findMany({
        where: { patientId },
        include: { doctor: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
    });

    // Build timeline
    const timeline = [
        ...recentAppointments.map(a => ({
            type: "appointment" as const,
            date: new Date(a.appointmentDate),
            title: `Appointment with Dr. ${a.doctor.name}`,
            subtitle: a.status,
            icon: Calendar,
        })),
        ...recentRecords.map(r => ({
            type: "record" as const,
            date: new Date(r.createdAt),
            title: r.diagnosis || "Medical Record",
            subtitle: `${r.type} · Dr. ${r.doctor?.name || "Unknown"}`,
            icon: Stethoscope,
        })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <PageHeader title="Last Visited" />

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            Last Appointment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {lastAppointment ? (
                            <>
                                <div className="text-lg font-bold">{format(new Date(lastAppointment.appointmentDate), "PPP")}</div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Dr. {lastAppointment.doctor.name} · {formatDistanceToNow(new Date(lastAppointment.appointmentDate))} ago
                                </p>
                            </>
                        ) : (
                            <p className="text-gray-400 text-sm">No appointments yet</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600">
                            <Stethoscope className="h-4 w-4 text-green-500" />
                            Last Diagnosis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {lastRecord ? (
                            <>
                                <div className="text-lg font-bold">{lastRecord.diagnosis || "General Checkup"}</div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {lastRecord.doctor ? `Dr. ${lastRecord.doctor.name}` : ""} · {format(new Date(lastRecord.createdAt), "PPP")}
                                </p>
                            </>
                        ) : (
                            <p className="text-gray-400 text-sm">No records yet</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600">
                            <Pill className="h-4 w-4 text-[#1A56DB]" />
                            Last Prescription
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {lastPrescription ? (
                            <>
                                <div className="text-lg font-bold">
                                    <Badge variant={lastPrescription.status === "active" ? "default" : "secondary"}>
                                        {lastPrescription.status}
                                    </Badge>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {lastPrescription.doctor ? `Dr. ${lastPrescription.doctor.name}` : ""} · {format(new Date(lastPrescription.issuedAt), "PPP")}
                                </p>
                            </>
                        ) : (
                            <p className="text-gray-400 text-sm">No prescriptions yet</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Activity Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-gray-500" />
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {timeline.length === 0 ? (
                        <p className="text-center text-gray-500 text-sm py-8">No activity yet.</p>
                    ) : (
                        <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
                            <div className="space-y-6">
                                {timeline.map((item, idx) => (
                                    <div key={idx} className="relative flex items-start gap-4 pl-10">
                                        <div className="absolute left-2.5 mt-1 w-3 h-3 rounded-full bg-white border-2 border-blue-400" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <item.icon className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium text-sm text-gray-900">{item.title}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-gray-500">{format(item.date, "PPP")}</span>
                                                <span className="text-xs text-gray-400">·</span>
                                                <span className="text-xs text-gray-500">{formatDistanceToNow(item.date)} ago</span>
                                                <Badge variant="outline" className="text-[10px] py-0 px-1">{item.subtitle}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
