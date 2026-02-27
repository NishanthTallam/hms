import { getSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { NurseDashboard } from "@/components/dashboard/NurseDashboard";
import { ReceptionistDashboard } from "@/components/dashboard/ReceptionistDashboard";
import { PharmacistDashboard } from "@/components/dashboard/PharmacistDashboard";
import { WardBoyDashboard } from "@/components/dashboard/WardBoyDashboard";
import { AccountantDashboard } from "@/components/dashboard/AccountantDashboard";
import { LabTechDashboard } from "@/components/dashboard/LabTechDashboard";

export default async function HospitalDashboardPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const role = session.user.role;

    if (role === "patient") {
        redirect("/patient/dashboard");
    }

    if (!["admin", "doctor", "staff", "super_admin"].includes(role)) {
        throw new Error("Forbidden");
    }

    const staffRole = (session.user as any).staffRole;

    if (role === "super_admin" || role === "admin" || role === "doctor") {
        return <AdminDashboard />;
    }

    if (role === "staff") {
        if (staffRole === "nurse") return <NurseDashboard />;
        if (staffRole === "receptionist") return <ReceptionistDashboard />;
        if (staffRole === "pharmacist") return <PharmacistDashboard />;
        if (staffRole === "ward_boy") return <WardBoyDashboard />;
        if (staffRole === "accountant") return <AccountantDashboard />;
        if (staffRole === "lab_technician") return <LabTechDashboard />;
    }

    // Default fallback
    return <AdminDashboard />;
}
