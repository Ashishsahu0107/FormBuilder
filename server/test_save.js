const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const form = await prisma.form.findFirst({
    where: { currentVersionId: { not: null } },
    include: { versions: true }
  })
  if(!form) {
    console.log('No form found'); return;
  }
  
  // mock save
  const newSchema = { ...form.versions[0].schema, elements: [{ id: 'test1', type: 'heading' }] }
  
  await prisma.formVersion.update({
    where: { id: form.currentVersionId },
    data: { schema: newSchema }
  })
  
  const updated = await prisma.formVersion.findUnique({
    where: { id: form.currentVersionId }
  })
  
  console.log('Updated elements length:', updated.schema?.elements?.length)
}
main().finally(() => prisma.$disconnect())
