import { getSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { NurseDashboard } from "@/components/dashboard/NurseDashboard";
import { ReceptionistDashboard } from "@/components/dashboard/ReceptionistDashboard";
import { PharmacistDashboard } from "@/components/dashboard/PharmacistDashboard";

export default async function HospitalDashboardPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const role = session.user.role;

    if (role === "patient") {
        redirect("/patient/dashboard");
    }

    if (!["admin", "doctor", "staff"].includes(role)) {
        throw new Error("Forbidden");
    }

    const staffRole = (session.user as any).staffRole;

    if (role === "admin" || role === "doctor") {
        return <AdminDashboard />;
    }

    if (role === "staff") {
        if (staffRole === "nurse") return <NurseDashboard />;
        if (staffRole === "receptionist") return <ReceptionistDashboard />;
        if (staffRole === "pharmacist") return <PharmacistDashboard />;
    }

    // Default fallback
    return <AdminDashboard />;
}
