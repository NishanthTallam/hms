"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Pill, Plus, Loader2, Search, Minus, Trash2, AlertTriangle } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

function getStockStatus(m: any): string {
    if (!m.stockQty || m.stockQty === 0) return "critical";
    if (m.expiryDate && new Date(m.expiryDate) < new Date()) return "expired";
    if (m.stockQty <= m.minThreshold * 0.5) return "critical";
    if (m.stockQty <= m.minThreshold) return "low_stock";
    if (m.expiryDate) { const t = new Date(); t.setDate(t.getDate() + 30); if (new Date(m.expiryDate) <= t) return "low_stock"; }
    return "in_stock";
}

export default function PharmacyPage() {
    const [medicines, setMedicines] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [search, setSearch] = useState(""); const [deleteId, setDeleteId] = useState<string | null>(null);
    const fetchMedicines = async () => { const r = await fetch("/api/pharmacy"); if (r.ok) setMedicines(await r.json()); setLoading(false); };
    useEffect(() => { fetchMedicines(); }, []);
    const filtered = medicines.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || (m.genericName && m.genericName.toLowerCase().includes(search.toLowerCase())));
    const lowStockCount = medicines.filter(m => ["critical", "low_stock"].includes(getStockStatus(m))).length;
    const updateStock = async (id: string, delta: number) => { await fetch(`/api/pharmacy/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stockDelta: delta }) }); fetchMedicines(); };
    const handleDelete = async () => { if (!deleteId) return; await fetch(`/api/pharmacy/${deleteId}`, { method: "DELETE" }); setDeleteId(null); fetchMedicines(); };

    return (
        <><PageHeader title="Pharmacy" action={<Link href="/hospital/pharmacy/new"><Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"><Plus className="h-4 w-4 mr-2" />Add Medicine</Button></Link>} />
            <div className="p-4 md:p-6">
                {lowStockCount > 0 && <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-4 flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" /><p className="text-sm text-amber-800"><span className="font-medium">{lowStockCount} medicines are low on stock or critical</span></p></div>}
                <div className="mb-4 flex justify-end"><div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div></div>
                {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
                    : filtered.length === 0 ? <EmptyState icon={<Pill className="h-12 w-12" />} title="No medicines" description="Add your first medicine" />
                        : <div className="bg-white rounded-xl border overflow-hidden"><div className="overflow-x-auto"><table className="min-w-[800px] w-full text-sm">
                            <thead><tr className="border-b bg-gray-50"><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Medicine</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Category</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Stock</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Expiry</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Price</th><th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th></tr></thead>
                            <tbody>{filtered.map(m => (<tr key={m.id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="py-3 px-4"><p className="font-medium text-gray-900">{m.name}</p>{m.genericName && <p className="text-xs text-gray-400">{m.genericName}</p>}</td>
                                <td className="py-3 px-4 text-gray-500">{m.category || "—"}</td>
                                <td className="py-3 px-4"><div className="flex items-center gap-1"><Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => updateStock(m.id, -1)}><Minus className="h-3 w-3" /></Button><span className="font-semibold w-8 text-center">{m.stockQty}</span><Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => updateStock(m.id, 1)}><Plus className="h-3 w-3" /></Button><span className="text-xs text-gray-400 ml-1">{m.unit}</span></div></td>
                                <td className="py-3 px-4"><StatusBadge status={getStockStatus(m)} /></td>
                                <td className="py-3 px-4 text-gray-500">{formatDate(m.expiryDate)}</td>
                                <td className="py-3 px-4 text-gray-500">{m.sellingPrice ? formatCurrency(m.sellingPrice) : "—"}</td>
                                <td className="py-3 px-4 text-right"><Button variant="ghost" size="sm" onClick={() => setDeleteId(m.id)}><Trash2 className="h-4 w-4 text-red-400" /></Button></td>
                            </tr>))}</tbody>
                        </table></div></div>}
            </div>
            <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete Medicine" description="Remove from inventory?" onConfirm={handleDelete} />
        </>
    );
}
