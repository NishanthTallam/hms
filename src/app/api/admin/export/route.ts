import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;

    const url = new URL(req.url);
    const format = url.searchParams.get("format") || "json";
    const type = url.searchParams.get("type") || "all";

    const data: Record<string, any> = {};

    if (type === "patients" || type === "all") {
        data.patients = await prisma.patient.findMany({
            where: { hospitalId },
            select: {
                id: true, name: true, phone: true, email: true, gender: true,
                bloodGroup: true, dob: true, address: true, createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });
    }

    if (type === "appointments" || type === "all") {
        data.appointments = await prisma.appointment.findMany({
            where: { hospitalId },
            select: {
                id: true, appointmentDate: true, type: true, status: true, notes: true,
                patient: { select: { name: true } },
                doctor: { select: { name: true, specialization: true } },
                createdAt: true,
            },
            orderBy: { appointmentDate: "desc" },
        });
    }

    if (type === "billing" || type === "all") {
        data.invoices = await prisma.invoice.findMany({
            where: { hospitalId },
            select: {
                id: true, invoiceNumber: true, items: true, subtotal: true,
                discount: true, totalAmount: true, paidAmount: true,
                status: true, dueDate: true, notes: true,
                patient: { select: { name: true } },
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });
    }

    if (type === "records" || type === "all") {
        data.records = await prisma.record.findMany({
            where: { hospitalId },
            select: {
                id: true, type: true, diagnosis: true, notes: true,
                patient: { select: { name: true } },
                doctor: { select: { name: true } },
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });
    }

    const exportPayload = {
        exportedAt: new Date().toISOString(),
        hospitalId,
        type,
        ...data,
    };

    if (format === "csv") {
        // Flatten the first available data type to CSV
        const key = Object.keys(data)[0];
        const rows = data[key] || [];
        if (rows.length === 0) {
            return new NextResponse("No data to export", { status: 200, headers: { "Content-Type": "text/plain" } });
        }

        const flattenObj = (obj: any, prefix = ""): Record<string, string> => {
            const result: Record<string, string> = {};
            for (const [k, v] of Object.entries(obj)) {
                const key = prefix ? `${prefix}_${k}` : k;
                if (v && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
                    Object.assign(result, flattenObj(v, key));
                } else {
                    result[key] = String(v ?? "");
                }
            }
            return result;
        };

        const flatRows = rows.map((r: any) => flattenObj(r));
        const headers = Object.keys(flatRows[0]);
        const csvLines = [
            headers.join(","),
            ...flatRows.map((row: Record<string, string>) =>
                headers.map(h => `"${(row[h] || "").replace(/"/g, '""')}"`).join(",")
            ),
        ];

        return new NextResponse(csvLines.join("\n"), {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="hospital-export-${type}-${new Date().toISOString().split("T")[0]}.csv"`,
            },
        });
    }

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename="hospital-export-${type}-${new Date().toISOString().split("T")[0]}.json"`,
        },
    });
}
