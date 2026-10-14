import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: ReactNode;
    backHref?: string;
}

export function PageHeader({ title, description, action, backHref }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 md:px-6 py-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
                {backHref && (
                    <Link href={backHref}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                )}
                <div>
                    <h1 className="text-[22px] font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>{title}</h1>
                    {description && <p className="text-sm text-gray-400 mt-0.5">{description}</p>}
                </div>
            </div>
            {action && <div className="w-full sm:w-auto">{action}</div>}
        </div>
    );
}
