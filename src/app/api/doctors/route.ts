import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { hashPassword } from "better-auth/crypto";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";

    const doctors = await prisma.doctor.findMany({
        where: {
            hospitalId,
            ...(search ? {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { specialization: { contains: search, mode: "insensitive" } },
                ],
            } : {}),
        },
        orderBy: { name: "asc" },
    });

    return NextResponse.json(doctors);
}

export async function POST(req: NextRequest) {
    const guard = await apiGuard(req, ["admin"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const body = await req.json();

    if (!body.name || !body.specialization || !body.email || !body.password) {
        return NextResponse.json({ error: "Name, specialization, email and password are required" }, { status: 400 });
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: body.email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
        }

        const passwordHash = await hashPassword(body.password);

        const doctor = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name: body.name,
                    email: body.email,
                    role: "doctor",
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

            return await tx.doctor.create({
                data: {
                    hospitalId,
                    name: body.name,
                    specialization: body.specialization,
                    phone: body.phone || undefined,
                    email: body.email,
                    availableDays: body.availableDays || [],
                    consultationFee: body.consultationFee || undefined,
                },
            });
        });

        return NextResponse.json(doctor, { status: 201 });
    } catch (error: any) {
        console.error("Doctor creation error:", error);
        return NextResponse.json({ error: "Failed to create doctor account" }, { status: 500 });
    }
}
