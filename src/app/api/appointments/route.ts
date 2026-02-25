import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { session, hospitalId } = guard;

    const where: any = { hospitalId };
    const user = session.user as any;

    // Doctor only sees their own appointments
    if (user.role === "doctor") {
        const doctor = await prisma.doctor.findFirst({ where: { userId: user.id, hospitalId } });
        if (doctor) where.doctorId = doctor.id;
    }

    // Filter by date if provided
    const url = new URL(req.url);
    const dateParam = url.searchParams.get("date");
    if (dateParam === "today") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        where.appointmentDate = { gte: today, lt: tomorrow };
    }

    const statusParam = url.searchParams.get("status");
    if (statusParam && statusParam !== "all") {
        where.status = statusParam;
    }

    const appointments = await prisma.appointment.findMany({
        where,
        include: {
            patient: { select: { id: true, name: true, phone: true } },
            doctor: { select: { id: true, name: true, specialization: true } },
        },
        orderBy: { appointmentDate: "desc" },
    });

    return NextResponse.json(appointments);
}

export async function POST(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff"]);
    if (guard instanceof NextResponse) return guard;
    const { session, hospitalId } = guard;
    const body = await req.json();

    if (!body.patientId || !body.doctorId || !body.appointmentDate) {
        return NextResponse.json({ error: "Patient, doctor, and date are required" }, { status: 400 });
    }

    const appointment = await prisma.appointment.create({
        data: {
            hospitalId,
            patientId: body.patientId,
            doctorId: body.doctorId,
            appointmentDate: new Date(body.appointmentDate),
            type: body.type || "OP",
            notes: body.notes || undefined,
            createdById: session.user.id,
        },
        include: {
            patient: { select: { name: true } },
            doctor: { select: { name: true } },
        },
    });

    return NextResponse.json(appointment, { status: 201 });
}
