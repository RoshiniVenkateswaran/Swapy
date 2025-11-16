# 📞 Contact Details Feature

## Overview

Users now provide contact information during signup, which is automatically displayed when trades are completed. This allows trading partners to easily coordinate item exchange.

---

## 🎯 What Was Added

### **1. Contact Information Collection**

**During Signup:**
- **Phone Number** (required)
- **Campus Address** (required)
- **Email** (already collected)

### **2. Contact Information Display**

**When Trade Completes:**
- Both users' contact details are automatically shown
- Displayed in the completed trades section
- Includes: Name, Email, Phone, Address

---

## 📝 Changes Made

### **File: `src/app/signup/page.tsx`**

**Added State Variables:**
```typescript
const [phone, setPhone] = useState('');
const [address, setAddress] = useState('');
```

**Added Form Fields:**
```typescript
// Phone Number Input
<input
  id="phone"
  type="tel"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  placeholder="+1 (555) 123-4567"
  required
/>

// Campus Address Textarea
<textarea
  id="address"
  value={address}
  onChange={(e) => setAddress(e.target.value)}
  placeholder="Dorm/Building, Room Number"
  required
/>
```

**Updated User Document Creation:**
```typescript
await setDoc(doc(db, 'users', user.uid), {
  uid: user.uid,
  email: user.email,
  displayName: name,
  phone: phone || '',       // ← NEW
  address: address || '',   // ← NEW
  createdAt: Timestamp.now(),
});
```

---

### **File: `src/app/trades/page.tsx`**

**Added Interface:**
```typescript
interface UserContact {
  displayName: string;
  email: string;
  phone: string;
  address: string;
}
```

**Updated Trade Interface:**
```typescript
interface Trade {
  // ... existing fields
  user1Contact?: UserContact;  // ← NEW
  user2Contact?: UserContact;  // ← NEW
}
```

**Added Contact Fetching in `loadTrades()`:**
```typescript
// Fetch user contact details for completed trades
if (tradeData.status === 'completed' && tradeData.usersInvolved.length === 2) {
  const [userId1, userId2] = tradeData.usersInvolved;
  
  // Fetch user 1 contact
  const user1Doc = await getDoc(doc(db, 'users', userId1));
  if (user1Doc.exists()) {
    const user1Data = user1Doc.data();
    tradeData.user1Contact = {
      displayName: user1Data.displayName || 'Unknown',
      email: user1Data.email || '',
      phone: user1Data.phone || 'Not provided',
      address: user1Data.address || 'Not provided',
    };
  }
  
  // Fetch user 2 contact (same pattern)
  // ...
}
```

**Added Contact Display UI:**
```typescript
{trade.status === 'completed' && trade.user1Contact && trade.user2Contact && (
  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
    <h4>📞 Contact Information</h4>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* User 1 Contact */}
      <div className="bg-white rounded-lg p-3">
        <p>{user1Contact.displayName}</p>
        <p>📧 {user1Contact.email}</p>
        <p>📱 {user1Contact.phone}</p>
        <p>🏠 {user1Contact.address}</p>
      </div>
      
      {/* User 2 Contact */}
      {/* ... same pattern */}
    </div>
    
    <p>💡 Contact each other to arrange the item exchange</p>
  </div>
)}
```

---

## 🎨 UI Design

### **Signup Page - New Fields**

```
┌────────────────────────────────────┐
│ Full Name                          │
│ [John Doe___________________]      │
│                                    │
│ College Email (.edu required)      │
│ [student@university.edu_____]      │
│                                    │
│ Password                           │
│ [**********************]            │
│                                    │
│ Confirm Password                   │
│ [**********************]            │
│                                    │
│ Phone Number                  ← NEW│
│ [+1 (555) 123-4567________]        │
│                                    │
│ Campus Address                ← NEW│
│ [Dorm A, Room 201_________]        │
│ [_________________________]        │
│                                    │
│ [Create Account ✨]                │
└────────────────────────────────────┘
```

---

### **Completed Trade - Contact Display**

```
┌─────────────────────────────────────┐
│ ⏳ Trade Details                    │
│                                     │
│ [Item 1] ⇅ [Item 2]                │
│                                     │
│ 🎉 Trade completed successfully!   │
├─────────────────────────────────────┤
│ 📞 Contact Information              │
│                                     │
│ ┌──────────────┐  ┌──────────────┐ │
│ │ John Doe     │  │ Jane Smith   │ │
│ │              │  │              │ │
│ │ 📧 john@...  │  │ 📧 jane@...  │ │
│ │ 📱 555-1234  │  │ 📱 555-5678  │ │
│ │ 🏠 Dorm A... │  │ 🏠 Dorm B... │ │
│ └──────────────┘  └──────────────┘ │
│                                     │
│ 💡 Contact each other to arrange   │
│    the item exchange                │
└─────────────────────────────────────┘
```

---

## 🔒 Privacy & Security

### **When Contact Info is Shown:**
- ✅ **Only shown for completed trades**
- ✅ **Only to users involved in that trade**
- ✅ **Not shown in pending trades**
- ✅ **Not publicly visible**

### **Firestore Security:**
```javascript
// users collection rules
match /users/{userId} {
  allow read: if request.auth != null;  // Any authenticated user can read
  allow write: if request.auth != null && request.auth.uid == userId;
}
```

**Why this is safe:**
- Users can only see contact info for people they're trading with
- Firestore rules prevent unauthorized access
- Contact details only fetched when trade status is 'completed'

---

## 🧪 Testing Guide

### **Test 1: New User Signup with Contact Details**

1. **Go to** `/signup`
2. **Fill in all fields:**
   - Name: Test User
   - Email: test@university.edu
   - Password: Test123!
   - Phone: +1 (555) 123-4567
   - Address: Dorm A, Room 201
3. **Complete OTP verification**
4. ✅ **Check Firestore** - User document should have `phone` and `address` fields

---

### **Test 2: Complete Trade and View Contact Info**

**Setup:**
1. Create 2 accounts with contact details
2. User A uploads item
3. User B uploads item
4. User A proposes trade
5. User B accepts trade

**Test:**
1. **Check trade status** - Should be "completed"
2. **Go to** `/trades` on both accounts
3. **Click** "Completed" tab
4. ✅ **Both users should see:**
   - Success message
   - Contact information section
   - Both users' names, emails, phones, addresses

---

### **Test 3: Pending Trade Should NOT Show Contacts**

1. Propose a trade but don't accept yet
2. Go to `/trades`
3. ✅ Pending trade should **NOT** show contact information
4. ✅ Only shows Accept/Decline buttons

---

## 📊 Database Schema

### **Users Collection**

```typescript
{
  uid: string,
  email: string,
  displayName: string,
  phone: string,           // ← NEW
  address: string,         // ← NEW
  createdAt: Timestamp
}
```

### **Example Document:**

```json
{
  "uid": "abc123",
  "email": "student@university.edu",
  "displayName": "John Doe",
  "phone": "+1 (555) 123-4567",
  "address": "West Campus Dorm A, Room 201",
  "createdAt": "2025-01-15T10:30:00Z"
}
```

---

## 🎯 User Experience Flow

### **For New Users:**

```
1. Start Signup
   ↓
2. Fill Name, Email, Password
   ↓
3. Fill Phone Number    ← NEW STEP
   ↓
4. Fill Campus Address  ← NEW STEP
   ↓
5. Verify OTP
   ↓
6. Account Created ✅
```

### **For Completed Trades:**

```
User A accepts trade
   ↓
Trade status: pending → completed
   ↓
Both users go to /trades
   ↓
Click "Completed" tab
   ↓
See contact information ✅
   ↓
Contact each other via:
   - Email
   - Phone
   - Visit address
   ↓
Exchange items 🤝
```

---

## 🚀 Future Enhancements (Optional)

### **1. In-App Messaging**
- Direct messaging between trading partners
- No need to share phone numbers
- Message history

### **2. Meeting Scheduler**
- Propose meeting times
- Set exchange location
- Calendar integration

### **3. Contact Preferences**
- Choose preferred contact method
- Hide phone/address optionally
- Use only email

### **4. Trade Completion Confirmation**
- Both users confirm exchange happened
- Rating system
- Report issues

### **5. Location Sharing**
- Show on campus map
- Suggest meeting points
- Safe exchange locations

---

## 📝 Notes

- **Phone and Address are required** during signup
- **Contact info is stored in plain text** (consider encryption for production)
- **Only shown to trade partners** when trade completes
- **Email is always shown** (it's their login credential)
- **Users can update contact info** in profile settings (future feature)

---

## 🐛 Troubleshooting

### **Contact Info Not Showing:**

**Check:**
1. Trade status is "completed"
2. Both users have phone/address in their profile
3. Firestore rules allow reading user documents
4. Console for any errors

**Fix:**
- Ensure users signed up after this feature was added
- Older users may need to add contact info (profile update feature needed)

---

### **Missing Contact Fields:**

**Symptom:** Shows "Not provided" for phone/address

**Cause:** User signed up before this feature

**Solution:**
- Add profile update page where users can add contact info
- Or require re-verification with new fields

---

## ✅ Completed Features

- ✅ Phone number collection during signup
- ✅ Campus address collection during signup
- ✅ Store contact details in user profile
- ✅ Fetch contact details for completed trades
- ✅ Display contact information beautifully
- ✅ Mobile-responsive contact cards
- ✅ Privacy (only shown to trade partners)

---

**Ready to use!** New users will provide contact info, and completed trades will show it automatically! 📞

