import { format } from "date-fns";

export interface PrescriptionItem {
    medicineId?: string;
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    quantity: number;
}

interface PrintablePrescriptionProps {
    hospital: {
        name: string;
        address: string | null;
        phone: string | null;
    };
    doctor: {
        name: string;
        specialization: string;
    };
    patient: {
        name: string;
    };
    prescription: {
        issuedAt: Date | string;
        notes?: string | null;
    };
    items: PrescriptionItem[];
}

export function PrintablePrescription({
    hospital,
    doctor,
    patient,
    prescription,
    items,
}: PrintablePrescriptionProps) {
    return (
        <div className="max-w-lg mx-auto bg-white p-8 print:shadow-none text-black selection:bg-orange-100">
            {/* Hospital letterhead */}
            <div className="flex justify-between border-b-2 border-gray-800 pb-3 mb-4">
                <div>
                    <h1 className="text-xl font-bold text-orange-500">{hospital.name}</h1>
                    {hospital.address && <p className="text-xs text-gray-500">{hospital.address}</p>}
                    {hospital.phone && <p className="text-xs text-gray-500">{hospital.phone}</p>}
                </div>
                <div className="text-right">
                    <p className="font-bold text-gray-900">Dr. {doctor.name}</p>
                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                </div>
            </div>

            {/* Patient info */}
            <div className="flex justify-between text-sm mb-4">
                <div>
                    <span className="text-gray-500">Patient: </span>
                    <strong>{patient.name}</strong>
                </div>
                <div>
                    <span className="text-gray-500">Date: </span>
                    {format(new Date(prescription.issuedAt), "dd MMM yyyy")}
                </div>
            </div>

            {/* Rx symbol + medicine list */}
            <p className="text-3xl font-serif text-gray-800 mb-3">℞</p>
            <ol className="space-y-3">
                {items.map((item, i) => (
                    <li key={i} className="border-b border-dashed pb-2">
                        <p className="font-semibold text-gray-900">
                            {i + 1}. {item.medicineName} {item.dosage}
                        </p>
                        <p className="text-sm text-gray-600">
                            {item.frequency} &times; {item.duration} &nbsp;&middot;&nbsp; Qty: {item.quantity}
                        </p>
                        {item.instructions && (
                            <p className="text-xs text-gray-500">{item.instructions}</p>
                        )}
                    </li>
                ))}
            </ol>

            {/* Notes + signature */}
            {prescription.notes && (
                <p className="mt-4 text-sm italic text-gray-600">{prescription.notes}</p>
            )}
            <div className="mt-10 flex justify-end">
                <div className="text-center border-t border-gray-400 pt-2 w-40">
                    <p className="text-xs text-gray-500">Doctor&apos;s Signature</p>
                </div>
            </div>
        </div>
    );
}
