import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { hashPassword } from "better-auth/crypto";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "super_admin"]);
    if (guard instanceof NextResponse) return guard;

    const { hospitalId } = guard;

    const staff = await prisma.user.findMany({
        where: { hospitalId, role: { in: ["staff", "admin", "doctor"] } },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            staffRole: true,
            createdAt: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(staff);
}

export async function POST(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "super_admin"]);
    if (guard instanceof NextResponse) return guard;

    const { hospitalId } = guard;
    const body = await req.json();

    if (!body.name || !body.email || !body.password || !body.role) {
        return NextResponse.json({ error: "Name, email, role, and password are required" }, { status: 400 });
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: body.email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
        }

        const passwordHash = await hashPassword(body.password);

        let finalStaffRole = null;
        if (body.role === "staff") {
            finalStaffRole = body.staffRole || "receptionist";
        }

        const newUser = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name: body.name,
                    email: body.email,
                    role: body.role, // admin, doctor, staff
                    staffRole: finalStaffRole,
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

            // If creating a doctor, also create the Doctor record
            if (body.role === "doctor") {
                await tx.doctor.create({
                    data: {
                        hospitalId,
                        userId: user.id,
                        name: `Dr. ${body.name}`,
                        specialization: body.specialization || "General",
                    }
                });
            }

            return user;
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error: any) {
        console.error("Staff creation error:", error);
        return NextResponse.json({ error: "Failed to create staff account" }, { status: 500 });
    }
}
