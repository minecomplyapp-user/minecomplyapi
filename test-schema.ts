// Quick test to verify Prisma client has correct CMVRReport schema
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSchema() {
  console.log('Testing Prisma CMVRReport schema...');

  // This should compile without errors if cmvrData exists
  const testQuery = await prisma.cMVRReport.findFirst({
    select: {
      id: true,
      cmvrData: true,
      createdAt: true,
      createdById: true,
    },
  });

  console.log('✅ Schema test passed! cmvrData field exists');
  console.log('Test query result:', testQuery);

  await prisma.$disconnect();
}

testSchema().catch((e) => {
  console.error('❌ Schema test failed:', e);
  process.exit(1);
});
