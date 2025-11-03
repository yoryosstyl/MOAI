# Email Setup Guide - MOAI Contact Form

The contact form on MOAI uses [Resend](https://resend.com) to send emails directly from the application.

## Why Resend?

- ✅ Modern API designed for developers
- ✅ Generous free tier: 100 emails/day, 3,000 emails/month
- ✅ No credit card required for free tier
- ✅ Easy integration with Next.js
- ✅ Built-in email validation and deliverability

## Setup Instructions

### Step 1: Create a Resend Account

1. Go to https://resend.com
2. Click "Sign Up" (you can use GitHub, Google, or email)
3. Verify your email address
4. You're done - no credit card required!

### Step 2: Get Your API Key

1. After logging in, go to https://resend.com/api-keys
2. Click "Create API Key"
3. Give it a name (e.g., "MOAI Production")
4. Select permissions: "Sending access" (default)
5. Click "Create"
6. **Important**: Copy the API key immediately - you won't be able to see it again!

### Step 3: Add API Key Locally (for development)

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and add your Resend API key:
   ```
   RESEND_API_KEY=re_your_actual_api_key_here
   ```

3. Restart your Next.js development server:
   ```bash
   npm run dev
   ```

### Step 4: Add API Key to Vercel (for production)

1. Go to your Vercel project dashboard: https://vercel.com/yoryosstyl/moai
2. Go to "Settings" → "Environment Variables"
3. Add a new variable:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Your Resend API key (starts with `re_`)
   - **Environment**: Production (and Preview if you want to test)
4. Click "Save"
5. Redeploy your application for changes to take effect

### Step 5: Verify Domain (Optional - for custom sender email)

By default, emails are sent from `onboarding@resend.dev`. To use your own domain (e.g., `contact@moaiart.net`):

1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Enter `moaiart.net`
4. Add the DNS records to your Hostinger DNS settings:
   - **TXT record** for domain verification
   - **MX records** for receiving replies (optional)
   - **SPF, DKIM records** for email authentication
5. Wait for DNS propagation (usually 5-30 minutes)
6. Update the API route (`app/api/send-email/route.js`) to use your domain:
   ```javascript
   from: 'MOAI Contact <contact@moaiart.net>',
   ```

## How It Works

### Contact Form Flow:

1. User fills out contact form at `/contact`
2. Form submits to API endpoint `/api/send-email`
3. API validates the input
4. Resend sends email to `gstylianopoulos@gmail.com`
5. Email includes:
   - User's name
   - User's email (set as "Reply To")
   - Subject line
   - Message content
6. User sees success message
7. You can reply directly to the user's email

### Email Format:

**From**: MOAI Contact Form <onboarding@resend.dev>
**To**: gstylianopoulos@gmail.com
**Reply-To**: [User's email]
**Subject**: [MOAI Contact] [User's subject]

**Body**:
```
New Contact Form Submission

From: [User's name]
Email: [User's email]
Subject: [Subject]

Message:
[User's message]
```

## Testing

### Test Locally:

1. Start development server: `npm run dev`
2. Go to http://localhost:3000/contact
3. Fill out the form
4. Click "Send Message"
5. Check `gstylianopoulos@gmail.com` for the email

### Test in Production:

1. Go to https://moaiart.net/contact
2. Fill out and submit the form
3. Check your inbox

## Troubleshooting

### Error: "Failed to send email"

**Possible causes:**
- Missing or invalid API key
- API key not set in Vercel environment variables
- Resend API is down (check https://status.resend.com)

**Solution:**
1. Check your API key is correctly set in `.env.local` (local) or Vercel (production)
2. Make sure API key starts with `re_`
3. Check browser console for specific error messages

### Email not received

**Possible causes:**
- Email went to spam folder
- Gmail blocked the email
- Wrong recipient email address

**Solution:**
1. Check spam/junk folder
2. Add `onboarding@resend.dev` to Gmail contacts
3. Verify email address in `app/api/send-email/route.js`

### Rate Limit Exceeded

**Free tier limits:**
- 100 emails per day
- 3,000 emails per month

**Solution:**
- Upgrade to paid plan on Resend
- Or implement contact form rate limiting

## Changing Recipient Email

To change where contact form emails are sent:

Edit `app/api/send-email/route.js`, line 30:
```javascript
to: ['your-new-email@example.com'],
```

Then commit and push to deploy.

## Security

- API key is stored as environment variable (never in code)
- API route validates all input fields
- Email addresses are validated with regex
- CSRF protection via Next.js
- Rate limiting can be added if needed

## Cost

**Free tier (current):**
- 100 emails/day
- 3,000 emails/month
- Perfect for contact forms

**Paid tier (if needed):**
- $20/month for 50,000 emails
- $80/month for 1,000,000 emails

## Support

- Resend Docs: https://resend.com/docs
- Resend Support: support@resend.com
- Resend Community: https://discord.gg/resend
