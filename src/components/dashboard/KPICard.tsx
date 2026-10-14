import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    color?: "blue" | "green" | "amber" | "red" | "purple";
    trend?: "up" | "down" | "neutral";
}

const colorMap = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600" },
    green: { bg: "bg-green-50", icon: "text-green-600" },
    amber: { bg: "bg-amber-50", icon: "text-amber-600" },
    red: { bg: "bg-red-50", icon: "text-red-600" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600" },
};

export function KPICard({ title, value, subtitle, icon: Icon, color = "blue", trend }: KPICardProps) {
    const colors = colorMap[color];

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-2 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_6px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.04)] transition-shadow duration-200">
            {/* Header row */}
            <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-gray-500">{title}</span>
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", colors.bg)}>
                    <Icon className={cn("h-4 w-4", colors.icon)} />
                </div>
            </div>

            {/* Value */}
            <p className="text-4xl font-bold text-gray-900 tracking-tight leading-none" style={{ fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-heading)" }}>
                {typeof value === "number" ? value.toLocaleString() : value}
            </p>

            {/* Trend / Subtitle */}
            {subtitle && (
                <div className="flex items-center gap-1.5 text-xs mt-1">
                    {trend && trend !== "neutral" && (
                        <span className={cn(
                            "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold",
                            trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                        )}>
                            {trend === "up" ? "↑" : "↓"}
                        </span>
                    )}
                    <span className="text-gray-400">{subtitle}</span>
                </div>
            )}
        </div>
    );
}
