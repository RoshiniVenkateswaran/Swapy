# ✨ Swapy UI Design System

## Overview
Swapy features a **premium, glassmorphic, futuristic dark UI** built with Next.js 14, TailwindCSS, and Framer Motion.

---

## 🎨 Design Philosophy

### Core Principles
- **Glassmorphism** - Translucent cards with blur effects
- **Dark Theme** - Deep blacks with gradient backgrounds
- **Smooth Animations** - Framer Motion throughout
- **Premium Feel** - Glows, shadows, and hover effects
- **Modern Typography** - Bold gradients and clean spacing
- **Emoji Icons** - Quick, fun, and recognizable

---

## 🎨 Color Palette

```javascript
Primary:    #4A8FFF (Electric Blue)
Accent:     #8B5CF6 (Violet Glow)
Dark:       #0D0F14 (Deep Black/Blue)
Light:      #F5F7FA (Off White)
Success:    #2ECC71 (Green)
Warning:    #F5A623 (Orange)
```

### Gradients
- **Primary Gradient**: `linear-gradient(135deg, #4A8FFF 0%, #8B5CF6 100%)`
- **Dark Background**: `linear-gradient(135deg, #0D0F14 0%, #1a1d29 100%)`
- **Glow Gradient**: `rgba(74, 143, 255, 0.2) → rgba(139, 92, 246, 0.2)`

---

## 🧩 Component Library

### 1. **GlassCard** (`/components/ui/GlassCard.tsx`)
- Translucent background with blur
- Optional hover effects and glow
- Rounded-3xl corners
- Used everywhere for content containers

**Usage:**
```tsx
<GlassCard hover glow>
  Content here
</GlassCard>
```

---

### 2. **ActionButton** (`/components/ui/ActionButton.tsx`)
- **Variants**: primary, accent, success, ghost
- **Sizes**: sm, md, lg
- Gradient backgrounds with hover scale
- Loading state with spinner

**Usage:**
```tsx
<ActionButton variant="primary" size="lg" loading={false}>
  Click Me
</ActionButton>
```

---

### 3. **GradientBadge** (`/components/ui/GradientBadge.tsx`)
- Small pill-shaped badges
- **Variants**: primary, accent, success, warning
- Optional glow effect
- Used for status indicators

**Usage:**
```tsx
<GradientBadge variant="success" glow>
  ✅ Verified
</GradientBadge>
```

---

### 4. **UploadDropzone** (`/components/ui/UploadDropzone.tsx`)
- Drag & drop file upload
- Animated hover states
- File size validation
- Preview support

**Usage:**
```tsx
<UploadDropzone 
  onFileSelect={(file) => handleFile(file)}
  maxSize={5 * 1024 * 1024}
/>
```

---

### 5. **MatchCard** (`/components/ui/MatchCard.tsx`)
- Displays trade matches
- Fair Trade Score badge
- Condition score progress bar
- Value comparison
- Action buttons

**Usage:**
```tsx
<MatchCard
  itemName="Calculus Textbook"
  itemImage="/image.jpg"
  fairTradeScore={85}
  condition={8}
  estimatedValue={50}
  yourItemValue={45}
  onAccept={() => {}}
  onViewDetails={() => {}}
/>
```

---

### 6. **MultiHopNode** (`/components/ui/MultiHopNode.tsx`)
- Visualizes multi-hop trade chains
- Shows item image and user
- Animated arrows between nodes

**Usage:**
```tsx
<MultiHopNode
  itemName="Laptop"
  itemImage="/laptop.jpg"
  userName="John"
  index={0}
  total={3}
/>
```

---

### 7. **FloatingButton** (`/components/ui/FloatingButton.tsx`)
- Fixed position FAB
- Positions: bottom-right, bottom-left, bottom-center
- Scale animations on hover

**Usage:**
```tsx
<FloatingButton onClick={() => router.push('/upload')}>
  ➕
</FloatingButton>
```

---

### 8. **PageTransition** (`/components/ui/PageTransition.tsx`)
- Wraps page content
- Fade + slide animations
- Used on every page

**Usage:**
```tsx
<PageTransition>
  <YourPageContent />
</PageTransition>
```

---

### 9. **Navbar** (`/components/Navbar.tsx`)
- Fixed top navigation
- Glassmorphic background
- Active link highlighting
- User profile display
- Responsive mobile menu

---

## 📄 Page Designs

### **1. Landing Page** (`/app/page.tsx`)
- Hero section with animated logo
- Gradient text title
- Feature cards grid (4 cards)
- Stats section
- Animated background circles
- CTA buttons (Get Started, Login)

---

### **2. Dashboard** (`/app/dashboard/page.tsx`)
- Welcome message with user name
- 3 stat cards (Active Items, Pending, Completed)
- 4 action cards:
  - 📤 Upload Item
  - 🤝 Find Matches
  - 🗺️ Campus Heatmap
  - 🔄 My Trades
- Feature highlight section
- Floating upload button

---

### **3. Upload Item** (`/app/upload/page.tsx`)
- **Two-Panel Layout:**
  - **Left**: Upload form
    - Drag & drop image zone
    - Item name & description inputs
    - Desired category chips
    - Submit button
  - **Right**: AI Analysis Preview
    - Category badge
    - Condition score (animated bar)
    - Estimated value
    - Keywords display
    - Success indicator

---

### **4. Matches** (`/app/matches/page.tsx`)
- Item selector (horizontal scroll)
- **Section 1**: Direct Matches
  - Grid of MatchCards
  - Fair Trade Score badges
  - Accept/View Details buttons
- **Section 2**: Multi-Hop Trades
  - Trade cycle visualization
  - Chain Fairness Score
  - Animated arrows between nodes
  - Initiate Trade button

---

### **5. Heatmap** (`/app/heatmap/page.tsx`)
- Rotating map emoji animation
- Legend (High Demand, Balanced, Over Supply)
- Category bars with:
  - Category icon
  - Status badge
  - Supply bar (blue gradient)
  - Demand bar (color-coded)
  - Hover insights
- Summary CTA card

---

### **6. My Trades** (`/app/trades/page.tsx`)
- Tab selector (Pending / Completed)
- Trade cards showing:
  - Status badge
  - Your item image
  - ⇅ Animated arrow
  - Their item image
  - Accept/Reject buttons (if pending)
  - Success message (if completed)
- Stats summary (Total, Pending, Completed)

---

## 🎬 Animations

### Framer Motion Patterns

**Card Entry:**
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.2 }}
```

**Hover Scale:**
```tsx
whileHover={{ scale: 1.05, y: -5 }}
whileTap={{ scale: 0.95 }}
```

**Float Animation:**
```tsx
animate={{ y: [0, -10, 0] }}
transition={{ duration: 2, repeat: Infinity }}
```

**Progress Bar:**
```tsx
initial={{ width: 0 }}
animate={{ width: `${percent}%` }}
transition={{ duration: 1, delay: 0.3 }}
```

**Rotate Loop:**
```tsx
animate={{ rotate: 360 }}
transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
```

---

## 🎨 Utility Classes

### Glassmorphism
```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Glow Effects
```css
.glow-primary {
  box-shadow: 0 0 20px rgba(74, 143, 255, 0.5);
}

.glow-accent {
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
}
```

### Gradient Text
```css
.gradient-text {
  background: linear-gradient(135deg, #4A8FFF 0%, #8B5CF6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## 📱 Responsive Design

- **Mobile First**: All components are mobile-responsive
- **Breakpoints**:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px

### Grid Patterns
```tsx
// 1 column mobile, 2 tablet, 3/4 desktop
grid-cols-1 md:grid-cols-2 lg:grid-cols-3
grid-cols-1 md:grid-cols-2 lg:grid-cols-4
```

---

## 🚀 Performance

- **Lazy Loading**: Images use Next.js `<Image />`
- **Code Splitting**: Components imported dynamically
- **Optimized Animations**: GPU-accelerated transforms
- **Debounced Inputs**: Search and filters debounced
- **Memoization**: Heavy computations memoized

---

## 🎯 Best Practices

1. **Always wrap pages** with `<PageTransition>`
2. **Use GlassCard** for all content containers
3. **Add hover effects** to interactive elements
4. **Include emojis** for quick visual recognition
5. **Animate on entry** with staggered delays
6. **Use gradient text** for emphasis
7. **Add glow effects** to primary actions
8. **Keep spacing consistent** (p-6, gap-6, mb-6)
9. **Use rounded-3xl** for cards, rounded-xl for buttons
10. **Include loading states** for async operations

---

## 🎨 Icon System

We use **emojis as icons** throughout:

| Purpose | Emoji |
|---------|-------|
| Upload | 📤 |
| Matches | 🤝 |
| Heatmap | 🗺️ |
| Trades | 🔄 |
| Items | 📦 |
| Success | ✅ |
| Warning | ⚠️ |
| Fire/Hot | 🔥 |
| AI/Robot | 🤖 |
| Star | ⭐ |
| Chart | 📊 |
| Lock | 🔒 |
| User | 👤 |

---

## 🌟 Special Effects

### Animated Background
```tsx
<div className="absolute inset-0 overflow-hidden">
  <motion.div
    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
    transition={{ duration: 8, repeat: Infinity }}
    className="w-96 h-96 bg-primary/20 rounded-full blur-3xl"
  />
</div>
```

### Glowing Badge
```tsx
<GradientBadge variant="primary" glow>
  ⭐ 95% Fair
</GradientBadge>
```

### Hover Glow Card
```tsx
<GlassCard hover glow className="group">
  <h3 className="group-hover:gradient-text">Title</h3>
</GlassCard>
```

---

## ✅ Completed Features

- ✅ Glassmorphic design system
- ✅ Dark theme with gradients
- ✅ Full component library
- ✅ Animated navbar
- ✅ Premium landing page
- ✅ Dashboard with stats
- ✅ Two-panel upload page
- ✅ Matches page with visualizations
- ✅ Animated heatmap
- ✅ Trades page with tabs
- ✅ Page transitions
- ✅ Mobile responsive
- ✅ Hover effects everywhere
- ✅ Loading states
- ✅ Error handling

---

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install framer-motion
   ```

2. **Import components:**
   ```tsx
   import GlassCard from '@/components/ui/GlassCard';
   import ActionButton from '@/components/ui/ActionButton';
   import PageTransition from '@/components/ui/PageTransition';
   ```

3. **Wrap your page:**
   ```tsx
   export default function MyPage() {
     return (
       <PageTransition>
         <div className="min-h-screen">
           <Navbar />
           <GlassCard>Content</GlassCard>
         </div>
       </PageTransition>
     );
   }
   ```

---

## 🎉 Result

**Your UI is now:**
- 🌟 Ultra-modern and premium
- ✨ Animated and delightful
- 🎨 Glassmorphic and futuristic
- 📱 Fully responsive
- 🚀 Production-ready

**It looks like a mix of:**
- Linear.app (clean, modern)
- Apple UI (premium, polished)
- Pinterest (card-based layout)
- Futuristic AI panels (glows, gradients)

---

**🎊 Hackathon-Winning Design Complete!** 🏆

