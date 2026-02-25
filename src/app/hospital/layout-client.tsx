"use client";

import { Sidebar } from "@/components/layout/Sidebar";

interface HospitalLayoutClientProps {
    children: React.ReactNode;
    hospitalName: string;
    userName: string;
    userRole: string;
}

export function HospitalLayoutClient({ children, hospitalName, userName, userRole }: HospitalLayoutClientProps) {
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar
                hospitalName={hospitalName}
                userName={userName}
                userRole={userRole}
            />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
