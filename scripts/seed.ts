// Seed script for HMS
// Run: npx ts-node scripts/seed.ts
// Or: npx tsx scripts/seed.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

import crypto from "crypto";
import { auth } from "../src/lib/auth";
import { hashPassword } from "better-auth/crypto";


async function createOrUpdateUser(email: string, name: string, role: any, password: string, hospitalId?: string) {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.upsert({
        where: { email },
        update: { name, role, passwordHash, hospitalId },
        create: { name, email, role, passwordHash, hospitalId, emailVerified: true },
    });

    const existingAccount = await prisma.account.findFirst({
        where: { userId: user.id, providerId: "credential" },
    });

    if (!existingAccount) {
        await prisma.account.create({
            data: {
                id: crypto.randomUUID(),
                accountId: user.id,
                providerId: "credential",
                userId: user.id,
                password: passwordHash,
            },
        });
    } else {
        await prisma.account.update({
            where: { id: existingAccount.id },
            data: { password: passwordHash },
        });
    }
    return user;
}

const SPECIALIZATIONS = ["Cardiology", "Orthopedics", "Neurology", "Pediatrics", "Dermatology"];

const INDIAN_NAMES = [
    "Arun Kumar", "Priya Sharma", "Rajesh Patel", "Sunita Verma", "Vikram Singh",
    "Meena Reddy", "Suresh Gupta", "Kavitha Nair", "Deepak Joshi", "Anjali Rao",
    "Ravi Shankar", "Lakshmi Iyer", "Ramesh Bhatt", "Pooja Mehta", "Sanjay Deshmukh",
];

const MEDICINES = [
    { name: "Paracetamol 500mg", generic: "Acetaminophen", cat: "Antipyretic" },
    { name: "Amoxicillin 250mg", generic: "Amoxicillin", cat: "Antibiotic" },
    { name: "Ibuprofen 400mg", generic: "Ibuprofen", cat: "Painkiller" },
    { name: "Omeprazole 20mg", generic: "Omeprazole", cat: "Antacid" },
    { name: "Cetirizine 10mg", generic: "Cetirizine", cat: "Antihistamine" },
    { name: "Metformin 500mg", generic: "Metformin", cat: "Antidiabetic" },
    { name: "Atorvastatin 10mg", generic: "Atorvastatin", cat: "Cardiovascular" },
    { name: "Azithromycin 500mg", generic: "Azithromycin", cat: "Antibiotic" },
    { name: "Pantoprazole 40mg", generic: "Pantoprazole", cat: "Antacid" },
    { name: "Amlodipine 5mg", generic: "Amlodipine", cat: "Cardiovascular" },
    { name: "Vitamin D3", generic: "Cholecalciferol", cat: "Vitamin" },
    { name: "Dolo 650", generic: "Paracetamol", cat: "Antipyretic" },
    { name: "Crocin Advance", generic: "Paracetamol", cat: "Antipyretic" },
    { name: "Betadine Solution", generic: "Povidone-Iodine", cat: "Antiseptic" },
    { name: "Metronidazole 400mg", generic: "Metronidazole", cat: "Antibiotic" },
];

async function seed() {
    console.log("🌱 Seeding database...\n");

    // 1. Create Super Admin
    const superAdmin = await createOrUpdateUser("superadmin@hms.com", "Super Admin", "super_admin", "SuperAdmin@2026");
    console.log("✅ Super Admin created:", superAdmin.email);

    // 2. Create Hospitals
    const hospitals = [
        { name: "Apollo Hospital", slug: "apollo", email: "info@apollo.com", phone: "9999999999", address: "Jubilee Hills, Hyderabad" },
        { name: "Fortis Hospital", slug: "fortis", email: "info@fortis.com", phone: "8888888888", address: "Bannerghatta Road, Bangalore" },
    ];

    for (const h of hospitals) {
        const hospital = await prisma.hospital.upsert({
            where: { slug: h.slug },
            update: {},
            create: h,
        });
        console.log(`\n🏥 Hospital: ${hospital.name}`);

        // 3. Create Hospital Admin
        const admin = await createOrUpdateUser(
            `admin@${h.slug}.com`,
            `${hospital.name} Admin`,
            "admin",
            `${h.slug.charAt(0).toUpperCase() + h.slug.slice(1)}@2026`,
            hospital.id
        );
        console.log(`   👤 Admin: ${admin.email}`);

        // 4. Create Doctors
        const doctors = [];
        for (let i = 0; i < SPECIALIZATIONS.length; i++) {
            const doctorName = `Dr. ${INDIAN_NAMES[i]}`;
            const doctor = await prisma.doctor.create({
                data: {
                    hospitalId: hospital.id,
                    name: doctorName,
                    specialization: SPECIALIZATIONS[i],
                    phone: `98765${String(i).padStart(5, "0")}`,
                    email: `${INDIAN_NAMES[i].toLowerCase().replace(" ", ".")}@${h.slug}.com`,
                    availableDays: ["Monday", "Wednesday", "Friday"].slice(0, 2 + (i % 3)),
                    consultationFee: 500 + (i * 100),
                },
            });
            doctors.push(doctor);

            // Create user account for first doctor
            if (i === 0) {
                await createOrUpdateUser(
                    doctor.email!,
                    doctorName,
                    "doctor",
                    "Doctor@2026",
                    hospital.id
                );
            }
        }
        console.log(`   🩺 ${doctors.length} doctors created`);

        // 5. Create Patients
        const patients = [];
        for (let i = 0; i < 15; i++) {
            const name = INDIAN_NAMES[i];
            const patient = await prisma.patient.create({
                data: {
                    hospitalId: hospital.id,
                    name,
                    phone: `77777${String(i + (h.slug === "apollo" ? 0 : 100)).padStart(5, "0")}`,
                    gender: i % 3 === 0 ? "male" : i % 3 === 1 ? "female" : "other",
                    bloodGroup: ["A_POS", "B_POS", "O_POS", "AB_POS", "A_NEG"][i % 5] as any,
                    dob: new Date(1980 + (i % 20), i % 12, (i % 28) + 1),
                    email: `${name.toLowerCase().replace(" ", ".")}@email.com`,
                    address: `${100 + i}, ${h.slug === "apollo" ? "Hyderabad" : "Bangalore"}`,
                },
            });
            patients.push(patient);
        }
        console.log(`   👥 ${patients.length} patients created`);

        // 6. Create Appointments
        const statuses = ["scheduled", "completed", "completed", "cancelled"] as const;
        for (let i = 0; i < 20; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (i * 2) + 5);
            await prisma.appointment.create({
                data: {
                    hospitalId: hospital.id,
                    patientId: patients[i % patients.length].id,
                    doctorId: doctors[i % doctors.length].id,
                    appointmentDate: date,
                    type: i % 5 === 0 ? "IP" : "OP",
                    status: statuses[i % statuses.length],
                    notes: `Appointment ${i + 1} notes`,
                },
            });
        }
        console.log("   📅 20 appointments created");

        // 7. Create Medical Records
        for (let i = 0; i < 10; i++) {
            await prisma.record.create({
                data: {
                    hospitalId: hospital.id,
                    patientId: patients[i % patients.length].id,
                    doctorId: doctors[i % doctors.length].id,
                    type: i % 4 === 0 ? "IP" : "OP",
                    diagnosis: ["Viral Fever", "Hypertension", "Fracture", "Diabetes Management", "Skin Allergy", "Migraine", "GERD", "Pneumonia", "Joint Pain", "Eye Infection"][i],
                    prescription: "Tab. Paracetamol 500mg 1-0-1 x 5 days\nTab. Omeprazole 20mg 1-0-0 x 7 days",
                    notes: "Patient advised rest and follow-up in 1 week",
                    admissionDate: i % 4 === 0 ? new Date() : undefined,
                    ward: i % 4 === 0 ? "General Ward" : undefined,
                    roomNumber: i % 4 === 0 ? `${100 + i}` : undefined,
                },
            });
        }
        console.log("   📋 10 medical records created");

        // 8. Create Invoices
        const invoiceStatuses = ["paid", "pending", "partial", "paid", "pending"] as const;
        for (let i = 0; i < 10; i++) {
            const items = [
                { name: "Consultation Fee", qty: 1, unitPrice: 500, total: 500 },
                { name: "Blood Test", qty: 1, unitPrice: 300, total: 300 },
            ];
            if (i % 3 === 0) items.push({ name: "X-Ray", qty: 1, unitPrice: 800, total: 800 });

            const subtotal = items.reduce((s, item) => s + item.total, 0);
            const discount = i % 4 === 0 ? 100 : 0;
            const totalAmount = subtotal - discount;
            const paidAmount = invoiceStatuses[i % 5] === "paid" ? totalAmount : invoiceStatuses[i % 5] === "partial" ? totalAmount / 2 : 0;

            await prisma.invoice.create({
                data: {
                    hospitalId: hospital.id,
                    patientId: patients[i % patients.length].id,
                    invoiceNumber: `INV-2026-${String(i + 1 + (h.slug === "apollo" ? 0 : 100)).padStart(4, "0")}`,
                    items,
                    subtotal,
                    discount,
                    totalAmount,
                    paidAmount,
                    status: invoiceStatuses[i % 5],
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
            });
        }
        console.log("   💰 10 invoices created");

        // 9. Create Medicines
        for (let i = 0; i < MEDICINES.length; i++) {
            const m = MEDICINES[i];
            const stockQty = i < 3 ? 5 : i < 5 ? 8 : 50 + (i * 10);
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + (i < 2 ? 15 : 365)); // 2 near expiry

            await prisma.medicine.create({
                data: {
                    hospitalId: hospital.id,
                    name: m.name,
                    genericName: m.generic,
                    category: m.cat,
                    unit: "strips",
                    stockQty,
                    minThreshold: 10,
                    expiryDate,
                    batchNumber: `BATCH-${h.slug.toUpperCase()}-${String(i + 1).padStart(3, "0")}`,
                    supplierName: `${["MedSupply", "PharmaCo", "HealthDist"][i % 3]} India`,
                    purchasePrice: 50 + (i * 10),
                    sellingPrice: 80 + (i * 15),
                },
            });
        }
        console.log(`   💊 ${MEDICINES.length} medicines created`);
    }

    console.log("\n✅ Seed complete!\n");
    console.log("Demo Accounts:");
    console.log("  Super Admin:  superadmin@hms.com / SuperAdmin@2026");
    console.log("  Apollo Admin: admin@apollo.com / Apollo@2026");
    console.log("  Apollo Doctor: arun.kumar@apollo.com / Doctor@2026");
    console.log("  Fortis Admin: admin@fortis.com / Fortis@2026");
}

seed()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
