import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { PrintablePrescription, PrescriptionItem } from "@/components/prescriptions/PrintablePrescription";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function PrescriptionDetailPage({ params }: Props) {
    const session = await requireRole(["admin", "doctor", "staff"]);
    const hospitalId = (session.user as any).hospitalId;
    const { id } = await params;

    const prescription = await prisma.prescription.findFirst({
        where: { id, hospitalId },
        include: {
            patient: { select: { name: true } },
            doctor: { select: { name: true, specialization: true } },
            hospital: { select: { name: true, address: true, phone: true } },
        },
    });

    if (!prescription) return notFound();

    const items = prescription.items as unknown as PrescriptionItem[];

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <PageHeader
                title="Prescription Details"
                action={
                    <Link href="/hospital/prescriptions" className="inline-flex items-center px-4 py-2 border rounded text-sm font-medium hover:bg-gray-50">
                        ← Back to List
                    </Link>
                }
            />

            {/* Summary card */}
            <div className="bg-white rounded border shadow-sm p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">Patient</span>
                        <p className="font-medium">{prescription.patient.name}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Doctor</span>
                        <p className="font-medium">
                            {prescription.doctor ? `Dr. ${prescription.doctor.name}` : "-"}
                        </p>
                    </div>
                    <div>
                        <span className="text-gray-500">Issued On</span>
                        <p className="font-medium">{format(new Date(prescription.issuedAt), "PPP")}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Valid Until</span>
                        <p className="font-medium">
                            {prescription.validUntil
                                ? format(new Date(prescription.validUntil), "PPP")
                                : "—"}
                        </p>
                    </div>
                    <div>
                        <span className="text-gray-500">Status</span>
                        <p>
                            <Badge
                                variant={
                                    prescription.status === "active"
                                        ? "default"
                                        : prescription.status === "dispensed"
                                            ? "secondary"
                                            : "outline"
                                }
                            >
                                {prescription.status}
                            </Badge>
                        </p>
                    </div>
                </div>

                {prescription.notes && (
                    <div className="text-sm">
                        <span className="text-gray-500">Notes</span>
                        <p className="mt-1 italic text-gray-700">{prescription.notes}</p>
                    </div>
                )}
            </div>

            {/* Medicines table */}
            <div className="bg-white rounded border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-gray-50 text-left text-gray-500">
                            <th className="p-4 font-medium">#</th>
                            <th className="p-4 font-medium">Medicine</th>
                            <th className="p-4 font-medium">Dosage</th>
                            <th className="p-4 font-medium">Frequency</th>
                            <th className="p-4 font-medium">Duration</th>
                            <th className="p-4 font-medium">Qty</th>
                            <th className="p-4 font-medium">Instructions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, i) => (
                            <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="p-4 text-gray-500">{i + 1}</td>
                                <td className="p-4 font-medium">{item.medicineName}</td>
                                <td className="p-4">{item.dosage}</td>
                                <td className="p-4">{item.frequency}</td>
                                <td className="p-4">{item.duration}</td>
                                <td className="p-4">{item.quantity}</td>
                                <td className="p-4 text-gray-600">{item.instructions || "—"}</td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-500">
                                    No medicines listed.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Printable version */}
            {prescription.doctor && (
                <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-2">Print Preview</h2>
                    <div className="border rounded shadow-sm print:border-none print:shadow-none">
                        <PrintablePrescription
                            hospital={prescription.hospital}
                            doctor={{
                                name: prescription.doctor.name,
                                specialization: prescription.doctor.specialization,
                            }}
                            patient={prescription.patient}
                            prescription={prescription}
                            items={items}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
