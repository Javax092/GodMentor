import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api";
import { createToken, hashPassword, setAuthCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = registerSchema.parse(await request.json());
    const existingUser = await prisma.user.findUnique({ where: { email: body.email } });
    if (existingUser) {
      throw new Error("Já existe uma conta com este email.");
    }

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash: await hashPassword(body.password)
      }
    });

    const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
    setAuthCookie(response, createToken({ userId: user.id, name: user.name, email: user.email }));
    return response;
  } catch (error) {
    return apiError(error);
  }
}
