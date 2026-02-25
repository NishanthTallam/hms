"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Stethoscope,
    CalendarDays,
    ClipboardList,
    Receipt,
    Pill,
    LogOut,
    Menu,
    X,
    Hospital,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
    { label: "Dashboard", href: "/hospital/dashboard", icon: LayoutDashboard },
    { label: "Patients", href: "/hospital/patients", icon: Users },
    { label: "Doctors", href: "/hospital/doctors", icon: Stethoscope },
    { label: "Appointments", href: "/hospital/appointments", icon: CalendarDays },
    { label: "Medical Records", href: "/hospital/records", icon: ClipboardList },
    { label: "Billing", href: "/hospital/billing", icon: Receipt },
    { label: "Pharmacy", href: "/hospital/pharmacy", icon: Pill },
];

interface SidebarProps {
    hospitalName?: string;
    userName?: string;
    userRole?: string;
    lowStockCount?: number;
}

export function Sidebar({ hospitalName = "Hospital", userName = "User", userRole = "staff", lowStockCount = 0 }: SidebarProps) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    const filteredNavItems = navItems.filter(item => {
        if (userRole === "doctor") {
            return !["/hospital/billing", "/hospital/pharmacy", "/hospital/doctors"].includes(item.href);
        }
        return true;
    });

    const sidebarContent = (
        <>
            <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-200">
                <div className="h-9 w-9 rounded-lg bg-orange-500 flex items-center justify-center">
                    <Hospital className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{hospitalName}</p>
                    <p className="text-xs text-gray-500">Hospital Management</p>
                </div>
                <button className="lg:hidden p-1" onClick={() => setOpen(false)}>
                    <X className="h-5 w-5 text-gray-400" />
                </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {filteredNavItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative",
                                isActive
                                    ? "bg-orange-50 text-orange-600"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-orange-500" : "text-gray-400")} />
                            <span>{item.label}</span>
                            {item.label === "Pharmacy" && lowStockCount > 0 && (
                                <span className="absolute right-2 h-5 min-w-[20px] rounded-full bg-red-500 text-white text-xs flex items-center justify-center px-1">
                                    {lowStockCount > 9 ? "9+" : lowStockCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-gray-200 px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-600">{userName.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                        <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                    </div>
                    <form action="/api/auth/sign-out" method="POST">
                        <Button variant="ghost" size="sm" type="submit" className="h-8 w-8 p-0">
                            <LogOut className="h-4 w-4 text-gray-400" />
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-20 lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            <aside className={cn(
                "fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col",
                "transform transition-transform duration-200 ease-in-out",
                open ? "translate-x-0" : "-translate-x-full",
                "lg:translate-x-0 lg:static lg:z-auto"
            )}>
                {sidebarContent}
            </aside>

            <button
                className="lg:hidden fixed top-4 left-4 z-10 p-2 bg-white rounded-lg shadow-md border border-gray-200"
                onClick={() => setOpen(true)}
            >
                <Menu className="h-5 w-5 text-gray-600" />
            </button>
        </>
    );
}
