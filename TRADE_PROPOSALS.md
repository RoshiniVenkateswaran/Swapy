# 🤝 Trade Proposals - How It Works

## What Happens When You Click "Propose Trade"

### **1-to-1 Trade Proposal Flow:**

```
User A clicks "Propose Trade" on User B's item
    ↓
Confirmation dialog appears
    ↓
API creates trade document in Firestore
    ↓
Trade status = 'pending'
    ↓
User B sees proposal in /trades page
    ↓
User B can Accept or Decline
```

---

## 🔄 Multi-hop Trade Proposal Flow:

```
User A clicks "Propose Chain Trade" on a multi-hop cycle
    ↓
Confirmation dialog shows all users involved
    ↓
API creates trade document with chain data
    ↓
All users in chain are involved
    ↓
User A (proposer) auto-accepts
    ↓
Other users see proposal in /trades
    ↓
ALL users must accept for trade to complete
```

---

## 📊 Trade Document Structure

### **1-to-1 Trade:**

```typescript
{
  type: '1-to-1',
  status: 'pending',          // pending | accepted | declined | completed | cancelled
  proposerId: 'user_a_id',
  item1Id: 'item_a_id',
  item2Id: 'item_b_id',
  item1UserId: 'user_a_id',
  item2UserId: 'user_b_id',
  usersInvolved: ['user_a_id', 'user_b_id'],
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

### **Multi-hop Trade:**

```typescript
{
  type: 'multi-hop',
  status: 'pending',
  proposerId: 'user_a_id',
  chainData: {
    items: [
      { itemId, name, imageUrl, estimatedValue, userId },
      { itemId, name, imageUrl, estimatedValue, userId },
      { itemId, name, imageUrl, estimatedValue, userId },
    ],
    userIds: ['user_a_id', 'user_b_id', 'user_c_id'],
    chainLength: 3,
    chainFairnessScore: 92,
    reasoning: 'Excellent value balance, Perfect category match chain!, Simple 3-way trade',
  },
  usersInvolved: ['user_a_id', 'user_b_id', 'user_c_id'],
  acceptedBy: ['user_a_id'],    // Proposer auto-accepts
  rejectedBy: [],
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

---

## ✅ What Currently Works

### **Propose Trade (1-to-1):**
- ✅ Confirmation dialog with trade details
- ✅ Creates trade document in Firestore
- ✅ Validates both items are still available
- ✅ Shows success message
- ✅ Refreshes matches after proposal

### **Propose Chain (Multi-hop):**
- ✅ Confirmation dialog with chain info
- ✅ Creates multi-hop trade document
- ✅ Validates all items are still available
- ✅ Shows success message
- ✅ Redirects to /trades page

---

## 🔜 What's Next (Phase 3)

### **Trades Page (`/trades`):**
Currently shows basic structure, needs:
1. **Incoming Proposals** - Trades you received
2. **Outgoing Proposals** - Trades you sent
3. **Accept/Decline Buttons** - Respond to proposals
4. **Trade Status Updates** - Real-time status changes
5. **Multi-hop Acceptance** - All users must agree
6. **Item Status Updates** - Mark items as 'pending' when proposed

---

## 🎯 Current User Experience

### **After clicking "Propose Trade":**

**Confirmation Dialog:**
```
Propose trade:
Your "Calculus Textbook" for their "Wireless Mouse"?

Fairness Score: 85%
```

**On Success:**
```
✅ Trade proposal sent! The other user will be notified.
```

**On Error:**
```
❌ Failed to propose trade. Please try again.
```

### **After clicking "Propose Chain Trade":**

**Confirmation Dialog:**
```
Propose 3-way trade chain?

Fairness Score: 92%

All 3 users will be notified.
```

**On Success:**
```
✅ Multi-hop trade proposal sent to 3 users!
```

Then redirects to `/trades` page.

---

## 🧪 How to Test

### **Test 1-to-1 Proposal:**

1. **Upload items from 2 different accounts**
   - Account A: Textbook ($50)
   - Account B: Mouse ($48)

2. **Login as Account A:**
   - Go to `/matches`
   - Select Textbook
   - See Mouse in matches
   - Click "🤝 Propose Trade"
   - Confirm in dialog
   - See success message ✅

3. **Check Firestore:**
   - Go to Firebase Console
   - Open `trades` collection
   - See new document with type: '1-to-1'

4. **Login as Account B:**
   - Go to `/trades`
   - Should see pending proposal (once we update /trades page)

---

### **Test Multi-hop Proposal:**

1. **Upload items from 3 accounts:**
   - Account A: Textbook ($50) wants Electronics
   - Account B: Mouse ($48) wants Clothing
   - Account C: Hoodie ($52) wants Books

2. **Login as Account A:**
   - Go to `/matches`
   - Select Textbook
   - Click "🔄 Multi-hop" tab
   - Click "Find Multi-hop Trades"
   - See 3-way chain appear
   - Click "🚀 Propose Chain Trade"
   - Confirm in dialog
   - Redirected to `/trades` ✅

3. **Check Firestore:**
   - See new document with type: 'multi-hop'
   - See chainData with all 3 items
   - See acceptedBy: [user_a_id]

---

## 🔐 Security Features

### **Validation:**
- ✅ User must be authenticated
- ✅ Items must exist in database
- ✅ Items must have status 'available'
- ✅ No trading with yourself (different userIds)

### **Using Firebase Admin SDK:**
- ✅ Bypasses client-side security rules
- ✅ Server-side validation only
- ✅ Secure, tamper-proof
- ✅ Direct database access

---

## 🐛 Error Handling

### **Possible Errors:**

1. **"Missing item IDs"**
   - Cause: Invalid request data
   - Fix: Check API call parameters

2. **"One or both items not found"**
   - Cause: Item deleted or doesn't exist
   - Fix: Refresh matches

3. **"Items no longer available"**
   - Cause: Item already in another trade
   - Fix: Show message, suggest other matches

4. **"Failed to create trade proposal"**
   - Cause: Database error
   - Fix: Check Firebase Admin credentials

---

## 📊 Database Indexes

**Recommended Firestore indexes:**

```
Collection: trades
Fields:
  - usersInvolved (Array)
  - status (Ascending)
  - createdAt (Descending)
```

This optimizes queries like:
```typescript
trades
  .where('usersInvolved', 'array-contains', userId)
  .where('status', '==', 'pending')
  .orderBy('createdAt', 'desc')
```

---

## 🎨 UI Improvements (Future)

### **Better Confirmation Dialogs:**
Replace `confirm()` with custom modal:
- ✨ Glassmorphic design
- 📷 Show item images
- 📊 Visual fairness breakdown
- 🎬 Smooth animations

### **Toast Notifications:**
Replace `alert()` with:
- ✅ Success toasts (green)
- ❌ Error toasts (red)
- ℹ️ Info toasts (blue)
- Auto-dismiss after 3s

### **Loading States:**
- 🔄 Disable button while proposing
- 💫 Show spinner on button
- ⏳ Prevent double-clicks

---

## 🔄 Next Steps to Complete Phase 3

1. **Update `/trades` page:**
   - Fetch trades from Firestore
   - Show incoming/outgoing proposals
   - Display trade details beautifully

2. **Add Accept/Decline API:**
   - `/api/accept-trade`
   - `/api/decline-trade`
   - Update item statuses
   - Handle multi-hop logic (all must accept)

3. **Add Real-time Updates:**
   - Firestore listeners for trade changes
   - Update UI when proposal accepted/declined
   - Show notifications

4. **Item Status Management:**
   - Mark items 'pending' when proposed
   - Revert to 'available' if declined
   - Mark 'traded' when completed

5. **Notifications System:**
   - Email notifications (optional)
   - In-app notifications badge
   - Push notifications (future)

---

## 🎉 Current Progress

**Phase 2:** ✅ COMPLETE (Matching Engine + Multi-hop)
**Phase 3:** 🟡 IN PROGRESS (Trade Proposals)

**What's Done:**
- ✅ Propose Trade API
- ✅ Propose Chain API
- ✅ UI handlers connected
- ✅ Confirmation dialogs
- ✅ Success/error feedback
- ✅ Firestore trade creation

**What's Next:**
- 🔜 Update /trades page to show proposals
- 🔜 Accept/Decline functionality
- 🔜 Multi-hop acceptance logic
- 🔜 Item status management
- 🔜 Real-time updates

---

**Ready to continue?** Next up: Making the `/trades` page functional! 🚀

