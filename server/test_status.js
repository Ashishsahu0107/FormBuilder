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
  
  const ver = form.versions.find(v => v.id === form.currentVersionId)
  console.log('Version status:', ver.status)
}
main().finally(() => prisma.$disconnect())
