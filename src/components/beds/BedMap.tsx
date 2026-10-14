"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { BedStatus } from "@prisma/client";
import { Search } from "lucide-react";

const BED_COLORS: Record<string, string> = {
    available: "bg-green-100 border-green-400 text-green-800",
    occupied: "bg-red-100 border-red-400 text-red-800",
    maintenance: "bg-yellow-100 border-yellow-400 text-yellow-800",
    reserved: "bg-blue-100 border-blue-400 text-blue-800",
};

const BED_INDICATOR: Record<string, string> = {
    available: "🟢",
    occupied: "🔴",
    maintenance: "🟡",
    reserved: "🔵",
};

export function BedMap({ hospitalId }: { hospitalId: string }) {
    const [beds, setBeds] = useState<any[]>([]);

    // Assign patient dialog state
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [assignBedId, setAssignBedId] = useState<string | null>(null);
    const [patients, setPatients] = useState<any[]>([]);
    const [patientSearch, setPatientSearch] = useState("");
    const [loadingPatients, setLoadingPatients] = useState(false);

    const fetchBeds = async () => {
        const res = await fetch("/api/beds");
        if (res.ok) setBeds(await res.json());
    };

    useEffect(() => {
        fetchBeds();
    }, []);

    const openAssignDialog = async (bedId: string) => {
        setAssignBedId(bedId);
        setPatientSearch("");
        setIsAssignOpen(true);
        setLoadingPatients(true);
        try {
            const res = await fetch("/api/patients");
            if (res.ok) setPatients(await res.json());
        } catch (e) {
            console.error("Failed to fetch patients", e);
        } finally {
            setLoadingPatients(false);
        }
    };

    const handleAssignPatient = async (patientId: string) => {
        if (!assignBedId) return;
        await fetch(`/api/beds/${assignBedId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "assign", patientId })
        });
        setIsAssignOpen(false);
        setAssignBedId(null);
        fetchBeds();
    };

    const handleAction = async (bedId: string, action: string) => {
        if (action === "assign") {
            openAssignDialog(bedId);
            return;
        } else if (action === "discharge") {
            if (!confirm("Confirm discharge?")) return;
            await fetch(`/api/beds/${bedId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action })
            });
        }
        fetchBeds();
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(patientSearch.toLowerCase())
    );

    // Group beds by Ward
    const groupedBeds = beds.reduce((acc, bed) => {
        const wardName = bed.ward.name + (bed.ward.floor ? ` — Floor ${bed.ward.floor}` : "");
        if (!acc[wardName]) acc[wardName] = [];
        acc[wardName].push(bed);
        return acc;
    }, {} as Record<string, any[]>);

    return (
        <div className="space-y-8 pb-10">
            <div className="flex gap-4 text-sm font-medium bg-white p-3 rounded shadow-sm border">
                <span>Legend:</span>
                <span className="flex items-center gap-1">🟢 Available</span>
                <span className="flex items-center gap-1">🔴 Occupied</span>
                <span className="flex items-center gap-1">🟡 Maintenance</span>
                <span className="flex items-center gap-1">🔵 Reserved</span>
            </div>

            {Object.entries(groupedBeds).map(([wardName, wardBeds]: [string, any]) => {
                const available = wardBeds.filter((b: any) => b.status === "available").length;
                const occupied = wardBeds.filter((b: any) => b.status === "occupied").length;

                return (
                    <div key={wardName} className="bg-white rounded-lg border shadow-sm overflow-hidden">
                        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                            <h3 className="font-bold text-lg">{wardName}</h3>
                            <div className="flex items-center gap-4">
                                <div className="text-sm font-medium space-x-3 hidden sm:block">
                                    <span className="text-green-700">Available: {available}</span>
                                    <span className="text-red-700">Occupied: {occupied}</span>
                                    <span className="text-gray-500">Total: {wardBeds.length}</span>
                                </div>
                                <a href={`/hospital/beds/wards/${wardBeds[0]?.wardId}`} className="text-sm font-semibold text-[#1A56DB] hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-md border border-blue-200">
                                    View Ward →
                                </a>
                            </div>
                        </div>
                        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {wardBeds.map((bed: any) => (
                                <div key={bed.id} className={`border-2 rounded-lg p-3 flex flex-col items-center justify-between min-h-[140px] ${BED_COLORS[bed.status]}`}>
                                    <div className="font-bold text-lg mb-1">{bed.bedNumber}</div>
                                    <div className="text-2xl mb-1">{BED_INDICATOR[bed.status]}</div>
                                    <div className="text-xs font-semibold capitalize mb-2">{bed.type.replace("_", " ")}</div>

                                    {bed.status === "occupied" && bed.currentPatient && (
                                        <div className="text-center w-full bg-white/50 rounded py-1 mb-2">
                                            <div className="text-xs font-bold truncate px-1">{bed.currentPatient.name.split(" ")[0]}</div>
                                            <div className="text-[10px]">
                                                {bed.admittedAt ? formatDistanceToNow(new Date(bed.admittedAt)) : ""}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-auto w-full">
                                        {bed.status === "available" && (
                                            <button onClick={() => handleAction(bed.id, "assign")} className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1 px-2 rounded">
                                                Assign
                                            </button>
                                        )}
                                        {bed.status === "occupied" && (
                                            <button onClick={() => handleAction(bed.id, "discharge")} className="w-full bg-white/80 hover:bg-white text-red-700 text-xs font-bold py-1 px-2 rounded border border-red-200">
                                                Discharge
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Assign Patient Dialog */}
            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assign Patient to Bed</DialogTitle>
                    </DialogHeader>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search patient by name..."
                            value={patientSearch}
                            onChange={e => setPatientSearch(e.target.value)}
                            className="pl-9"
                            autoFocus
                        />
                    </div>

                    <div className="max-h-[300px] overflow-y-auto border rounded-lg divide-y">
                        {loadingPatients ? (
                            <div className="p-6 text-center text-gray-500">Loading patients...</div>
                        ) : filteredPatients.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                {patientSearch ? "No patients match your search" : "No patients found"}
                            </div>
                        ) : (
                            filteredPatients.map((patient: any) => (
                                <button
                                    key={patient.id}
                                    onClick={() => handleAssignPatient(patient.id)}
                                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center justify-between group"
                                >
                                    <div>
                                        <div className="font-semibold text-gray-900 group-hover:text-blue-700">{patient.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {patient.phone || "No phone"}{patient.gender ? ` • ${patient.gender}` : ""}
                                        </div>
                                    </div>
                                    <span className="text-xs text-[#1A56DB] opacity-0 group-hover:opacity-100 font-medium">Assign →</span>
                                </button>
                            ))
                        )}
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button variant="outline" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
