# Automatic Deployment Setup Guide

This guide will help you set up automatic deployment to Firebase Hosting. After setup, every push to your `main` branch will automatically deploy your site!

## Overview

When you push code to GitHub, GitHub Actions will:
1. Build your Next.js app
2. Deploy to Firebase Hosting automatically
3. Your site updates in ~2-3 minutes

**No more manual deployment commands needed!** 🚀

## Setup Steps

### Step 1: Generate Firebase Service Account Key

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/
   - Select your project: **moai-aca3c**

2. **Navigate to Project Settings:**
   - Click the gear icon ⚙️ (top left, next to "Project Overview")
   - Click **"Project settings"**

3. **Go to Service Accounts:**
   - Click the **"Service accounts"** tab
   - You should see "Firebase Admin SDK"

4. **Generate New Private Key:**
   - Click **"Generate new private key"**
   - A dialog will appear warning you to keep the key secure
   - Click **"Generate key"**
   - A JSON file will download to your computer (e.g., `moai-aca3c-firebase-adminsdk-xxxxx.json`)

   ⚠️ **IMPORTANT:** Keep this file secure! Don't share it or commit it to your repository.

### Step 2: Add Secrets to GitHub Repository

1. **Go to Your GitHub Repository:**
   - Visit: https://github.com/yoryosstyl/MOAI

2. **Navigate to Settings:**
   - Click **"Settings"** tab (top right of repository page)

3. **Go to Secrets and Variables:**
   - In the left sidebar, click **"Secrets and variables"** → **"Actions"**

4. **Add Firebase Service Account Secret:**
   - Click **"New repository secret"** (green button)
   - **Name:** `FIREBASE_SERVICE_ACCOUNT_MOAI`
   - **Value:** Open the downloaded JSON file in a text editor, copy ALL the contents, and paste here
   - Click **"Add secret"**

5. **Add Firebase Configuration Secrets:**

   Add each of these as separate secrets (click "New repository secret" for each):

   | Secret Name | Value (from your .env.local) |
   |------------|------------------------------|
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | AIzaSyBu8EK7OZFlFIlP1gF8OkZt9dey7fknlkg |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | moai-aca3c.firebaseapp.com |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | moai-aca3c |
   | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | moai-aca3c.firebasestorage.app |
   | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | 57595286391 |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` | 1:57595286391:web:e16f6f2e239a47a3e8c772 |
   | `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | G-XP1QRJTVFH |

6. **Add Google Maps API Key (Optional - when you get it):**
   - Name: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - Value: Your Google Maps API key (add this later when you get one)

### Step 3: Verify Secrets Are Added

After adding all secrets, you should see these in your repository secrets list:
- ✅ FIREBASE_SERVICE_ACCOUNT_MOAI
- ✅ NEXT_PUBLIC_FIREBASE_API_KEY
- ✅ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- ✅ NEXT_PUBLIC_FIREBASE_PROJECT_ID
- ✅ NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- ✅ NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- ✅ NEXT_PUBLIC_FIREBASE_APP_ID
- ✅ NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
- ⏳ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (add later)

### Step 4: Test Automatic Deployment

Now test that it works!

1. **Make a small change** (or just push the workflow file):
   ```bash
   git pull origin claude/session-011CUZnDDrZp7Jde1joKgAvk
   git checkout main  # or your main branch name
   git merge claude/session-011CUZnDDrZp7Jde1joKgAvk
   git push origin main
   ```

2. **Watch the deployment:**
   - Go to your GitHub repository
   - Click the **"Actions"** tab
   - You should see a workflow running: "Deploy to Firebase Hosting"
   - Click on it to watch the progress

3. **Wait for completion:**
   - Takes about 2-3 minutes
   - When done, you'll see green checkmarks ✅

4. **Verify your site:**
   - Visit: https://moai-aca3c.web.app
   - Your latest changes should be live!

## How It Works

The workflow file (`.github/workflows/firebase-deploy.yml`) tells GitHub Actions to:

1. **Trigger on push to main branch**
   - Every time you push to `main`, deployment starts automatically
   - You can also trigger manually from GitHub UI

2. **Build your app**
   - Installs dependencies
   - Runs `npm run build`
   - Uses your Firebase config from secrets

3. **Deploy to Firebase**
   - Uploads the built files to Firebase Hosting
   - Your site updates automatically

## Your New Workflow

### Before (Manual):
```bash
git pull
npm run build
npx firebase-tools deploy --only hosting
```

### After (Automatic):
```bash
git push origin main
# That's it! Wait 2-3 minutes and your site is live! 🎉
```

## Deploying Changes from Claude Session Branch

When working with Claude session branches, you'll need to merge to main to trigger deployment:

```bash
# Option 1: Merge to main locally and push
git checkout main
git pull origin main
git merge claude/session-XXXXX
git push origin main  # This triggers automatic deployment!

# Option 2: Create a Pull Request on GitHub
# - Go to GitHub and create a PR from your claude branch to main
# - Merge the PR on GitHub
# - Automatic deployment starts immediately!
```

## Monitoring Deployments

**Check deployment status:**
1. Go to: https://github.com/yoryosstyl/MOAI/actions
2. See all your deployments and their status
3. Click on any deployment to see logs

**Check live site:**
- Production: https://moai-aca3c.web.app
- Alternative: https://moai-aca3c.firebaseapp.com

## Troubleshooting

### Deployment Fails

**Check GitHub Actions logs:**
1. Go to **Actions** tab in your repository
2. Click the failed workflow
3. Read the error messages

**Common issues:**

1. **Missing secrets:**
   - Error: "Secret FIREBASE_SERVICE_ACCOUNT_MOAI not found"
   - Solution: Add the missing secret in GitHub Settings

2. **Build errors:**
   - Error during `npm run build`
   - Solution: Fix the code error, commit, and push again

3. **Firebase permissions:**
   - Error: "Permission denied"
   - Solution: Regenerate service account key with proper permissions

### Workflow Doesn't Trigger

1. Check you pushed to `main` branch (not claude session branch)
2. Check workflow file is in `.github/workflows/` directory
3. Check GitHub Actions are enabled in repository settings

## Security Notes

⚠️ **NEVER commit these files to your repository:**
- Firebase service account JSON file
- `.env.local` file
- Any file containing secrets

✅ **Always use GitHub Secrets for:**
- API keys
- Service account credentials
- Environment variables

## Need to Update Secrets?

If you need to change any secrets (e.g., new Firebase API key):

1. Go to: https://github.com/yoryosstyl/MOAI/settings/secrets/actions
2. Click on the secret name
3. Click **"Update"** or **"Remove"** and add new one

## Benefits of Automatic Deployment

✅ **Faster workflow** - No manual commands
✅ **Consistent** - Same process every time
✅ **Traceable** - See deployment history
✅ **Reliable** - Automated testing possible
✅ **Collaborative** - Works for all contributors

---

**Ready to set it up?** Follow the steps above, and you'll have automatic deployment working in about 10 minutes! 🚀

Questions? Check the logs in GitHub Actions or refer to:
- Firebase Actions: https://github.com/FirebaseExtended/action-hosting-deploy
- GitHub Actions docs: https://docs.github.com/en/actions
