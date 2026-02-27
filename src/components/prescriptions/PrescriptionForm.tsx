"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function PrescriptionForm({ hospitalId }: { hospitalId: string }) {
    const router = useRouter();
    const [patients, setPatients] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [medicines, setMedicines] = useState<any[]>([]);

    const [patientId, setPatientId] = useState("");
    const [doctorId, setDoctorId] = useState("");
    const [validUntil, setValidUntil] = useState("");
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState<any[]>([
        { medicineId: "", medicineName: "", dosage: "", frequency: "", duration: "", quantity: 1, instructions: "" }
    ]);

    useEffect(() => {
        Promise.all([
            fetch("/api/patients").then(r => r.json()),
            fetch("/api/doctors").then(r => r.json()),
            fetch("/api/pharmacy").then(r => r.json())
        ]).then(([p, d, m]) => {
            setPatients(Array.isArray(p) ? p : []);
            setDoctors(Array.isArray(d) ? d : []);
            setMedicines(Array.isArray(m) ? m : []);
        });
    }, []);

    const handleAddItem = () => {
        setItems([...items, { medicineId: "", medicineName: "", dosage: "", frequency: "", duration: "", quantity: 1, instructions: "" }]);
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        if (field === "medicineId") {
            const med = medicines.find(m => m.id === value);
            if (med) {
                newItems[index].medicineName = med.name;
            }
        }
        newItems[index][field] = value;
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!patientId || items.length === 0) return alert("Patient and at least one item required");

        const res = await fetch("/api/prescriptions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                patientId,
                doctorId,
                validUntil: validUntil || undefined,
                notes,
                items
            })
        });

        if (res.ok) {
            router.push("/prescriptions");
            router.refresh();
        } else {
            const err = await res.json();
            alert("Error: " + err.error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <Label>Patient *</Label>
                    <Select value={patientId} onValueChange={setPatientId}>
                        <SelectTrigger><SelectValue placeholder="Select Patient" /></SelectTrigger>
                        <SelectContent>
                            {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Doctor</Label>
                    <Select value={doctorId} onValueChange={setDoctorId}>
                        <SelectTrigger><SelectValue placeholder="Select Doctor" /></SelectTrigger>
                        <SelectContent>
                            {doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Valid Until</Label>
                    <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
                </div>
            </div>

            <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Medicines</h3>
                {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4 items-end bg-gray-50 p-3 rounded border">
                        <div className="md:col-span-2">
                            <Label>Medicine</Label>
                            <Select value={item.medicineId} onValueChange={(v) => handleItemChange(index, "medicineId", v)}>
                                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="custom">-- Custom Text --</SelectItem>
                                    {medicines.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {item.medicineId === "custom" && (
                                <Input className="mt-2" placeholder="Enter medicine name" value={item.medicineName} onChange={e => handleItemChange(index, "medicineName", e.target.value)} />
                            )}
                        </div>
                        <div>
                            <Label>Dosage</Label>
                            <Input placeholder="500mg" value={item.dosage} onChange={e => handleItemChange(index, "dosage", e.target.value)} />
                        </div>
                        <div>
                            <Label>Frequency</Label>
                            <Input placeholder="3x daily" value={item.frequency} onChange={e => handleItemChange(index, "frequency", e.target.value)} />
                        </div>
                        <div>
                            <Label>Duration</Label>
                            <Input placeholder="5 days" value={item.duration} onChange={e => handleItemChange(index, "duration", e.target.value)} />
                        </div>
                        <div className="flex gap-2 items-end">
                            <div className="w-20">
                                <Label>Qty</Label>
                                <Input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(index, "quantity", parseInt(e.target.value) || 1)} />
                            </div>
                            <Button type="button" variant="destructive" onClick={() => removeItem(index)}>X</Button>
                        </div>
                        <div className="md:col-span-6">
                            <Input placeholder="Instructions (e.g. After food)" value={item.instructions} onChange={e => handleItemChange(index, "instructions", e.target.value)} />
                        </div>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddItem}>+ Add Medicine</Button>
            </div>

            <div className="border-t pt-4">
                <Label>Notes</Label>
                <Textarea placeholder="General instructions..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            <div className="flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit">Save Prescription</Button>
            </div>
        </form>
    );
}
