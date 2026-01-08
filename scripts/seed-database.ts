/**
 * Full Database Seed Script
 * Seeds the database with initial data for development/testing
 */

import { PrismaClient } from '@prisma/client'
import { hashPin } from '../lib/auth/password'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test users
  const shipperPin = await hashPin('1234')
  const transporterPin = await hashPin('1234')
  const brokerPin = await hashPin('1234')

  const shipper = await prisma.user.upsert({
    where: { phone: '265991234567' },
    update: {},
    create: {
      phone: '265991234567',
      name: 'Test Shipper',
      pinHash: shipperPin,
      role: 'shipper',
      verified: true,
      verificationLevel: 'phone',
    },
  })

  const transporter = await prisma.user.upsert({
    where: { phone: '265992345678' },
    update: {},
    create: {
      phone: '265992345678',
      name: 'Test Transporter',
      pinHash: transporterPin,
      role: 'transporter',
      verified: true,
      verificationLevel: 'phone',
    },
  })

  const broker = await prisma.user.upsert({
    where: { phone: '265993456789' },
    update: {},
    create: {
      phone: '265993456789',
      name: 'Test Broker',
      pinHash: brokerPin,
      role: 'broker',
      verified: true,
      verificationLevel: 'phone',
    },
  })

  console.log('✅ Created test users')

  // Create sample shipment
  const shipment = await prisma.shipment.create({
    data: {
      shipperId: shipper.id,
      reference: `ML${Date.now().toString().slice(-6)}`,
      originCity: 'Lilongwe',
      originDistrict: 'Lilongwe',
      originRegion: 'Central',
      destinationCity: 'Blantyre',
      destinationDistrict: 'Blantyre',
      destinationRegion: 'Southern',
      cargoType: 'maize',
      cargoDescription: 'Maize bags for market',
      weight: 1000,
      requiredVehicleType: 'medium_truck',
      pickupDate: new Date(Date.now() + 86400000), // Tomorrow
      pickupTimeWindow: 'Morning',
      price: 50000,
      paymentMethod: 'cash',
      status: 'posted',
    },
  })

  console.log('✅ Created sample shipment')

  // Create sample vehicle
  const vehicle = await prisma.vehicle.create({
    data: {
      transporterId: transporter.id,
      registrationNumber: 'LL-1234',
      vehicleType: 'medium_truck',
      capacity: 5000,
      currentLocation: 'Lilongwe',
      available: true,
    },
  })

  console.log('✅ Created sample vehicle')

  // Seed achievements (if not already seeded)
  const achievements = await prisma.achievement.findMany()
  if (achievements.length === 0) {
    await prisma.achievement.createMany({
      data: [
        {
          code: 'first_shipment',
          name: 'First Shipment',
          description: 'Post your first shipment',
          type: 'milestone',
          category: 'shipments',
          targetValue: 1,
        },
        {
          code: 'five_star_rating',
          name: 'Five Star Rating',
          description: 'Achieve a 5.0 rating',
          type: 'value',
          category: 'ratings',
          targetValue: 5.0,
        },
        {
          code: 'reliable_transporter',
          name: 'Reliable Transporter',
          description: 'Complete 10 shipments successfully',
          type: 'count',
          category: 'reliability',
          targetValue: 10,
        },
      ],
    })
    console.log('✅ Seeded achievements')
  }

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

