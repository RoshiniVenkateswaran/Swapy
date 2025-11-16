# 📧 Email Setup Guide for Swapy

Swapy uses **Resend** to send OTP verification emails. This guide shows you how to set it up.

---

## 🚀 Quick Setup for Development (2 minutes)

> **Note:** This is for local development. Domain verification (Step 3) is only needed when you deploy to production!

### **Step 1: Create Resend Account**

1. Go to https://resend.com
2. Click **"Sign Up"** (it's free!)
3. Verify your email address

### **Step 2: Get Your API Key**

1. After logging in, go to **API Keys** in the sidebar
2. Click **"Create API Key"**
3. Name it: `Swapy Development`
4. Click **"Add"**
5. **Copy the API key** (starts with `re_...`)
   - ⚠️ You won't see it again!

### **Step 3: Add to Your Environment (Development Only)**

1. Open your `.env.local` file in the project root
2. Add these two lines:

```env
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=Swapy <onboarding@resend.dev>
```

**That's it for development!** No domain verification needed.

### **Step 4: Restart Your Dev Server**

```bash
# Stop your server (Ctrl+C if running)
# Then restart:
npm run dev
```

---

## 🌐 Production Setup (Do This Later When You Deploy)

### **Step 3: Verify Your Domain (Production Only)**

**Only needed when you deploy to production:**
1. Go to Resend Dashboard → **Domains**
2. Click **"Add Domain"**
3. Add your domain (e.g., `swapy.app`)
4. Add the DNS records Resend provides to your domain registrar
5. Wait for verification (usually 5-10 minutes)

### **Step 4: Update Environment Variables (Production)**

When deploying to Vercel/Firebase:
1. Go to your hosting platform's dashboard
2. Add environment variables:
   ```env
   RESEND_API_KEY=re_your_api_key
   RESEND_FROM_EMAIL=Swapy <noreply@yourdomain.com>
   ```
3. Redeploy

**For now, you can skip Steps 3 & 4!** Just do Steps 1-2-3 (the development setup) above.

---

## ✅ Test It!

1. Go to http://localhost:3000/signup
2. Fill in the form with your .edu email
3. Click **"Send Verification Code"**
4. Check your email inbox! 📬
5. Enter the OTP code to complete signup

---

## 🆓 Resend Free Tier

- **100 emails/day** (perfect for testing)
- **3,000 emails/month** (enough for small campus)
- No credit card required
- Ready in 2 minutes

---

## 🔄 Current Behavior (Without Email Service)

If you **don't** configure Resend:
- ✅ OTP is still generated and stored
- ✅ OTP is shown on the verification screen
- ✅ You can copy/paste the code
- ✅ Everything still works for testing

**The OTP appears in a blue box on the verification page!**

---

## 🎨 Email Template

The OTP email includes:
- ✅ Beautiful HTML design
- ✅ Large, easy-to-read OTP code
- ✅ Expiration time (10 minutes)
- ✅ Swapy branding
- ✅ Plain text fallback

---

## 🔧 Alternative Email Services

If you prefer other services, here's how to switch:

### **Option 1: SendGrid**

Update `src/app/api/send-otp/route.ts`:

```typescript
// Replace Resend code with:
await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    personalizations: [{ to: [{ email }] }],
    from: { email: 'noreply@yourdomain.com', name: 'Swapy' },
    subject: 'Your Swapy Verification Code',
    content: [
      { type: 'text/html', value: htmlContent },
    ],
  }),
});
```

### **Option 2: AWS SES**

Similar setup, use AWS SDK

### **Option 3: Mailgun**

Similar API pattern

---

## 🐛 Troubleshooting

### **"Email not sending"**

1. Check your `.env.local` has `RESEND_API_KEY`
2. Verify API key is correct (no spaces, full key)
3. Restart your dev server after adding env variable
4. Check Resend dashboard for errors

### **"API key invalid"**

1. Copy the key again from Resend dashboard
2. Make sure there are no spaces
3. Key should start with `re_`

### **"Domain not verified"**

- For development: Use `onboarding@resend.dev` (already verified)
- For production: Complete domain verification in Resend

### **Emails going to spam**

1. Verify your domain with Resend
2. Add SPF/DKIM records
3. Use a custom domain for `from` address

---

## 📊 Monitor Email Delivery

1. Go to Resend Dashboard → **Logs**
2. See all sent emails
3. Check delivery status
4. View any errors

---

## 🎯 For Production Deployment

### **Vercel:**

1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add:
   - `RESEND_API_KEY` = your key
   - `RESEND_FROM_EMAIL` = `Swapy <noreply@yourdomain.com>`
4. Redeploy

### **Firebase Hosting:**

Add to your environment configuration

---

## 💡 Pro Tips

1. **Development:** Use Resend's test domain (`onboarding@resend.dev`)
2. **Production:** Verify your own domain for better deliverability
3. **Testing:** OTP still appears on screen if email fails (for development)
4. **Monitoring:** Check Resend logs weekly to ensure delivery
5. **Backup:** Keep API key secure, never commit to Git

---

## 🎉 That's It!

Once you add `RESEND_API_KEY` to your `.env.local`, emails will start sending automatically!

**Need help?** Check Resend docs: https://resend.com/docs

---

**Happy Email Sending! 📧✨**

