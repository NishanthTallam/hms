"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { FlaskConical, FileCheck, Clock, FileText } from "lucide-react";

export function LabTechDashboard() {
    return (
        <>
            <PageHeader title="Laboratory & Diagnostics" />
            <div className="p-4 md:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                    <KPICard title="Pending Tests" value={0} subtitle="Waiting for results" icon={Clock} color="amber" trend="up" />
                    <KPICard title="Reports Today" value={0} subtitle="Generated" icon={FileCheck} color="green" />
                    <KPICard title="Total Records" value={0} subtitle="In medical history" icon={FileText} color="blue" />
                    <KPICard title="Active Requests" value={0} subtitle="From doctors" icon={FlaskConical} color="blue" />
                </div>

                <div className="bg-white rounded-xl border p-6">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="h-16 w-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4">
                            <FlaskConical className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Medical Records & Reports</h3>
                        <p className="text-gray-500 max-w-md mb-6">
                            Currently, lab management is handled through the Medical Records module. Upload investigation reports and diagnosis details there.
                        </p>
                        <a
                            href="/hospital/records"
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                        >
                            Open Medical Records
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
