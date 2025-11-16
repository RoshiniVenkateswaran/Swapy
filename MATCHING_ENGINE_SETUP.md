# 🧠 Matching Engine Setup Guide

## Overview

Phase 2 implements the **Matching Engine** - the core intelligence of Swapy that finds perfect trade matches using AI-powered algorithms.

---

## 🎯 What Was Built

### 1. **Match Items API** (`/api/match-items`)
- Fetches all available candidate items
- Filters out invalid matches (same user, wrong value range, etc.)
- Calculates fairness scores (0-100)
- Returns ranked 1-to-1 matches

### 2. **Fairness Score Algorithm**
Calculates match quality based on:
- **Value Similarity** (40 points) - How close the items are in estimated value
- **Condition Similarity** (20 points) - Similar wear/quality levels
- **Category Match** (25 points) - Mutual interest or category alignment
- **Keyword Similarity** (15 points) - Common features/attributes

### 3. **Matches Page UI**
- Beautiful glassmorphic design
- Select your item → See all matches
- Visual fairness scores with color coding
- Match reasoning and badges
- "Propose Trade" functionality (ready for Phase 3)

---

## 📦 Installation

### Step 1: Install Firebase Admin SDK

```bash
npm install firebase-admin --save
```

### Step 2: Get Firebase Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the **gear icon** → **Project settings**
4. Go to **Service accounts** tab
5. Click **"Generate new private key"**
6. Download the JSON file

### Step 3: Add Environment Variables

Add these to your `.env.local` file:

```bash
# Firebase Admin SDK (from service account JSON)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

**Note:** Make sure to keep the quotes around `FIREBASE_PRIVATE_KEY` and preserve the `\n` characters!

### Step 4: Update Firestore Rules

Make sure your Firestore rules allow reading items:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /items/{itemId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 🧪 Testing the Matching Engine

### 1. Upload Multiple Items

Upload at least 3-4 items with:
- Different categories
- Various estimated values
- Different condition scores
- Set "desired categories" when uploading

### 2. Go to Matches Page

```
http://localhost:3000/matches
```

### 3. Test Scenarios

**Scenario A: Perfect Match**
- Item A: $50, Condition 8/10, Category "Electronics", Wants "Books"
- Item B: $55, Condition 7/10, Category "Books", Wants "Electronics"
- Expected: **High score (80-95)** with "Mutual Interest" badge

**Scenario B: Value Mismatch**
- Item A: $100
- Item B: $30
- Expected: **Low score or filtered out** (>30% value difference)

**Scenario C: Category Match Only**
- Item A: Wants "Sports"
- Item B: Category "Sports"
- Expected: **Medium score (60-75)**, "Category Match" badge

### 4. Check Console Logs

Open browser console (F12) to see:
- `🔍 Finding matches for item: [id]`
- `📦 Source item: [name]`
- `📊 Total available items: X`
- `✅ Filtered candidates: Y`
- `🎯 Top matches found: Z`

---

## 🎛️ Configuration

You can adjust matching behavior in `/api/match-items/route.ts`:

```typescript
const CONFIG = {
  MAX_VALUE_DIFFERENCE_PERCENT: 30, // Increase to allow wider value gaps
  MIN_FAIR_TRADE_SCORE: 50,         // Lower to show more matches
  MAX_MATCHES_TO_RETURN: 20,        // Increase to show more results
};
```

---

## 🔍 How the Algorithm Works

### Filtering Stage:
```
All Items → Filter same user → Filter value difference → Filter status
```

### Scoring Stage:
```
For each candidate:
  1. Calculate value similarity (0-40 points)
  2. Calculate condition similarity (0-20 points)
  3. Check category match (0-25 points)
  4. Count common keywords (0-15 points)
  5. Sum = Fair Trade Score (0-100)
```

### Ranking Stage:
```
Sort by score → Take top N → Return to UI
```

---

## 📊 Fairness Score Breakdown

| Score Range | Quality | Color | Meaning |
|------------|---------|-------|---------|
| 80-100 | Excellent | 🟢 Green | Perfect match, highly recommended |
| 60-79 | Good | 🔵 Blue | Solid trade, fair value |
| 50-59 | Fair | 🟡 Yellow | Acceptable, minor differences |
| 0-49 | Poor | 🟠 Orange | Large gaps, not recommended |

---

## 🚀 Next Steps (Phase 3)

Once matching works, you can implement:
1. **Trade Proposals** - Send trade requests to other users
2. **Trade Status** - Accept/decline/counter-offer
3. **Multi-hop Matching** - Find A→B→C trade cycles
4. **Notifications** - Alert users of new matches
5. **Chat System** - Message before trading

---

## ❓ Troubleshooting

### "Missing or insufficient permissions"
- Check Firestore rules (above)
- Ensure Firebase Admin is initialized
- Verify environment variables are set

### "No matches found"
- Upload more items
- Check value differences (max 30%)
- Verify items have `status: 'available'`
- Check console logs for filtering details

### "Firebase Admin initialization error"
- Verify `.env.local` variables are correct
- Check private key has proper `\n` escaping
- Restart dev server after adding env vars

### "TypeError: Cannot read property..."
- Ensure all items have required fields
- Check that AI analysis completed for all items
- Verify itemId exists in database

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Matches page loads without errors
- ✅ Selecting an item shows matches
- ✅ Fairness scores make sense (similar items = high score)
- ✅ Mutual interest gets highest scores
- ✅ Console logs show filtering + scoring details

---

## 📝 API Endpoints

### POST `/api/match-items`

**Request:**
```json
{
  "itemId": "abc123",
  "userId": "user_xyz"
}
```

**Response:**
```json
{
  "success": true,
  "itemId": "abc123",
  "totalCandidates": 15,
  "totalMatches": 8,
  "matches": [
    {
      "matchId": "abc123_def456",
      "item1": { ... },
      "item2": { ... },
      "fairTradeScore": 87,
      "categoryMatch": true,
      "valueDifference": 5,
      "mutualInterest": true,
      "reasoning": "Perfect mutual interest, Similar value"
    }
  ]
}
```

---

## 🎨 UI Components

The Matches page includes:
- ✨ Glassmorphic cards with light theme
- 🎬 Smooth animations (Framer Motion)
- 🏷️ Visual badges (Mutual Interest, Category Match, etc.)
- 📊 Color-coded fairness scores
- 🖼️ Image hover zoom effects
- 📱 Responsive design (mobile + desktop)

---

## 🔐 Security Notes

- Firebase Admin has full access - only use server-side
- Never expose service account credentials client-side
- API routes run on Next.js server (secure)
- Always validate userId matches authenticated user
- Filter out user's own items to prevent self-trading

---

Happy Matching! 🎯

