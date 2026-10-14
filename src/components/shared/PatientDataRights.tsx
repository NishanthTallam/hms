"use client";

import { useState } from "react";
import { Download, Trash2, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PatientDataRights() {
    const [downloading, setDownloading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteResult, setDeleteResult] = useState<string | null>(null);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const res = await fetch("/api/patient/export");
            if (!res.ok) throw new Error("Export failed");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = res.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") || "health-record.json";
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            alert("Failed to download records. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch("/api/patient/delete-data", { method: "DELETE" });
            const data = await res.json();
            if (res.ok) {
                setDeleteResult(data.message);
                setTimeout(() => { window.location.href = "/login"; }, 3000);
            } else {
                setDeleteResult(data.error || "Failed to delete data.");
            }
        } catch {
            setDeleteResult("An error occurred. Please contact the hospital.");
        } finally {
            setDeleting(false);
            setShowConfirm(false);
        }
    };

    return (
        <div className="mt-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-[#1A56DB]" />
                    </div>
                    <div>
                        <h3 className="text-[15px] font-semibold text-gray-800" style={{ fontFamily: "var(--font-heading)" }}>Your Data Rights</h3>
                        <p className="text-xs text-gray-400">DPDP Act 2023 Compliant</p>
                    </div>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                    Under the Digital Personal Data Protection Act, you have the right to access your health data and request its deletion.
                </p>

                {deleteResult && (
                    <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
                        {deleteResult}
                    </div>
                )}

                <div className="flex flex-wrap gap-3">
                    <Button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="bg-[#1A56DB] hover:bg-[#1E40AF] text-white gap-2"
                    >
                        {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        Download My Records
                    </Button>

                    {!showConfirm ? (
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirm(true)}
                            className="border-red-200 text-red-600 hover:bg-red-50 gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Request Data Deletion
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2 p-3 rounded-lg border border-red-200 bg-red-50">
                            <p className="text-sm text-red-700">This will permanently delete all your data. Are you sure?</p>
                            <Button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs"
                                size="sm"
                            >
                                {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Yes, Delete"}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowConfirm(false)}
                                className="text-xs"
                            >
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
