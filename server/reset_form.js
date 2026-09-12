const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function main() {
  await prisma.formVersion.updateMany({
    where: { form: { title: 'Contact Form' } },
    data: { status: 'DRAFT' }
  })
  
  await prisma.form.updateMany({
    where: { title: 'Contact Form' },
    data: { status: 'DRAFT' }
  })
  console.log('Reset Contact Form to DRAFT')
}
main().finally(() => prisma.$disconnect())
