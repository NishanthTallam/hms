"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const CATEGORIES = ["Antibiotic", "Painkiller", "Antacid", "Antipyretic", "Antiseptic", "Vitamin", "Antifungal", "Cardiovascular", "Other"];

export default function NewMedicinePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false); const [error, setError] = useState("");
    const [form, setForm] = useState({ name: "", genericName: "", category: "", unit: "strips", stockQty: "0", minThreshold: "10", expiryDate: "", batchNumber: "", supplierName: "", supplierContact: "", purchasePrice: "", sellingPrice: "" });
    const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); setError(""); const res = await fetch("/api/pharmacy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, stockQty: parseInt(form.stockQty) || 0, minThreshold: parseInt(form.minThreshold) || 10, purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : undefined, sellingPrice: form.sellingPrice ? parseFloat(form.sellingPrice) : undefined }) }); if (!res.ok) { const d = await res.json(); setError(d.error || "Failed"); setLoading(false); return; } router.push("/hospital/pharmacy"); router.refresh(); };

    return (
        <><PageHeader title="Add Medicine" backHref="/hospital/pharmacy" />
            <div className="p-4 md:p-6 max-w-2xl"><div className="bg-white rounded-xl border p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label>Medicine Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                        <div><Label>Generic Name</Label><Input value={form.genericName} onChange={e => setForm({ ...form, genericName: e.target.value })} /></div>
                        <div><Label>Category</Label><Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                        <div><Label>Unit</Label><Select value={form.unit} onValueChange={v => setForm({ ...form, unit: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["strips", "bottles", "vials", "tablets"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></div>
                        <div><Label>Stock Qty *</Label><Input type="number" min={0} value={form.stockQty} onChange={e => setForm({ ...form, stockQty: e.target.value })} required /></div>
                        <div><Label>Min Threshold *</Label><Input type="number" min={0} value={form.minThreshold} onChange={e => setForm({ ...form, minThreshold: e.target.value })} required /></div>
                        <div><Label>Expiry Date</Label><Input type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} /></div>
                        <div><Label>Batch Number</Label><Input value={form.batchNumber} onChange={e => setForm({ ...form, batchNumber: e.target.value })} /></div>
                    </div>
                    <hr /><h3 className="text-sm font-semibold text-gray-700">Supplier & Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label>Supplier Name</Label><Input value={form.supplierName} onChange={e => setForm({ ...form, supplierName: e.target.value })} /></div>
                        <div><Label>Supplier Contact</Label><Input value={form.supplierContact} onChange={e => setForm({ ...form, supplierContact: e.target.value })} /></div>
                        <div><Label>Purchase Price (₹)</Label><Input type="number" min={0} step="0.01" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: e.target.value })} /></div>
                        <div><Label>Selling Price (₹)</Label><Input type="number" min={0} step="0.01" value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: e.target.value })} /></div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2"><Button type="submit" className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600" disabled={loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : "Add Medicine"}</Button><Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.back()}>Cancel</Button></div>
                </form>
            </div></div></>
    );
}
