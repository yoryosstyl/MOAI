# Deploying MOAI to Vercel (Recommended)

## Why Vercel Instead of Firebase Hosting?

Your MOAI platform has **dynamic user-generated content** (projects created by users). This requires:
- Dynamic routes (`/projects/[id]`)
- Server-side rendering or client-side routing
- Real-time database access

**Firebase Hosting** is designed for static sites and doesn't handle dynamic Next.js routes well without Firebase Functions (complex setup).

**Vercel** is:
- ✅ Built specifically for Next.js
- ✅ **FREE** for personal projects
- ✅ Handles dynamic routes perfectly
- ✅ Automatic deployments from GitHub
- ✅ Free SSL certificates
- ✅ Global CDN
- ✅ Works seamlessly with Firebase backend

**You still use Firebase** for:
- Authentication
- Firestore database
- Storage
- All your backend services stay the same!

---

## Deployment Steps

### Step 1: Create Vercel Account

1. Go to: https://vercel.com/signup
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your repositories

### Step 2: Import Your Repository

1. Click **"Add New..."** → **"Project"**
2. Find and select **"MOAI"** repository
3. Click **"Import"**

### Step 3: Configure Project

Vercel will auto-detect Next.js. Configure:

**Framework Preset:** Next.js (auto-detected)

**Root Directory:** `./` (leave as is)

**Build Command:** `npm run build` (auto-filled)

**Output Directory:** `.next` (auto-filled)

**Install Command:** `npm install` (auto-filled)

### Step 4: Add Environment Variables

Click **"Environment Variables"** and add these (from your `.env.local`):

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyBu8EK7OZFlFIlP1gF8OkZt9dey7fknlkg` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `moai-aca3c.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `moai-aca3c` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `moai-aca3c.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `57595286391` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:57595286391:web:e16f6f2e239a47a3e8c772` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-XP1QRJTVFH` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | *(add when you get it)* |

### Step 5: Deploy!

1. Click **"Deploy"**
2. Wait ~2 minutes for build to complete
3. Your site is live! 🎉

You'll get a URL like: `https://moai-xxx.vercel.app`

---

## Automatic Deployments

**Every time you push to your main branch**, Vercel automatically:
1. Builds your app
2. Runs tests (if configured)
3. Deploys to production
4. Updates your site in ~2 minutes

**Workflow:**
```bash
git push origin main
```
That's it! Your site updates automatically.

---

## Custom Domain Setup

### Option 1: Use Vercel's Free Domain
Vercel gives you: `moai-xxx.vercel.app` for free

### Option 2: Connect Your Custom Domain

1. Buy a domain (Hostinger, Google Domains, Namecheap, etc.)
2. In Vercel Dashboard:
   - Go to your project → **Settings** → **Domains**
   - Click **"Add"**
   - Enter your domain (e.g., `moaiart.net`)
3. Update DNS records at your registrar:
   - Add the records Vercel provides
   - Usually an A record and CNAME
4. Wait for DNS propagation (5-30 minutes)
5. Done! Free SSL included

---

## Monitoring and Analytics

### Check Deployment Status
- Dashboard: https://vercel.com/dashboard
- See all deployments, logs, and analytics
- Real-time performance monitoring

### View Logs
- Click on any deployment
- See build logs and runtime logs
- Debug any issues

---

## Cost Comparison

### Vercel (Recommended)
- Hosting: **FREE**
- Bandwidth: 100 GB/month **FREE**
- Builds: Unlimited **FREE**
- Custom domain: **FREE**
- SSL: **FREE**
- **Total: $0/month** + domain cost (~$10-15/year)

### Firebase Hosting + Functions
- Hosting: FREE (10 GB storage)
- Functions: ~$5-25/month (for Next.js SSR)
- **Total: ~$60-300/year**

### Firebase (Backend) - Still Used!
- Authentication: **FREE** (generous limits)
- Firestore: **FREE** (generous limits)
- Storage: $0.026/GB (Blaze plan)
- **Total: ~$0-5/month** for your usage

---

## What Stays on Firebase?

Everything backend-related:
- ✅ User authentication (Google, Email/Password)
- ✅ Firestore database (users, projects, toolkits)
- ✅ Storage (images, files)
- ✅ Security rules
- ✅ All your data

**Only the hosting moves to Vercel!**

---

## Firebase Console Changes

### Update Authorized Domains

1. Go to: https://console.firebase.google.com/
2. Select **moai-aca3c**
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add your Vercel domain:
   - `moai-xxx.vercel.app` (Vercel subdomain)
   - `moaiart.net` (your custom domain, when added)

This allows Firebase Authentication to work from your Vercel-hosted site.

---

## GitHub Integration

Vercel automatically sets up:
- ✅ Deployments on every push to main
- ✅ Preview deployments for pull requests
- ✅ Automatic rollbacks if deployment fails
- ✅ Deployment status in GitHub

You can see deployment status directly in GitHub pull requests!

---

## Troubleshooting

### Build Fails

**Check Environment Variables:**
- Ensure all Firebase config variables are set
- Check for typos

**Check Build Logs:**
- Click on failed deployment
- Read error messages
- Fix and push again

### Firebase Authentication Doesn't Work

**Check Authorized Domains:**
- Make sure your Vercel domain is added to Firebase Auth settings

### Images Not Loading

**Check Firebase Storage Rules:**
- Ensure storage.rules allows public read access for images

---

## Next Steps After Deployment

1. ✅ Test all features on live site
2. ✅ Add your production domain to Firebase Auth
3. ✅ Update Google Maps API restrictions (add production domain)
4. ✅ Test user registration and login
5. ✅ Create test projects
6. ✅ Share your site!

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Next.js on Vercel: https://vercel.com/docs/frameworks/nextjs
- Firebase + Vercel: https://vercel.com/guides/deploying-nextjs-with-firebase

Your backend stays on Firebase (authentication, database, storage).
Your frontend deploys to Vercel (hosting, builds, CDN).

**Best of both worlds!** 🚀

---

## Summary

**Before:**
- ❌ Firebase Hosting doesn't support Next.js dynamic routes easily
- ❌ Would need Firebase Functions setup (complex + expensive)

**After:**
- ✅ Vercel handles Next.js perfectly (free!)
- ✅ Automatic deployments from GitHub
- ✅ All Firebase services still work
- ✅ Custom domains with free SSL
- ✅ Better performance and developer experience

**Total cost: $0/month** (+ optional domain ~$10-15/year)
