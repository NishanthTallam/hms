"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { Receipt, TrendingUp, BarChart, FileText, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function AccountantDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/dashboard/stats?role=accountant")
            .then(res => res.json())
            .then(data => { setStats(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <>
                <PageHeader title="Accounts & Billing Dashboard" />
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
            </>
        );
    }

    return (
        <>
            <PageHeader title="Accounts & Billing" />
            <div className="p-4 md:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                    <KPICard title="Revenue This Month" value={formatCurrency(stats?.revenue_this_month || 0)} subtitle="Total payments collected" icon={TrendingUp} color="green" trend="up" />
                    <KPICard title="Pending Payments" value={formatCurrency(stats?.pending_amount || 0)} subtitle="From unpaid invoices" icon={Receipt} color="red" />
                    <KPICard title="Pending Bills" value={stats?.pending_bills || 0} subtitle="Invoices waiting" icon={FileText} color="amber" />
                    <KPICard title="Total Transactions" value="--" subtitle="View in billing" icon={BarChart} color="blue" />
                </div>

                <div className="bg-white rounded-xl border p-6">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="h-16 w-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
                            <Receipt className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Hospital Billing System</h3>
                        <p className="text-gray-500 max-w-md mb-6">
                            Process payments, review pending invoices, generate receipts, and manage financial records for all patients.
                        </p>
                        <a
                            href="/hospital/billing"
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                        >
                            Go to Billing module
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
