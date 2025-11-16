# 🎨 Swapy Color Reference - Light Theme

## Quick Reference Guide

### Background Colors
```css
Body Background: linear-gradient(135deg, #F0F4FF 0%, #E8F0FE 100%)
Glass Cards: rgba(255, 255, 255, 0.7) with backdrop-blur
```

### Text Colors
```css
Headings:        text-gray-900  (#1a1d29)
Body Text:       text-gray-700  (#4b5563)
Secondary Text:  text-gray-600  (#6b7280)
Placeholder:     text-gray-500  (#9ca3af)
```

### Accent Colors
```css
Primary:   #4A8FFF (Blue)
Accent:    #8B5CF6 (Purple)
Success:   #2ECC71 (Green)
Warning:   #F5A623 (Orange)
Danger:    #EF4444 (Red)
```

### Interactive States
```css
Hover Glass:  hover:bg-white/50
Focus Ring:   focus:ring-2 focus:ring-primary
Active:       active:scale-95
```

### Shadows
```css
Small:   shadow-lg (0 10px 15px rgba(0,0,0,0.1))
Medium:  shadow-xl (0 20px 25px rgba(0,0,0,0.1))
Glow:    0 0 20px rgba(74,143,255,0.4)
```

---

## Usage Examples

### Glass Card
```tsx
<div className="glass rounded-3xl p-6">
  <h2 className="text-gray-900">Title</h2>
  <p className="text-gray-700">Content</p>
</div>
```

### Button
```tsx
<button className="bg-gradient-primary text-white px-6 py-3 rounded-xl shadow-lg glow-primary">
  Click Me
</button>
```

### Badge
```tsx
<span className="bg-gradient-primary text-white px-3 py-1 rounded-full text-xs">
  Badge
</span>
```

---

## Tailwind Classes

### Most Used
- `text-gray-900` - Main headings
- `text-gray-700` - Body text
- `text-gray-600` - Subtle text
- `glass` - Glassmorphic cards
- `bg-gradient-primary` - Blue-purple gradient
- `glow-primary` - Blue glow effect
- `rounded-3xl` - Large rounded corners

---

**Use this as your quick reference!** 🎨

