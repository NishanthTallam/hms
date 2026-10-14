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
    AlertCircle,
    Bed,
    Droplets,
    Wind,
    FileText,
    FlaskConical,
} from "lucide-react";

const navItems = [
    { label: "Dashboard", href: "/hospital/dashboard", icon: LayoutDashboard },
    { label: "Emergency", href: "/hospital/emergency", icon: AlertCircle },
    { label: "Patients", href: "/hospital/patients", icon: Users },
    { label: "Beds", href: "/hospital/beds", icon: Bed },
    { label: "Doctors", href: "/hospital/doctors", icon: Stethoscope },
    { label: "Appointments", href: "/hospital/appointments", icon: CalendarDays },
    { label: "Medical Records", href: "/hospital/records", icon: ClipboardList },
    { label: "Prescriptions", href: "/hospital/prescriptions", icon: FileText },
    { label: "Blood Bank", href: "/hospital/blood-bank", icon: Droplets },
    { label: "Oxygen", href: "/hospital/oxygen", icon: Wind },
    { label: "Billing", href: "/hospital/billing", icon: Receipt },
    { label: "Pharmacy", href: "/hospital/pharmacy", icon: FlaskConical },
    { label: "Staff", href: "/hospital/staff", icon: Users },
];

interface SidebarProps {
    hospitalName?: string;
    userName?: string;
    userRole?: string;
    staffRole?: string;
    lowStockCount?: number;
    open?: boolean;
    onClose?: () => void;
}

export function Sidebar({ hospitalName = "Hospital", userName = "User", userRole = "staff", staffRole, lowStockCount = 0, open = false, onClose }: SidebarProps) {
    const pathname = usePathname();

    const filteredNavItems = navItems.filter(item => {
        if (userRole === "admin") return true;

        if (userRole === "doctor") {
            const allowedForDoctors = [
                "/hospital/dashboard",
                "/hospital/emergency",
                "/hospital/patients",
                "/hospital/records",
                "/hospital/prescriptions",
                "/hospital/appointments"
            ];
            return allowedForDoctors.includes(item.href);
        }

        if (userRole === "staff") {
            let allowedForStaff: string[] = ["/hospital/dashboard"];

            if (staffRole === "receptionist") {
                allowedForStaff.push("/hospital/patients", "/hospital/appointments", "/hospital/billing");
            } else if (staffRole === "nurse") {
                allowedForStaff.push("/hospital/emergency", "/hospital/patients", "/hospital/records", "/hospital/prescriptions", "/hospital/beds");
            } else if (staffRole === "pharmacist") {
                allowedForStaff.push("/hospital/pharmacy", "/hospital/prescriptions");
            } else if (staffRole === "lab_technician") {
                allowedForStaff.push("/hospital/records");
            } else if (staffRole === "ward_boy") {
                allowedForStaff.push("/hospital/beds");
            } else if (staffRole === "accountant") {
                allowedForStaff.push("/hospital/billing");
            }

            return allowedForStaff.includes(item.href);
        }

        return false;
    });

    const userInitials = userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

    const sidebarContent = (
        <>
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-[#1E293B]">
                <div className="h-8 w-8 rounded-lg bg-[#1A56DB] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">H</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate tracking-tight">{hospitalName}</p>
                    <p className="text-[11px] text-[#64748B]">Management System</p>
                </div>
                <button className="lg:hidden p-1 text-[#64748B] hover:text-white" onClick={onClose}>
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
                <p className="text-[10px] font-semibold text-[#475569] uppercase tracking-[0.1em] px-3 py-2">Main Menu</p>
                {filteredNavItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/hospital/dashboard" && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative",
                                isActive
                                    ? "bg-[#1A56DB] text-white shadow-sm"
                                    : "text-[#94A3B8] hover:bg-[#1E293B] hover:text-white"
                            )}
                        >
                            <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-white" : "text-[#64748B]")} />
                            <span>{item.label}</span>
                            {item.label === "Emergency" && (
                                <span className="ml-auto h-5 min-w-[20px] rounded-full bg-red-500 text-white text-[11px] font-semibold flex items-center justify-center px-1.5">
                                    !
                                </span>
                            )}
                            {item.label === "Pharmacy" && lowStockCount > 0 && (
                                <span className="ml-auto h-5 min-w-[20px] rounded-full bg-[#1A56DB] text-white text-[11px] font-semibold flex items-center justify-center px-1.5">
                                    {lowStockCount > 9 ? "9+" : lowStockCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User profile */}
            <div className="border-t border-[#1E293B] px-3 py-3">
                <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#1E293B] transition-colors cursor-pointer">
                    <div className="h-8 w-8 rounded-full bg-[#1A56DB] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-semibold">{userInitials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#F1F5F9] truncate">{userName}</p>
                        <p className="text-[11px] text-[#64748B] capitalize">{staffRole || userRole}</p>
                    </div>
                    <form action="/api/auth/sign-out" method="POST">
                        <button type="submit" className="p-1.5 rounded-md text-[#64748B] hover:text-white hover:bg-[#334155] transition-colors" title="Sign out">
                            <LogOut className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-[240px] bg-[#0F172A] flex flex-col",
                "transform transition-transform duration-200 ease-in-out",
                open ? "translate-x-0" : "-translate-x-full",
                "lg:translate-x-0 lg:static lg:z-auto"
            )}>
                {sidebarContent}
            </aside>
        </>
    );
}
