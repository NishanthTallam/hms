"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export default function NewRecordPage() {
    const router = useRouter();
    const [patients, setPatients] = useState<any[]>([]); const [doctors, setDoctors] = useState<any[]>([]); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
    const [form, setForm] = useState({ patientId: "", doctorId: "", type: "OP", diagnosis: "", prescription: "", notes: "", admissionDate: "", dischargeDate: "", ward: "", roomNumber: "" });
    useEffect(() => { fetch("/api/patients").then(r => r.json()).then(setPatients); fetch("/api/doctors").then(r => r.json()).then(setDoctors); }, []);
    const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); setError(""); const res = await fetch("/api/records", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); if (!res.ok) { const d = await res.json(); setError(d.error || "Failed"); setLoading(false); return; } router.push("/hospital/records"); router.refresh(); };

    return (
        <><PageHeader title="New Medical Record" backHref="/hospital/records" />
            <div className="p-4 md:p-6 max-w-2xl"><div className="bg-white rounded-xl border p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label>Patient *</Label><Select value={form.patientId} onValueChange={v => setForm({ ...form, patientId: v })}><SelectTrigger><SelectValue placeholder="Select Patient" /></SelectTrigger><SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
                        <div><Label>Doctor</Label><Select value={form.doctorId} onValueChange={v => setForm({ ...form, doctorId: v })}><SelectTrigger><SelectValue placeholder="Select Doctor" /></SelectTrigger><SelectContent>{doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select></div>
                    </div>
                    <div><Label>Type</Label><Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="OP">OP (Outpatient)</SelectItem><SelectItem value="IP">IP (Inpatient)</SelectItem></SelectContent></Select></div>
                    <div><Label>Diagnosis</Label><Textarea value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} rows={3} /></div>
                    <div><Label>Prescription</Label><Textarea value={form.prescription} onChange={e => setForm({ ...form, prescription: e.target.value })} rows={3} placeholder="Medicine names, dosage, duration..." /></div>
                    <div><Label>Clinical Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
                    {form.type === "IP" && (<><hr /><h3 className="text-sm font-semibold text-gray-700">Inpatient Details</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><Label>Admission Date</Label><Input type="date" value={form.admissionDate} onChange={e => setForm({ ...form, admissionDate: e.target.value })} /></div><div><Label>Discharge Date</Label><Input type="date" value={form.dischargeDate} onChange={e => setForm({ ...form, dischargeDate: e.target.value })} /></div><div><Label>Ward</Label><Input value={form.ward} onChange={e => setForm({ ...form, ward: e.target.value })} /></div><div><Label>Room Number</Label><Input value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })} /></div></div></>)}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2"><Button type="submit" className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600" disabled={loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Record"}</Button><Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.back()}>Cancel</Button></div>
                </form>
            </div></div></>
    );
}
