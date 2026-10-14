"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplet, Droplets, AlertTriangle, X, User } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// Prisma returns enum keys (A_POS) but UI uses display values (A+)
const ENUM_TO_DISPLAY: Record<string, string> = {
    A_POS: "A+", A_NEG: "A-",
    B_POS: "B+", B_NEG: "B-",
    AB_POS: "AB+", AB_NEG: "AB-",
    O_POS: "O+", O_NEG: "O-",
};

/* ───── Add Donor Unit Modal ───── */
function AddDonorModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const fd = new FormData(e.currentTarget);
        const body = {
            bloodGroup: fd.get("bloodGroup"),
            donorName: fd.get("donorName"),
            donorPhone: fd.get("donorPhone"),
            expiryDate: fd.get("expiryDate"),
            units: Number(fd.get("units")) || 1,
        };
        const res = await fetch("/api/blood-bank", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (res.ok) {
            onSuccess();
            onClose();
        } else {
            const data = await res.json().catch(() => ({}));
            setError(data.error || "Failed to add unit");
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b">
                    <h3 className="text-lg font-bold">Add Donor Unit</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group *</label>
                        <select name="bloodGroup" required className="w-full border rounded-lg px-3 py-2 text-sm">
                            <option value="">Select</option>
                            {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Donor Name *</label>
                        <input name="donorName" required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Full name" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Donor Phone</label>
                        <input name="donorPhone" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Phone number" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Units *</label>
                            <input name="units" type="number" min={1} defaultValue={1} required className="w-full border rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                            <input name="expiryDate" type="date" required className="w-full border rounded-lg px-3 py-2 text-sm" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50">
                            {loading ? "Adding..." : "Add Unit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ───── New Blood Request Modal ───── */
function NewRequestModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [patients, setPatients] = useState<any[]>([]);

    useEffect(() => {
        fetch("/api/patients").then(r => r.ok ? r.json() : []).then(setPatients).catch(() => { });
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const fd = new FormData(e.currentTarget);
        const body = {
            bloodGroup: fd.get("bloodGroup"),
            unitsNeeded: Number(fd.get("unitsNeeded")),
            patientId: fd.get("patientId") || null,
            priority: fd.get("priority"),
            notes: fd.get("notes") || null,
        };
        const res = await fetch("/api/blood-bank/requests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (res.ok) {
            onSuccess();
            onClose();
        } else {
            const data = await res.json().catch(() => ({}));
            setError(data.error || "Failed to create request");
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b">
                    <h3 className="text-lg font-bold">New Blood Request</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group *</label>
                        <select name="bloodGroup" required className="w-full border rounded-lg px-3 py-2 text-sm">
                            <option value="">Select</option>
                            {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Units Needed *</label>
                            <input name="unitsNeeded" type="number" min={1} defaultValue={1} required className="w-full border rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                            <select name="priority" required className="w-full border rounded-lg px-3 py-2 text-sm">
                                <option value="routine">Routine</option>
                                <option value="urgent">Urgent</option>
                                <option value="emergency">Emergency</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Patient (optional)</label>
                        <select name="patientId" className="w-full border rounded-lg px-3 py-2 text-sm">
                            <option value="">— None —</option>
                            {patients.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea name="notes" rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Additional notes..." />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50">
                            {loading ? "Submitting..." : "Submit Request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ───── Main Dashboard ───── */
export function BloodBankDashboard({ hospitalId }: { hospitalId: string }) {
    const [inventory, setInventory] = useState<Record<string, number>>({});
    const [requests, setRequests] = useState<any[]>([]);
    const [donorUnits, setDonorUnits] = useState<any[]>([]);
    const [showAddDonor, setShowAddDonor] = useState(false);
    const [showNewRequest, setShowNewRequest] = useState(false);

    const fetchData = async () => {
        const [invRes, reqRes, unitsRes] = await Promise.all([
            fetch("/api/blood-bank"),
            fetch("/api/blood-bank/requests"),
            fetch("/api/blood-bank?view=list")
        ]);

        if (invRes.ok) {
            const data = await invRes.json();
            const invMap = data.reduce((acc: any, curr: any) => {
                const displayKey = ENUM_TO_DISPLAY[curr.bloodGroup] || curr.bloodGroup;
                acc[displayKey] = curr._count.id;
                return acc;
            }, {});
            setInventory(invMap);
        }
        if (reqRes.ok) {
            setRequests(await reqRes.json());
        }
        if (unitsRes.ok) {
            setDonorUnits(await unitsRes.json());
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleFulfill = async (id: string) => {
        if (!confirm("Confirm fulfillment? This will deduct from inventory.")) return;
        await fetch(`/api/blood-bank/requests/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "fulfill" })
        });
        fetchData();
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Modals */}
            {showAddDonor && <AddDonorModal onClose={() => setShowAddDonor(false)} onSuccess={fetchData} />}
            {showNewRequest && <NewRequestModal onClose={() => setShowNewRequest(false)} onSuccess={fetchData} />}

            {/* Inventory Grid */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Droplets className="text-red-600" /> Current Inventory
                    </h2>
                    <button
                        onClick={() => setShowAddDonor(true)}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded"
                    >
                        + Add Donor Unit
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                    {BLOOD_GROUPS.map((bg) => {
                        const count = inventory[bg] || 0;
                        const isLow = count < 5;
                        return (
                            <div key={bg} className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center min-h-[120px] transition-all
                                ${isLow ? "bg-red-50 border-red-200" : "bg-white border-gray-100 shadow-sm"}`}>
                                <div className="text-2xl font-black text-gray-900 mb-2">{bg}</div>
                                <div className={`text-3xl font-bold ${isLow ? "text-red-600" : "text-gray-700"}`}>
                                    {count}
                                </div>
                                <div className="text-xs text-gray-500 font-medium">Units</div>
                                {isLow && <div className="mt-2 text-[10px] font-bold text-red-600 flex items-center"><AlertTriangle className="h-3 w-3 mr-1" /> LOW</div>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Donor Units List */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <User className="text-red-600" /> Donor Units
                    </h2>
                    <span className="text-sm text-gray-500">{donorUnits.length} total</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                            <tr>
                                <th className="py-3 px-4">Donor Name</th>
                                <th className="py-3 px-4">Contact</th>
                                <th className="py-3 px-4 text-center">Blood Group</th>
                                <th className="py-3 px-4 text-center">Units</th>
                                <th className="py-3 px-4">Collected</th>
                                <th className="py-3 px-4">Expiry</th>
                                <th className="py-3 px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {donorUnits.map((unit) => (
                                <tr key={unit.id} className="hover:bg-gray-50 bg-white">
                                    <td className="py-3 px-4 font-medium">{unit.donorName || "-"}</td>
                                    <td className="py-3 px-4 text-gray-600">{unit.donorContact || "-"}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="font-bold text-red-600 text-lg">{ENUM_TO_DISPLAY[unit.bloodGroup] || unit.bloodGroup}</span>
                                    </td>
                                    <td className="py-3 px-4 text-center font-bold">{unit.units}</td>
                                    <td className="py-3 px-4 text-xs text-gray-500">{format(new Date(unit.collectedAt), "dd MMM yyyy")}</td>
                                    <td className="py-3 px-4 text-xs text-gray-500">{format(new Date(unit.expiryDate), "dd MMM yyyy")}</td>
                                    <td className="py-3 px-4">
                                        <Badge variant={
                                            unit.status === "available" ? "default" :
                                                unit.status === "used" ? "secondary" :
                                                    unit.status === "expired" ? "destructive" : "outline"
                                        }>
                                            {unit.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                            {donorUnits.length === 0 && (
                                <tr><td colSpan={7} className="py-10 text-center text-gray-500">No donor units recorded yet</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Requests Section */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Pending Requests</h2>
                    <button
                        onClick={() => setShowNewRequest(true)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded"
                    >
                        + New Request
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                            <tr>
                                <th className="py-3 px-4">Priority</th>
                                <th className="py-3 px-4">Patient</th>
                                <th className="py-3 px-4 text-center">Blood Group</th>
                                <th className="py-3 px-4 text-center">Units required</th>
                                <th className="py-3 px-4">Time</th>
                                <th className="py-3 px-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {requests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50 bg-white">
                                    <td className="py-3 px-4">
                                        <Badge variant={
                                            req.urgency === "emergency" ? "destructive" :
                                                req.urgency === "urgent" ? "default" : "secondary"
                                        } className={req.urgency === "urgent" ? "bg-[#1A56DB] hover:bg-[#1E40AF]" : ""}>
                                            {(req.urgency || req.priority || "normal").toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td className="py-3 px-4">{req.patient?.name || "-"}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="font-bold text-red-600 text-lg">{req.bloodGroup}</span>
                                    </td>
                                    <td className="py-3 px-4 text-center font-bold text-gray-900">{req.unitsNeeded}</td>
                                    <td className="py-3 px-4 text-xs text-gray-500">{formatDistanceToNow(new Date(req.createdAt))} ago</td>
                                    <td className="py-3 px-4">
                                        {req.status === "pending" ? (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleFulfill(req.id)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs transition-colors">Fulfill</button>
                                                <button className="bg-gray-100 hover:bg-gray-200 text-red-600 font-bold py-1 px-3 rounded text-xs transition-colors">Reject</button>
                                            </div>
                                        ) : (
                                            <Badge variant="outline">{req.status}</Badge>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr><td colSpan={6} className="py-10 text-center text-gray-500">No active blood requests</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
