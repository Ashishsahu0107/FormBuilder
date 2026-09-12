const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function main() {
  const forms = await prisma.form.findMany({ include: { versions: true } })
  forms.forEach(f => {
    console.log('Form:', f.title)
    f.versions.forEach(v => {
       console.log('  Version ' + v.id + ': ' + v.status)
    })
  })
}
main().finally(() => prisma.$disconnect())
