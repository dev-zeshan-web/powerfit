# PowerFit AI Smart Gym Management System
## Complete Setup & Deployment Guide

---

## 📋 Project Overview

**PowerFit** is an AI-powered gym management system built as a Final Year Project (FYP). It features:
- Role-based access: Admin, Member, Trainer
- AI Fitness Assistant powered by Google Gemini (FREE)
- BMI Calculator with AI workout suggestions
- EasyPaisa payment simulation
- Real-time class booking system
- Finance & analytics dashboard for admin

---

## 🛠️ Tech Stack

| Layer      | Technology                      |
|------------|--------------------------------|
| Frontend   | React 18 + Vite                |
| Styling    | Tailwind CSS                   |
| Database   | Supabase (PostgreSQL)          |
| Auth       | Supabase Auth                  |
| AI         | Google Gemini 1.5 Flash (FREE) |
| Charts     | Recharts                       |
| Router     | React Router DOM v6            |
| Payments   | EasyPaisa (Simulated)          |

---

## ⚡ Quick Start

### Step 1 — Install Dependencies

Open VSCode terminal (`Ctrl + `` ` ``), then run:

```bash
npm install
```

If you need to install packages individually, run:

```bash
npm install @supabase/supabase-js react-router-dom react-icons react-hot-toast swiper recharts lucide-react date-fns
```

### Step 2 — Environment Variables

Create a `.env` file in the root folder (already included). Verify it contains:

```env
VITE_SUPABASE_URL=https://igvswzkpysmbnzstaacb.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_MvThGGq2QAHvONA4Pxqwaw_ONS90ONQ
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_NAYAPAY_NUMBER=0300-1234567
```

### Step 3 — Get Your FREE Gemini API Key

Follow the instructions in the section below ⬇️

### Step 4 — Setup Supabase Database

Follow the database setup section below ⬇️

### Step 5 — Run the Project

```bash
npm run dev
```

Open your browser at: **http://localhost:5173**

---

## 🤖 FREE Google Gemini API Key Setup

### Why Gemini?
- **Completely FREE** — No credit card required
- 15 requests/minute, 1,500 requests/day on free tier
- No billing account needed
- Google account required (Gmail)

### Step-by-Step Instructions

**Step 1 — Go to Google AI Studio**
```
https://aistudio.google.com/
```

**Step 2 — Sign In**
- Click **"Sign in"** with your Google/Gmail account
- Accept the Terms of Service if prompted

**Step 3 — Create API Key**
1. Click **"Get API key"** in the left sidebar
2. Click **"Create API key"**
3. Select **"Create API key in new project"**
4. Your API key will be generated instantly (looks like: `AIzaSy...`)

**Step 4 — Copy & Paste**
- Copy the key
- Open your `.env` file
- Replace `your_gemini_api_key_here` with your key:
```env
VITE_GEMINI_API_KEY=AIzaSyYourActualKeyHere
```

**Step 5 — Restart Dev Server**
```bash
# Stop the server (Ctrl+C), then restart:
npm run dev
```

### Gemini Free Tier Limits
| Limit        | Free Tier         |
|-------------|-------------------|
| Requests/min | 15                |
| Requests/day | 1,500             |
| Tokens/min   | 1,000,000         |
| Cost         | $0.00 (FREE)      |

### ⚠️ Important Notes
- Never commit your API key to GitHub
- The `.env` file is in `.gitignore` by default
- If you exceed free limits, wait 1 minute or the next day

---

## 🗄️ Supabase Database Setup

### Step 1 — Access Your Supabase Project
1. Go to: **https://supabase.com**
2. Sign in with your account
3. Open project: `igvswzkpysmbnzstaacb`

### Step 2 — Run the SQL Schema

1. In your Supabase dashboard, click **"SQL Editor"** in the left menu
2. Click **"New Query"**
3. Open the file: `supabase/schema.sql` from this project
4. Copy the **entire contents** and paste into the SQL Editor
5. Click **"Run"** (or press `Ctrl+Enter`)

This will create:
- ✅ All tables (profiles, plans, memberships, payments, classes, bookings, reviews, etc.)
- ✅ Row Level Security (RLS) policies
- ✅ Sample data (plans, classes, reviews)
- ✅ Auto-profile trigger on registration

### Step 3 — Verify Tables
Go to **Table Editor** in Supabase sidebar. You should see:
- `profiles`
- `plans` (with 3 default plans)
- `memberships`
- `payments`
- `classes` (with 6 sample classes)
- `class_bookings`
- `reviews`
- `trainer_profiles`
- `ai_conversations`

### Step 4 — Enable Email Auth
1. Go to **Authentication → Providers**
2. Make sure **Email** provider is enabled
3. For development, disable email confirmation:
   - Go to **Authentication → Email Templates**
   - Or go to **Authentication → Settings → Disable email confirmations**

---

## 👥 Demo Accounts Setup

After running the SQL schema, create these accounts manually in Supabase:

### Method 1 — Register through the website
Go to `/register` and create accounts. Then manually set the role in Supabase:

1. Go to **Table Editor → profiles**
2. Find the user
3. Change `role` column to `admin`, `member`, or `trainer`

### Method 2 — Supabase Auth Dashboard
1. Go to **Authentication → Users**
2. Click **"Add user"**
3. Create users with these emails:

| Email                  | Password    | Role    |
|------------------------|-------------|---------|
| admin@powerfit.pk      | admin123    | admin   |
| trainer@powerfit.pk    | trainer123  | trainer |
| member@powerfit.pk     | member123   | member  |

4. After creation, go to **Table Editor → profiles** and set the correct `role` for each.

---

## 💰 EasyPaisa Payment Flow

The payment system is **simulated** (no real money transferred). Here's how it works:

### Member Flow:
1. Member goes to **Plans** page
2. Clicks any plan card
3. A payment modal opens showing:
   - EasyPaisa account number to send money to
   - Amount to pay
4. Member (pretends to) send money via their EasyPaisa app
5. Member enters their **Transaction ID** in the form
6. Clicks **Submit Payment**
7. Payment is recorded with status `pending`

### Admin Flow:
1. Admin logs into dashboard
2. Goes to **Pending Payments** tab
3. Sees all pending payments with transaction IDs
4. Admin verifies the transaction manually in their EasyPaisa account
5. Clicks **Verify** button
6. Membership is automatically activated for the member

### To Change EasyPaisa Number:
Edit `.env` file:
```env
VITE_NAYAPAY_NUMBER=0300-YOUR-NUMBER
```

---

## 🏗️ Project Structure

```
powerfit-fyp/
├── public/
├── src/
│   ├── components/
│   │   ├── AIChat.jsx          # Floating + inline AI chat
│   │   ├── BMICalculator.jsx   # BMI + AI workout suggestions
│   │   ├── Footer.jsx
│   │   ├── Logo.jsx            # SVG logo
│   │   ├── Navbar.jsx
│   │   ├── PaymentModal.jsx    # EasyPaisa 3-step flow
│   │   ├── ProtectedRoute.jsx  # Role-based route guard
│   │   └── ReviewSlider.jsx    # Auto-play review slider
│   ├── context/
│   │   ├── AuthContext.jsx     # Auth + user role
│   │   └── ThemeContext.jsx    # Dark/light mode
│   ├── dashboards/
│   │   ├── AdminDashboard.jsx  # Finance, members, payments
│   │   ├── MemberDashboard.jsx # Classes, membership, reviews
│   │   └── TrainerDashboard.jsx # Schedule, booked members
│   ├── lib/
│   │   ├── gemini.js           # Gemini AI integration
│   │   └── supabase.js         # Supabase client
│   ├── pages/
│   │   ├── About.jsx
│   │   ├── AIFeatures.jsx
│   │   ├── Classes.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Plans.jsx
│   │   ├── Register.jsx
│   │   └── Trainers.jsx
│   ├── App.jsx                 # Routes
│   ├── index.css               # Global styles + CSS vars
│   └── main.jsx                # Entry point
├── supabase/
│   └── schema.sql              # Full DB schema + RLS
├── .env                        # Environment variables
├── .env.example                # Template
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🎨 Design System

### Color Palette
| Token        | Value       | Usage               |
|-------------|-------------|---------------------|
| brand-500    | #FF6B00     | Primary orange      |
| dark-900     | #0f0f1a     | Darkest background  |
| dark-800     | #1a1a2e     | Sidebar background  |
| dark-700     | #16213e     | Cards in dark mode  |

### Fonts
- **Bebas Neue** — Hero headings, display text
- **Oswald** — Section headings, labels
- **Nunito** — Body text, descriptions

### Dark Mode
Toggle via the moon/sun icon in the navbar. Preference is saved to `localStorage`.

---

## 📱 Pages & Routes

| Route              | Page           | Access      |
|--------------------|----------------|-------------|
| `/`                | Home           | Public      |
| `/about`           | About          | Public      |
| `/classes`         | Classes        | Public      |
| `/plans`           | Plans          | Public      |
| `/trainers`        | Trainers       | Public      |
| `/ai-features`     | AI Features    | Public      |
| `/login`           | Login          | Public      |
| `/register`        | Register       | Public      |
| `/dashboard/admin`   | Admin Dashboard | Admin only  |
| `/dashboard/member`  | Member Dashboard | Member only |
| `/dashboard/trainer` | Trainer Dashboard | Trainer only |

---

## 🔐 Security & RLS Policies

All Supabase tables have Row Level Security enabled:

| Table         | Read              | Write              |
|--------------|-------------------|--------------------|
| profiles      | Own + admin       | Own + admin        |
| memberships   | Own + admin       | Admin only         |
| payments      | Own + admin       | Member (insert)    |
| classes       | All               | Admin only         |
| class_bookings| Own + admin/trainer| Member (insert)   |
| reviews       | All               | Authenticated      |

---

## 🚀 Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder. Deploy to:
- **Vercel** (recommended): `vercel deploy`
- **Netlify**: Drag & drop `dist/` folder
- **GitHub Pages**: Configure in repo settings

### Environment Variables for Deployment
Add these in your hosting platform's settings:
```
VITE_SUPABASE_URL=https://igvswzkpysmbnzstaacb.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_MvThGGq2QAHvONA4Pxqwaw_ONS90ONQ
VITE_GEMINI_API_KEY=your_key_here
VITE_NAYAPAY_NUMBER=0300-1234567
```

---

## 🐛 Troubleshooting

### "Supabase connection failed"
- Check `.env` file values are correct
- Make sure there are no spaces around `=`
- Restart dev server after changing `.env`

### "Gemini API not responding"
- Verify API key in `.env`
- Check you haven't exceeded free tier limits (15 req/min)
- Try a different browser / clear cache

### "Login not working"
- Make sure the SQL schema was run in Supabase
- Check if email confirmation is disabled in Supabase Auth settings
- Verify the user exists in Authentication → Users

### "Classes not showing"
- Run the full `schema.sql` which includes sample class data
- Check Supabase Table Editor to confirm `classes` table has rows

### "Dashboard shows blank / redirect loop"
- Make sure the user profile has a `role` set in the `profiles` table
- Default role after registration is `member`

---

## 📊 AI Features

### What AI Can Do
1. **Fitness Chat** — Ask any fitness question
2. **Workout Plans** — Personalized based on BMI & goals
3. **Diet Advice** — Nutrition tips based on health data
4. **Progress Analysis** — Interpretation of fitness metrics

### Prompt Examples for Testing
- "Create a 4-week workout plan for a beginner"
- "What should I eat to lose 5kg in 2 months?"
- "I have a BMI of 27. What exercises should I do?"
- "How many calories do I need daily?"

---

## 📦 All NPM Packages

```bash
# Core packages (run this single command)
npm install @supabase/supabase-js react-router-dom react-icons react-hot-toast swiper recharts lucide-react date-fns
```

| Package              | Version  | Purpose                     |
|---------------------|----------|-----------------------------|
| @supabase/supabase-js | ^2.x   | Database & Auth             |
| react-router-dom     | ^6.x     | Client-side routing         |
| react-icons          | ^5.x     | Icon library                |
| react-hot-toast      | ^2.x     | Toast notifications         |
| swiper               | ^11.x    | Review slider               |
| recharts             | ^2.x     | Charts & graphs             |
| lucide-react         | ^0.x     | Additional icons            |
| date-fns             | ^3.x     | Date formatting             |

---

## 🎓 FYP Evaluation Criteria Met

| Criteria                    | How Met                                          |
|-----------------------------|--------------------------------------------------|
| Innovation & Originality    | AI + Gym management fusion, EasyPaisa integration|
| AI/ML Usage                 | Gemini AI for workouts, diet, BMI analysis       |
| Modern Technology           | React, Supabase, Cloud DB, REST APIs             |
| Real-World Problem Solving  | Gym owners managing members, payments digitally  |
| Measurable Contribution     | Working prototype with full CRUD & analytics     |
| Clarity & Presentability    | Modern UI, professional design, mobile responsive|
| R&D Potential               | Can add IoT sensors, ML models, wearable sync    |

---

## 👨‍💻 Developer Notes

- All images sourced from **Pexels.com** (royalty-free)
- No real payments are processed (EasyPaisa is simulated)
- Gemini AI responses may vary; not medical advice
- For production, replace Supabase anon key with proper RLS

---

*PowerFit AI Smart Gym Management System — Final Year Project*  
*Built with React + Vite + Tailwind + Supabase + Gemini AI*
