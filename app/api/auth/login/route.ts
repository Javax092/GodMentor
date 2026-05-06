import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api";
import { comparePassword, createToken, setAuthCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) {
      throw new Error("Credenciais inválidas.");
    }

    const validPassword = await comparePassword(body.password, user.passwordHash);
    if (!validPassword) {
      throw new Error("Credenciais inválidas.");
    }

    const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
    setAuthCookie(response, createToken({ userId: user.id, name: user.name, email: user.email }));
    return response;
  } catch (error) {
    return apiError(error);
  }
}
