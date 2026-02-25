import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";
import { hashPassword } from "better-auth/crypto";
import crypto from "crypto";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["super_admin"]);
    if (guard instanceof NextResponse) return guard;

    const hospitals = await prisma.hospital.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: { select: { patients: true, doctors: true, users: true } },
        },
    });

    return NextResponse.json(hospitals);
}

export async function POST(req: NextRequest) {
    const guard = await apiGuard(req, ["super_admin"]);
    if (guard instanceof NextResponse) return guard;

    const body = await req.json();

    const {
        hospital_name, hospital_slug, hospital_email,
        hospital_phone, hospital_address,
        admin_name, admin_email, admin_password
    } = body;

    if (!hospital_name || !hospital_slug || !admin_name || !admin_email || !admin_password) {
        return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 }
        );
    }

    const existingSlug = await prisma.hospital.findUnique({ where: { slug: hospital_slug } });
    if (existingSlug) {
        return NextResponse.json({ error: "Hospital slug already exists" }, { status: 409 });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email: admin_email } });
    if (existingEmail) {
        return NextResponse.json({ error: "Admin email already in use" }, { status: 409 });
    }

    const passwordHash = await hashPassword(admin_password);

    const result = await prisma.$transaction(async (tx) => {
        const hospital = await tx.hospital.create({
            data: {
                name: hospital_name,
                slug: hospital_slug,
                email: hospital_email,
                phone: hospital_phone,
                address: hospital_address,
            },
        });

        const admin = await tx.user.create({
            data: {
                hospitalId: hospital.id,
                name: admin_name,
                email: admin_email,
                passwordHash,
                role: "admin",
                emailVerified: true,
            },
        });

        await tx.account.create({
            data: {
                id: crypto.randomUUID(),
                accountId: admin.id,
                providerId: "credential",
                userId: admin.id,
                password: passwordHash,
            },
        });

        return { hospital, admin };
    });

    return NextResponse.json(result, { status: 201 });
}


