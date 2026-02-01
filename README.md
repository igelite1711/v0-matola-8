# Matola Logistics Platform

Pan-African Logistics Platform - Connecting shippers and transporters across Malawi and beyond.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/prankdad-7342s-projects/v0-matola)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/auY7QHmRAoR)

## Overview

Matola is a comprehensive logistics platform designed for the African market, with special focus on Malawi. It connects shippers with transporters through multiple channels: Web PWA, USSD, and WhatsApp.

## Tech Stack

- **Framework:** Next.js 16
- **Language:** TypeScript
- **Database:** Prisma (SQLite for dev, PostgreSQL for production)
- **Package Manager:** pnpm
- **UI:** Radix UI + Tailwind CSS
- **State Management:** Zustand
- **Authentication:** JWT with PIN-based auth
- **Payments:** Airtel Money & TNM Mpamba integration

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (install with `npm install -g pnpm`)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd v0-matola-8
\`\`\`

2. Install dependencies:
\`\`\`bash
pnpm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp env.example .env.local
# Edit .env.local with your configuration
\`\`\`

4. Set up the database:
\`\`\`bash
pnpm run db:generate
pnpm run db:push
# Or for migrations:
pnpm run db:migrate
\`\`\`

5. Seed the database (optional):
\`\`\`bash
pnpm run db:seed:full
\`\`\`

6. Start the development server:
\`\`\`bash
pnpm run dev
\`\`\`

The app will be available at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run lint` - Run ESLint
- `pnpm run test` - Run unit tests
- `pnpm run test:watch` - Run tests in watch mode
- `pnpm run test:e2e` - Run end-to-end tests
- `pnpm run test:all` - Run all tests
- `pnpm run db:generate` - Generate Prisma client
- `pnpm run db:push` - Push schema to database
- `pnpm run db:migrate` - Run database migrations
- `pnpm run db:studio` - Open Prisma Studio
- `pnpm run workers:start` - Start background workers

## Project Structure

\`\`\`
v0-matola-8/
├── app/              # Next.js app directory
│   ├── api/         # API routes
│   ├── dashboard/   # Dashboard pages
│   └── ...
├── components/      # React components
├── lib/             # Utilities and business logic
│   ├── auth/       # Authentication
│   ├── db/         # Database client
│   ├── payments/   # Payment integrations
│   └── ...
├── prisma/          # Database schema
└── tests/           # Test files
\`\`\`

## Features

- 🔐 PIN-based authentication
- 📱 Multi-channel access (Web, USSD, WhatsApp)
- 🚚 Smart cargo matching
- 💰 Mobile money payments (Airtel Money, TNM Mpamba)
- ⭐ Rating and review system
- 🏆 Gamification and achievements
- 📊 Real-time tracking
- 🌍 Bilingual support (English/Chichewa)
- 📴 Offline-first PWA

## Deployment

The project is configured for deployment on Vercel. Make sure to set all required environment variables in your Vercel project settings.

## License

Private - All rights reserved
