"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Archive, ArrowRight, Wrench, RotateCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
    full: "bg-green-100 border-green-500 text-green-800",
    in_use: "bg-blue-100 border-blue-500 text-blue-800",
    empty: "bg-red-100 border-red-500 text-red-800",
    maintenance: "bg-yellow-100 border-yellow-500 text-yellow-800",
};

export function OxygenGrid({ hospitalId }: { hospitalId: string }) {
    const [cylinders, setCylinders] = useState<any[]>([]);

    const fetchCylinders = async () => {
        const res = await fetch("/api/oxygen");
        if (res.ok) setCylinders(await res.json());
    };

    useEffect(() => {
        fetchCylinders();
        const interval = setInterval(fetchCylinders, 30000); // 30s auto-refresh
        return () => clearInterval(interval);
    }, []);

    const handleAction = async (id: string, action: string) => {
        let payload: any = { action };
        if (action === "assign") {
            const roomId = prompt("Enter Room/Ward ID to assign:");
            if (!roomId) return;
            payload.roomId = roomId;
        }

        await fetch(`/api/oxygen/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        fetchCylinders();
    };

    const grouped = {
        full: cylinders.filter(c => c.status === "full"),
        in_use: cylinders.filter(c => c.status === "in_use"),
        empty: cylinders.filter(c => c.status === "empty"),
        maintenance: cylinders.filter(c => c.status === "maintenance"),
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center justify-between">
                    <div><div className="text-gray-500 text-sm">Full</div><div className="text-2xl font-bold text-green-600">{grouped.full.length}</div></div>
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600"><Archive className="h-5 w-5" /></div>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center justify-between">
                    <div><div className="text-gray-500 text-sm">In Use</div><div className="text-2xl font-bold text-blue-600">{grouped.in_use.length}</div></div>
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><ArrowRight className="h-5 w-5" /></div>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center justify-between">
                    <div><div className="text-gray-500 text-sm">Empty</div><div className="text-2xl font-bold text-red-600">{grouped.empty.length}</div></div>
                    <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600"><RotateCcw className="h-5 w-5" /></div>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center justify-between">
                    <div><div className="text-gray-500 text-sm">Maintenance</div><div className="text-2xl font-bold text-yellow-600">{grouped.maintenance.length}</div></div>
                    <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600"><Wrench className="h-5 w-5" /></div>
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm p-6 overflow-hidden">
                <h3 className="text-lg font-bold mb-4">Cylinder Inventory map</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {cylinders.map((cyl) => (
                        <div key={cyl.id} className={`border-2 rounded-xl p-3 flex flex-col items-center justify-between min-h-[160px] ${STATUS_COLORS[cyl.status]}`}>
                            <div className="font-mono font-bold text-lg mb-1">{cyl.cylinderNumber}</div>
                            <div className="text-3xl mb-1 mt-1">🛢️</div>
                            <div className="text-xs font-semibold capitalize mb-2">{cyl.size} • {cyl.status.replace("_", " ")}</div>

                            {cyl.status === "in_use" && cyl.room && (
                                <div className="text-center w-full bg-white/60 rounded py-1 mb-2 px-1 text-xs font-bold truncate">
                                    Room {cyl.room.name}
                                </div>
                            )}

                            <div className="mt-auto w-full grid grid-cols-1 gap-1">
                                {cyl.status === "full" && (
                                    <button onClick={() => handleAction(cyl.id, "assign")} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-1 px-1 rounded shadow-sm">Assign</button>
                                )}
                                {cyl.status === "in_use" && (
                                    <button onClick={() => handleAction(cyl.id, "empty")} className="w-full bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold py-1 px-1 rounded shadow-sm">Mark Empty</button>
                                )}
                                {cyl.status === "empty" && (
                                    <div className="grid grid-cols-2 gap-1">
                                        <button onClick={() => handleAction(cyl.id, "refill")} className="w-full bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold py-1 px-1 rounded shadow-sm">Refill</button>
                                        <button onClick={() => handleAction(cyl.id, "maintenance")} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-[10px] font-bold py-1 px-1 rounded shadow-sm">Maint</button>
                                    </div>
                                )}
                                {cyl.status === "maintenance" && (
                                    <button onClick={() => handleAction(cyl.id, "refill")} className="w-full bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold py-1 px-1 rounded shadow-sm">Maint Done</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
