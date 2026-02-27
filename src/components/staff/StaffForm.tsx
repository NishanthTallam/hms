"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export function StaffForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "staff",
        staffRole: "receptionist",
        specialization: "General",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/staff", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create staff member");
            }

            router.push("/hospital/staff");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium border border-red-100">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Temporary Password</Label>
                    <Input
                        id="password"
                        type="password"
                        required
                        minLength={8}
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Min. 8 characters"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="role">System Role</Label>
                    <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select system role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="staff">Staff Member</SelectItem>
                            <SelectItem value="doctor">Doctor</SelectItem>
                            <SelectItem value="admin">Hospital Admin</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Dictates overall system access level.</p>
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Role Specific Details</h4>

                {formData.role === "staff" && (
                    <div className="space-y-2 max-w-sm">
                        <Label htmlFor="staffRole">Department / Sub-Role</Label>
                        <Select value={formData.staffRole} onValueChange={(val) => setFormData({ ...formData, staffRole: val })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select staff sub-role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="receptionist">Receptionist</SelectItem>
                                <SelectItem value="nurse">Nurse</SelectItem>
                                <SelectItem value="pharmacist">Pharmacist</SelectItem>
                                <SelectItem value="lab_technician">Lab Technician</SelectItem>
                                <SelectItem value="ward_boy">Ward Boy</SelectItem>
                                <SelectItem value="accountant">Accountant</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 mt-1">Determines which specialized dashboard they see.</p>
                    </div>
                )}

                {formData.role === "doctor" && (
                    <div className="space-y-2 max-w-sm">
                        <Label htmlFor="specialization">Medical Specialization</Label>
                        <Input
                            id="specialization"
                            required={formData.role === "doctor"}
                            value={formData.specialization}
                            onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                            placeholder="e.g. Cardiologist, General Physician"
                        />
                    </div>
                )}

                {formData.role === "admin" && (
                    <div className="text-sm text-gray-600">
                        Admins have full access to all hospital modules, settings, and staff management features.
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white min-w-[140px]">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {loading ? "Creating..." : "Create Staff Account"}
                </Button>
            </div>
        </form>
    );
}
