"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, FileText, Pill, LogOut, History, Bed } from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const navigation = [
    { name: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
    { name: "Appointments", href: "/patient/appointments", icon: Calendar },
    { name: "Medical Records", href: "/patient/records", icon: FileText },
    { name: "Prescriptions", href: "/patient/prescriptions", icon: Pill },
    { name: "Last Visited", href: "/patient/last-visited", icon: History },
    { name: "Beds", href: "/patient/beds", icon: Bed },
];

export function PatientSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await authClient.signOut();
        router.push("/login");
    };

    return (
        <div className="hidden lg:flex w-64 flex-col bg-gray-900 border-r text-gray-300">
            <div className="flex h-14 items-center border-b border-gray-800 px-4 font-semibold text-white">
                Patient Portal
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    isActive ? "bg-gray-800 text-white" : "hover:bg-gray-800 hover:text-white",
                                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        isActive ? "text-white" : "text-gray-400 group-hover:text-white",
                                        "mr-3 flex-shrink-0 h-5 w-5"
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
