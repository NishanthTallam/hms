"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { Plus, Users, Search } from "lucide-react";

const BED_COLORS: Record<string, string> = {
    available: "bg-green-50 border-green-200 text-green-800",
    occupied: "bg-red-50 border-red-200 text-red-800",
    maintenance: "bg-yellow-50 border-yellow-200 text-yellow-800",
    reserved: "bg-blue-50 border-blue-200 text-blue-800",
};

const BED_INDICATOR: Record<string, string> = {
    available: "🟢",
    occupied: "🔴",
    maintenance: "🟡",
    reserved: "🔵",
};

export function WardBedGrid({ wardId, hospitalId, isAdmin }: { wardId: string, hospitalId: string, isAdmin: boolean }) {
    const [ward, setWard] = useState<any>(null);
    const [isAddBedOpen, setIsAddBedOpen] = useState(false);
    const [isBulkAdd, setIsBulkAdd] = useState(false);

    // Assign patient dialog state
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [assignBedId, setAssignBedId] = useState<string | null>(null);
    const [patients, setPatients] = useState<any[]>([]);
    const [patientSearch, setPatientSearch] = useState("");
    const [loadingPatients, setLoadingPatients] = useState(false);

    // Single bed form
    const [bedNumber, setBedNumber] = useState("");
    const [bedType, setBedType] = useState("general");

    // Bulk bed form
    const [bulkPrefix, setBulkPrefix] = useState("A");
    const [bulkCount, setBulkCount] = useState(5);

    const fetchWard = async () => {
        const res = await fetch(`/api/wards/${wardId}`);
        if (res.ok) setWard(await res.json());
    };

    useEffect(() => {
        fetchWard();
    }, [wardId]);

    const handleAddBed = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = isBulkAdd
            ? { count: bulkCount, prefix: bulkPrefix, type: bedType }
            : { bedNumber, type: bedType };

        await fetch(`/api/wards/${wardId}/beds`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        setIsAddBedOpen(false);
        setBedNumber("");
        fetchWard();
    };

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
        fetchWard();
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
        } else if (action === "maintenance") {
            await fetch(`/api/beds/${bedId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, maintenance: true })
            });
        } else if (action === "ready") {
            await fetch(`/api/beds/${bedId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "maintenance", maintenance: false })
            });
        }
        fetchWard();
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(patientSearch.toLowerCase())
    );

    if (!ward) return <div className="p-8 text-center text-gray-500">Loading ward data...</div>;

    const available = ward.beds?.filter((b: any) => b.status === "available").length || 0;
    const occupied = ward.beds?.filter((b: any) => b.status === "occupied").length || 0;
    const maintenance = ward.beds?.filter((b: any) => b.status === "maintenance").length || 0;

    return (
        <div className="space-y-6 pb-10">
            {/* Ward Header */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{ward.name}</h2>
                    <p className="text-gray-500">Floor: {ward.floor || "N/A"}</p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-gray-50 px-4 py-2 rounded-lg border text-center min-w-[100px]">
                        <div className="text-sm text-gray-500 font-medium mb-1">Total Beds</div>
                        <div className="text-xl font-bold text-gray-900">{ward.beds?.length || 0}</div>
                    </div>
                    <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100 text-center min-w-[100px]">
                        <div className="text-sm text-green-700 font-medium mb-1">Available</div>
                        <div className="text-xl font-bold text-green-700">{available}</div>
                    </div>
                    <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-100 text-center min-w-[100px]">
                        <div className="text-sm text-red-700 font-medium mb-1">Occupied</div>
                        <div className="text-xl font-bold text-red-700">{occupied}</div>
                    </div>
                    <div className="bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-100 text-center min-w-[100px]">
                        <div className="text-sm text-yellow-700 font-medium mb-1">Maint.</div>
                        <div className="text-xl font-bold text-yellow-700">{maintenance}</div>
                    </div>
                </div>
            </div>

            {/* Bed Actions & Legend */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex gap-4 text-sm font-medium">
                    <span className="flex items-center gap-1">🟢 Available</span>
                    <span className="flex items-center gap-1">🔴 Occupied</span>
                    <span className="flex items-center gap-1">🟡 Maintenance</span>
                </div>
                {isAdmin && (
                    <Button onClick={() => setIsAddBedOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Beds
                    </Button>
                )}
            </div>

            {/* Bed Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {ward.beds?.map((bed: any) => (
                    <div key={bed.id} className={`bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col h-full ${BED_COLORS[bed.status]}`}>
                        <div className="p-3 border-b border-black/5 bg-black/5 flex justify-between items-center">
                            <span className="font-bold text-gray-900">{bed.bedNumber}</span>
                            <span className="text-xs font-semibold capitalize bg-white px-2 py-0.5 rounded shadow-sm">{bed.type.replace("_", " ")}</span>
                        </div>

                        <div className="p-4 flex-1 flex flex-col items-center justify-center text-center gap-2">
                            <div className="text-4xl mb-1">{BED_INDICATOR[bed.status]}</div>

                            {bed.status === "occupied" && bed.currentPatient ? (
                                <div className="w-full">
                                    <div className="font-semibold text-gray-900 text-sm truncate">{bed.currentPatient.name}</div>
                                    <div className="text-xs text-gray-600 mt-1">
                                        Admitted: {bed.admittedAt ? formatDistanceToNow(new Date(bed.admittedAt)) : "Unknown"} ago
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm font-medium capitalize opacity-70">
                                    {bed.status}
                                </div>
                            )}
                        </div>

                        <div className="p-2 border-t border-black/5 bg-white flex flex-col gap-2">
                            {bed.status === "available" && (
                                <>
                                    <Button size="sm" onClick={() => handleAction(bed.id, "assign")} className="w-full bg-green-600 hover:bg-green-700 text-white h-8">
                                        Assign Patient
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleAction(bed.id, "maintenance")} className="w-full h-8 text-xs text-yellow-700 hover:bg-yellow-50">
                                        Set Maintenance
                                    </Button>
                                </>
                            )}

                            {bed.status === "occupied" && (
                                <Button size="sm" variant="outline" onClick={() => handleAction(bed.id, "discharge")} className="w-full border-red-200 text-red-700 hover:bg-red-50 h-8">
                                    Discharge
                                </Button>
                            )}

                            {bed.status === "maintenance" && (
                                <Button size="sm" variant="outline" onClick={() => handleAction(bed.id, "ready")} className="w-full border-green-200 text-green-700 hover:bg-green-50 h-8">
                                    Mark Ready
                                </Button>
                            )}
                        </div>
                    </div>
                ))}

                {(!ward.beds || ward.beds.length === 0) && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl border-gray-200 bg-gray-50">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No beds in this ward</h3>
                        <p className="text-gray-500 mt-1">Add beds to start placing patients.</p>
                        {isAdmin && (
                            <Button onClick={() => setIsAddBedOpen(true)} className="mt-4 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                                Add Beds
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Add Bed Dialog */}
            <Dialog open={isAddBedOpen} onOpenChange={setIsAddBedOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Beds to {ward.name}</DialogTitle>
                    </DialogHeader>

                    <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                        <button
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${!isBulkAdd ? 'bg-white shadow' : 'text-gray-500 hover:text-gray-900'}`}
                            onClick={() => setIsBulkAdd(false)}
                        >
                            Single Bed
                        </button>
                        <button
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${isBulkAdd ? 'bg-white shadow' : 'text-gray-500 hover:text-gray-900'}`}
                            onClick={() => setIsBulkAdd(true)}
                        >
                            Bulk Add
                        </button>
                    </div>

                    <form onSubmit={handleAddBed} className="space-y-4">
                        {isBulkAdd ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bulkPrefix">Prefix (e.g. 'A', 'W1')</Label>
                                    <Input
                                        id="bulkPrefix"
                                        required
                                        value={bulkPrefix}
                                        onChange={e => setBulkPrefix(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bulkCount">Number of Beds</Label>
                                    <Input
                                        id="bulkCount"
                                        type="number"
                                        min="1"
                                        max="50"
                                        required
                                        value={bulkCount}
                                        onChange={e => setBulkCount(parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="bedNumber">Bed Number / Label</Label>
                                <Input
                                    id="bedNumber"
                                    required
                                    placeholder="e.g. A-01"
                                    value={bedNumber}
                                    onChange={e => setBedNumber(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="bedType">Bed Type</Label>
                            <Select value={bedType} onValueChange={setBedType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select bed type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="general">General</SelectItem>
                                    <SelectItem value="semi_private">Semi Private</SelectItem>
                                    <SelectItem value="private">Private</SelectItem>
                                    <SelectItem value="ICU">ICU</SelectItem>
                                    <SelectItem value="NICU">NICU</SelectItem>
                                    <SelectItem value="HDU">HDU</SelectItem>
                                    <SelectItem value="emergency">Emergency</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsAddBedOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">Add Bed{isBulkAdd ? 's' : ''}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

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
                                    className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors flex items-center justify-between group"
                                >
                                    <div>
                                        <div className="font-semibold text-gray-900 group-hover:text-orange-700">{patient.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {patient.phone || "No phone"}{patient.gender ? ` • ${patient.gender}` : ""}
                                        </div>
                                    </div>
                                    <span className="text-xs text-orange-600 opacity-0 group-hover:opacity-100 font-medium">Assign →</span>
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
