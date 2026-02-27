"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplet, Droplets, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function BloodBankDashboard({ hospitalId }: { hospitalId: string }) {
    const [inventory, setInventory] = useState<Record<string, number>>({});
    const [requests, setRequests] = useState<any[]>([]);

    const fetchData = async () => {
        const [invRes, reqRes] = await Promise.all([
            fetch("/api/blood-bank"),
            fetch("/api/blood-bank/requests")
        ]);

        if (invRes.ok) {
            const data = await invRes.json();
            const invMap = data.reduce((acc: any, curr: any) => {
                acc[curr.bloodGroup] = curr._count.id;
                return acc;
            }, {});
            setInventory(invMap);
        }
        if (reqRes.ok) {
            setRequests(await reqRes.json());
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
            {/* Inventory Grid */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Droplets className="text-red-600" /> Current Inventory
                    </h2>
                    <button className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded">
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

            {/* Requests Section */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Pending Requests</h2>
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded">
                        + New Request
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                            <tr>
                                <th className="py-3 px-4">Priority</th>
                                <th className="py-3 px-4">Requested By</th>
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
                                            req.priority === "emergency" ? "destructive" :
                                                req.priority === "urgent" ? "default" : "secondary"
                                        } className={req.priority === "urgent" ? "bg-orange-500 hover:bg-orange-600" : ""}>
                                            {req.priority.toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td className="py-3 px-4 font-medium">Dr. {req.doctor?.name || "Unknown"}</td>
                                    <td className="py-3 px-4">{req.patient?.name || "-"}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="font-bold text-red-600 text-lg">{req.bloodGroup}</span>
                                    </td>
                                    <td className="py-3 px-4 text-center font-bold text-gray-900">{req.unitsRequired}</td>
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
                                <tr><td colSpan={7} className="py-10 text-center text-gray-500">No active blood requests</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
