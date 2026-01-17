import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import 'dotenv/config'
import crypto from 'node:crypto'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    let admin = await prisma.user.findUnique({
        where: { email: 'admin@ngopidi.cafe' },
    })

    if (!admin) {
        const passwordHash = await bcrypt.hash('admin1234', 10)
        admin = await prisma.user.create({
            data: {
                id: crypto.randomUUID(),
                email: 'admin@ngopidi.cafe',
                name: 'Admin User',
                password: passwordHash,
                role: 'ADMIN',
                email_verified: new Date(),
            },
        })
    }
    console.log({ admin })

    let user = await prisma.user.findUnique({
        where: { email: 'user@ngopidi.cafe' },
    })

    if (!user) {
        const passwordHash2 = await bcrypt.hash('user1234', 10)
        user = await prisma.user.create({
            data: {
                id: crypto.randomUUID(),
                email: 'user@ngopidi.cafe',
                name: 'Regular User',
                password: passwordHash2,
                role: 'USER',
                email_verified: new Date(),
            },
        })
    }
    console.log({ user })

    const { places: bandungPlaces } = await import('./data/bandung_places.js')
    const { places: tasikmalayaPlaces } = await import('./data/tasikmalaya_places.js')
    const { places: jakartaPlaces } = await import('./data/jakarta_places.js')
    const { places: cirebonPlaces } = await import('./data/cirebon_places.js')

    if (admin) {
        for (const place of bandungPlaces) {
            const existing = await prisma.place.findFirst({
                where: { name: place.name },
            })

            if (!existing) {
                await prisma.place.create({
                    data: {
                        ...place,
                        wifi_available: place.wifi_available ?? false,
                        power_outlets_available: place.power_outlets_available ?? false,
                        prayer_room_available: false, // Defaulting to false as it might not be in the source
                        submitter_id: admin.id,
                    },
                })
                console.log(`Created place: ${place.name}`)
            } else {
                console.log(`Place already exists: ${place.name}`)
            }
        }

        for (const place of tasikmalayaPlaces) {
            const existing = await prisma.place.findFirst({
                where: { name: place.name },
            })

            if (!existing) {
                await prisma.place.create({
                    data: {
                        ...place,
                        wifi_available: place.wifi_available ?? false,
                        power_outlets_available: place.power_outlets_available ?? false,
                        prayer_room_available: false, // Defaulting to false as it might not be in the source
                        submitter_id: admin.id,
                    },
                })
                console.log(`Created place: ${place.name}`)
            } else {
                console.log(`Place already exists: ${place.name}`)
            }
        }

        for (const place of jakartaPlaces) {
            const existing = await prisma.place.findFirst({
                where: { name: place.name },
            })

            if (!existing) {
                await prisma.place.create({
                    data: {
                        ...place,
                        wifi_available: place.wifi_available ?? false,
                        power_outlets_available: place.power_outlets_available ?? false,
                        prayer_room_available: false, // Defaulting to false as it might not be in the source
                        submitter_id: admin.id,
                    },
                })
                console.log(`Created place: ${place.name}`)
            } else {
                console.log(`Place already exists: ${place.name}`)
            }
        }

        for (const place of cirebonPlaces) {
            const existing = await prisma.place.findFirst({
                where: { name: place.name },
            })

            if (!existing) {
                await prisma.place.create({
                    data: {
                        ...place,
                        wifi_available: place.wifi_available ?? false,
                        power_outlets_available: place.power_outlets_available ?? false,
                        prayer_room_available: false, // Defaulting to false as it might not be in the source
                        submitter_id: admin.id,
                    },
                })
                console.log(`Created place: ${place.name}`)
            } else {
                console.log(`Place already exists: ${place.name}`)
            }
        }
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
