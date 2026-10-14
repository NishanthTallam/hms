"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Generate synthetic monthly data based on total patient count
function generateMonthlyData(totalPatients: number) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    const data = [];
    for (let i = 0; i < 7; i++) {
        const monthIdx = (currentMonth - 6 + i + 12) % 12;
        const base = Math.max(10, Math.floor(totalPatients / 12));
        data.push({
            month: months[monthIdx],
            consultation: Math.floor(base * (0.6 + Math.random() * 0.8)),
            checkUp: Math.floor(base * (0.3 + Math.random() * 0.5)),
        });
    }
    return data;
}

export function PatientStatusChart() {
    const [totalPatients, setTotalPatients] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/dashboard/stats?role=admin")
            .then(res => res.json())
            .then(stats => { setTotalPatients(stats.total_patients || 0); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const monthlyData = generateMonthlyData(totalPatients);

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-1">
                <div>
                    <h3 className="text-[15px] font-semibold text-gray-800" style={{ fontFamily: "var(--font-heading)" }}>Patients Status</h3>
                    <p className="text-3xl font-bold text-gray-900 tracking-tight mt-1" style={{ fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-heading)" }}>
                        {totalPatients.toLocaleString()}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#1A56DB]" /> Consultation
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#111827]" /> Check-Up
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-[#1A56DB]" />
                </div>
            ) : (
                <div className="mt-4" style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData} barGap={2} barCategoryGap="30%">
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}
                                cursor={{ fill: "rgba(0,0,0,0.03)" }}
                            />
                            <Bar dataKey="consultation" fill="#1A56DB" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="checkUp" fill="#111827" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
