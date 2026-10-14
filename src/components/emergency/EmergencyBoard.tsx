"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { differenceInMinutes } from "date-fns";
import { Clock, Activity, Stethoscope, Users, AlertTriangle, HeartPulse, Thermometer, Wind } from "lucide-react";

type TriageLevel = "critical" | "urgent" | "semi_urgent" | "non_urgent";

const triageConfig: Record<TriageLevel, {
    bg: string; border: string; headerBg: string; text: string; label: string; icon: string; pulse: boolean;
}> = {
    critical: {
        bg: "bg-red-50", border: "border-red-200", headerBg: "bg-gradient-to-r from-red-600 to-red-700",
        text: "text-red-700", label: "CRITICAL", icon: "🔴", pulse: true,
    },
    urgent: {
        bg: "bg-blue-50", border: "border-blue-200", headerBg: "bg-gradient-to-r from-orange-400 to-orange-500",
        text: "text-blue-700", label: "URGENT", icon: "🟠", pulse: false,
    },
    semi_urgent: {
        bg: "bg-amber-50", border: "border-amber-200", headerBg: "bg-gradient-to-r from-amber-500 to-yellow-500",
        text: "text-amber-700", label: "SEMI-URGENT", icon: "🟡", pulse: false,
    },
    non_urgent: {
        bg: "bg-emerald-50", border: "border-emerald-200", headerBg: "bg-gradient-to-r from-emerald-500 to-green-500",
        text: "text-emerald-700", label: "NON-URGENT", icon: "🟢", pulse: false,
    },
};

function CaseCard({ c, mounted, config }: { c: any; mounted: boolean; config: typeof triageConfig[TriageLevel] }) {
    const router = useRouter();
    const waitMin = mounted ? Math.max(0, differenceInMinutes(new Date(), new Date(c.arrivedAt))) : 0;
    const isUrgentWait = waitMin > 30;

    return (
        <div
            onClick={() => router.push(`/hospital/emergency/${c.id}`)}
            className={`group relative bg-white rounded-xl border ${config.border} p-4 cursor-pointer transition-all duration-200
                hover:shadow-lg hover:scale-[1.01] hover:border-gray-300 active:scale-[0.99]`}
        >
            {/* Left accent bar */}
            <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${config.headerBg}`} />

            {/* Header row */}
            <div className="flex justify-between items-start ml-3 mb-3">
                <div>
                    <span className="font-mono text-[11px] text-gray-400 tracking-wider">{c.caseNumber}</span>
                    <h4 className="font-bold text-base text-gray-900 leading-tight mt-0.5 uppercase line-clamp-2">
                        {c.chiefComplaint}
                    </h4>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${isUrgentWait ? "bg-red-100 text-red-700 animate-pulse" : "bg-gray-100 text-gray-600"}`}>
                    <Clock className="h-3 w-3" />
                    {waitMin}m
                </div>
            </div>

            {/* Patient info */}
            <div className="ml-3 flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                    {c.patientName?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-800">{c.patientName}</p>
                    <p className="text-xs text-gray-500">
                        {c.patientAge ? `${c.patientAge}y` : "—"}{c.patientGender ? ` • ${c.patientGender.charAt(0).toUpperCase()}` : ""}
                    </p>
                </div>
            </div>

            {/* Vitals strip */}
            {(c.vitalsBP || c.vitalsHR || c.vitalsSpO2 || c.vitalsTemp) && (
                <div className="ml-3 flex flex-wrap gap-2 mb-3">
                    {c.vitalsBP && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-medium">
                            <Activity className="h-3 w-3" /> {c.vitalsBP}
                        </span>
                    )}
                    {c.vitalsHR && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-pink-50 text-pink-700 text-[11px] font-medium">
                            <HeartPulse className="h-3 w-3" /> {c.vitalsHR} bpm
                        </span>
                    )}
                    {c.vitalsSpO2 && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${c.vitalsSpO2 < 95 ? "bg-red-50 text-red-700" : "bg-teal-50 text-teal-700"}`}>
                            <Wind className="h-3 w-3" /> {c.vitalsSpO2}%
                        </span>
                    )}
                    {c.vitalsTemp && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[11px] font-medium">
                            <Thermometer className="h-3 w-3" /> {c.vitalsTemp}°
                        </span>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="ml-3 flex justify-between items-center pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs">
                    <Stethoscope className="h-3 w-3 text-gray-400" />
                    <span className={c.assignedDoctor ? "text-blue-700 font-medium" : "text-gray-400 italic"}>
                        {c.assignedDoctor?.name ? `Dr. ${c.assignedDoctor.name}` : "Unassigned"}
                    </span>
                </div>
                <Badge
                    variant={c.status === "in_treatment" ? "default" : "outline"}
                    className="text-[10px] font-bold"
                >
                    {c.status.replace("_", " ")}
                </Badge>
            </div>
        </div>
    );
}

export function EmergencyBoard({ hospitalId }: { hospitalId: string }) {
    const [cases, setCases] = useState<any[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [mounted, setMounted] = useState(false);

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
        const interval = setInterval(fetchCases, 15000);
        return () => clearInterval(interval);
    }, []);

    const grouped = {
        critical: cases.filter(c => c.triageLevel === "critical"),
        urgent: cases.filter(c => c.triageLevel === "urgent"),
        semi_urgent: cases.filter(c => c.triageLevel === "semi_urgent"),
        non_urgent: cases.filter(c => c.triageLevel === "non_urgent"),
    };

    const totalActive = cases.length;
    const inTreatment = cases.filter(c => c.status === "in_treatment").length;
    const waiting = cases.filter(c => c.status === "waiting").length;

    return (
        <div className="h-full flex flex-col gap-4">
            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-gray-900">{grouped.critical.length}</p>
                        <p className="text-xs text-gray-500 font-medium">Critical</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-gray-900">{totalActive}</p>
                        <p className="text-xs text-gray-500 font-medium">Total Active</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                        <Stethoscope className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-gray-900">{inTreatment}</p>
                        <p className="text-xs text-gray-500 font-medium">In Treatment</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-gray-900">{waiting}</p>
                        <p className="text-xs text-gray-500 font-medium">Waiting</p>
                    </div>
                </div>
            </div>

            {/* Live indicator + last updated */}
            <div className="flex justify-between items-center text-xs text-gray-400">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <span className="font-medium text-gray-500">LIVE</span>
                </div>
                <span>Updated: {mounted && lastUpdated ? lastUpdated.toLocaleTimeString() : "..."}</span>
            </div>

            {/* Triage columns */}
            <div className="flex-1 overflow-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pb-6">
                {(Object.keys(grouped) as TriageLevel[]).map((level) => {
                    const config = triageConfig[level];
                    const levelCases = grouped[level];
                    return (
                        <div key={level} className="flex flex-col gap-3">
                            {/* Column header */}
                            <div className={`${config.headerBg} rounded-xl px-4 py-3 flex justify-between items-center shadow-sm`}>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{config.icon}</span>
                                    <span className="text-white font-bold text-sm tracking-wide">{config.label}</span>
                                </div>
                                <span className="bg-white/20 text-white font-black text-sm px-2.5 py-0.5 rounded-lg">
                                    {levelCases.length}
                                </span>
                            </div>

                            {/* Cases */}
                            <div className="flex flex-col gap-3">
                                {levelCases.map((c) => (
                                    <CaseCard key={c.id} c={c} mounted={mounted} config={config} />
                                ))}
                                {levelCases.length === 0 && (
                                    <div className={`${config.bg} rounded-xl border ${config.border} border-dashed p-6 text-center`}>
                                        <p className={`text-sm font-medium ${config.text} opacity-60`}>No cases</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
