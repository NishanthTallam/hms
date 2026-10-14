"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const TRIAGE_LEVELS = [
    { value: "critical", label: "🔴 CRITICAL", color: "bg-red-50 hover:bg-red-100 border-red-500 text-red-700" },
    { value: "urgent", label: "🟠 URGENT", color: "bg-blue-50 hover:bg-blue-100 border-orange-400 text-blue-700" },
    { value: "semi_urgent", label: "🟡 SEMI-URGENT", color: "bg-yellow-50 hover:bg-yellow-100 border-yellow-500 text-yellow-700" },
    { value: "non_urgent", label: "🟢 NON-URGENT", color: "bg-green-50 hover:bg-green-100 border-green-500 text-green-700" }
];

export function FastIntakeForm({ hospitalId }: { hospitalId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [patientName, setPatientName] = useState("");
    const [patientAge, setPatientAge] = useState("");
    const [patientGender, setPatientGender] = useState("");
    const [chiefComplaint, setChiefComplaint] = useState("");
    const [triageLevel, setTriageLevel] = useState("urgent");

    const [vitalsBP, setVitalsBP] = useState("");
    const [vitalsHR, setVitalsHR] = useState("");
    const [vitalsTemp, setVitalsTemp] = useState("");
    const [vitalsSpO2, setVitalsSpO2] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch("/api/emergency", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                patientName,
                patientAge: patientAge ? Number(patientAge) : undefined,
                patientGender,
                chiefComplaint,
                triageLevel,
                vitalsBP,
                vitalsHR: vitalsHR ? Number(vitalsHR) : undefined,
                vitalsTemp: vitalsTemp ? Number(vitalsTemp) : undefined,
                vitalsSpO2: vitalsSpO2 ? Number(vitalsSpO2) : undefined
            })
        });

        if (res.ok) {
            router.push("/hospital/emergency");
            router.refresh();
        } else {
            const err = await res.json();
            alert(err.error || "Failed to admit");
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 max-w-3xl border rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="md:col-span-2">
                    <Label htmlFor="name">Patient Name *</Label>
                    <Input id="name" required placeholder="Name (or 'Unknown')" value={patientName} onChange={e => setPatientName(e.target.value)} autoFocus />
                </div>
                <div>
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" placeholder="25" value={patientAge} onChange={e => setPatientAge(e.target.value)} />
                </div>
                <div>
                    <Label>Gender</Label>
                    <Select value={patientGender} onValueChange={setPatientGender}>
                        <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="mb-6">
                <Label>Chief Complaint *</Label>
                <Input required placeholder="Chest pain, accident, unconscious..." value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)} className="text-lg font-medium py-6" />
            </div>

            <div className="mb-8 p-4 bg-gray-50 border rounded-lg">
                <Label className="mb-3 block text-gray-700">Triage Level</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {TRIAGE_LEVELS.map((t) => (
                        <div
                            key={t.value}
                            onClick={() => setTriageLevel(t.value)}
                            className={`cursor-pointer border-2 rounded-lg p-3 text-center font-bold tracking-tight transition-all
                ${triageLevel === t.value ? `ring-2 ring-offset-2 ring-blue-500 shadow-md ${t.color}` : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-100'}
              `}
                        >
                            {t.label}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-8">
                <Label className="mb-3 block text-gray-500 items-center gap-2">Vitals <Badge variant="outline" className="font-normal text-xs ml-2">Optional - fill if time permits</Badge></Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <Label className="text-xs">BP (mmHg)</Label>
                        <Input placeholder="120/80" value={vitalsBP} onChange={e => setVitalsBP(e.target.value)} />
                    </div>
                    <div>
                        <Label className="text-xs">HR (bpm)</Label>
                        <Input type="number" placeholder="80" value={vitalsHR} onChange={e => setVitalsHR(e.target.value)} />
                    </div>
                    <div>
                        <Label className="text-xs">Temp (°C)</Label>
                        <Input type="number" step="0.1" placeholder="37.0" value={vitalsTemp} onChange={e => setVitalsTemp(e.target.value)} />
                    </div>
                    <div>
                        <Label className="text-xs">SpO2 (%)</Label>
                        <Input type="number" placeholder="98" value={vitalsSpO2} onChange={e => setVitalsSpO2(e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center pt-2">
                <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
                <Button size="lg" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white font-bold px-8">
                    {loading ? "Admitting..." : "⚡ ADMIT TO EMERGENCY"}
                </Button>
            </div>
        </form>
    );
}
