import { getSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { HospitalLayoutClient } from "./layout-client";

export default async function HospitalLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const user = session.user as any;

    return (
        <HospitalLayoutClient
            hospitalName={user.hospitalName || "Hospital"}
            userName={user.name}
            userRole={user.role}
            staffRole={user.staffRole}
        >
            {children}
        </HospitalLayoutClient>
    );
}
