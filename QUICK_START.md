# ⚡ Quick Start Guide

Get Swapy running in **10 minutes**!

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Firebase account created
- [ ] OpenRouter API key obtained
- [ ] Git installed

---

## 🚀 5-Step Setup

### Step 1: Clone & Install (2 min)

```bash
git clone <your-repo>
cd Swapy_web
npm install
cd functions && npm install && cd ..
```

### Step 2: Firebase Setup (3 min)

1. Go to https://console.firebase.google.com/
2. Create new project
3. Enable: **Authentication** (Email/Password), **Firestore**, **Storage**
4. Get config from Project Settings → Your apps

### Step 3: Environment Variables (2 min)

Create `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
OPENROUTER_API_KEY=your_openrouter_key
NEXT_PUBLIC_ALLOWED_DOMAINS=.edu
```

### Step 4: Deploy Firebase Backend (2 min)

```bash
npm install -g firebase-tools
firebase login
firebase init  # Select Firestore, Functions, Storage
firebase deploy --only firestore,storage
```

Set functions config:
```bash
firebase functions:config:set openrouter.apikey="your_key"
cd functions && npm run build && cd ..
firebase deploy --only functions
```

### Step 5: Run Development Server (1 min)

```bash
npm run dev
```

Open http://localhost:3000 🎉

---

## ✅ Verify Setup

1. Sign up with test@university.edu
2. Upload an item
3. Check Firestore (should see item)
4. View matches
5. Propose a trade

---

## 🆘 Common Issues

### "Firebase not initialized"
➡️ Check `.env.local` has all variables

### "OpenRouter API error"
➡️ Verify API key in Firebase Functions config

### "Email domain not allowed"
➡️ Add domain to `NEXT_PUBLIC_ALLOWED_DOMAINS`

### Functions not deploying
➡️ Run `cd functions && npm run build` first

---

## 📚 Next Steps

- [ ] Customize allowed domains
- [ ] Update price table in `src/lib/constants.ts`
- [ ] Add custom categories
- [ ] Deploy to Vercel (see DEPLOYMENT.md)
- [ ] Invite users to test

---

## 🎯 Production Checklist

Before going live:

- [ ] Set up custom domain
- [ ] Configure Firebase Auth domain whitelist
- [ ] Enable Firebase App Check
- [ ] Set up monitoring/alerts
- [ ] Add budget limits
- [ ] Test on mobile devices
- [ ] Backup Firestore data
- [ ] Create user documentation

---

**Need help?** See README.md for detailed documentation.

