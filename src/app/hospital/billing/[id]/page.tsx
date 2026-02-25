"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Loader2, Printer } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function InvoiceDetailPage() {
    const { id } = useParams();
    const [invoice, setInvoice] = useState<any>(null); const [loading, setLoading] = useState(true); const [paymentAmount, setPaymentAmount] = useState(""); const [paying, setPaying] = useState(false);
    const fetchInvoice = async () => { const r = await fetch(`/api/billing/${id}`); if (r.ok) { const d = await r.json(); setInvoice(d); } setLoading(false); };
    useEffect(() => { fetchInvoice(); }, [id]);
    const handlePayment = async (full: boolean) => { setPaying(true); const amount = full ? Number(invoice.totalAmount) : Number(invoice.paidAmount) + Number(paymentAmount); await fetch(`/api/billing/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paidAmount: amount }) }); setPaying(false); setPaymentAmount(""); fetchInvoice(); };

    if (loading) return <><PageHeader title="Invoice" backHref="/hospital/billing" /><div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div></>;
    if (!invoice) return <><PageHeader title="Invoice Not Found" backHref="/hospital/billing" /><div className="p-6 text-center text-gray-500">Not found</div></>;

    const items = Array.isArray(invoice.items) ? invoice.items : JSON.parse(invoice.items || "[]");
    const balance = Number(invoice.totalAmount) - Number(invoice.paidAmount);

    return (
        <><PageHeader title={`Invoice ${invoice.invoiceNumber}`} backHref="/hospital/billing" action={<Button variant="outline" className="hidden sm:inline-flex print:hidden" onClick={() => window.print()}><Printer className="h-4 w-4 mr-2" />Print</Button>} />
            <div className="p-4 md:p-6 print:p-0"><div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-8 print:shadow-none">
                <div className="flex justify-between items-start mb-8"><div><h1 className="text-2xl font-bold text-orange-500">Invoice</h1><p className="text-gray-500 text-sm">{invoice.invoiceNumber}</p><p className="text-gray-500 text-sm">{formatDate(invoice.createdAt)}</p></div><StatusBadge status={invoice.status} /></div>
                <div className="mb-6"><p className="text-sm text-gray-500">Bill To:</p><p className="font-semibold text-gray-900">{invoice.patient?.name}</p><p className="text-sm text-gray-500">{invoice.patient?.phone}</p></div>
                <table className="w-full text-sm mb-6"><thead><tr className="border-b"><th className="text-left py-2 text-gray-500">Description</th><th className="text-center py-2 text-gray-500">Qty</th><th className="text-right py-2 text-gray-500">Unit Price</th><th className="text-right py-2 text-gray-500">Total</th></tr></thead><tbody>{items.map((item: any, i: number) => (<tr key={i} className="border-b"><td className="py-2">{item.name}</td><td className="text-center py-2">{item.qty}</td><td className="text-right py-2">{formatCurrency(item.unitPrice)}</td><td className="text-right py-2">{formatCurrency(item.total)}</td></tr>))}</tbody></table>
                <div className="border-t pt-4 space-y-1 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div>{Number(invoice.discount) > 0 && <div className="flex justify-between text-red-600"><span>Discount</span><span>-{formatCurrency(invoice.discount)}</span></div>}<div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span>{formatCurrency(invoice.totalAmount)}</span></div><div className="flex justify-between text-green-600"><span>Paid</span><span>{formatCurrency(invoice.paidAmount)}</span></div>{balance > 0 && <div className="flex justify-between text-red-600 font-semibold"><span>Balance Due</span><span>{formatCurrency(balance)}</span></div>}</div>
                {invoice.status !== "paid" && <div className="mt-6 pt-4 border-t print:hidden space-y-3"><div className="flex gap-2 items-end"><div className="flex-1"><Input type="number" placeholder="Amount" min={1} value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} /></div><Button onClick={() => handlePayment(false)} disabled={paying || !paymentAmount} variant="outline">Record Payment</Button></div><Button onClick={() => handlePayment(true)} disabled={paying} className="w-full bg-green-600 hover:bg-green-700 text-white">{paying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Mark as Fully Paid</Button></div>}
            </div></div></>
    );
}
