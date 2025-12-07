# Matola V2 - World-Class African Transport Platform

## Overview

Matola V2 represents a complete reimagining of the transport logistics platform, specifically designed for the African context with a focus on Malawi. This document outlines all the features that make Matola the best simplified transport app for Africa.

---

## Core Design Principles

### 1. **3-Tap Philosophy**
Every core action can be completed in 3 taps or less:
- Shippers: Select route → Choose cargo → Post (3 taps)
- Transporters: See load → Accept → Confirm (3 taps)
- Both: Track shipment → View details (2 taps)

### 2. **Offline-First Architecture**
- IndexedDB for local data storage
- Background sync when connectivity returns
- Service Worker for PWA functionality
- Works on 2G networks and offline

### 3. **Accessibility First**
- Large touch targets (minimum 48px)
- High contrast dark theme
- Voice commands in English and Chichewa
- USSD fallback for feature phones

---

## African-Context Features

### Chichewa Language Support
- Full bilingual interface (English/Chichewa)
- Toggle between languages instantly
- All UI text, notifications, and messages translated
- Voice commands understand Chichewa city names

### Voice Commands
- Web Speech API integration
- Understands both English and Chichewa
- Commands: "Post load to Blantyre", "Ndikufuna katundu ku Lilongwe"
- Text-to-speech for confirmations

### Community Trust System
Unlike Western "star ratings only" systems, Matola uses African trust models:

**Trust Score (0-100)** based on:
- Community vouches from other verified users
- Union membership verification (NASFAM, transport unions)
- Trip completion rate
- On-time delivery record
- Dispute resolution history

**Trust Levels:**
- New User (0-30): Building trust
- Trusted (31-60): Established reputation  
- Highly Trusted (61-80): Proven track record
- Community Champion (81-100): Top performer

**Badges:**
- First Trip, 10 Trips, 100 Trips milestones
- Route Expert (specialized routes)
- Fast Responder (quick communication)
- Harvest Hero (seasonal excellence)
- Rainy Warrior (reliable during rainy season)

### Mobile Money Integration
Full support for Malawian payment methods:

**Airtel Money:**
- Dial *115*1*AMOUNT*PHONE#
- Instant payment confirmation
- Transaction tracking

**TNM Mpamba:**
- Dial *121*2*4*2*PHONE*AMOUNT*PIN#
- Same-day settlement
- Receipt via SMS

### Seasonal Intelligence
Malawi's transport needs vary by season:

**Maize Harvest (April-June):**
- High demand alerts
- Farm route optimization
- Storage location suggestions

**Tobacco Season (May-August):**
- Auction floor schedules
- Bale transport specialization
- Premium pricing indicators

**Rainy Season (November-March):**
- Road condition alerts
- Alternative route suggestions
- Delay notifications

**Tea Picking (October-March):**
- Estate connections
- Regular route scheduling

---

## Safety & Security

### Emergency SOS System
- Long-press (1.5s) floating button
- Immediate location sharing
- Direct dial to:
  - Police (997)
  - Ambulance (998)
  - Matola Support (+265 999 123 456)
- Trusted contacts notification
- Journey checkpoint tracking

### Journey Tracking
**Checkpoints on major routes:**
- Lilongwe-Blantyre: Dedza → Ntcheu → Balaka → Liwonde
- Lilongwe-Mzuzu: Kasungu → Mzimba → Ekwendeni
- Automatic checkpoint detection
- Delay alerts if checkpoint missed

**Safety Monitoring:**
- Route deviation alerts
- No-signal alerts (30 min threshold)
- Speed monitoring (coming soon)

---

## Gamification & Engagement

### Achievement System
40+ achievements across categories:
- **Milestones**: Trip counts, earnings, distances
- **Streaks**: Consecutive days active
- **Community**: Vouches given/received
- **Seasonal**: Harvest hero, rainy warrior
- **Route**: M1 Master, Route Explorer

### Celebration System
- Confetti animations on achievements
- Haptic feedback on mobile
- Share achievements to WhatsApp
- Level progression (1-10)

### Leaderboard
- Weekly/Monthly/All-time rankings
- Regional filtering (Central, Southern, Northern)
- Community stats display
- Rank change indicators

---

## Technical Features

### PWA Support
- Installable on home screen
- Push notifications
- Background sync
- Works offline

### Performance
- Optimized for low-end devices
- Minimal JavaScript bundle
- Image optimization
- Lazy loading

### Accessibility
- Screen reader compatible
- High contrast mode
- Large text support
- Reduced motion option

---

## Routes & Pages

\`\`\`
/simple/v2                    - Landing page
/simple/v2/shipper           - Shipper dashboard
/simple/v2/transporter       - Transporter dashboard
/simple/v2/achievements      - Achievement gallery
/simple/v2/leaderboard       - Community rankings
/simple/v2/track/[id]        - Live shipment tracking
/simple/v2/profile           - User profile & settings
/simple/login                - Authentication
/simple/register             - Registration
\`\`\`

---

## What Makes Matola Best-in-Class

1. **Simplicity**: 3-tap core actions vs 8+ steps in competitors
2. **Offline**: Works without internet, syncs when connected
3. **Language**: Full Chichewa support, voice commands
4. **Trust**: Community-based verification, not just algorithms
5. **Payments**: Native mobile money (Airtel/TNM)
6. **Safety**: SOS, journey tracking, checkpoints
7. **Seasonal**: Understands Malawi's agricultural calendar
8. **Engagement**: Achievements, leaderboards, celebrations
9. **Accessibility**: Large targets, USSD fallback, voice
10. **Performance**: Works on 2G, low-end devices

---

## Future Roadmap

- [ ] GPS tracking integration
- [ ] Fuel price alerts
- [ ] Insurance integration
- [ ] Cross-border (Zambia, Mozambique, Tanzania)
- [ ] Fleet management for large transporters
- [ ] AI-powered demand prediction
- [ ] Carbon footprint tracking

---

*Built with love in Malawi, for Malawi and Africa*
