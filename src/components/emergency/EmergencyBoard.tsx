"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { differenceInMinutes } from "date-fns";

type TriageLevel = "critical" | "urgent" | "semi_urgent" | "non_urgent";

const triageConfig: Record<TriageLevel, { color: string, label: string }> = {
    critical: { color: "bg-red-600", label: "🔴 CRITICAL" },
    urgent: { color: "bg-orange-500", label: "🟠 URGENT" },
    semi_urgent: { color: "bg-yellow-500", label: "🟡 SEMI-URGENT" },
    non_urgent: { color: "bg-green-500", label: "🟢 NON-URGENT" }
};

export function EmergencyBoard({ hospitalId }: { hospitalId: string }) {
    const [cases, setCases] = useState<any[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    const fetchCases = async () => {
        const res = await fetch("/api/emergency?active=true");
        if (res.ok) {
            setCases(await res.json());
            setLastUpdated(new Date());
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchCases();
        const interval = setInterval(fetchCases, 30000); // 30s auto-refresh
        return () => clearInterval(interval);
    }, []);

    const grouped = {
        critical: cases.filter(c => c.triageLevel === "critical"),
        urgent: cases.filter(c => c.triageLevel === "urgent"),
        semi_urgent: cases.filter(c => c.triageLevel === "semi_urgent"),
        non_urgent: cases.filter(c => c.triageLevel === "non_urgent"),
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                <span>Auto-refreshing every 30s</span>
                <span>Last updated: {mounted && lastUpdated ? lastUpdated.toLocaleTimeString() : "..."}</span>
            </div>

            <div className="flex-1 overflow-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pb-10">
                {(Object.keys(grouped) as TriageLevel[]).map((level) => (
                    <div key={level} className="flex flex-col gap-3 min-w-[280px]">
                        <div className={`font-bold text-white px-3 py-2 rounded shadow-sm ${triageConfig[level].color}`}>
                            {triageConfig[level].label} ({grouped[level].length} cases)
                        </div>

                        {grouped[level].map((c) => (
                            <Card key={c.id} className="cursor-pointer hover:border-gray-400 border-l-4 border-l-gray-900 shadow-sm" onClick={() => router.push(`/emergency/${c.id}`)}>
                                <CardContent className="p-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-mono text-xs text-gray-500">{c.caseNumber}</div>
                                        <div className="text-xs font-medium">{c.patientGender?.charAt(0) || "-"}, {c.patientAge || "-"}y</div>
                                    </div>
                                    <div className="font-bold text-lg leading-tight uppercase mb-2 truncate" title={c.chiefComplaint}>
                                        {c.chiefComplaint}
                                    </div>
                                    <div className="flex gap-2 text-xs text-gray-600 mb-2">
                                        {c.vitalsHR && <span title="Heart Rate">HR:{c.vitalsHR}</span>}
                                        {c.vitalsBP && <span title="Blood Pressure">BP:{c.vitalsBP}</span>}
                                        {c.vitalsSpO2 && <span title="Oxygen">SpO2:{c.vitalsSpO2}%</span>}
                                    </div>
                                    <div className="flex justify-between items-end mt-3 border-t pt-2">
                                        <div className="text-xs text-blue-700 max-w-[120px] truncate">
                                            {c.assignedDoctor?.name ? `Dr. ${c.assignedDoctor.name}` : "Unassigned"}
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <Badge variant={c.status === "in_treatment" ? "default" : "outline"} className="text-[10px]">
                                                {c.status.replace("_", " ")}
                                            </Badge>
                                            <span className="text-xs text-red-600 font-bold">
                                                ⏱ {mounted ? Math.max(0, differenceInMinutes(new Date(), new Date(c.arrivedAt))) : 0} min
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
