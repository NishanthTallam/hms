"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, differenceInMinutes } from "date-fns";
import {
    Clock, Activity, Stethoscope, HeartPulse, Thermometer, Wind,
    UserPlus, RefreshCw, ChevronDown, CheckCircle2, AlertTriangle,
    ArrowLeft, Loader2, StickyNote, User
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmergencyCase {
    id: string;
    caseNumber: string;
    patientName: string;
    patientAge: number | null;
    patientGender: string | null;
    chiefComplaint: string;
    triageLevel: string;
    status: string;
    vitalsBP: string | null;
    vitalsHR: number | null;
    vitalsTemp: number | null;
    vitalsSpO2: number | null;
    vitalsRR: number | null;
    arrivedAt: string;
    treatmentStartAt: string | null;
    resolvedAt: string | null;
    notes: string | null;
    assignedDoctorId: string | null;
    assignedDoctor: { id: string; name: string; specialization: string } | null;
    patient: { id: string; name: string; phone: string } | null;
}

interface Doctor {
    id: string;
    name: string;
    specialization: string;
}

const triageConfig: Record<string, { bg: string; text: string; border: string; label: string; icon: string }> = {
    critical: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "CRITICAL", icon: "🔴" },
    urgent: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", label: "URGENT", icon: "🟠" },
    semi_urgent: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "SEMI-URGENT", icon: "🟡" },
    non_urgent: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", label: "NON-URGENT", icon: "🟢" },
};

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    waiting: { bg: "bg-amber-100", text: "text-amber-800", label: "Waiting" },
    in_treatment: { bg: "bg-blue-100", text: "text-blue-800", label: "In Treatment" },
    admitted: { bg: "bg-purple-100", text: "text-purple-800", label: "Admitted" },
    discharged: { bg: "bg-green-100", text: "text-green-800", label: "Discharged" },
    referred: { bg: "bg-gray-100", text: "text-gray-800", label: "Referred" },
    deceased: { bg: "bg-red-100", text: "text-red-800", label: "Deceased" },
};

export function EmergencyCaseDetail({ caseId }: { caseId: string }) {
    const router = useRouter();
    const [caseData, setCaseData] = useState<EmergencyCase | null>(null);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showDoctorSelect, setShowDoctorSelect] = useState(false);
    const [showStatusSelect, setShowStatusSelect] = useState(false);
    const [showNotesEdit, setShowNotesEdit] = useState(false);
    const [notesValue, setNotesValue] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        loadCase();
        loadDoctors();
    }, []);

    const loadCase = async () => {
        try {
            const res = await fetch("/api/emergency?active=false");
            if (res.ok) {
                const cases = await res.json();
                const found = cases.find((c: any) => c.id === caseId);
                if (found) {
                    setCaseData(found);
                    setNotesValue(found.notes || "");
                }
            }
        } catch { } finally { setLoading(false); }
    };

    const loadDoctors = async () => {
        try {
            const res = await fetch("/api/doctors");
            if (res.ok) setDoctors(await res.json());
        } catch { }
    };

    const updateCase = async (data: Record<string, any>) => {
        setSaving(true);
        try {
            const res = await fetch(`/api/emergency/${caseId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (res.ok) await loadCase();
        } catch { } finally {
            setSaving(false);
            setShowDoctorSelect(false);
            setShowStatusSelect(false);
            setShowNotesEdit(false);
        }
    };

    if (loading || !caseData) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-[#1A56DB]" />
            </div>
        );
    }

    const triage = triageConfig[caseData.triageLevel] || triageConfig.urgent;
    const status = statusConfig[caseData.status] || statusConfig.waiting;
    const waitMin = mounted ? Math.max(0, differenceInMinutes(new Date(), new Date(caseData.arrivedAt))) : 0;

    const vitals = [
        { label: "Blood Pressure", value: caseData.vitalsBP, unit: "mmHg", icon: Activity, color: "bg-blue-50 text-blue-600" },
        { label: "Heart Rate", value: caseData.vitalsHR, unit: "bpm", icon: HeartPulse, color: "bg-pink-50 text-pink-600" },
        { label: "Temperature", value: caseData.vitalsTemp, unit: "°F", icon: Thermometer, color: "bg-amber-50 text-amber-600" },
        { label: "SpO2", value: caseData.vitalsSpO2, unit: "%", icon: Wind, color: caseData.vitalsSpO2 && caseData.vitalsSpO2 < 95 ? "bg-red-50 text-red-600" : "bg-teal-50 text-teal-600" },
        { label: "Resp. Rate", value: caseData.vitalsRR, unit: "/min", icon: Activity, color: "bg-purple-50 text-purple-600" },
    ];

    return (
        <div className="p-4 md:p-6 space-y-5 page-enter max-w-6xl mx-auto">
            {/* Top bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push("/hospital/emergency")} className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
                                {caseData.caseNumber}
                            </h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${triage.bg} ${triage.text} ${triage.border} border`}>
                                {triage.icon} {triage.label}
                            </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-0.5">
                            Arrived {mounted ? format(new Date(caseData.arrivedAt), "dd MMM yyyy, hh:mm a") : "..."} · {waitMin}m ago
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Status badge + change button */}
                    <div className="relative">
                        <button
                            onClick={() => { setShowStatusSelect(!showStatusSelect); setShowDoctorSelect(false); }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${status.bg} ${status.text} transition-colors hover:opacity-80`}
                        >
                            {status.label}
                            <ChevronDown className="w-3 h-3" />
                        </button>
                        {showStatusSelect && (
                            <div className="absolute top-full mt-1 right-0 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                                {Object.entries(statusConfig).map(([key, cfg]) => (
                                    <button
                                        key={key}
                                        onClick={() => updateCase({ status: key })}
                                        disabled={saving}
                                        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                        <span className={`w-2 h-2 rounded-full ${cfg.bg}`} />
                                        {cfg.label}
                                        {caseData.status === key && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-green-500" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={loadCase}
                        disabled={saving}
                        className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw className={`h-4 w-4 ${saving ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left column — Patient + Complaint + Vitals */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Patient card */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-500">
                                {caseData.patientName?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">{caseData.patientName}</h2>
                                <p className="text-sm text-gray-400">
                                    {caseData.patientAge ? `${caseData.patientAge} years` : "Age unknown"}
                                    {caseData.patientGender ? ` · ${caseData.patientGender}` : ""}
                                </p>
                            </div>
                            {caseData.patient && (
                                <button
                                    onClick={() => router.push(`/hospital/patients/${caseData.patient!.id}`)}
                                    className="ml-auto text-xs text-[#1A56DB] font-medium hover:underline"
                                >
                                    View patient record →
                                </button>
                            )}
                        </div>

                        {/* Chief complaint */}
                        <div className={`rounded-lg p-4 ${triage.bg} ${triage.border} border`}>
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className={`w-4 h-4 ${triage.text}`} />
                                <span className={`text-xs font-bold ${triage.text}`}>Chief Complaint</span>
                            </div>
                            <p className="text-gray-800 font-medium">{caseData.chiefComplaint}</p>
                        </div>
                    </div>

                    {/* Vitals grid */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <h3 className="text-[15px] font-semibold text-gray-800 mb-4" style={{ fontFamily: "var(--font-heading)" }}>Vitals</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {vitals.map((v) => (
                                <div key={v.label} className="bg-gray-50 rounded-xl p-3 text-center">
                                    <div className={`mx-auto w-8 h-8 rounded-lg ${v.color} flex items-center justify-center mb-2`}>
                                        <v.icon className="w-4 h-4" />
                                    </div>
                                    <div className="text-xl font-bold text-gray-900" style={{ fontVariantNumeric: "tabular-nums" }}>
                                        {v.value ?? "—"}
                                    </div>
                                    <div className="text-[11px] text-gray-400 mt-0.5">{v.unit}</div>
                                    <div className="text-[10px] text-gray-400 font-medium mt-1">{v.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <h3 className="text-[15px] font-semibold text-gray-800 mb-4" style={{ fontFamily: "var(--font-heading)" }}>Timeline</h3>
                        <div className="space-y-4">
                            {[
                                { label: "Arrived", time: caseData.arrivedAt, color: "bg-blue-500", always: true },
                                { label: "Treatment Started", time: caseData.treatmentStartAt, color: "bg-green-500", always: false },
                                { label: "Resolved", time: caseData.resolvedAt, color: "bg-gray-500", always: false },
                            ].map((item, i) => (
                                (item.always || item.time) && (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-3 h-3 rounded-full ${item.time ? item.color : "bg-gray-200"}`} />
                                            {i < 2 && <div className="w-0.5 h-6 bg-gray-100 mt-1" />}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium ${item.time ? "text-gray-800" : "text-gray-400"}`}>{item.label}</p>
                                            <p className="text-xs text-gray-400">
                                                {item.time ? format(new Date(item.time), "dd MMM yyyy, hh:mm a") : "Pending"}
                                            </p>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right column — Doctor + Notes + Actions */}
                <div className="space-y-5">
                    {/* Assigned Doctor */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[15px] font-semibold text-gray-800" style={{ fontFamily: "var(--font-heading)" }}>Assigned Doctor</h3>
                            <button
                                onClick={() => { setShowDoctorSelect(!showDoctorSelect); setShowStatusSelect(false); }}
                                className="text-xs text-[#1A56DB] font-medium hover:underline flex items-center gap-1"
                            >
                                <UserPlus className="w-3 h-3" />
                                {caseData.assignedDoctor ? "Change" : "Assign"}
                            </button>
                        </div>

                        {caseData.assignedDoctor ? (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                                <div className="w-10 h-10 rounded-full bg-[#1A56DB] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    {caseData.assignedDoctor.name[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">Dr. {caseData.assignedDoctor.name}</p>
                                    <p className="text-xs text-gray-500">{caseData.assignedDoctor.specialization}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 rounded-lg border-2 border-dashed border-gray-200 text-center">
                                <Stethoscope className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">No doctor assigned</p>
                                <button
                                    onClick={() => setShowDoctorSelect(true)}
                                    className="mt-2 text-xs text-[#1A56DB] font-medium hover:underline"
                                >
                                    Click to assign →
                                </button>
                            </div>
                        )}

                        {/* Doctor selection dropdown */}
                        {showDoctorSelect && (
                            <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500">
                                    Select Doctor
                                </div>
                                <div className="max-h-48 overflow-y-auto">
                                    {doctors.length === 0 ? (
                                        <div className="py-4 text-center text-sm text-gray-400">No doctors found</div>
                                    ) : (
                                        doctors.map((d) => (
                                            <button
                                                key={d.id}
                                                onClick={() => updateCase({ assignedDoctorId: d.id })}
                                                disabled={saving}
                                                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-left hover:bg-blue-50 transition-colors disabled:opacity-50 border-b border-gray-50 last:border-0"
                                            >
                                                <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold flex-shrink-0">
                                                    {d.name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">Dr. {d.name}</p>
                                                    <p className="text-[11px] text-gray-400">{d.specialization}</p>
                                                </div>
                                                {caseData.assignedDoctorId === d.id && (
                                                    <CheckCircle2 className="w-4 h-4 ml-auto text-green-500" />
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[15px] font-semibold text-gray-800" style={{ fontFamily: "var(--font-heading)" }}>Notes</h3>
                            <button
                                onClick={() => setShowNotesEdit(!showNotesEdit)}
                                className="text-xs text-[#1A56DB] font-medium hover:underline flex items-center gap-1"
                            >
                                <StickyNote className="w-3 h-3" />
                                Edit
                            </button>
                        </div>

                        {showNotesEdit ? (
                            <div className="space-y-2">
                                <textarea
                                    value={notesValue}
                                    onChange={(e) => setNotesValue(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#1A56DB]/20 focus:border-[#1A56DB]"
                                    rows={4}
                                    placeholder="Add case notes..."
                                />
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => updateCase({ notes: notesValue })}
                                        disabled={saving}
                                        className="bg-[#1A56DB] hover:bg-[#1E40AF] text-white text-xs"
                                    >
                                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setShowNotesEdit(false)} className="text-xs">Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600">{caseData.notes || "No notes added."}</p>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <h3 className="text-[15px] font-semibold text-gray-800 mb-3" style={{ fontFamily: "var(--font-heading)" }}>Quick Actions</h3>
                        <div className="space-y-2">
                            {caseData.status === "waiting" && (
                                <Button
                                    onClick={() => updateCase({ status: "in_treatment" })}
                                    disabled={saving}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white text-sm justify-start gap-2"
                                >
                                    <Stethoscope className="w-4 h-4" /> Start Treatment
                                </Button>
                            )}
                            {caseData.status === "in_treatment" && (
                                <>
                                    <Button
                                        onClick={() => updateCase({ status: "admitted" })}
                                        disabled={saving}
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm justify-start gap-2"
                                    >
                                        <User className="w-4 h-4" /> Admit Patient
                                    </Button>
                                    <Button
                                        onClick={() => updateCase({ status: "discharged" })}
                                        disabled={saving}
                                        className="w-full bg-[#1A56DB] hover:bg-[#1E40AF] text-white text-sm justify-start gap-2"
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> Discharge
                                    </Button>
                                </>
                            )}
                            <Button
                                variant="outline"
                                onClick={() => router.push("/hospital/emergency")}
                                className="w-full text-sm justify-start gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to Board
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
