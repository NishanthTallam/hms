"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { Bed, Activity, Thermometer, UserCheck, Loader2 } from "lucide-react";

export function WardBoyDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/dashboard/stats?role=ward_boy")
            .then(res => res.json())
            .then(data => { setStats(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <>
                <PageHeader title="Ward Management" />
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#1A56DB]" /></div>
            </>
        );
    }

    return (
        <>
            <PageHeader title="Ward Management Dashboard" />
            <div className="p-4 md:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                    <KPICard title="Total Beds" value={stats?.total_beds || 0} subtitle="Mapped to wards" icon={Bed} color="blue" />
                    <KPICard title="Available Beds" value={stats?.available_beds || 0} subtitle="Ready for patients" icon={UserCheck} color="green" />
                    <KPICard title="Occupied Beds" value={stats?.occupied_beds || 0} subtitle="Currently in use" icon={Activity} color="amber" trend="up" />
                    <KPICard title="Maintenance" value={stats?.maintenance_beds || 0} subtitle="Requires cleaning/repair" icon={Thermometer} color="red" />
                </div>

                <div className="bg-white rounded-xl border p-6">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                            <Bed className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Hospital Wards & Beds</h3>
                        <p className="text-gray-500 max-w-md mb-6">
                            View the visual map of all hospital beds, manage their statuses (cleaning, maintenance), and review admitted patients.
                        </p>
                        <a
                            href="/hospital/beds"
                            className="bg-[#1A56DB] hover:bg-[#1E40AF] text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                        >
                            Open Bed Map
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
