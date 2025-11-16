# Deployment Guide for Swapy

## Quick Deployment Checklist

### ✅ Pre-Deployment

- [ ] Firebase project created
- [ ] OpenRouter API key obtained
- [ ] Environment variables configured
- [ ] Firebase CLI installed (`npm i -g firebase-tools`)
- [ ] Logged into Firebase (`firebase login`)
- [ ] Vercel account created (for frontend)

---

## Step-by-Step Deployment

### 1. Firebase Backend Setup

#### A. Create Firebase Project
```bash
# Go to https://console.firebase.google.com/
# Click "Add project"
# Follow the wizard
```

#### B. Enable Services
1. **Authentication**
   - Go to Authentication → Get Started
   - Enable Email/Password sign-in method

2. **Firestore Database**
   - Go to Firestore Database → Create database
   - Start in production mode
   - Choose your region

3. **Storage**
   - Go to Storage → Get Started
   - Use default security rules for now

4. **Functions**
   - Automatically enabled when you deploy

#### C. Update Firebase Config
```bash
# Update .firebaserc with your project ID
{
  "projects": {
    "default": "your-project-id"
  }
}
```

#### D. Deploy Firebase
```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore:rules,firestore:indexes

# Deploy Storage rules
firebase deploy --only storage

# Build and deploy Functions
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

#### E. Set Function Environment Variables
```bash
firebase functions:config:set openrouter.apikey="your_openrouter_api_key"
firebase deploy --only functions
```

---

### 2. Frontend Deployment (Vercel)

#### A. Install Vercel CLI
```bash
npm i -g vercel
```

#### B. Build Check (Local)
```bash
npm run build
```

#### C. Deploy to Vercel
```bash
vercel
```

Follow the prompts:
- Link to existing project or create new
- Confirm project settings
- Deploy

#### D. Add Environment Variables in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
OPENROUTER_API_KEY=...
NEXT_PUBLIC_ALLOWED_DOMAINS=.edu,youruniversity.edu
```

#### E. Redeploy
```bash
vercel --prod
```

---

### 3. Post-Deployment Configuration

#### A. Update Firebase Auth Domain
1. Go to Firebase Console → Authentication → Settings
2. Add Authorized Domains:
   - `localhost` (for testing)
   - Your Vercel domain (e.g., `swapy.vercel.app`)
   - Custom domain (if applicable)

#### B. Test the Application
1. Visit your Vercel URL
2. Create a test account with .edu email
3. Upload a test item
4. Check Firestore to verify data is being saved
5. Test matching functionality

#### C. Monitor Logs
```bash
# Firebase Functions logs
firebase functions:log

# Vercel logs
vercel logs
```

---

## Alternative: Deploy Both on Firebase Hosting

If you prefer to host everything on Firebase:

### Build Next.js for Static Export

Update `next.config.js`:
```javascript
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
}
```

### Build and Deploy
```bash
npm run build
firebase deploy --only hosting
```

**Note:** Some Next.js features (like API routes) won't work with static export. API routes should be migrated to Firebase Cloud Functions.

---

## Environment-Specific Deployments

### Development
```bash
npm run dev
```

### Staging
```bash
# Create staging Firebase project
firebase use --add staging

# Deploy to staging
firebase deploy --only functions,firestore,storage --project staging
vercel --prod --scope your-team --name swapy-staging
```

### Production
```bash
firebase use production
firebase deploy
vercel --prod
```

---

## Security Post-Deployment

### 1. Restrict API Keys
- Go to Google Cloud Console → APIs & Services → Credentials
- Click on your API key
- Under "API restrictions", select "Restrict key"
- Enable only necessary APIs (Firebase, Storage, etc.)
- Under "Application restrictions", add your domains

### 2. Review Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 3. Set Up Budget Alerts
- Go to Google Cloud Console → Billing
- Set up budget alerts to avoid unexpected charges

### 4. Enable App Check (Optional)
- Protects backend from abuse
- Go to Firebase Console → App Check
- Register your web app
- Enable reCAPTCHA Enterprise

---

## Monitoring & Maintenance

### Firebase Console
- **Firestore Usage:** Monitor reads/writes
- **Storage Usage:** Check file uploads
- **Functions Usage:** Track invocations and errors
- **Authentication:** Monitor user growth

### Vercel Analytics
- Enable Web Analytics in Vercel dashboard
- Monitor page views, performance

### Set Up Alerts
```bash
# Firebase alerts for quota limits
# Vercel alerts for deployment failures
```

---

## Rollback Procedures

### Rollback Functions
```bash
firebase functions:log
firebase deploy --only functions
```

### Rollback Vercel
```bash
vercel rollback [deployment-url]
```

### Restore Firestore Data
Use Firebase Console → Firestore → Import/Export

---

## Cost Optimization

### Firebase Free Tier Limits
- Firestore: 50K reads/20K writes per day
- Storage: 5GB stored, 1GB/day downloads
- Functions: 2M invocations/month

### To Stay Free:
- Implement client-side caching
- Optimize Firestore queries
- Compress images before upload
- Use Firebase emulator for testing

### Upgrade Triggers
- If exceeding limits
- Need support
- Custom domain on Firebase Hosting

---

## Troubleshooting Deployment Issues

### Functions Won't Deploy
```bash
# Check Node version
node -v  # Should be 18+

# Clear cache
rm -rf functions/node_modules functions/lib
cd functions && npm install && npm run build && cd ..

# Deploy with verbose logging
firebase deploy --only functions --debug
```

### Vercel Build Failing
```bash
# Test build locally
npm run build

# Check build logs in Vercel dashboard
# Verify environment variables are set
```

### CORS Issues
Add to your API routes:
```typescript
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}
```

---

## Custom Domain Setup

### For Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### For Firebase Hosting
```bash
firebase hosting:channel:deploy production --expires 30d
```

---

## Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Firebase and Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id
```

---

## Support Contacts

- Firebase Support: https://firebase.google.com/support
- Vercel Support: https://vercel.com/support
- OpenRouter Docs: https://openrouter.ai/docs

---

**🎉 Congratulations! Your Swapy platform is now live!**

