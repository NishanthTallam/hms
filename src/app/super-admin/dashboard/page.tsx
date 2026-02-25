import { requirePage } from "@/lib/auth-guards";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { Building2, Hospital, Users, Activity } from "lucide-react";

export default async function SuperAdminDashboard() {
    await requirePage(["super_admin"]);

    const [totalHospitals, activeHospitals, totalUsers] = await Promise.all([
        prisma.hospital.count(),
        prisma.hospital.count({ where: { isActive: true } }),
        prisma.user.count(),
    ]);

    const recentHospitals = await prisma.hospital.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { _count: { select: { patients: true, doctors: true } } },
    });

    return (
        <>
            <PageHeader title="System Dashboard" />
            <div className="p-4 md:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                    <KPICard title="Total Hospitals" value={totalHospitals} icon={Building2} color="orange" />
                    <KPICard title="Active Hospitals" value={activeHospitals} icon={Hospital} color="green" />
                    <KPICard title="Total Users" value={totalUsers} icon={Users} color="blue" />
                    <KPICard title="System Status" value="Online" icon={Activity} color="green" />
                </div>

                <div className="bg-white rounded-xl border p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Hospitals</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-[640px] w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hospital</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patients</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctors</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentHospitals.map((h: { id: string; name: string; slug: string; _count: { patients: number; doctors: number } }) => (
                                    <tr key={h.id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-900">{h.name}</td>
                                        <td className="py-3 px-4 text-gray-500">{h.slug}</td>
                                        <td className="py-3 px-4 text-gray-500">{h._count.patients}</td>
                                        <td className="py-3 px-4 text-gray-500">{h._count.doctors}</td>
                                    </tr>
                                ))}
                                {recentHospitals.length === 0 && (
                                    <tr><td colSpan={4} className="py-8 text-center text-gray-400">No hospitals yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
