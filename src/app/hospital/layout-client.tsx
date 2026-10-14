"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

interface HospitalLayoutClientProps {
    children: React.ReactNode;
    hospitalName: string;
    userName: string;
    userRole: string;
    staffRole?: string;
}

export function HospitalLayoutClient({ children, hospitalName, userName, userRole, staffRole }: HospitalLayoutClientProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
            <Sidebar
                hospitalName={hospitalName}
                userName={userName}
                userRole={userRole}
                staffRole={staffRole}
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Navbar
                    userName={userName}
                    userRole={staffRole || userRole}
                    hospitalName={hospitalName}
                    onMenuClick={() => setSidebarOpen(true)}
                />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
