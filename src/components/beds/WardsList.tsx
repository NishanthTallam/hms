"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { Trash2, Edit, LayoutGrid } from "lucide-react";

export function WardsList({ hospitalId, isAdmin }: { hospitalId: string, isAdmin: boolean }) {
    const [wards, setWards] = useState<any[]>([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", floor: "", totalBeds: 0 });

    const fetchWards = async () => {
        const res = await fetch("/api/wards");
        if (res.ok) setWards(await res.json());
    };

    useEffect(() => {
        fetchWards();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch("/api/wards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        setIsCreateOpen(false);
        setFormData({ name: "", floor: "", totalBeds: 0 });
        fetchWards();
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}? All beds in this ward will also be deleted.`)) return;
        await fetch(`/api/wards/${id}`, { method: "DELETE" });
        fetchWards();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Hospital Wards</h2>
                    <p className="text-sm text-gray-500">Manage wards, floors, and bed capacities</p>
                </div>
                {isAdmin && (
                    <Button onClick={() => setIsCreateOpen(true)} className="bg-[#1A56DB] hover:bg-[#1E40AF] text-white">
                        + Add Ward
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wards.map((ward) => (
                    <div key={ward.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{ward.name}</h3>
                                <p className="text-sm text-gray-500">Floor {ward.floor || "N/A"}</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center">
                                <span className="text-[#1A56DB] font-bold">{ward._count?.beds || 0}</span>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 flex gap-2">
                            <Link href={`/hospital/beds/wards/${ward.id}`} className="flex-1">
                                <Button variant="outline" className="w-full flex items-center gap-2 bg-white">
                                    <LayoutGrid className="w-4 h-4" /> Manage Beds
                                </Button>
                            </Link>

                            {isAdmin && (
                                <Button
                                    variant="outline"
                                    className="px-3 text-red-600 hover:bg-red-50 hover:text-red-700 bg-white"
                                    onClick={() => handleDelete(ward.id, ward.name)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}

                {wards.length === 0 && (
                    <div className="col-span-full bg-white p-8 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
                        <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <LayoutGrid className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No Wards Set Up</h3>
                        <p className="text-sm text-gray-500 mb-4 max-w-sm">You haven't added any wards to your hospital yet. Create your first ward to start managing beds.</p>
                        {isAdmin && (
                            <Button onClick={() => setIsCreateOpen(true)} className="bg-[#1A56DB] hover:bg-[#1E40AF] text-white">
                                Create Your First Ward
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Ward</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Ward Name</Label>
                            <Input
                                id="name"
                                required
                                placeholder="e.g. General Ward A, ICU, Maternity"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="floor">Floor / Building</Label>
                                <Input
                                    id="floor"
                                    placeholder="e.g. 2nd Floor, East Wing"
                                    value={formData.floor}
                                    onChange={e => setFormData({ ...formData, floor: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-[#1A56DB] hover:bg-[#1E40AF] text-white">Create Ward</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
