# MOAI - Artist Collaboration Platform

A mobile-responsive website for artist collaboration, allowing artists to share projects, discover creative toolkits, and connect with each other.

## Features

- **User Authentication**: Sign up and login with email/password or Google
- **Project Sharing**: Artists can create, edit, and share their projects
- **Toolkit Discovery**: Browse and search curated toolkits for art creation
- **User Profiles**: Customizable profiles with privacy controls
- **Multilingual**: Support for English and Greek
- **Mobile Responsive**: Works seamlessly on all devices

## Tech Stack

- **Frontend**: Next.js 16 (React) with App Router
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Hosting**: Vercel (recommended)
- **Languages**: JavaScript

## Project Structure

```
MOAI/
├── app/                    # Next.js App Router pages
│   ├── layout.js          # Root layout with Navbar
│   ├── page.js            # Home page
│   ├── projects/          # Projects listing and detail pages
│   ├── toolkits/          # Toolkits listing
│   ├── about/             # About page
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   └── profile/           # User profile page
├── components/            # Reusable React components
│   └── Navbar.js          # Navigation bar
├── lib/                   # Utility functions and configurations
│   ├── firebase.js        # Firebase configuration
│   ├── dataModels.js      # Firestore data schemas
│   └── i18n/              # Internationalization
│       ├── config.js      # i18n configuration
│       └── locales/       # Translation files (en.json, el.json)
├── public/                # Static assets
├── utils/                 # Helper utilities
└── package.json           # Dependencies
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Firebase account (free tier is sufficient for development)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/MOAI.git
cd MOAI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select your existing "MOAI" project
3. Enable the following services:
   - **Authentication**: Enable Email/Password and Google providers
   - **Firestore Database**: Create a database in production mode
   - **Storage**: Enable Firebase Storage for image uploads

4. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click on the web icon (</>) to create a web app
   - Copy the configuration values

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Firebase Security Rules

### Firestore Rules (Coming Soon)

You'll need to set up security rules for Firestore to control access to your data.

### Storage Rules (Coming Soon)

Configure storage rules for image uploads with file size and type restrictions.

## Deployment

### Deploy to Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts and add your environment variables in the Vercel dashboard.

### Custom Domain Setup

Once deployed, you can add your custom domain `moaiart.net` in the Vercel dashboard:
1. Go to your project settings
2. Navigate to Domains
3. Add `moaiart.net`
4. Update your DNS records as instructed

## Development Roadmap

### Phase 1: Core Features (Current)
- [x] Project setup with Next.js and Tailwind
- [x] Basic page structure
- [x] Firebase configuration
- [x] i18n setup (English/Greek)
- [ ] User authentication implementation
- [ ] Project creation and editing
- [ ] Toolkit browsing

### Phase 2: Enhanced Features
- [ ] Search and filtering
- [ ] Image upload with compression
- [ ] User profiles with privacy controls
- [ ] Project detail pages
- [ ] Infinite scroll

### Phase 3: Admin & Moderation
- [ ] Admin dashboard
- [ ] User and project moderation
- [ ] Cost monitoring and alerts

## Data Models

See `lib/dataModels.js` for detailed schema definitions:

- **User Profile**: Display name, avatar, bio, contact info, privacy settings
- **Project**: Title, description, images, tags, links, contact person
- **Toolkit**: Title, description, category, tags, resources

## Image Requirements

- **Max file size**: 2MB
- **Allowed formats**: PNG, JPEG, WebP, PDF
- **Auto-resize**: Images resized to 800px width
- **Storage**: Firebase Storage

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## Cost Estimates

Based on hundreds of users within the first year:

- **Vercel**: Free tier (sufficient for development and early launch)
- **Firebase**:
  - Firestore: ~$10-25/month
  - Storage: ~$5-15/month
  - Authentication: Free
- **SendGrid**: Free tier (100 emails/day)
- **Domain**: ~$12/year
- **Total**: ~$200-500/year

## Support

For questions or issues, please open an issue on GitHub.

## License

MIT License - feel free to use this project for your own purposes.


Platforms used: https://resend.com/emails
https://vercel.com/yoryos-styls-projects/moai/
https://console.cloud.google.com/
https://console.firebase.google.com/
Hostinger
