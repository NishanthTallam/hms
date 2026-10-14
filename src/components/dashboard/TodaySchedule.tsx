"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Loader2 } from "lucide-react";

interface ScheduleItem {
    id: string;
    appointmentDate: string;
    patient: { name: string };
    doctor: { name: string; specialization: string };
}

export function TodaySchedule() {
    const [appointments, setAppointments] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        fetch(`/api/appointments?date=${today}`)
            .then(res => res.json())
            .then(data => { setAppointments(Array.isArray(data) ? data.slice(0, 6) : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="text-[15px] font-semibold text-gray-800" style={{ fontFamily: "var(--font-heading)" }}>Today&apos;s Schedule</h3>
                <span className="text-xs text-gray-400">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-[#1A56DB]" />
                </div>
            ) : appointments.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-400">No appointments today</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-24">Time</th>
                                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Doctor</th>
                                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Patient</th>
                                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-10" />
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((a) => (
                                <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors last:border-0">
                                    <td className="px-5 py-3 text-sm font-medium text-gray-700">{formatTime(a.appointmentDate)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                                {a.doctor.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{a.doctor.name}</p>
                                                <p className="text-[11px] text-gray-400">{a.doctor.specialization}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{a.patient.name}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="w-7 h-7 rounded-md text-gray-300 hover:text-gray-600 hover:bg-gray-100 inline-flex items-center justify-center transition-colors">
                                            <MoreHorizontal className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
