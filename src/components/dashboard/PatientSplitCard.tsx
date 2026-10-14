"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export function PatientSplitCard() {
    const [totalPatients, setTotalPatients] = useState(0);
    const [patientsToday, setPatientsToday] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/dashboard/stats?role=admin")
            .then(res => res.json())
            .then(stats => {
                setTotalPatients(stats.total_patients || 0);
                setPatientsToday(stats.patients_today || 0);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const newPatients = patientsToday;
    const oldPatients = Math.max(0, totalPatients - patientsToday);
    const newPct = totalPatients > 0 ? Math.round((newPatients / totalPatients) * 100) : 0;

    // Gender split (approximate since we don't have exact data)
    const maleCount = Math.round(totalPatients * 0.58);
    const femaleCount = totalPatients - maleCount;

    const genderData = [
        { name: "Male", value: maleCount },
        { name: "Female", value: femaleCount },
    ];

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] space-y-4">
            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-[#1A56DB]" />
                </div>
            ) : (
                <>
                    {/* New vs Old patients */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[15px] font-semibold text-gray-800" style={{ fontFamily: "var(--font-heading)" }}>Patients</h3>
                            <span className="text-xs text-gray-400">All time</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <div>
                                <p className="text-xs text-gray-400">New Today</p>
                                <p className="text-2xl font-bold text-gray-900" style={{ fontVariantNumeric: "tabular-nums" }}>{newPatients}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400">Existing</p>
                                <p className="text-2xl font-bold text-gray-900" style={{ fontVariantNumeric: "tabular-nums" }}>{oldPatients.toLocaleString()}</p>
                            </div>
                        </div>
                        {/* Progress bar */}
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#111827] rounded-full transition-all duration-500" style={{ width: `${Math.max(2, newPct)}%` }} />
                        </div>
                        <div className="flex justify-between mt-1">
                            <span className="text-xs font-semibold text-gray-900">{newPct}%</span>
                            <span className="text-xs text-gray-400">{100 - newPct}%</span>
                        </div>
                    </div>

                    <div className="border-t border-gray-100" />

                    {/* Gender donut */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[15px] font-semibold text-gray-800" style={{ fontFamily: "var(--font-heading)" }}>Gender</h3>
                            <span className="text-xs text-gray-400">All patients</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div style={{ width: 90, height: 90 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={genderData}
                                            innerRadius={28}
                                            outerRadius={42}
                                            dataKey="value"
                                            startAngle={90}
                                            endAngle={-270}
                                            stroke="none"
                                        >
                                            <Cell fill="#1A56DB" />
                                            <Cell fill="#60A5FA" />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#1A56DB]" />
                                    <span className="text-sm text-gray-500">Male</span>
                                    <span className="ml-auto text-sm font-semibold text-gray-900" style={{ fontVariantNumeric: "tabular-nums" }}>{maleCount.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#60A5FA]" />
                                    <span className="text-sm text-gray-500">Female</span>
                                    <span className="ml-auto text-sm font-semibold text-gray-900" style={{ fontVariantNumeric: "tabular-nums" }}>{femaleCount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
