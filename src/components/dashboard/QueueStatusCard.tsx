"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface QueueData {
    completed: number;
    scheduled: number;
    cancelled: number;
}

export function QueueStatusCard() {
    const [data, setData] = useState<QueueData>({ completed: 0, scheduled: 0, cancelled: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/dashboard/stats?role=admin")
            .then(res => res.json())
            .then(stats => {
                setData({
                    completed: stats.appointments_today || 0,
                    scheduled: stats.appointments_scheduled || 0,
                    cancelled: 0,
                });
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const total = data.completed + data.scheduled + (data.cancelled || 0);
    const completedPct = total > 0 ? Math.round((data.completed / total) * 100) : 0;

    const chartData = [
        { name: "Completed", value: data.completed || 1, color: "#1A56DB" },
        { name: "Scheduled", value: data.scheduled || 1, color: "#60A5FA" },
        { name: "Remaining", value: data.cancelled || 1, color: "#E5E7EB" },
    ];

    const legend = [
        { label: "Completed", count: data.completed, color: "#1A56DB" },
        { label: "Scheduled", count: data.scheduled, color: "#60A5FA" },
        { label: "Total", count: total, color: "#E5E7EB" },
    ];

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-semibold text-gray-800" style={{ fontFamily: "var(--font-heading)" }}>Queue Status</h3>
                <span className="text-xs text-gray-400">Today</span>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-[#1A56DB]" />
                </div>
            ) : (
                <>
                    {/* Semi-circle chart */}
                    <div className="flex justify-center mb-4">
                        <div className="relative" style={{ width: 200, height: 120 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="100%"
                                        startAngle={180}
                                        endAngle={0}
                                        innerRadius={60}
                                        outerRadius={90}
                                        dataKey="value"
                                        cornerRadius={4}
                                        stroke="none"
                                    >
                                        {chartData.map((entry, idx) => (
                                            <Cell key={idx} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                                <p className="text-2xl font-bold text-gray-900" style={{ fontVariantNumeric: "tabular-nums" }}>{completedPct}%</p>
                                <p className="text-[10px] text-gray-400">completed</p>
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="space-y-2.5">
                        {legend.map((item) => (
                            <div key={item.label} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                                    <span className="text-sm text-gray-600">{item.label}</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-800" style={{ fontVariantNumeric: "tabular-nums" }}>{item.count}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
