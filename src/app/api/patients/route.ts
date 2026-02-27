import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { hashPassword } from "better-auth/crypto";
export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;

    const { hospitalId } = guard;

    const patients = await prisma.patient.findMany({
        where: { hospitalId },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(patients);
}

export async function POST(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff"]);
    if (guard instanceof NextResponse) return guard;

    const { hospitalId } = guard;
    const body = await req.json();

    if (!body.name || !body.phone || !body.email || !body.password) {
        return NextResponse.json({ error: "Name, phone, email, and password are required" }, { status: 400 });
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: body.email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
        }

        const passwordHash = await hashPassword(body.password);

        const patient = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name: body.name,
                    email: body.email,
                    role: "patient",
                    passwordHash,
                    hospitalId,
                    emailVerified: true,
                }
            });

            await tx.account.create({
                data: {
                    id: crypto.randomUUID(),
                    accountId: user.id,
                    providerId: "credential",
                    userId: user.id,
                    password: passwordHash,
                },
            });

            return await tx.patient.create({
                data: {
                    hospitalId,
                    name: body.name,
                    phone: body.phone,
                    dob: body.dob ? new Date(body.dob) : undefined,
                    gender: body.gender || undefined,
                    email: body.email,
                    address: body.address || undefined,
                    bloodGroup: body.bloodGroup || undefined,
                    emergencyContactName: body.emergencyContactName || undefined,
                    emergencyContactPhone: body.emergencyContactPhone || undefined,
                },
            });
        });

        return NextResponse.json(patient, { status: 201 });
    } catch (error: any) {
        console.error("Patient creation error:", error);
        return NextResponse.json({ error: "Failed to create patient account" }, { status: 500 });
    }
}
