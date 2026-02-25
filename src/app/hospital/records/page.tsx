"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ClipboardList, Plus, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function RecordsPage() {
    const [records, setRecords] = useState<any[]>([]); const [loading, setLoading] = useState(true);
    useEffect(() => { fetch("/api/records").then(r => r.json()).then(d => { setRecords(d); setLoading(false); }).catch(() => setLoading(false)); }, []);

    return (
        <><PageHeader title="Medical Records" action={<Link href="/hospital/records/new"><Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"><Plus className="h-4 w-4 mr-2" />New Record</Button></Link>} />
            <div className="p-4 md:p-6">
                {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
                    : records.length === 0 ? <EmptyState icon={<ClipboardList className="h-12 w-12" />} title="No medical records" description="Create your first medical record" />
                        : <div className="bg-white rounded-xl border overflow-hidden"><div className="overflow-x-auto"><table className="min-w-[640px] w-full text-sm">
                            <thead><tr className="border-b bg-gray-50"><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Patient</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Doctor</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Diagnosis</th></tr></thead>
                            <tbody>{records.map(r => (<tr key={r.id} className="border-b last:border-0 hover:bg-gray-50"><td className="py-3 px-4">{formatDate(r.createdAt)}</td><td className="py-3 px-4 font-medium">{r.patient?.name}</td><td className="py-3 px-4 text-gray-500">{r.doctor?.name || "—"}</td><td className="py-3 px-4"><StatusBadge status={r.type} /></td><td className="py-3 px-4 max-w-xs truncate text-gray-600">{r.diagnosis || "—"}</td></tr>))}</tbody>
                        </table></div></div>}
            </div></>
    );
}
