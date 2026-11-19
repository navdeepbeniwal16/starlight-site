import { afterAll, beforeEach } from "vitest";
import { prisma } from "@/lib/db";

// Isolation between tests: each case starts from an empty table so rows never leak.
beforeEach(async () => {
  await prisma.signup.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
