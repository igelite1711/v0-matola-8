# Matola V2 - Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables
Set these in your Vercel project's Environment Variables (Vars section):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_API_URL=https://matola.vercel.app
```

### 2. Build & Test Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Test production build
npm start
```

### 3. Deployment Steps

#### Using Vercel CLI:
```bash
vercel --prod
```

#### Using GitHub Integration:
1. Push code to GitHub
2. Vercel automatically deploys on push to main branch

### 4. Post-Deployment Verification

- [ ] Landing page loads at `/simple/v2`
- [ ] Login redirects properly
- [ ] Registration completes successfully
- [ ] Shipper dashboard displays with data
- [ ] Transporter dashboard displays with loads
- [ ] PWA install prompt appears
- [ ] Offline mode works (DevTools > Offline)
- [ ] All modals function properly
- [ ] Language toggle works (English/Chichewa)
- [ ] SOS button is accessible
- [ ] Images load without CORS errors
- [ ] Animations perform smoothly

### 5. Analytics & Monitoring

Enable these in Vercel Dashboard:

1. **Web Analytics** - Track user interactions
2. **Performance Monitoring** - Monitor Core Web Vitals
3. **Error Tracking** - Capture runtime errors
4. **Real-time Logs** - Monitor deployments

### 6. Database Migration

If using Supabase:

```bash
# Run pending migrations
npm run db:migrate

# Seed demo data (optional)
npm run db:seed
```

### 7. SSL Certificate

Vercel provides free SSL. Ensure:
- Domain is verified in Vercel
- HTTPS enforced
- Certificates auto-renew

### 8. Performance Optimization

```bash
# Check bundle size
npm run build -- --analyze

# Monitor Core Web Vitals
# Use Vercel Analytics dashboard
```

### 9. Mobile Testing

Test on real devices:
- iPhone (various sizes)
- Android phones
- Tablets
- Network: 4G, 3G, 2G (throttle in DevTools)

### 10. Security Checks

- [ ] No secrets in code
- [ ] Environment variables configured
- [ ] CORS properly set
- [ ] CSP headers configured
- [ ] XSS protection enabled
- [ ] CSRF tokens in forms
- [ ] No console errors
- [ ] No console warnings

### 11. Rollback Plan

If deployment fails:

```bash
# Revert to previous deployment
vercel rollback

# Or deploy specific commit
vercel --target=production <commit-hash>
```

## Monitoring & Support

### Key Metrics to Monitor:

1. **User Registration Rate** - Track new users
2. **Login Success Rate** - Monitor auth issues
3. **Shipment Completion Rate** - Core business metric
4. **App Performance** - Load times, errors
5. **User Session Duration** - Engagement
6. **Mobile vs Desktop** - Usage distribution

### Support Channels:

- **Email**: support@matola.app
- **WhatsApp**: +265999123456
- **USSD**: *384*628652#
- **Help Page**: `/simple/v2/help`

## Scaling Considerations

As the app grows:

1. **Database Optimization**
   - Add indexes on frequently queried columns
   - Archive old shipments
   - Implement database replication

2. **Caching Strategy**
   - Implement Redis for session storage
   - Cache static assets with CDN
   - Implement ISR (Incremental Static Regeneration)

3. **Load Testing**
   - Simulate peak traffic (harvest season)
   - Test database under load
   - Monitor API response times

4. **Geographic Distribution**
   - Deploy to edge functions
   - Use regional databases
   - Optimize for Malawi's network conditions

## Troubleshooting

### Issue: PWA not installing

**Solution**: Check manifest.json is valid and served with correct MIME type

### Issue: CORS errors

**Solution**: Ensure backend allows requests from your domain

### Issue: Slow loading times

**Solution**: 
- Check image sizes
- Enable compression
- Use lazy loading
- Implement skeleton screens

### Issue: Login not working

**Solution**:
- Verify Supabase connection
- Check environment variables
- Review browser console for errors

## Success Metrics

After deployment, track:

- Users: 0 → 1,000 → 10,000 → 100,000
- Daily Active Users (DAU)
- Shipments per week
- Transaction volume (MWK)
- App ratings (iOS/Android)
- User retention rate

## Post-Launch Features

### Week 1-4: Stabilization
- Monitor errors
- Fix critical bugs
- Gather user feedback

### Month 2-3: Enhancement
- Add analytics dashboard
- Implement admin panel
- Add customer support chat

### Month 4-6: Scaling
- Expand to other regions (Mozambique, Zambia)
- Optimize for rural areas
- Launch API for B2B partners

---

**Deployment Status**: Ready for production
**Target Rollout**: Phased rollout to Lilongwe first, then nationwide
**Success Criteria**: 100+ daily active shippers and transporters
