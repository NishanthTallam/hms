export type Role = "super_admin" | "admin" | "doctor" | "staff";

export const PERMISSIONS = {
    super_admin: ["manage:hospitals", "view:system"],
    admin: [
        "manage:users", "manage:patients", "manage:doctors",
        "manage:appointments", "manage:records", "manage:billing",
        "manage:pharmacy", "view:reports"
    ],
    doctor: [
        "view:own_appointments", "manage:records",
        "view:patients", "view:own_patients"
    ],
    staff: [
        "manage:patients", "manage:appointments",
        "manage:billing", "manage:pharmacy",
        "view:patients", "view:doctors"
    ],
} as const;

export interface InvoiceItem {
    name: string;
    qty: number;
    unitPrice: number;
    total: number;
}
