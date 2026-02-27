"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { Users, CalendarClock, Ticket, CheckSquare } from "lucide-react";

export function ReceptionistDashboard() {
    return (
        <>
            <PageHeader title="Receptionist Dashboard" />
            <div className="p-4 md:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                    <KPICard title="Pending Queue" value={8} subtitle="Waiting in lobby" icon={Users} color="orange" trend="up" />
                    <KPICard title="Appointments Today" value={24} subtitle="Scheduled" icon={CalendarClock} color="blue" />
                    <KPICard title="Tokens Issued" value={15} subtitle="Since morning" icon={Ticket} color="blue" />
                    <KPICard title="Completed Check-ins" value={12} subtitle="Today" icon={CheckSquare} color="green" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <div className="lg:col-span-2 bg-white rounded-xl border p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Live Queue Management</h3>
                            <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-sm font-medium">
                                + Issue Token
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                                    <tr>
                                        <th className="py-3 px-4">Token #</th>
                                        <th className="py-3 px-4">Patient Name</th>
                                        <th className="py-3 px-4">Doctor</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {/* Mock Queue Data */}
                                    <tr className="hover:bg-gray-50">
                                        <td className="py-3 px-4 font-mono font-bold text-purple-700">T-016</td>
                                        <td className="py-3 px-4 font-medium">Michael Brown</td>
                                        <td className="py-3 px-4 text-gray-600">Dr. Smith</td>
                                        <td className="py-3 px-4"><span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Waiting</span></td>
                                        <td className="py-3 px-4 space-x-2">
                                            <button className="text-green-600 font-medium hover:underline text-xs bg-green-50 px-2 py-1 rounded">Call In</button>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="py-3 px-4 font-mono font-bold text-purple-700">T-017</td>
                                        <td className="py-3 px-4 font-medium">Sarah Connor</td>
                                        <td className="py-3 px-4 text-gray-600">Dr. Adams</td>
                                        <td className="py-3 px-4"><span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Waiting</span></td>
                                        <td className="py-3 px-4 space-x-2">
                                            <button className="text-green-600 font-medium hover:underline text-xs bg-green-50 px-2 py-1 rounded">Call In</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
                        <div className="space-y-3">
                            <a href="/hospital/patients/new" className="block p-3 rounded-lg border hover:border-orange-500 hover:bg-orange-50 transition-colors">
                                <div className="font-medium text-orange-800">Register Patient</div>
                                <div className="text-xs text-gray-500">Create new patient record</div>
                            </a>
                            <a href="/hospital/appointments" className="block p-3 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-colors">
                                <div className="font-medium text-blue-800">Appointments</div>
                                <div className="text-xs text-gray-500">Manage daily schedule</div>
                            </a>
                            <a href="/hospital/billing" className="block p-3 rounded-lg border hover:border-green-500 hover:bg-green-50 transition-colors">
                                <div className="font-medium text-green-800">Billing & Invoices</div>
                                <div className="text-xs text-gray-500">Process payments</div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
