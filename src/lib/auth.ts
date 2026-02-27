import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
    },

    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5,
        },
    },

    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: "staff",
                input: false,
            },
            hospitalId: {
                type: "string",
                required: false,
                input: false,
            },
            staffRole: {
                type: "string",
                required: false,
                input: false,
            },
            patientId: {
                type: "string",
                required: false,
                input: false,
            },
        },
    },
});

export type Session = typeof auth.$Infer.Session;
