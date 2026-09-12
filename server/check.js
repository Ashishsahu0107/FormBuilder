const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const form = await prisma.form.findFirst({
    include: { versions: true }
  })
  if(!form) {
    console.log('No form found'); return;
  }
  console.log('Form ID:', form.id)
  console.log('Current Version ID:', form.currentVersionId)
  
  if(form.currentVersionId) {
     const ver = await prisma.formVersion.findUnique({where: {id: form.currentVersionId}})
     console.log('Current schema elements length:', ver.schema?.elements?.length)
  }
}
main().finally(() => prisma.$disconnect())
