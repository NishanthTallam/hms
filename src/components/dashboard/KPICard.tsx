import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    color?: "orange" | "green" | "amber" | "red" | "blue";
    trend?: "up" | "down" | "neutral";
}

const colorMap = {
    orange: { bg: "bg-orange-50", icon: "text-orange-500", border: "border-orange-100" },
    green: { bg: "bg-green-50", icon: "text-green-500", border: "border-green-100" },
    amber: { bg: "bg-amber-50", icon: "text-amber-500", border: "border-amber-100" },
    red: { bg: "bg-red-50", icon: "text-red-500", border: "border-red-100" },
    blue: { bg: "bg-blue-50", icon: "text-blue-500", border: "border-blue-100" },
};

export function KPICard({ title, value, subtitle, icon: Icon, color = "orange", trend }: KPICardProps) {
    const colors = colorMap[color];

    return (
        <div className={cn("rounded-xl border bg-white p-5 shadow-sm", colors.border)}>
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", colors.bg)}>
                    <Icon className={cn("h-5 w-5", colors.icon)} />
                </div>
            </div>
            <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {subtitle && (
                    <p className={cn(
                        "text-xs mt-1",
                        trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-500"
                    )}>
                        {trend === "up" && "↑ "}
                        {trend === "down" && "↓ "}
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}
