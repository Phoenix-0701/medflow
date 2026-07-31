import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        doctorProfile: {
          select: { specialty: true, department: true }
        },
        patientProfile: {
          select: { dateOfBirth: true, gender: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    console.log("Users:", users);
  } catch(e) {
    console.error("Error:", e);
  }
  await prisma.$disconnect();
}
main();
