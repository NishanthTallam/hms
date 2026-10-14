"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Archive, ArrowRight, Wrench, RotateCcw, X } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
    full: "bg-green-100 border-green-500 text-green-800",
    in_use: "bg-blue-100 border-blue-500 text-blue-800",
    empty: "bg-red-100 border-red-500 text-red-800",
    maintenance: "bg-yellow-100 border-yellow-500 text-yellow-800",
};

const CYLINDER_SIZES = ["B_TYPE", "D_TYPE", "E_TYPE", "G_TYPE"];
const SIZE_LABELS: Record<string, string> = {
    B_TYPE: "B-Type (Small)",
    D_TYPE: "D-Type (Medium)",
    E_TYPE: "E-Type (Large)",
    G_TYPE: "G-Type (Jumbo)",
};

/* ───── Register Cylinder Modal ───── */
function RegisterCylinderModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const fd = new FormData(e.currentTarget);
        const body = {
            cylinderCode: fd.get("cylinderCode"),
            size: fd.get("size"),
        };
        const res = await fetch("/api/oxygen", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (res.ok) {
            onSuccess();
            onClose();
        } else {
            const data = await res.json().catch(() => ({}));
            setError(data.error || "Failed to register cylinder");
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b">
                    <h3 className="text-lg font-bold">Register New Cylinder</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cylinder Code *</label>
                        <input name="cylinderCode" required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. OXY-001" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Size *</label>
                        <select name="size" required className="w-full border rounded-lg px-3 py-2 text-sm">
                            <option value="">Select size</option>
                            {CYLINDER_SIZES.map((s) => <option key={s} value={s}>{SIZE_LABELS[s]}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">
                            {loading ? "Registering..." : "Register Cylinder"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ───── Main Grid ───── */
export function OxygenGrid({ hospitalId }: { hospitalId: string }) {
    const [cylinders, setCylinders] = useState<any[]>([]);
    const [showRegister, setShowRegister] = useState(false);

    const fetchCylinders = async () => {
        const res = await fetch("/api/oxygen");
        if (res.ok) setCylinders(await res.json());
    };

    useEffect(() => {
        fetchCylinders();
        const interval = setInterval(fetchCylinders, 30000);
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
            {/* Register Modal */}
            {showRegister && <RegisterCylinderModal onClose={() => setShowRegister(false)} onSuccess={fetchCylinders} />}

            {/* Stats + Register Button */}
            <div className="flex justify-between items-center">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
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
                <button
                    onClick={() => setShowRegister(true)}
                    className="ml-4 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded whitespace-nowrap"
                >
                    + Register Cylinder
                </button>
            </div>

            {/* Cylinder Inventory Map */}
            <div className="bg-white rounded-xl border shadow-sm p-6 overflow-hidden">
                <h3 className="text-lg font-bold mb-4">Cylinder Inventory Map</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {cylinders.map((cyl) => (
                        <div key={cyl.id} className={`border-2 rounded-xl p-3 flex flex-col items-center justify-between min-h-[160px] ${STATUS_COLORS[cyl.status] || ""}`}>
                            <div className="font-mono font-bold text-lg mb-1">{cyl.cylinderCode}</div>
                            <div className="text-3xl mb-1 mt-1">🛢️</div>
                            <div className="text-xs font-semibold capitalize mb-2">{SIZE_LABELS[cyl.size] || cyl.size} • {cyl.status.replace("_", " ")}</div>

                            {cyl.status === "in_use" && cyl.assignedTo && (
                                <div className="text-center w-full bg-white/60 rounded py-1 mb-2 px-1 text-xs font-bold truncate">
                                    Assigned: {cyl.assignedTo}
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
                    {cylinders.length === 0 && (
                        <div className="col-span-full py-10 text-center text-gray-500">No cylinders registered yet. Click &quot;+ Register Cylinder&quot; to add one.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
