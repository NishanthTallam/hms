"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Plus, Bell, Settings, Menu, LogOut, User, X, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NavbarProps {
    userName?: string;
    userRole?: string;
    hospitalName?: string;
    onMenuClick?: () => void;
}

interface SearchResult {
    id: string;
    label: string;
    sub: string;
    href: string;
    type: "patient" | "doctor" | "appointment";
}

export function Navbar({ userName = "User", userRole = "admin", hospitalName = "Hospital", onMenuClick }: NavbarProps) {
    const router = useRouter();
    const userInitials = userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Notifications state
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [notifLoading, setNotifLoading] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    // Profile dropdown state
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Debounced search
    const searchTimer = useRef<NodeJS.Timeout | null>(null);
    const handleSearch = useCallback((q: string) => {
        setSearchQuery(q);
        if (q.length < 2) { setSearchResults([]); setSearchOpen(false); return; }

        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(async () => {
            setSearchLoading(true);
            setSearchOpen(true);
            try {
                const results: SearchResult[] = [];
                // Search patients
                const pRes = await fetch(`/api/patients?search=${encodeURIComponent(q)}`);
                if (pRes.ok) {
                    const patients = await pRes.json();
                    (Array.isArray(patients) ? patients : []).slice(0, 4).forEach((p: any) =>
                        results.push({ id: p.id, label: p.name, sub: p.phone || p.email || "", href: `/hospital/patients/${p.id}`, type: "patient" })
                    );
                }
                // Search doctors
                const dRes = await fetch(`/api/doctors?search=${encodeURIComponent(q)}`);
                if (dRes.ok) {
                    const doctors = await dRes.json();
                    (Array.isArray(doctors) ? doctors : []).slice(0, 3).forEach((d: any) =>
                        results.push({ id: d.id, label: `Dr. ${d.name}`, sub: d.specialization || "", href: `/hospital/doctors`, type: "doctor" })
                    );
                }
                setSearchResults(results);
            } catch {
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 350);
    }, []);

    // Load notifications
    const loadNotifications = async () => {
        setNotifLoading(true);
        try {
            const items: any[] = [];
            // Fetch today's stats for notification-like items
            const res = await fetch("/api/dashboard/stats?role=admin");
            if (res.ok) {
                const d = await res.json();
                if (d.appointments_today > 0) items.push({ id: "appt", text: `${d.appointments_today} appointment(s) today`, time: "Today", type: "info" });
                if (d.pending_bills > 0) items.push({ id: "bill", text: `${d.pending_bills} pending invoice(s)`, time: "Billing", type: "warning" });
                if (d.low_stock_count > 0) items.push({ id: "stock", text: `${d.low_stock_count} medicine(s) low on stock`, time: "Pharmacy", type: "alert" });
                if (d.expiring_soon_count > 0) items.push({ id: "expiry", text: `${d.expiring_soon_count} medicine(s) expiring soon`, time: "Pharmacy", type: "alert" });
            }
            // Fetch emergency stats
            const eRes = await fetch("/api/emergency?active=true");
            if (eRes.ok) {
                const cases = await eRes.json();
                const critical = Array.isArray(cases) ? cases.filter((c: any) => c.triageLevel === "critical").length : 0;
                if (critical > 0) items.push({ id: "emg", text: `${critical} critical emergency case(s)`, time: "Now", type: "alert" });
            }
            if (items.length === 0) items.push({ id: "none", text: "All clear — no alerts right now", time: "", type: "info" });
            setNotifications(items);
        } catch {
            setNotifications([{ id: "err", text: "Unable to load notifications", time: "", type: "info" }]);
        } finally {
            setNotifLoading(false);
        }
    };

    const handleNotifToggle = () => {
        if (!notifOpen) loadNotifications();
        setNotifOpen(!notifOpen);
        setProfileOpen(false);
        setSearchOpen(false);
    };

    const handleProfileToggle = () => {
        setProfileOpen(!profileOpen);
        setNotifOpen(false);
        setSearchOpen(false);
    };

    const handleSignOut = async () => {
        await fetch("/api/auth/sign-out", { method: "POST" });
        router.push("/login");
    };

    const notifColors: Record<string, string> = {
        alert: "bg-red-50 text-red-600",
        warning: "bg-amber-50 text-amber-600",
        info: "bg-blue-50 text-blue-600",
    };

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 md:px-6 gap-3 sticky top-0 z-30">
            {/* Mobile menu button */}
            <button
                className="lg:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                onClick={onMenuClick}
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Search */}
            <div className="hidden sm:block relative flex-1 max-w-md" ref={searchRef}>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    <Search className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search patients, doctors..."
                        className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400 w-full"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => { if (searchResults.length > 0) setSearchOpen(true); }}
                    />
                    {searchQuery && (
                        <button onClick={() => { setSearchQuery(""); setSearchResults([]); setSearchOpen(false); }} className="text-gray-400 hover:text-gray-600">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
                {/* Search dropdown */}
                {searchOpen && (
                    <div className="absolute top-full mt-1.5 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                        {searchLoading ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-5 w-5 animate-spin text-[#1A56DB]" />
                            </div>
                        ) : searchResults.length === 0 ? (
                            <div className="py-6 text-center text-sm text-gray-400">No results for &ldquo;{searchQuery}&rdquo;</div>
                        ) : (
                            <div className="max-h-72 overflow-y-auto">
                                {searchResults.map((r) => (
                                    <Link
                                        key={`${r.type}-${r.id}`}
                                        href={r.href}
                                        onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                    >
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${r.type === "patient" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}`}>
                                            {r.label[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{r.label}</p>
                                            <p className="text-xs text-gray-400 truncate">{r.sub}</p>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="ml-auto flex items-center gap-2">
                <Link href="/hospital/appointments/new">
                    <button className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A56DB] hover:bg-[#1E40AF] text-white text-xs font-medium transition-colors shadow-sm">
                        <Plus className="w-3.5 h-3.5" /> Appointment
                    </button>
                </Link>
                <Link href="/hospital/patients/new">
                    <button className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Patient
                    </button>
                </Link>
                <Link href="/hospital/billing/new">
                    <button className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Invoice
                    </button>
                </Link>
                <Link href="/hospital/prescriptions/new">
                    <button className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Prescription
                    </button>
                </Link>

                {/* Divider */}
                <div className="hidden md:block w-px h-6 bg-gray-200 mx-1" />

                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                    <button
                        className="w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors relative"
                        onClick={handleNotifToggle}
                    >
                        <Bell className="w-4 h-4" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                    </button>
                    {notifOpen && (
                        <div className="absolute top-full mt-2 right-0 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-800" style={{ fontFamily: "var(--font-heading)" }}>Notifications</h3>
                                <span className="text-[11px] text-gray-400">{hospitalName}</span>
                            </div>
                            {notifLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-5 w-5 animate-spin text-[#1A56DB]" />
                                </div>
                            ) : (
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.map((n) => (
                                        <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                                            <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${n.type === "alert" ? "bg-red-500" : n.type === "warning" ? "bg-amber-500" : "bg-blue-500"}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-700">{n.text}</p>
                                                {n.time && <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Settings */}
                <Link href="/hospital/dashboard">
                    <button className="hidden sm:flex w-9 h-9 rounded-lg border border-gray-200 bg-white items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
                        <Settings className="w-4 h-4" />
                    </button>
                </Link>

                {/* Profile Avatar with dropdown */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={handleProfileToggle}
                        className="w-8 h-8 rounded-full bg-[#1A56DB] flex items-center justify-center text-white text-xs font-semibold ml-1 cursor-pointer hover:bg-[#1E40AF] transition-colors"
                    >
                        {userInitials}
                    </button>
                    {profileOpen && (
                        <div className="absolute top-full mt-2 right-0 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-semibold text-gray-800">{userName}</p>
                                <p className="text-xs text-gray-400 capitalize">{userRole}</p>
                            </div>
                            <div className="py-1">
                                <Link href="/hospital/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors" onClick={() => setProfileOpen(false)}>
                                    <User className="w-4 h-4 text-gray-400" /> My Dashboard
                                </Link>
                                <Link href="/hospital/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors" onClick={() => setProfileOpen(false)}>
                                    <Settings className="w-4 h-4 text-gray-400" /> Settings
                                </Link>
                            </div>
                            <div className="border-t border-gray-100 py-1">
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                                >
                                    <LogOut className="w-4 h-4" /> Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
