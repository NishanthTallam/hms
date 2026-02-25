import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageHeaderProps {
    title: string;
    action?: ReactNode;
    backHref?: string;
}

export function PageHeader({ title, action, backHref }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 md:px-6 py-4 border-b bg-white">
            <div className="flex items-center gap-3">
                {backHref && (
                    <Link href={backHref}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            ←
                        </Button>
                    </Link>
                )}
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            </div>
            {action && <div className="w-full sm:w-auto">{action}</div>}
        </div>
    );
}
