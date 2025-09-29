import 'dotenv/config';
import { hash } from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
// import { auth } from '../src/lib/auth'; // Temporarily disabled

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [{ email: 'admin@berjamaah.poskubandung.org' }, { role: 'admin' }],
    },
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists:', existingAdmin.email);
  } else {
    // Create admin user directly with Prisma
    try {
      const hashedPassword = await hash('aman0809!', 12);

      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@berjamaah.poskubandung.org',
          password: hashedPassword,
          role: 'admin',
          status: 'active',
          fullName: 'Admin Berjamaah',
          phone: '081234567890',
        },
      });

      console.log('✅ Admin user created successfully:');
      console.log('   📧 Email: admin@berjamaah.poskubandung.org');
      console.log('   🔑 Password: ******');
      console.log('   👑 Role: admin');
      console.log('   🆔 ID:', adminUser.id);
    } catch (error) {
      console.error('❌ Error creating admin user:', error);
    }
  }

  console.log('🎉 Database seeding completed!');
}

main()
  .catch(e => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
