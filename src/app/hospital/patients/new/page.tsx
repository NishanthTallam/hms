"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export default function NewPatientPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", dob: "", gender: "", bloodGroup: "", address: "", emergencyContactName: "", emergencyContactPhone: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true); setError("");
        const res = await fetch("/api/patients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        if (!res.ok) { const d = await res.json(); setError(d.error || "Failed"); setLoading(false); return; }
        router.push("/hospital/patients"); router.refresh();
    };

    return (
        <>
            <PageHeader title="Register Patient" backHref="/hospital/patients" />
            <div className="p-4 md:p-6 max-w-2xl"><div className="bg-white rounded-xl border p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label>Full Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                        <div><Label>Phone *</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required /></div>
                        <div><Label>Date of Birth</Label><Input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} /></div>
                        <div><Label>Gender</Label><Select value={form.gender} onValueChange={v => setForm({ ...form, gender: v })}><SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
                        <div><Label>Blood Group</Label><Select value={form.bloodGroup} onValueChange={v => setForm({ ...form, bloodGroup: v })}><SelectTrigger><SelectValue placeholder="Select Blood Group" /></SelectTrigger><SelectContent>{["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"].map(bg => <SelectItem key={bg} value={bg}>{bg.replace("_POS", "+").replace("_NEG", "-")}</SelectItem>)}</SelectContent></Select></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
                        <div><Label>Password *</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></div>
                    </div>
                    <div><Label>Address</Label><Textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2} /></div>
                    <hr /><h3 className="text-sm font-semibold text-gray-700">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label>Contact Name</Label><Input value={form.emergencyContactName} onChange={e => setForm({ ...form, emergencyContactName: e.target.value })} /></div>
                        <div><Label>Contact Phone</Label><Input value={form.emergencyContactPhone} onChange={e => setForm({ ...form, emergencyContactPhone: e.target.value })} /></div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button type="submit" className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600" disabled={loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Registering...</> : "Register Patient"}</Button>
                        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.back()}>Cancel</Button>
                    </div>
                </form>
            </div></div>
        </>
    );
}
