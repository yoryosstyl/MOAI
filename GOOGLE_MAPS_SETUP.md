# Google Maps API Setup Guide

This guide will help you set up Google Maps API for the location autocomplete feature in user profiles.

## Prerequisites
- A Google account
- Access to Google Cloud Console

## Step-by-Step Instructions

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create a New Project (or select existing)
- Click on the project dropdown at the top
- Click "New Project"
- Enter project name (e.g., "MOAI Platform")
- Click "Create"

### 3. Enable Required APIs
- In the left sidebar, go to **APIs & Services > Library**
- Search for "Places API"
- Click on **"Places API"** and click **"Enable"**
- Go back to the Library
- Search for "Maps JavaScript API"
- Click on **"Maps JavaScript API"** and click **"Enable"**

### 4. Create API Key
- Go to **APIs & Services > Credentials**
- Click **"+ CREATE CREDENTIALS"** at the top
- Select **"API key"**
- Your API key will be created and displayed

### 5. Restrict Your API Key (Important for Security!)
- Click on the API key name to edit it
- Under **"API restrictions"**:
  - Select "Restrict key"
  - Check only:
    - Maps JavaScript API
    - Places API
- Under **"Application restrictions"** (optional but recommended):
  - Select "HTTP referrers (web sites)"
  - Add your domains:
    - `http://localhost:3000/*` (for development)
    - `https://yourdomain.com/*` (for production)
- Click **"Save"**

### 6. Set Up Billing (Required)
- Google Maps API requires a billing account
- Go to **Billing** in the left sidebar
- Link a billing account or create a new one
- **Note**: Google provides $200 free credit per month, which is typically more than enough for small to medium applications
- The free tier includes:
  - 28,000+ map loads per month
  - 100,000+ autocomplete requests per month

### 7. Add API Key to Your Project
- Copy your API key
- Create a file named `.env.local` in the root of your project (if it doesn't exist)
- Add the following line:
  ```
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
  ```
- Replace `your_api_key_here` with your actual API key

### 8. Restart Your Development Server
```bash
npm run dev
```

## Testing
1. Go to your profile edit page (`/profile/edit`)
2. Click on the Location field
3. Start typing an address
4. You should see Google Maps autocomplete suggestions appear

## Troubleshooting

### "Google Maps not loaded" message appears
- Check that your API key is correctly set in `.env.local`
- Verify the API key has no extra spaces
- Make sure you've enabled both "Places API" and "Maps JavaScript API"
- Restart your development server after adding the environment variable

### No autocomplete suggestions appear
- Check browser console for errors
- Verify your API key restrictions allow requests from `localhost:3000`
- Check that billing is enabled in Google Cloud Console

### "This API project is not authorized to use this API" error
- Make sure you've enabled both "Places API" and "Maps JavaScript API" in Google Cloud Console
- Wait a few minutes after enabling APIs (propagation can take time)

## Cost Considerations
- **Free tier**: $200 credit per month (typically sufficient for hundreds of users)
- **Places Autocomplete**: ~$2.83 per 1000 requests (after free credit)
- **Tip**: The free credit resets monthly, so monitor usage in Google Cloud Console

## Alternative: Manual Entry
If you don't want to set up Google Maps API right now:
- The location field still works with manual entry
- Users can click "Enter Manually" to type their location
- Locations entered manually won't have the "verified" indicator
