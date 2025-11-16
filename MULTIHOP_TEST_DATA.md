# 🔄 Multi-Hop Trade Testing Guide

## 🎯 Test Scenario: 3-Way Trade Chain

This will create a perfect multi-hop trade cycle where:
- User A → wants what User B has
- User B → wants what User C has  
- User C → wants what User A has

**Result:** A 3-way trade chain! 🔄

---

## 👥 Step 1: Create 3 Test Accounts

### **Account A:**
- **Email:** `alice@university.edu` (or any .edu)
- **Name:** Alice Smith
- **Password:** Test123!
- **Phone:** +1 (555) 111-1111
- **Address:** Dorm A, Room 101

### **Account B:**
- **Email:** `bob@university.edu`
- **Name:** Bob Johnson
- **Password:** Test123!
- **Phone:** +1 (555) 222-2222
- **Address:** Dorm B, Room 202

### **Account C:**
- **Email:** `charlie@university.edu`
- **Name:** Charlie Brown
- **Password:** Test123!
- **Phone:** +1 (555) 333-3333
- **Address:** Dorm C, Room 303

---

## 📦 Step 2: Upload Items (Creating the Chain)

### **User A (Alice) - Upload Item 1:**

**Login as:** `alice@university.edu`

**Upload:**
- **Name:** Calculus Textbook
- **Description:** Advanced Calculus textbook, 3rd edition. Perfect condition with all pages intact.
- **Category:** Books
- **Condition:** 9/10
- **Estimated Value:** $80
- **Looking for:** Electronics (important!)
- **Image:** Upload any textbook image

---

### **User B (Bob) - Upload Item 2:**

**Login as:** `bob@university.edu`

**Upload:**
- **Name:** Wireless Mouse
- **Description:** Logitech wireless mouse, works perfectly. Includes USB receiver.
- **Category:** Electronics
- **Condition:** 8/10
- **Estimated Value:** $75
- **Looking for:** Clothing (important!)
- **Image:** Upload any mouse/electronics image

---

### **User C (Charlie) - Upload Item 3:**

**Login as:** `charlie@university.edu`

**Upload:**
- **Name:** Designer Hoodie
- **Description:** Nike hoodie, size L, barely worn. Very warm and comfortable.
- **Category:** Clothing
- **Condition:** 9/10
- **Estimated Value:** $85
- **Looking for:** Books (important!)
- **Image:** Upload any hoodie/clothing image

---

## 🔄 The Chain Created:

```
Alice (Textbook) → wants Electronics → Bob has Mouse
   ↑                                         ↓
   │                                    wants Clothing
   │                                         ↓
Charlie has Hoodie ← wants Books ← Bob (Mouse) → Charlie
```

**This creates a perfect 3-way cycle!** ✅

---

## 🧪 Step 3: Test Multi-Hop Matching

### **As User A (Alice):**

1. **Login** as `alice@university.edu`
2. **Go to** `/matches`
3. **Select** "Calculus Textbook" from "Your Items"
4. **Click** "🔄 Multi-hop" tab (top right)
5. **Click** "🔄 Find Multi-hop Trades" button
6. ⏳ Wait 3-5 seconds for AI analysis
7. ✅ **Should see:** 3-way trade chain!

**Expected Result:**
```
┌─────────────────────────────────────┐
│ 🔄 3-Way Trade Chain                │
│ Fairness Score: 92%                 │
├─────────────────────────────────────┤
│ [Textbook] → [Mouse] → [Hoodie] ↺  │
│    $80         $75        $85       │
│                                     │
│ 💡 Perfect category match chain!   │
│    Excellent value balance          │
│                                     │
│ [🚀 Propose Chain Trade]           │
└─────────────────────────────────────┘
```

---

## 🎯 Step 4: Propose the Chain

1. **Click** "🚀 Propose Chain Trade"
2. **Modal appears** showing:
   - 3 People involved
   - Chain Fairness Score
   - All item details
3. **Click** "Confirm Proposal"
4. ✅ **Success!** Trade proposed to all 3 users

---

## ✅ Step 5: Accept the Chain

### **As User A (Alice) - Already Accepted:**
- ✅ Auto-accepted (you're the proposer)
- Status: "Waiting for 2 more users"

### **As User B (Bob):**
1. **Login** as `bob@university.edu`
2. **Go to** `/trades`
3. **See** pending multi-hop trade
4. **Click** "✅ Accept"
5. ✅ Status: "Waiting for 1 more user"

### **As User C (Charlie):**
1. **Login** as `charlie@university.edu`
2. **Go to** `/trades`
3. **See** pending multi-hop trade
4. **Click** "✅ Accept"
5. 🎉 **Trade Completed!** All 3 users accepted!

---

## 🎊 Step 6: Verify Completion

### **Check Contact Details:**

**All 3 users** should now see each other's contact info:

**As User A:**
- Go to `/trades` → "Completed" tab
- See contact info for Bob and Charlie
- 📧 Emails, 📱 Phones, 🏠 Addresses

**As User B:**
- See contact info for Alice and Charlie

**As User C:**
- See contact info for Alice and Bob

---

## 📊 Expected Console Logs

When you click "Find Multi-hop Trades":

```
🔄 Finding multi-hop trades for item: [itemId]
📦 Source item: Calculus Textbook
📊 Total available items: 3
🕸️ Trade graph built with 3 nodes
🔍 Found 1 potential cycles
✅ Valid multi-hop chains found: 1
```

---

## 🎯 Alternative Test Data

### **Option 2: Electronics → Sports → Books Chain**

**User A:**
- Item: Gaming Headset ($60)
- Category: Electronics
- Looking for: Sports Equipment

**User B:**
- Item: Basketball ($55)
- Category: Sports Equipment
- Looking for: Books

**User C:**
- Item: Psychology Textbook ($65)
- Category: Books
- Looking for: Electronics

---

### **Option 3: Furniture → Kitchen → Study Chain**

**User A:**
- Item: Desk Lamp ($40)
- Category: Furniture
- Looking for: Kitchen

**User B:**
- Item: Coffee Maker ($45)
- Category: Kitchen
- Looking for: Study Supplies

**User C:**
- Item: Calculator ($42)
- Category: Study Supplies
- Looking for: Furniture

---

## 🐛 Troubleshooting

### **No Multi-hop Chains Found:**

**Check:**
1. ✅ All 3 items uploaded with correct categories
2. ✅ "Looking for" categories match the chain
3. ✅ Item values are similar (within ±30%)
4. ✅ All items have status "available"

**Fix:**
- Make sure the chain is logical
- Check console for errors
- Verify item categories match desires

---

### **Error: "No items found":**

**Cause:** Not enough items in database

**Fix:** 
- Upload all 3 test items first
- Refresh the page
- Try again

---

### **Chain Not Appearing:**

**Check:**
1. All items status = "available"
2. Values are similar ($75-$85 is good)
3. Categories match the cycle
4. No items owned by same user

---

## 📝 Quick Test Checklist

- [ ] Create 3 accounts (Alice, Bob, Charlie)
- [ ] Upload Item 1: Textbook (Books → wants Electronics)
- [ ] Upload Item 2: Mouse (Electronics → wants Clothing)
- [ ] Upload Item 3: Hoodie (Clothing → wants Books)
- [ ] Login as Alice
- [ ] Go to /matches, select Textbook
- [ ] Click "Multi-hop" tab
- [ ] Click "Find Multi-hop Trades"
- [ ] See 3-way chain appear ✅
- [ ] Click "Propose Chain Trade"
- [ ] Confirm proposal
- [ ] Login as Bob → Accept trade
- [ ] Login as Charlie → Accept trade
- [ ] All 3 see completed trade with contacts ✅

---

## 🎯 Success Criteria

✅ **Multi-hop chain found** when clicking "Find Multi-hop Trades"  
✅ **Chain shows all 3 items** in correct order  
✅ **Fairness score displayed** (should be 85%+)  
✅ **Propose button works** - creates trade  
✅ **All 3 users notified** - see in /trades  
✅ **Acceptance tracking** - shows "Waiting for X more users"  
✅ **Completion works** - When all accept, status = completed  
✅ **Contact info shown** - All users see each other's details  

---

## 🚀 Ready to Test!

**Start with User A (Alice):**
1. Create account
2. Upload Calculus Textbook
3. Then create Bob and Charlie's accounts
4. Upload their items
5. Return to Alice
6. Find multi-hop trades
7. **Magic happens!** 🎉

---

**Happy Testing!** If you see the 3-way chain, it's working perfectly! 🔄✨

