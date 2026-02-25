"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, Plus, Loader2, Eye } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function BillingPage() {
    const [invoices, setInvoices] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [statusFilter, setStatusFilter] = useState("all");
    useEffect(() => { const params = new URLSearchParams(); if (statusFilter !== "all") params.set("status", statusFilter); fetch(`/api/billing?${params}`).then(r => r.json()).then(d => { setInvoices(d); setLoading(false); }).catch(() => setLoading(false)); }, [statusFilter]);

    return (
        <><PageHeader title="Billing" action={<Link href="/hospital/billing/new"><Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"><Plus className="h-4 w-4 mr-2" />Create Invoice</Button></Link>} />
            <div className="p-4 md:p-6">
                <div className="mb-4 flex justify-end"><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="paid">Paid</SelectItem></SelectContent></Select></div>
                {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
                    : invoices.length === 0 ? <EmptyState icon={<Receipt className="h-12 w-12" />} title="No invoices" description="Create your first invoice" />
                        : <div className="bg-white rounded-xl border overflow-hidden"><div className="overflow-x-auto"><table className="min-w-[700px] w-full text-sm">
                            <thead><tr className="border-b bg-gray-50"><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Invoice #</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Patient</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Amount</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Paid</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Balance</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th><th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th><th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th></tr></thead>
                            <tbody>{invoices.map(inv => (<tr key={inv.id} className="border-b last:border-0 hover:bg-gray-50"><td className="py-3 px-4 font-medium text-gray-900">{inv.invoiceNumber}</td><td className="py-3 px-4">{inv.patient?.name}</td><td className="py-3 px-4">{formatCurrency(inv.totalAmount)}</td><td className="py-3 px-4 text-green-600">{formatCurrency(inv.paidAmount)}</td><td className="py-3 px-4 text-red-600">{formatCurrency(Number(inv.totalAmount) - Number(inv.paidAmount))}</td><td className="py-3 px-4"><StatusBadge status={inv.status} /></td><td className="py-3 px-4 text-gray-500">{formatDate(inv.createdAt)}</td><td className="py-3 px-4 text-right"><Link href={`/hospital/billing/${inv.id}`}><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></Link></td></tr>))}</tbody>
                        </table></div></div>}
            </div></>
    );
}
