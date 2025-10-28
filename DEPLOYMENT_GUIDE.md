# MOAI Deployment Guide

This guide will help you deploy your MOAI platform to Firebase Hosting with a custom domain.

## Overview

**Recommended Setup:**
- **Hosting:** Firebase Hosting (FREE)
- **Domain:** Any domain registrar (Hostinger, Google Domains, Namecheap, etc.)
- **Total Cost:** ~$10-15/year (just the domain!)

## Why Firebase Hosting?

✅ **FREE for your usage** (generous free tier)
✅ **Already integrated** with your Firebase backend
✅ **Automatic HTTPS** (SSL certificates)
✅ **Global CDN** (fast worldwide)
✅ **Easy deployment** from command line
✅ **Custom domain support** included

## Prerequisites

- ✅ Firebase project created (moai-aca3c)
- ✅ Next.js application built
- ✅ Node.js installed on your computer
- ⏳ Domain name (can add later)

## Deployment Steps

### Step 1: Install Firebase CLI

On your computer, run:
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

This will open a browser window to authenticate with your Google account.

### Step 3: Initialize Firebase Hosting

In your MOAI project directory:
```bash
firebase init hosting
```

Answer the prompts as follows:
- **Which Firebase project?** → Select `moai-aca3c`
- **What do you want to use as your public directory?** → `out` (for static export) OR `.next` (for server-side)
- **Configure as a single-page app?** → `No`
- **Set up automatic builds with GitHub?** → `Yes` (optional, but recommended)
- **Overwrite index.html?** → `No`

### Step 4: Configure Next.js for Deployment

You have two options:

#### Option A: Static Export (Simpler, Recommended for Now)

1. Update `next.config.mjs`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

2. Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "export": "next build && next export",
    "deploy": "npm run build && firebase deploy --only hosting"
  }
}
```

#### Option B: Server-Side Rendering (More features, slightly more complex)

Use a library like `firebase-functions` for Next.js SSR.
(We can set this up later if needed)

### Step 5: Create Firebase Configuration File

Create `firebase.json` in your project root:
```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=3600"
          }
        ]
      }
    ]
  }
}
```

### Step 6: Build Your Application

```bash
npm run build
```

This creates an optimized production build.

### Step 7: Deploy to Firebase

```bash
firebase deploy --only hosting
```

After deployment completes, you'll see a URL like:
```
https://moai-aca3c.web.app
https://moai-aca3c.firebaseapp.com
```

Your site is now LIVE! 🎉

## Step 8: Connect Custom Domain

### If You Buy Domain from Hostinger (or any registrar):

1. **In Firebase Console:**
   - Go to https://console.firebase.google.com
   - Select your project (moai-aca3c)
   - Go to **Hosting** → **Add custom domain**
   - Enter your domain (e.g., `moaiart.net`)
   - Firebase will provide DNS records (A and TXT records)

2. **In Hostinger Dashboard:**
   - Go to **Domains** → Select your domain
   - Go to **DNS / Name Servers**
   - Add the A records provided by Firebase:
     ```
     Type: A
     Name: @
     Points to: 151.101.1.195

     Type: A
     Name: @
     Points to: 151.101.65.195
     ```
   - Add the TXT record for verification
   - For `www` subdomain, add:
     ```
     Type: A
     Name: www
     Points to: 151.101.1.195

     Type: A
     Name: www
     Points to: 151.101.65.195
     ```

3. **Wait for DNS Propagation:**
   - Usually takes 5-30 minutes
   - Can take up to 24-48 hours in rare cases
   - Check status in Firebase Console

4. **Firebase Automatically Provisions SSL:**
   - Your site will be available at `https://yourdomain.com`
   - Free SSL certificate included
   - Auto-renewal

## Using Hostinger Hosting Account

**Can you use your Hostinger hosting?**

Not for the Next.js app directly, but you could:

1. **Use Hostinger only for the domain** (point DNS to Firebase)
   - Most cost-effective
   - Firebase handles all hosting

2. **Use Hostinger VPS/Cloud hosting** (if you have it)
   - Install Node.js
   - Deploy Next.js app
   - More complex setup
   - More expensive than free Firebase

**Recommendation:** Use Firebase Hosting + Hostinger domain

## Continuous Deployment (Optional)

Set up automatic deployment when you push to GitHub:

1. **In Firebase Console:**
   - Go to Hosting → Add custom domain
   - Enable **GitHub integration**
   - Connect your repository
   - Choose branch (e.g., `main`)
   - Every push automatically deploys! 🚀

## Cost Comparison

### Option 1: Firebase Hosting (Recommended)
- Hosting: **FREE**
- Domain: ~$10-15/year
- SSL: **FREE** (included)
- **Total: $10-15/year**

### Option 2: Hostinger Web Hosting
- Hosting: ~$3-10/month = $36-120/year
- Domain: Included or ~$10/year
- SSL: Usually included
- **Total: $36-120/year**
- ⚠️ But won't work for Next.js without VPS/Cloud

### Option 3: Hostinger VPS
- VPS: ~$4-12/month = $48-144/year
- Domain: Included or ~$10/year
- Setup complexity: High
- **Total: $48-144/year**

**Winner: Firebase Hosting** 🏆

## Monitoring and Limits

### Firebase Free Tier Limits:
- **Storage:** 10 GB
- **Bandwidth:** 360 MB/day (~10.5 GB/month)
- **Custom domains:** Unlimited

### Expected Usage (Year 1 - hundreds of users):
- Storage needed: ~1-2 GB (images, static files)
- Bandwidth: ~100-200 MB/day
- **Status:** Comfortably within free tier ✅

### If You Exceed Free Tier:
- Firebase Blaze plan charges:
  - Storage: $0.026/GB/month
  - Bandwidth: $0.15/GB
- Example: 20 GB bandwidth/month = ~$3/month
- Still cheaper than traditional hosting!

## Troubleshooting

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
rm -rf out
npm run build
```

### Firebase CLI Issues
```bash
# Update Firebase CLI
npm install -g firebase-tools@latest

# Re-login
firebase logout
firebase login
```

### DNS Not Resolving
- Check DNS propagation: https://dnschecker.org
- Verify A records are correct
- Wait 24-48 hours maximum
- Check for typos in domain name

## Next Steps After Deployment

1. ✅ Test all features on live site
2. ✅ Set up Google Analytics (optional)
3. ✅ Configure Google Maps API restrictions for production domain
4. ✅ Update Firebase security rules if needed
5. ✅ Add your production domain to Firebase Auth authorized domains

## Questions?

- Firebase Hosting docs: https://firebase.google.com/docs/hosting
- Next.js deployment: https://nextjs.org/docs/deployment
- Custom domain setup: https://firebase.google.com/docs/hosting/custom-domain

---

**Ready to deploy?** Let me know and I can help you through each step! 🚀
