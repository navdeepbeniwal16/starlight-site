import { afterAll, beforeEach } from "vitest";
import { prisma } from "@/lib/db";

beforeEach(async () => {
  await prisma.signup.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
