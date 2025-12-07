# Matola Simplicity Guidelines

## The 3-Tap Philosophy

Every core user action should complete in 3 taps or less.

### For Shippers
| Action | Taps | Flow |
|--------|------|------|
| Post a load | 3 | Home → Post Button → Fill & Submit |
| Track shipment | 2 | Home → Track Button → Enter ID |
| View my loads | 1 | Bottom Nav → Loads |

### For Transporters  
| Action | Taps | Flow |
|--------|------|------|
| Go online | 1 | Toggle on home screen |
| Accept a load | 2 | Home recommendation → Accept |
| View earnings | 1 | Bottom Nav → Earnings |

## Simplified UI Components

### 1. Quick Post Load (Single Screen)
- Only 4 fields: From, To, Cargo Type, Weight
- Pre-set weight buttons (500, 1000, 2000, 5000 kg)
- Instant price estimate
- One-tap submit

### 2. Simple Sidebar (Desktop)
- Max 4 navigation items per user type
- Settings and Help in footer
- No nested menus

### 3. Mobile Bottom Nav
- Fixed 4-icon navigation
- Always visible
- Large tap targets (44px minimum)

### 4. Simple Login/Register
- Phone + PIN only
- 2-step registration max
- Clear USSD/WhatsApp alternatives

## Design Principles

1. **Progressive Disclosure**: Show only what's needed now
2. **Smart Defaults**: Pre-fill common values (today's date, popular routes)
3. **Visual Hierarchy**: One primary action per screen
4. **Forgiveness**: Easy undo, clear error messages
5. **Bilingual**: Chichewa/English toggle, not duplicate text

## What We Removed

- Multi-step wizards (replaced with single-screen forms)
- Hidden filters (always visible, minimal options)
- Broker/Admin tabs in registration (separate flows)
- Verification badges complexity
- Seasonal pricing alerts (background optimization)
- ADMARC market prices (separate section, not home)
- Complex rating flows (single star + optional comment)

## Mobile-First Rules

1. Touch targets: 44px minimum
2. Forms: 14px+ font, single column
3. Navigation: Bottom bar, not hamburger
4. Loading: Skeleton states, optimistic updates
5. Offline: Clear indicators, cached data
