import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
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

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    scheduled: "default",
    completed: "secondary",
    cancelled: "destructive",
};

export default async function PatientAppointments() {
    const session = await requireRole(["patient"]);
    const patientId = await getPatientId(session);

    if (!patientId) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <p className="text-gray-500">Patient profile not linked. Contact hospital administration.</p>
            </div>
        );
    }

    const appointments = await prisma.appointment.findMany({
        where: { patientId },
        include: {
            doctor: { select: { name: true, specialization: true } },
        },
        orderBy: { appointmentDate: "desc" },
    });

    const upcoming = appointments.filter(a => a.status === "scheduled" && new Date(a.appointmentDate) >= new Date());
    const past = appointments.filter(a => a.status !== "scheduled" || new Date(a.appointmentDate) < new Date());

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <PageHeader title="My Appointments" />

            {/* Upcoming */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Upcoming</h2>
                {upcoming.length === 0 ? (
                    <Card><CardContent className="py-8 text-center text-gray-500 text-sm">No upcoming appointments.</CardContent></Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {upcoming.map(apt => (
                            <Card key={apt.id} className="border-l-4 border-l-blue-500">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-medium">Dr. {apt.doctor.name}</CardTitle>
                                        <Badge variant={STATUS_COLORS[apt.status] || "outline"}>{apt.status}</Badge>
                                    </div>
                                    <p className="text-xs text-gray-500">{apt.doctor.specialization}</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <Calendar className="h-4 w-4 text-blue-500" />
                                        {format(new Date(apt.appointmentDate), "PPP")}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                        <Clock className="h-4 w-4" />
                                        {format(new Date(apt.appointmentDate), "p")}
                                    </div>
                                    {apt.notes && <p className="text-xs text-gray-400 mt-2 italic">{apt.notes}</p>}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Past */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Past Appointments</h2>
                {past.length === 0 ? (
                    <Card><CardContent className="py-8 text-center text-gray-500 text-sm">No past appointments.</CardContent></Card>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-xl border shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                                <tr>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Doctor</th>
                                    <th className="py-3 px-4">Specialization</th>
                                    <th className="py-3 px-4">Type</th>
                                    <th className="py-3 px-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {past.map(apt => (
                                    <tr key={apt.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium">{format(new Date(apt.appointmentDate), "PPP")}</td>
                                        <td className="py-3 px-4">Dr. {apt.doctor.name}</td>
                                        <td className="py-3 px-4 text-gray-500">{apt.doctor.specialization}</td>
                                        <td className="py-3 px-4"><Badge variant="outline">{apt.type}</Badge></td>
                                        <td className="py-3 px-4">
                                            <Badge variant={STATUS_COLORS[apt.status] || "outline"}>{apt.status}</Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
