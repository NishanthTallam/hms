import { Loader2 } from "lucide-react";

export function LoadingSpinner({ className }: { className?: string }) {
    return (
        <div className="flex justify-center py-16">
            <Loader2 className={`h-8 w-8 animate-spin text-[#1A56DB] ${className || ""}`} />
        </div>
    );
}
