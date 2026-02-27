"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { Activity, Thermometer, UserCheck, Stethoscope } from "lucide-react";

export function NurseDashboard() {
    return (
        <>
            <PageHeader title="Nurse Dashboard" />
            <div className="p-4 md:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                    <KPICard title="Admitted Patients" value={12} subtitle="Currently in beds" icon={UserCheck} color="blue" />
                    <KPICard title="Vitals Pending" value={5} subtitle="Due in next 2 hours" icon={Activity} color="orange" trend="up" />
                    <KPICard title="Emergency Triages" value={3} subtitle="Today" icon={Stethoscope} color="red" />
                    <KPICard title="Critical Patients" value={1} subtitle="Requires monitoring" icon={Thermometer} color="red" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <div className="lg:col-span-2 bg-white rounded-xl border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Admitted Patients - Vitals Panel</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                                    <tr>
                                        <th className="py-3 px-4">Patient / Bed</th>
                                        <th className="py-3 px-4">Last Check</th>
                                        <th className="py-3 px-4">Heart Rate</th>
                                        <th className="py-3 px-4">BP</th>
                                        <th className="py-3 px-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {/* Mock Data */}
                                    <tr className="hover:bg-gray-50">
                                        <td className="py-3 px-4">John Doe<br /><span className="text-xs text-gray-500">ICU-01</span></td>
                                        <td className="py-3 px-4 text-orange-600 font-medium">4 hours ago</td>
                                        <td className="py-3 px-4">88 bpm</td>
                                        <td className="py-3 px-4">120/80</td>
                                        <td className="py-3 px-4">
                                            <button className="text-blue-600 font-medium hover:underline text-xs bg-blue-50 px-3 py-1 rounded">Record Vitals</button>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="py-3 px-4">Jane Smith<br /><span className="text-xs text-gray-500">Gen-12</span></td>
                                        <td className="py-3 px-4 text-green-600 font-medium">1 hour ago</td>
                                        <td className="py-3 px-4">76 bpm</td>
                                        <td className="py-3 px-4">110/70</td>
                                        <td className="py-3 px-4">
                                            <button className="text-blue-600 font-medium hover:underline text-xs bg-blue-50 px-3 py-1 rounded">Record Vitals</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <a href="/hospital/beds" className="block p-3 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-colors">
                                <div className="font-medium text-blue-800">Assign Beds</div>
                                <div className="text-xs text-gray-500">View visual bed map</div>
                            </a>
                            <a href="/hospital/emergency" className="block p-3 rounded-lg border hover:border-red-500 hover:bg-red-50 transition-colors">
                                <div className="font-medium text-red-800">Emergency Board</div>
                                <div className="text-xs text-gray-500">View incoming triages</div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
