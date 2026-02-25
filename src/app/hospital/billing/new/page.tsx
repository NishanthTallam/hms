"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface LineItem { name: string; qty: number; unitPrice: number; total: number; }

export default function NewInvoicePage() {
    const router = useRouter();
    const [patients, setPatients] = useState<any[]>([]); const [loading, setLoading] = useState(false); const [error, setError] = useState(""); const [patientId, setPatientId] = useState(""); const [discount, setDiscount] = useState(0); const [dueDate, setDueDate] = useState(""); const [notes, setNotes] = useState("");
    const [items, setItems] = useState<LineItem[]>([{ name: "", qty: 1, unitPrice: 0, total: 0 }]);
    useEffect(() => { fetch("/api/patients").then(r => r.json()).then(setPatients); }, []);
    const updateItem = (i: number, field: string, value: any) => { const u = [...items]; (u[i] as any)[field] = value; u[i].total = u[i].qty * u[i].unitPrice; setItems(u); };
    const addItem = () => setItems([...items, { name: "", qty: 1, unitPrice: 0, total: 0 }]);
    const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
    const subtotal = items.reduce((s, item) => s + item.total, 0);
    const grandTotal = subtotal - discount;
    const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); setError(""); const res = await fetch("/api/billing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patientId, items, discount, dueDate: dueDate || undefined, notes: notes || undefined }) }); if (!res.ok) { const d = await res.json(); setError(d.error || "Failed"); setLoading(false); return; } router.push("/hospital/billing"); router.refresh(); };

    return (
        <><PageHeader title="Create Invoice" backHref="/hospital/billing" />
            <div className="p-4 md:p-6 max-w-3xl"><div className="bg-white rounded-xl border p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><Label>Patient *</Label><Select value={patientId} onValueChange={setPatientId}><SelectTrigger><SelectValue placeholder="Select Patient" /></SelectTrigger><SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div><div><Label>Due Date</Label><Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div></div>
                    <div><div className="flex items-center justify-between mb-2"><Label>Line Items</Label><Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="h-3 w-3 mr-1" />Add Item</Button></div>
                        <div className="space-y-2">{items.map((item, i) => (<div key={i} className="grid grid-cols-12 gap-2 items-end"><div className="col-span-5"><Input placeholder="Description" value={item.name} onChange={e => updateItem(i, "name", e.target.value)} /></div><div className="col-span-2"><Input type="number" placeholder="Qty" min={1} value={item.qty} onChange={e => updateItem(i, "qty", parseInt(e.target.value) || 0)} /></div><div className="col-span-2"><Input type="number" placeholder="Price" min={0} value={item.unitPrice} onChange={e => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)} /></div><div className="col-span-2 text-right text-sm font-medium py-2">{formatCurrency(item.total)}</div><div className="col-span-1">{items.length > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(i)}><Trash2 className="h-3 w-3 text-red-400" /></Button>}</div></div>))}</div></div>
                    <div className="border-t pt-4 space-y-2"><div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-medium">{formatCurrency(subtotal)}</span></div><div className="flex justify-between items-center text-sm"><span>Discount</span><Input type="number" className="w-32 text-right" min={0} value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} /></div><div className="flex justify-between text-lg font-bold border-t pt-2"><span>Grand Total</span><span className="text-orange-600">{formatCurrency(grandTotal)}</span></div></div>
                    <div><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} /></div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2"><Button type="submit" className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600" disabled={loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Invoice"}</Button><Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.back()}>Cancel</Button></div>
                </form>
            </div></div></>
    );
}
