"use client";

import { useState, useEffect } from "react";
import { KPICard } from "@/components/dashboard/KPICard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Users, CalendarDays, Receipt, Pill, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DashboardStats {
    total_patients: number;
    patients_today: number;
    appointments_today: number;
    appointments_scheduled: number;
    pending_bills: number;
    pending_amount: number;
    low_stock_count: number;
    expiring_soon_count: number;
    revenue_this_month: number;
}

export function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/dashboard/stats")
            .then(res => res.json())
            .then(data => { setStats(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <>
                <PageHeader title="Dashboard" />
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
            </>
        );
    }

    return (
        <>
            <PageHeader title="Dashboard" />
            <div className="p-4 md:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                    <KPICard title="Total Patients" value={stats?.total_patients || 0} subtitle={`+${stats?.patients_today || 0} today`} icon={Users} color="orange" trend={stats?.patients_today ? "up" : "neutral"} />
                    <KPICard title="Today's Appointments" value={stats?.appointments_today || 0} subtitle={`${stats?.appointments_scheduled || 0} scheduled total`} icon={CalendarDays} color="blue" />
                    <KPICard title="Pending Bills" value={formatCurrency(stats?.pending_amount || 0)} subtitle={`${stats?.pending_bills || 0} invoices`} icon={Receipt} color="amber" />
                    <KPICard title="Low Stock Items" value={stats?.low_stock_count || 0} subtitle={`${stats?.expiring_soon_count || 0} expiring soon`} icon={Pill} color={stats?.low_stock_count ? "red" : "green"} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Stats</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b"><span className="text-sm text-gray-600">Revenue This Month</span><span className="text-sm font-semibold text-gray-900">{formatCurrency(stats?.revenue_this_month || 0)}</span></div>
                            <div className="flex justify-between items-center py-2 border-b"><span className="text-sm text-gray-600">Total Scheduled</span><span className="text-sm font-semibold text-gray-900">{stats?.appointments_scheduled || 0}</span></div>
                            <div className="flex justify-between items-center py-2"><span className="text-sm text-gray-600">Low Stock Medicines</span><span className="text-sm font-semibold text-red-600">{stats?.low_stock_count || 0}</span></div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Navigation</h3>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <a href="/hospital/patients" className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"><Users className="h-4 w-4 text-orange-500" />Patients</a>
                            <a href="/hospital/appointments" className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"><CalendarDays className="h-4 w-4 text-blue-500" />Appointments</a>
                            <a href="/hospital/billing" className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"><Receipt className="h-4 w-4 text-amber-500" />Billing</a>
                            <a href="/hospital/pharmacy" className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"><Pill className="h-4 w-4 text-green-500" />Pharmacy</a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
