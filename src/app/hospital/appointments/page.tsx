"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Plus, Loader2, Check, X } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [statusFilter, setStatusFilter] = useState("all"); const [cancelId, setCancelId] = useState<string | null>(null);
    const fetchAppointments = async () => { const params = new URLSearchParams(); if (statusFilter !== "all") params.set("status", statusFilter); const r = await fetch(`/api/appointments?${params}`); if (r.ok) setAppointments(await r.json()); setLoading(false); };
    useEffect(() => { fetchAppointments(); }, [statusFilter]);
    const markComplete = async (id: string) => { await fetch(`/api/appointments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "completed" }) }); fetchAppointments(); };
    const cancelAppointment = async () => { if (!cancelId) return; await fetch(`/api/appointments/${cancelId}`, { method: "DELETE" }); setCancelId(null); fetchAppointments(); };

    return (
        <>
            <PageHeader title="Appointments" action={<Link href="/hospital/appointments/new"><Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"><Plus className="h-4 w-4 mr-2" />Book Appointment</Button></Link>} />
            <div className="p-4 md:p-6">
                <div className="mb-4 flex justify-end"><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="scheduled">Scheduled</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select></div>
                {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
                    : appointments.length === 0 ? <EmptyState icon={<CalendarDays className="h-12 w-12" />} title="No appointments" description="Book your first appointment" />
                        : <div className="bg-white rounded-xl border overflow-hidden"><div className="overflow-x-auto"><table className="min-w-[700px] w-full text-sm">
                            <thead><tr className="border-b bg-gray-50"><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date & Time</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Patient</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Doctor</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th><th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th></tr></thead>
                            <tbody>{appointments.map(a => (<tr key={a.id} className="border-b last:border-0 hover:bg-gray-50"><td className="py-3 px-4">{formatDateTime(a.appointmentDate)}</td><td className="py-3 px-4 font-medium">{a.patient?.name}</td><td className="py-3 px-4 text-gray-500">{a.doctor?.name}<br /><span className="text-xs text-gray-400">{a.doctor?.specialization}</span></td><td className="py-3 px-4"><StatusBadge status={a.type} /></td><td className="py-3 px-4"><StatusBadge status={a.status} /></td><td className="py-3 px-4 text-right space-x-1">{a.status === "scheduled" && <><Button variant="ghost" size="sm" onClick={() => markComplete(a.id)}><Check className="h-4 w-4 text-green-500" /></Button><Button variant="ghost" size="sm" onClick={() => setCancelId(a.id)}><X className="h-4 w-4 text-red-400" /></Button></>}</td></tr>))}</tbody>
                        </table></div></div>}
            </div>
            <ConfirmDialog open={!!cancelId} onOpenChange={() => setCancelId(null)} title="Cancel Appointment" description="Are you sure?" onConfirm={cancelAppointment} />
        </>
    );
}
