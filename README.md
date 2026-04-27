# ⚡ UpSkillX — Premium EdTech Platform

> Built by **Tanmay Tuli** · [official.tanmaytuli@gmail.com](mailto:official.tanmaytuli@gmail.com)

A full-featured, production-ready educational platform with authentication, course management, doubt system, leaderboard, streaks, and admin dashboard — deployable free on Cloudflare Pages.

---

## 🏗️ Tech Stack

| Layer | Technology | Free Tier |
|---|---|---|
| Hosting | Cloudflare Pages | ✅ Free |
| Backend API | Cloudflare Pages Functions (Workers) | ✅ Free |
| Auth | Firebase Authentication | ✅ Free |
| Database | Firebase Firestore | ✅ Free |
| Storage | Firebase Storage | ✅ Free |
| Email | SendGrid | ✅ 100/day free |
| CDN | Cloudflare | ✅ Free |

---

## 📁 Project Structure

```
upskillx/
├── public/                     ← Static frontend (Cloudflare Pages serves this)
│   ├── index.html              ← Landing page
│   ├── css/
│   │   └── main.css            ← All styles (glassmorphism, dark/light mode)
│   ├── js/
│   │   └── firebase-config.js  ← Firebase SDK initialization
│   └── pages/
│       ├── login.html          ← Auth page (Google + Email/Password)
│       ├── dashboard.html      ← Student dashboard
│       ├── course.html         ← Course viewer (lectures, notes, assignments)
│       └── admin.html          ← Admin dashboard (protected)
├── functions/                  ← Cloudflare Pages Functions (server-side)
│   └── api/
│       ├── admin-auth.js       ← Secure admin credential validation
│       ├── send-email.js       ← Bulk email to enrolled students
│       └── notify-students.js  ← Auto-notify on new content upload
├── .github/
│   └── workflows/
│       └── deploy.yml          ← GitHub Actions auto-deploy
├── firestore.rules             ← Firebase security rules
├── wrangler.toml               ← Cloudflare config
├── .env.example                ← Environment variables template
└── README.md
```

---

## 🚀 Deployment Guide (Step by Step)

### Step 1 — Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add Project** → name it `upskillx`
3. Enable **Google Analytics** (optional)

#### Enable Authentication
- Sidebar → **Authentication** → **Get Started**
- Enable **Google** provider
- Enable **Email/Password** provider

#### Enable Firestore
- Sidebar → **Firestore Database** → **Create database**
- Select **Start in production mode**
- Choose your region (e.g., `asia-south1` for India)

#### Enable Storage
- Sidebar → **Storage** → **Get Started**

#### Get your config
- Project Settings (gear icon) → **Your apps** → **Web app** → **Register app**
- Copy the `firebaseConfig` object values

#### Deploy Firestore Rules
```bash
# Install Firebase CLI
npm install -g firebase-tools

firebase login
firebase init firestore   # select your project
# Copy firestore.rules content, then:
firebase deploy --only firestore:rules
```

---

### Step 2 — Update Firebase Config in Code

Open `public/js/firebase-config.js` and replace all placeholder values with your actual Firebase config:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",           // ← Your API key
  authDomain: "upskillx.firebaseapp.com",
  projectId: "upskillx",
  storageBucket: "upskillx.appspot.com",
  messagingSenderId: "12345...",
  appId: "1:12345...:web:abcdef..."
};
```

---

### Step 3 — GitHub Repository

```bash
# In the upskillx/ folder:
git init
git add .
git commit -m "🚀 Initial UpSkillX deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/upskillx.git
git push -u origin main
```

---

### Step 4 — Cloudflare Pages Setup

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Pages**
2. Click **Create a project** → **Connect to Git**
3. Select your `upskillx` GitHub repository
4. Configure build settings:
   - **Framework preset:** None
   - **Build command:** *(leave empty)*
   - **Build output directory:** `public`
5. Click **Save and Deploy**

Your site will be live at: `https://upskillx.pages.dev` 🎉

---

### Step 5 — Add Environment Variables in Cloudflare

In Cloudflare Pages → **Settings** → **Environment variables** → Add:

| Variable | Value | Notes |
|---|---|---|
| `ADMIN_ID` | `admin` | Admin login ID |
| `ADMIN_PASS` | `ADMIN@2026` | Admin password (encrypted) |
| `ADMIN_SECRET` | `your_random_secret` | Token signing secret |
| `FIREBASE_API_KEY` | `AIzaSy...` | From Firebase config |
| `FIREBASE_PROJECT_ID` | `upskillx` | Your project ID |
| `SENDGRID_API_KEY` | `SG.xxx...` | From SendGrid dashboard |
| `FROM_EMAIL` | `official.tanmaytuli@gmail.com` | Sender email |
| `FROM_NAME` | `UpSkillX by Tanmay Tuli` | Sender name |

> ⚠️ Set all sensitive vars as **Encrypted**. Never expose ADMIN_PASS or SENDGRID_API_KEY in frontend code.

---

### Step 6 — Add GitHub Secrets (for auto-deploy)

GitHub repo → **Settings** → **Secrets and variables** → **Actions** → Add:

| Secret | Where to find |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens → Create Token (use "Edit Cloudflare Pages" template) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare → Right sidebar on Pages dashboard |

---

### Step 7 — SendGrid Email Setup

1. Go to [sendgrid.com](https://sendgrid.com) → create free account
2. **Settings** → **API Keys** → **Create API Key** (Full Access)
3. Add this key as `SENDGRID_API_KEY` in Cloudflare env vars
4. Verify your sender email `official.tanmaytuli@gmail.com` under **Sender Authentication**

---

## 🔐 Admin Access

The admin panel is hidden — no visible link anywhere.

**How to access:**
1. Look for a tiny ★ star in the bottom-right corner of any page
2. Click it → admin login popup appears
3. Enter credentials (validated server-side — never exposed in frontend code)
4. You're redirected to the full admin dashboard

**Default credentials (change in Cloudflare env vars):**
- ID: `admin`
- Password: `ADMIN@2026`

---

## ✨ Features

### Student Features
- 🔐 Google OAuth + Email/Password authentication
- 📚 Course browsing and enrollment
- 🎬 YouTube-embedded lecture player
- 📄 Downloadable PDF notes
- 🙋 Doubt submission system
- 💬 Community chat
- 🔥 Daily streaks tracking
- ⭐ XP points system
- 🏆 Global leaderboard
- 🎓 Certificate placeholder (unlocked at 100% completion)
- 🎁 Reward-based ad system for bonus notes
- 🌙 Dark / ☀️ Light mode toggle

### Admin Features
- 📊 Dashboard with live stats
- 👥 User management table
- 📚 Add / Edit / Delete courses
- 🎬 Upload YouTube lecture links
- 📄 Upload PDF notes links
- 📢 Post announcements
- ✉️ Email all students or per-course students
- 🔔 Auto-email on new content upload
- 🙋 View & resolve student doubts

---

## 🔧 Local Development

Since this is pure HTML/CSS/JS, just open files directly or use any static server:

```bash
# Option 1: Python
cd public && python3 -m http.server 3000

# Option 2: Node
npx serve public

# Option 3: VS Code Live Server extension
# Right-click index.html → Open with Live Server
```

> Note: Firebase auth requires a real domain or localhost. Google sign-in needs `localhost` added to Firebase Auth Authorized Domains.

---

## 📧 Contact

**Tanmay Tuli**  
Email: [official.tanmaytuli@gmail.com](mailto:official.tanmaytuli@gmail.com)  
Platform: [upskillx.pages.dev](https://upskillx.pages.dev)

---

*Built with ❤️ for learners everywhere.*
