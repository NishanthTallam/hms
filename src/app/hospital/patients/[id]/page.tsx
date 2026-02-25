"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, Calendar, FileText, Receipt } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function PatientProfilePage() {
    const { id } = useParams();
    const [patient, setPatient] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetch(`/api/patients/${id}`).then(r => r.json()).then(d => { setPatient(d); setLoading(false); }).catch(() => setLoading(false)); }, [id]);

    if (loading) return <><PageHeader title="Patient Profile" backHref="/hospital/patients" /><div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div></>;
    if (!patient) return <><PageHeader title="Patient Not Found" backHref="/hospital/patients" /><div className="p-6 text-center text-gray-500">Patient not found</div></>;

    return (
        <>
            <PageHeader title={patient.name} backHref="/hospital/patients" />
            <div className="p-4 md:p-6 space-y-6">
                <div className="bg-white rounded-xl border p-6">
                    <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-full bg-orange-100 flex items-center justify-center shrink-0"><User className="h-7 w-7 text-orange-600" /></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                            <div><p className="text-xs text-gray-500 uppercase">Phone</p><p className="text-sm font-medium">{patient.phone}</p></div>
                            <div><p className="text-xs text-gray-500 uppercase">Gender</p><p className="text-sm font-medium capitalize">{patient.gender || "—"}</p></div>
                            <div><p className="text-xs text-gray-500 uppercase">Blood Group</p><p className="text-sm font-medium">{patient.bloodGroup?.replace("_POS", "+").replace("_NEG", "-") || "—"}</p></div>
                            <div><p className="text-xs text-gray-500 uppercase">Registered</p><p className="text-sm font-medium">{formatDate(patient.createdAt)}</p></div>
                        </div>
                    </div>
                </div>
                <Tabs defaultValue="appointments" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="appointments"><Calendar className="h-4 w-4 mr-1" />Appointments</TabsTrigger>
                        <TabsTrigger value="records"><FileText className="h-4 w-4 mr-1" />Records</TabsTrigger>
                        <TabsTrigger value="invoices"><Receipt className="h-4 w-4 mr-1" />Invoices</TabsTrigger>
                    </TabsList>
                    <TabsContent value="appointments"><div className="bg-white rounded-xl border overflow-hidden"><div className="overflow-x-auto"><table className="min-w-[500px] w-full text-sm"><thead><tr className="border-b bg-gray-50"><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Doctor</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th></tr></thead><tbody>{patient.appointments?.map((a: any) => (<tr key={a.id} className="border-b last:border-0"><td className="py-3 px-4">{formatDate(a.appointmentDate)}</td><td className="py-3 px-4">{a.doctor?.name || "—"}</td><td className="py-3 px-4"><StatusBadge status={a.type} /></td><td className="py-3 px-4"><StatusBadge status={a.status} /></td></tr>))}{(!patient.appointments || patient.appointments.length === 0) && <tr><td colSpan={4} className="py-8 text-center text-gray-400">No appointments</td></tr>}</tbody></table></div></div></TabsContent>
                    <TabsContent value="records"><div className="bg-white rounded-xl border overflow-hidden"><div className="overflow-x-auto"><table className="min-w-[500px] w-full text-sm"><thead><tr className="border-b bg-gray-50"><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Doctor</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Diagnosis</th></tr></thead><tbody>{patient.records?.map((r: any) => (<tr key={r.id} className="border-b last:border-0"><td className="py-3 px-4">{formatDate(r.createdAt)}</td><td className="py-3 px-4">{r.doctor?.name || "—"}</td><td className="py-3 px-4"><StatusBadge status={r.type} /></td><td className="py-3 px-4 max-w-xs truncate">{r.diagnosis || "—"}</td></tr>))}{(!patient.records || patient.records.length === 0) && <tr><td colSpan={4} className="py-8 text-center text-gray-400">No records</td></tr>}</tbody></table></div></div></TabsContent>
                    <TabsContent value="invoices"><div className="bg-white rounded-xl border overflow-hidden"><div className="overflow-x-auto"><table className="min-w-[500px] w-full text-sm"><thead><tr className="border-b bg-gray-50"><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Invoice #</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Amount</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Paid</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th></tr></thead><tbody>{patient.invoices?.map((inv: any) => (<tr key={inv.id} className="border-b last:border-0"><td className="py-3 px-4 font-medium">{inv.invoiceNumber}</td><td className="py-3 px-4">{formatCurrency(inv.totalAmount)}</td><td className="py-3 px-4">{formatCurrency(inv.paidAmount)}</td><td className="py-3 px-4"><StatusBadge status={inv.status} /></td></tr>))}{(!patient.invoices || patient.invoices.length === 0) && <tr><td colSpan={4} className="py-8 text-center text-gray-400">No invoices</td></tr>}</tbody></table></div></div></TabsContent>
                </Tabs>
            </div>
        </>
    );
}
