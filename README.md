# Swapy 🎓🔄

A **campus-exclusive barter platform** where students can trade items using AI-powered matching, fair trade scoring, and multi-hop trade detection.

## 🚀 Features

- **College Email Authentication** - Only `.edu` domains allowed
- **AI Item Analysis** - Auto-categorization, condition scoring, and value estimation using Gemini 1.5 Flash
- **Smart Matching** - Fair Trade Score algorithm for 1-to-1 matches
- **Multi-Hop Trading** - BFS/DFS-based cycle detection for complex trades (A → B → C → A)
- **Heatmap Analytics** - Supply/demand visualization across categories
- **Trade Management** - Accept/decline trades with status tracking
- **Real-time Updates** - Firestore listeners for live data

## 🛠 Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TailwindCSS
- **Backend:** Firebase (Auth, Firestore, Storage, Cloud Functions)
- **AI:** OpenRouter → Gemini 1.5 Flash
- **Charts:** Recharts
- **Icons:** Lucide React
- **Hosting:** Vercel (frontend) + Firebase (backend)

## 📁 Project Structure

```
Swapy_web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   ├── dashboard/         # Main dashboard
│   │   ├── upload/            # Upload item page
│   │   ├── matches/           # View matches (single & multi-hop)
│   │   ├── my-items/          # Manage user items
│   │   ├── trades/            # Trade management
│   │   ├── heatmap/           # Analytics page
│   │   ├── community/         # Community features
│   │   └── api/               # Next.js API routes
│   ├── components/            # Reusable React components
│   └── lib/                   # Utilities, types, Firebase config
├── functions/                 # Firebase Cloud Functions
│   └── src/
│       └── index.ts          # Cloud Functions (analyzeItem, etc.)
├── firebase.json             # Firebase configuration
├── firestore.rules           # Firestore security rules
├── firestore.indexes.json    # Firestore indexes
└── storage.rules             # Storage security rules
```

## 🔧 Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- Firebase account
- OpenRouter API key (for Gemini 1.5 Flash)
- Git

### 2. Clone Repository

```bash
git clone <your-repo-url>
cd Swapy_web
```

### 3. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Firebase Functions dependencies
cd functions
npm install
cd ..
```

### 4. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Enable Firestore Database
5. Enable Storage
6. Enable Cloud Functions

**Get Firebase Config:**
- Go to Project Settings → General
- Scroll to "Your apps" → Add web app
- Copy the Firebase config object

### 5. OpenRouter Setup

1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up and get an API key
3. Ensure you have access to `google/gemini-flash-1.5` model

### 6. Environment Variables

Create `.env.local` in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# OpenRouter API
OPENROUTER_API_KEY=your_openrouter_api_key

# Allowed Email Domains
NEXT_PUBLIC_ALLOWED_DOMAINS=.edu,youruniversity.edu
```

**For Firebase Functions:**

Create `functions/.env`:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 7. Firebase CLI Setup

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Select:
# - Firestore
# - Functions
# - Storage
# - Hosting (optional)
```

### 8. Deploy Firebase Rules & Indexes

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
```

### 9. Deploy Firebase Functions

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

### 10. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

### Deploy Frontend to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables in Vercel dashboard

### Deploy Backend to Firebase

```bash
firebase deploy
```

## 🔐 Security

### Firestore Rules

- Users can only read/write their own data
- Items can be created by authenticated users only
- Trades are only visible to involved parties
- Stats are read-only for users

### Storage Rules

- Users can only upload to their own folder
- All authenticated users can read uploaded images

## 📊 Data Models

### User
```typescript
{
  userId: string
  name: string
  email: string
  campusDomain: string
  createdAt: Timestamp
}
```

### Item
```typescript
{
  itemId: string
  userId: string
  name: string
  category: string
  description: string
  desiredCategories: string[]
  conditionScore: number (0-100)
  estimatedValue: number
  imageUrl: string
  status: 'available' | 'pending' | 'traded'
  createdAt: Timestamp
}
```

### Trade
```typescript
{
  tradeId: string
  itemsInvolved: string[]
  usersInvolved: string[]
  fairnessScore: number
  tradeType: 'single' | 'multi'
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: Timestamp
}
```

### Stats
```typescript
{
  category: string
  demandCount: number
  supplyCount: number
}
```

## 🧮 Algorithms

### Fair Trade Score Calculation

```
valueSimilarity = 100 - (|valueA - valueB| / max(valueA, valueB) * 100)
conditionCompatibility = 100 - |condA - condB|
scarcityCompatibility = (min(scarcityA, scarcityB) / max(scarcityA, scarcityB)) * 100
demandAlignment = 100 if mutual interest, 50 if one-way, 0 otherwise

fairTradeScore = 0.4 * valueSimilarity +
                 0.2 * conditionCompatibility +
                 0.2 * scarcityCompatibility +
                 0.2 * demandAlignment
```

### Multi-Hop Detection

- Uses BFS/DFS to find cycles in directed graph
- Edge A → B exists if A wants something B has
- Detects cycles of length 2-4
- Calculates chain fairness as average of pair scores

## 🎯 Core Features Breakdown

### 1. Upload Item Flow
1. User uploads photo → Firebase Storage
2. Next.js calls `/api/analyze-item`
3. API calls OpenRouter → Gemini
4. AI returns category, condition, keywords
5. Backend calculates estimated value from price table
6. Item saved to Firestore
7. Stats updated

### 2. Matching Flow
1. User selects item to match
2. System fetches all available items
3. Calculates Fair Trade Score for each pair
4. Returns top 20 matches
5. User can propose trade

### 3. Multi-Hop Flow
1. Build directed graph from all items
2. Run BFS/DFS to find cycles
3. Calculate chain fairness score
4. Return top 10 cycles
5. User can propose multi-hop trade

### 4. Trade Flow
1. User proposes trade (single or multi-hop)
2. Trade record created with status "pending"
3. Other users accept/decline
4. If all accept → status "completed", items marked "traded"
5. If any decline → status "cancelled"

## 🐛 Troubleshooting

### Firebase Functions Not Working
- Check that Cloud Functions are enabled in Firebase Console
- Verify OPENROUTER_API_KEY is set in Firebase Functions config
- Check function logs: `firebase functions:log`

### Authentication Issues
- Verify Firebase config in `.env.local`
- Check that Email/Password auth is enabled in Firebase Console
- Verify allowed domains in constants

### Image Upload Failing
- Check Storage rules are deployed
- Verify Firebase Storage is enabled
- Check browser console for errors

## 📝 TODO / Future Enhancements

- [ ] Real-time chat between traders
- [ ] Push notifications for trade updates
- [ ] User reputation system
- [ ] Advanced filters for matches
- [ ] Mobile app (React Native)
- [ ] Integration with campus payment systems
- [ ] Trade history analytics
- [ ] Wishlist features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for your campus!

## 👥 Support

For issues or questions:
- Open a GitHub issue
- Contact: [your-email]

---

**Built with ❤️ for campus communities**

