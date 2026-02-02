
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Checking database users...')
    try {
        const users = await prisma.user.findMany()
        console.log(`Found ${users.length} users:`)
        users.forEach(u => {
            console.log(`- ${u.name} (${u.role}): ${u.phone} (Verified: ${u.verified})`)
        })
    } catch (e) {
        console.error('Error connecting to database:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
