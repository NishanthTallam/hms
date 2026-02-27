"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { Pill, Activity, AlertTriangle, CheckCircle } from "lucide-react";

export function PharmacistDashboard() {
    return (
        <>
            <PageHeader title="Pharmacist Dashboard" />
            <div className="p-4 md:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                    <KPICard title="Pending Prescriptions" value={14} subtitle="To be dispensed" icon={Activity} color="orange" trend="up" />
                    <KPICard title="Low Stock Alerts" value={3} subtitle="Items below threshold" icon={AlertTriangle} color="red" />
                    <KPICard title="Total Medicines" value={210} subtitle="In inventory" icon={Pill} color="blue" />
                    <KPICard title="Dispensed Today" value={42} subtitle="Prescriptions completed" icon={CheckCircle} color="green" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <div className="lg:col-span-2 bg-white rounded-xl border p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Prescriptions (Pending)</h3>
                            <a href="/hospital/prescriptions" className="text-sm text-green-600 hover:underline font-medium">View All →</a>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                                    <tr>
                                        <th className="py-3 px-4">Time</th>
                                        <th className="py-3 px-4">Patient Name</th>
                                        <th className="py-3 px-4">Doctor</th>
                                        <th className="py-3 px-4">Items</th>
                                        <th className="py-3 px-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {/* Mock Pending Prescriptions */}
                                    <tr className="hover:bg-gray-50">
                                        <td className="py-3 px-4 text-xs font-medium text-gray-500">10:45 AM</td>
                                        <td className="py-3 px-4 font-medium">Alice Johnson</td>
                                        <td className="py-3 px-4 text-gray-600">Dr. Miller</td>
                                        <td className="py-3 px-4">2 meds</td>
                                        <td className="py-3 px-4">
                                            <button className="text-green-600 font-medium hover:underline text-xs bg-green-50 border border-green-200 px-3 py-1.5 rounded">Dispense</button>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="py-3 px-4 text-xs font-medium text-gray-500">11:10 AM</td>
                                        <td className="py-3 px-4 font-medium">Robert Fox</td>
                                        <td className="py-3 px-4 text-gray-600">Dr. Stevens</td>
                                        <td className="py-3 px-4">1 med</td>
                                        <td className="py-3 px-4">
                                            <button className="text-green-600 font-medium hover:underline text-xs bg-green-50 border border-green-200 px-3 py-1.5 rounded">Dispense</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" /> Low Stock Alerts
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 rounded-lg border border-red-100 bg-red-50">
                                <div>
                                    <div className="font-bold text-gray-900">Paracetamol 500mg</div>
                                    <div className="text-xs text-red-600 font-medium">Only 12 strips left</div>
                                </div>
                                <button className="text-xs font-semibold bg-white text-gray-700 px-2 py-1 rounded border shadow-sm hover:bg-gray-50">Order</button>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg border border-orange-100 bg-orange-50">
                                <div>
                                    <div className="font-bold text-gray-900">Amoxicillin 250mg</div>
                                    <div className="text-xs text-orange-600 font-medium">Low stock (24 left)</div>
                                </div>
                                <button className="text-xs font-semibold bg-white text-gray-700 px-2 py-1 rounded border shadow-sm hover:bg-gray-50">Order</button>
                            </div>
                            <div className="pt-2 text-center">
                                <a href="/hospital/pharmacy" className="text-sm text-blue-600 font-medium hover:underline">Go to Inventory</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
