const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Provide email as argument')
    process.exit(1)
  }
  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' }
  })
  console.log(`User ${user.email} is now ADMIN.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())