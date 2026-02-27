"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { BedStatus } from "@prisma/client";

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

    const fetchBeds = async () => {
        const res = await fetch("/api/beds");
        if (res.ok) setBeds(await res.json());
    };

    useEffect(() => {
        fetchBeds();
    }, []);

    const handleAction = async (bedId: string, action: string) => {
        if (action === "assign") {
            const pid = prompt("Enter Patient ID to assign:");
            if (!pid) return;
            await fetch(`/api/beds/${bedId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, patientId: pid })
            });
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
                            <div className="text-sm font-medium space-x-3">
                                <span className="text-green-700">Available: {available}</span>
                                <span className="text-red-700">Occupied: {occupied}</span>
                                <span className="text-gray-500">Total: {wardBeds.length}</span>
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
        </div>
    );
}
