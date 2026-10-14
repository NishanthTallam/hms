"use client";

import { useState, useEffect } from "react";
import { KPICard } from "@/components/dashboard/KPICard";
import { TodaySchedule } from "@/components/dashboard/TodaySchedule";
import { QueueStatusCard } from "@/components/dashboard/QueueStatusCard";
import { PatientStatusChart } from "@/components/dashboard/PatientStatusChart";
import { PatientSplitCard } from "@/components/dashboard/PatientSplitCard";
import { Users, CalendarDays, Stethoscope, Bed, Loader2 } from "lucide-react";
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
    available_beds?: number;
}

export function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch("/api/dashboard/stats?role=admin").then(r => r.json()),
            fetch("/api/dashboard/stats?role=ward_boy").then(r => r.json()),
        ])
            .then(([adminStats, bedStats]) => {
                setStats({ ...adminStats, available_beds: bedStats.available_beds || 0 });
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-[#1A56DB]" />
                </div>
            </div>
        );
    }

    const today = new Date();
    const greeting = today.getHours() < 12 ? "Good morning" : today.getHours() < 17 ? "Good afternoon" : "Good evening";

    return (
        <div className="p-6 space-y-6 page-enter">
            {/* Welcome row */}
            <div>
                <h1 className="text-[22px] font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
                    {greeting} 👋
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">
                    {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </p>
            </div>

            {/* KPI Cards row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Today's Appointments"
                    value={stats?.appointments_today || 0}
                    subtitle={`${stats?.appointments_scheduled || 0} scheduled total`}
                    icon={CalendarDays}
                    color="blue"
                    trend={stats?.appointments_today ? "up" : "neutral"}
                />
                <KPICard
                    title="Total Patients"
                    value={stats?.total_patients || 0}
                    subtitle={`+${stats?.patients_today || 0} today`}
                    icon={Users}
                    color="green"
                    trend={stats?.patients_today ? "up" : "neutral"}
                />
                <KPICard
                    title="Revenue This Month"
                    value={formatCurrency(stats?.revenue_this_month || 0)}
                    subtitle={`${stats?.pending_bills || 0} pending bills`}
                    icon={Stethoscope}
                    color="purple"
                    trend="up"
                />
                <KPICard
                    title="Available Beds"
                    value={stats?.available_beds || 0}
                    subtitle={`${stats?.low_stock_count || 0} low stock items`}
                    icon={Bed}
                    color="amber"
                    trend="neutral"
                />
            </div>

            {/* Middle row — Schedule + Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3">
                    <TodaySchedule />
                </div>
                <div className="lg:col-span-2">
                    <QueueStatusCard />
                </div>
            </div>

            {/* Bottom row — Chart + Patient split */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3">
                    <PatientStatusChart />
                </div>
                <div className="lg:col-span-2">
                    <PatientSplitCard />
                </div>
            </div>
        </div>
    );
}
