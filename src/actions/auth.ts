"use server";

import { prisma } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";
import {signUpSchema} from "@/src/schemas/auth"

export async function registerUser(formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = signUpSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingUser) {
    return { error: "Email sudah terdaftar!" };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

  // Buat user sekaligus dompet default (misal "Kas Tunai")
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
      wallets: {
        create: {
          name: "Kas Tunai",
          initialBalance: 0,
          currentBalance: 0,
        },
      },
    },
  });

  return { success: true };
}

