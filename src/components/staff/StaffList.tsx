"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Shield, Stethoscope, UserCog } from "lucide-react";

export function StaffList({ hospitalId }: { hospitalId: string }) {
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStaff = async () => {
        setLoading(true);
        const res = await fetch("/api/staff");
        if (res.ok) setStaff(await res.json());
        setLoading(false);
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500 bg-white border rounded-xl shadow-sm">Loading staff members...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">System Role</th>
                            <th className="px-6 py-4">Department / Sub-Role</th>
                            <th className="px-6 py-4">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {staff.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                <td className="px-6 py-4">
                                    {user.role === "admin" && <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-100"><Shield className="w-3 h-3" /> Admin</span>}
                                    {user.role === "doctor" && <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"><Stethoscope className="w-3 h-3" /> Doctor</span>}
                                    {user.role === "staff" && <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"><UserCog className="w-3 h-3" /> Staff</span>}
                                </td>
                                <td className="px-6 py-4 capitalize text-gray-700 font-medium">
                                    {user.staffRole ? user.staffRole.replace("_", " ") : (user.role === "doctor" ? "Medical" : "Administration")}
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "-"}
                                </td>
                            </tr>
                        ))}
                        {staff.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No staff members found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
