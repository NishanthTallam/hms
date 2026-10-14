"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Stethoscope, Plus, Loader2, Trash2 } from "lucide-react";

const SPECIALIZATIONS = ["Cardiology", "Orthopedics", "Neurology", "Pediatrics", "Dermatology", "General Medicine", "Gynecology", "Ophthalmology", "ENT", "Psychiatry"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface Doctor { id: string; name: string; specialization: string; phone: string | null; email: string | null; availableDays: string[]; consultationFee: string | null; }

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]); const [loading, setLoading] = useState(true); const [dialogOpen, setDialogOpen] = useState(false); const [creating, setCreating] = useState(false); const [error, setError] = useState(""); const [deleteId, setDeleteId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: "", specialization: "", phone: "", email: "", password: "", consultationFee: "", availableDays: [] as string[] });
    const fetchDoctors = async () => { const r = await fetch("/api/doctors"); if (r.ok) setDoctors(await r.json()); setLoading(false); };
    useEffect(() => { fetchDoctors(); }, []);
    const handleCreate = async (e: React.FormEvent) => { e.preventDefault(); setCreating(true); setError(""); const res = await fetch("/api/doctors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); if (!res.ok) { const d = await res.json(); setError(d.error || "Failed"); setCreating(false); return; } setDialogOpen(false); setForm({ name: "", specialization: "", phone: "", email: "", password: "", consultationFee: "", availableDays: [] }); setCreating(false); fetchDoctors(); };
    const toggleDay = (day: string) => { setForm(f => ({ ...f, availableDays: f.availableDays.includes(day) ? f.availableDays.filter(d => d !== day) : [...f.availableDays, day] })); };
    const handleDelete = async () => { if (!deleteId) return; await fetch(`/api/doctors/${deleteId}`, { method: "DELETE" }); setDeleteId(null); fetchDoctors(); };

    return (
        <>
            <PageHeader title="Doctors" action={
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogTrigger asChild><Button className="w-full sm:w-auto bg-[#1A56DB] hover:bg-[#1E40AF] text-white"><Plus className="h-4 w-4 mr-2" />Add Doctor</Button></DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Add New Doctor</DialogTitle></DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 mt-4">
                            {error && <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                                <div><Label>Specialization *</Label><Select value={form.specialization} onValueChange={v => setForm({ ...form, specialization: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{SPECIALIZATIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                                <div><Label>Consultation Fee</Label><Input type="number" value={form.consultationFee} onChange={e => setForm({ ...form, consultationFee: e.target.value })} /></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
                                <div><Label>Password *</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></div>
                            </div>
                            <div><Label>Available Days</Label><div className="flex flex-wrap gap-2 mt-1">{DAYS.map(d => (
                                <button key={d} type="button" onClick={() => toggleDay(d)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${form.availableDays.includes(d) ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>{d.slice(0, 3)}</button>
                            ))}</div></div>
                            <Button type="submit" className="w-full bg-[#1A56DB] hover:bg-[#1E40AF]" disabled={creating}>{creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : "Add Doctor"}</Button>
                        </form>
                    </DialogContent></Dialog>
            } />
            <div className="p-4 md:p-6">
                {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#1A56DB]" /></div>
                    : doctors.length === 0 ? <EmptyState icon={<Stethoscope className="h-12 w-12" />} title="No doctors yet" description="Add your first doctor" />
                        : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{doctors.map(d => (
                            <div key={d.id} className="bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow">
                                <div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className="h-11 w-11 rounded-full bg-blue-100 flex items-center justify-center"><span className="text-sm font-bold text-blue-600">{d.name.split(" ").map(n => n[0]).join("")}</span></div><div><p className="font-semibold text-gray-900">{d.name}</p><p className="text-xs text-gray-500">{d.specialization}</p></div></div>
                                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(d.id)}><Trash2 className="h-4 w-4 text-red-400" /></Button></div>
                                <div className="mt-4 space-y-2">
                                    {d.phone && <p className="text-xs text-gray-500">📞 {d.phone}</p>}
                                    {d.consultationFee && <p className="text-xs text-gray-500">💰 ₹{d.consultationFee}</p>}
                                    {d.availableDays.length > 0 && <div className="flex flex-wrap gap-1">{d.availableDays.map(day => <span key={day} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">{day.slice(0, 3)}</span>)}</div>}
                                </div>
                            </div>))}</div>}
            </div>
            <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete Doctor" description="Are you sure?" onConfirm={handleDelete} />
        </>
    );
}
