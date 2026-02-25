"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Building2 } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

interface Hospital {
    id: string;
    name: string;
    slug: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    isActive: boolean;
    createdAt: string;
    _count: { patients: number; doctors: number; users: number };
}

export default function HospitalsPage() {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        hospital_name: "", hospital_slug: "", hospital_email: "", hospital_phone: "", hospital_address: "",
        admin_name: "", admin_email: "", admin_password: "",
    });

    const fetchHospitals = async () => {
        const res = await fetch("/api/admin/hospitals");
        if (res.ok) setHospitals(await res.json());
        setLoading(false);
    };

    useEffect(() => { fetchHospitals(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setError("");

        const res = await fetch("/api/admin/hospitals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.error || "Failed to create hospital");
            setCreating(false);
            return;
        }

        setDialogOpen(false);
        setForm({ hospital_name: "", hospital_slug: "", hospital_email: "", hospital_phone: "", hospital_address: "", admin_name: "", admin_email: "", admin_password: "" });
        setCreating(false);
        fetchHospitals();
    };

    return (
        <>
            <PageHeader
                title="Hospitals"
                action={
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white">
                                <Plus className="h-4 w-4 mr-2" /> Create Hospital
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create New Hospital</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4 mt-4">
                                {error && <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

                                <h3 className="text-sm font-semibold text-gray-700">Hospital Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div><Label>Hospital Name *</Label><Input value={form.hospital_name} onChange={e => setForm({ ...form, hospital_name: e.target.value })} required /></div>
                                    <div><Label>Slug *</Label><Input value={form.hospital_slug} onChange={e => setForm({ ...form, hospital_slug: e.target.value.toLowerCase().replace(/\s/g, "-") })} required placeholder="e.g. apollo" /></div>
                                    <div><Label>Email</Label><Input type="email" value={form.hospital_email} onChange={e => setForm({ ...form, hospital_email: e.target.value })} /></div>
                                    <div><Label>Phone</Label><Input value={form.hospital_phone} onChange={e => setForm({ ...form, hospital_phone: e.target.value })} /></div>
                                </div>
                                <div><Label>Address</Label><Input value={form.hospital_address} onChange={e => setForm({ ...form, hospital_address: e.target.value })} /></div>

                                <hr />
                                <h3 className="text-sm font-semibold text-gray-700">Admin Account</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div><Label>Admin Name *</Label><Input value={form.admin_name} onChange={e => setForm({ ...form, admin_name: e.target.value })} required /></div>
                                    <div><Label>Admin Email *</Label><Input type="email" value={form.admin_email} onChange={e => setForm({ ...form, admin_email: e.target.value })} required /></div>
                                </div>
                                <div><Label>Admin Password *</Label><Input type="password" value={form.admin_password} onChange={e => setForm({ ...form, admin_password: e.target.value })} required minLength={8} /></div>

                                <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={creating}>
                                    {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Hospital"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                }
            />
            <div className="p-4 md:p-6">
                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
                ) : hospitals.length === 0 ? (
                    <EmptyState icon={<Building2 className="h-12 w-12" />} title="No hospitals yet" description="Create your first hospital to get started" />
                ) : (
                    <div className="bg-white rounded-xl border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-[640px] w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Hospital</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Slug</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Patients</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Doctors</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Users</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hospitals.map(h => (
                                        <tr key={h.id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="py-3 px-4 font-medium text-gray-900">{h.name}</td>
                                            <td className="py-3 px-4 text-gray-500">{h.slug}</td>
                                            <td className="py-3 px-4 text-gray-500">{h._count.patients}</td>
                                            <td className="py-3 px-4 text-gray-500">{h._count.doctors}</td>
                                            <td className="py-3 px-4 text-gray-500">{h._count.users}</td>
                                            <td className="py-3 px-4"><StatusBadge status={h.isActive ? "active" : "inactive"} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
