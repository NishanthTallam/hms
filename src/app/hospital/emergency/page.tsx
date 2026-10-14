import { requireRole } from "@/lib/auth-utils";
import { EmergencyBoard } from "@/components/emergency/EmergencyBoard";
import Link from "next/link";

export default async function EmergencyPage() {
    const session = await requireRole(["admin", "doctor", "staff"]);
    const hospitalId = (session.user as any).hospitalId;

    return (
        <div className="flex-1 flex flex-col min-h-0 p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
                        <span className="text-white text-xl">🚨</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Emergency Department</h1>
                        <p className="text-sm text-gray-500">Live triage board • Auto-refreshes every 15s</p>
                    </div>
                </div>
                <Link
                    href="/hospital/emergency/new"
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-red-200 transition-all hover:shadow-red-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <span className="text-lg">⚡</span> Fast Intake
                </Link>
            </div>

            {/* Board */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <EmergencyBoard hospitalId={hospitalId} />
            </div>
        </div>
    );
}
