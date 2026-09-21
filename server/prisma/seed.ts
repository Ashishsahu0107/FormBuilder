import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123';
  
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { 
      role: 'ADMIN',
      password: hashedPassword 
    },
    create: {
      email: adminEmail,
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log(`✅ Admin user seeded successfully!`);
  console.log(`📧 Email: ${admin.email}`);
  console.log(`🔑 Password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding admin user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


  // npx prisma db seed