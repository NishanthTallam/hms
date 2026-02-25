"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Users, Plus, Search, Loader2, Trash2, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Patient { id: string; name: string; phone: string; email: string | null; gender: string | null; bloodGroup: string | null; createdAt: string; }

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchPatients = async () => { const res = await fetch("/api/patients"); if (res.ok) setPatients(await res.json()); setLoading(false); };
    useEffect(() => { fetchPatients(); }, []);

    const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search));

    const handleDelete = async () => { if (!deleteId) return; setDeleting(true); await fetch(`/api/patients/${deleteId}`, { method: "DELETE" }); setDeleteId(null); setDeleting(false); fetchPatients(); };

    return (
        <>
            <PageHeader title="Patients" action={<Link href="/hospital/patients/new"><Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"><Plus className="h-4 w-4 mr-2" />Register Patient</Button></Link>} />
            <div className="p-4 md:p-6">
                <div className="mb-4 flex justify-end"><div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div></div>
                {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
                    : filtered.length === 0 ? <EmptyState icon={<Users className="h-12 w-12" />} title={search ? "No matching patients" : "No patients registered yet"} description={search ? "Try a different search term" : "Register your first patient"} action={!search && <Link href="/hospital/patients/new"><Button className="bg-orange-500 hover:bg-orange-600 text-white">Register Patient</Button></Link>} />
                        : (
                            <div className="bg-white rounded-xl border overflow-hidden"><div className="overflow-x-auto"><table className="min-w-[640px] w-full text-sm">
                                <thead><tr className="border-b bg-gray-50">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Phone</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Gender</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Blood Group</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Registered</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr></thead>
                                <tbody>{filtered.map(p => (
                                    <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-900">{p.name}</td>
                                        <td className="py-3 px-4 text-gray-500">{p.phone}</td>
                                        <td className="py-3 px-4 text-gray-500 capitalize">{p.gender || "—"}</td>
                                        <td className="py-3 px-4">{p.bloodGroup ? <StatusBadge status={p.bloodGroup.replace("_POS", "+").replace("_NEG", "-")} /> : "—"}</td>
                                        <td className="py-3 px-4 text-gray-500">{formatDate(p.createdAt)}</td>
                                        <td className="py-3 px-4 text-right space-x-1">
                                            <Link href={`/hospital/patients/${p.id}`}><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></Link>
                                            <Button variant="ghost" size="sm" onClick={() => setDeleteId(p.id)}><Trash2 className="h-4 w-4 text-red-400" /></Button>
                                        </td>
                                    </tr>
                                ))}</tbody>
                            </table></div></div>
                        )}
            </div>
            <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete Patient" description="Are you sure? This will permanently delete this patient." onConfirm={handleDelete} loading={deleting} />
        </>
    );
}
