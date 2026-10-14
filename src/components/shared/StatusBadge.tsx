import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
    // Appointments
    scheduled: "bg-amber-100 text-amber-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-600",

    // Billing
    paid: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    partial: "bg-blue-100 text-blue-700",
    overdue: "bg-red-100 text-red-600",

    // Pharmacy stock
    in_stock: "bg-green-100 text-green-700",
    low_stock: "bg-amber-100 text-amber-700",
    critical: "bg-red-100 text-red-600",
    expiring_soon: "bg-blue-100 text-blue-700",
    expired: "bg-red-900 text-red-100",

    // Type
    OP: "bg-blue-100 text-blue-700",
    IP: "bg-purple-100 text-purple-700",

    // Status
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-500",

    // Emergency triage
    critical_triage: "bg-red-500 text-white",
    urgent: "bg-orange-400 text-white",
    semi_urgent: "bg-amber-100 text-amber-800",
    non_urgent: "bg-green-100 text-green-700",

    // Blood bank
    blood_ok: "bg-green-100 text-green-700",
    blood_low: "bg-amber-100 text-amber-700",
    blood_critical: "bg-red-100 text-red-600",
};

interface StatusBadgeProps {
    status: string;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const style = statusStyles[status] || "bg-gray-100 text-gray-500";
    return (
        <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize whitespace-nowrap",
            style,
            className
        )}>
            {status.replace(/_/g, " ")}
        </span>
    );
}
