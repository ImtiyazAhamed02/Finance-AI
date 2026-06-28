# 🤖 FinGenius AI — Personal Finance Advisor

> An AI-powered personal finance SaaS built with React, Node.js, Supabase, and Grok API.

![FinGenius AI](https://img.shields.io/badge/FinGenius-AI%20Finance-6366F1?style=for-the-badge)
![Grok AI](https://img.shields.io/badge/Powered%20By-Grok%20AI-06B6D4?style=for-the-badge)
![Supabase](https://img.shields.io/badge/Database-Supabase-22C55E?style=for-the-badge)

---

## ✨ Features

- 🧠 **AI Financial Advisor** — Streaming chat with Grok AI, personalized to your data
- 📊 **Interactive Charts** — Income vs expense trends, category breakdown, savings forecast
- 💸 **Expense Tracking** — Full CRUD with search, filter, sort, and pagination
- 💰 **Income Management** — Track salary, freelance, business, and other sources
- 🎯 **Savings Goals** — Create goals with progress bars and milestone celebrations
- ❤️ **Health Score** — AI-powered financial health gauge (0-100)
- 🔒 **Secure Auth** — Supabase email/password authentication
- 🌗 **Dark Mode** — Premium dark theme with glassmorphism
- 📱 **Responsive** — Works on desktop, tablet, and mobile

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)
- A [Grok API key](https://console.x.ai) from xAI

---

### Step 1 — Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and paste the contents of `supabase/schema.sql`
3. Run the SQL to create all tables, policies, and triggers
4. Go to **Project Settings → API** and copy:
   - Project URL
   - `anon` public key (for frontend)
   - `service_role` secret key (for backend)

---

### Step 2 — Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GROK_API_KEY=xai-your-grok-api-key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

```bash
npm install
npm run dev
```

Backend runs at `http://localhost:5000`

---

### Step 3 — Frontend Setup

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:5000/api
```

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## 📁 Project Structure

```
Finance AI/
├── frontend/                  # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/               # Axios API client
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Layout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Topbar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── AIInsightCard.jsx
│   │   │   ├── GoalCard.jsx
│   │   │   ├── HealthGauge.jsx
│   │   │   └── HeroScene.jsx  # Three.js 3D scene
│   │   ├── context/           # Auth context
│   │   ├── lib/               # Supabase client, utilities
│   │   ├── pages/             # Route-level pages
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Expenses.jsx
│   │   │   ├── Income.jsx
│   │   │   ├── Goals.jsx
│   │   │   ├── AIChat.jsx
│   │   │   ├── HealthScore.jsx
│   │   │   └── Settings.jsx
│   │   └── store/             # Zustand global state
│   └── vercel.json
│
├── backend/                   # Node.js + Express
│   ├── src/
│   │   ├── index.js           # Server entry point
│   │   ├── middleware/
│   │   │   └── auth.js        # JWT authentication
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── income.js
│   │   │   ├── expenses.js
│   │   │   ├── goals.js
│   │   │   ├── ai.js          # Grok AI chat + insights
│   │   │   └── dashboard.js
│   │   └── services/
│   │       ├── supabase.js    # Supabase admin client
│   │       └── grok.js        # Grok AI streaming
│   └── render.yaml
│
└── supabase/
    └── schema.sql             # Complete DB schema with RLS
```

---

## 🚀 Deployment

### Frontend → Vercel
1. Push `frontend/` to GitHub
2. Import in [Vercel](https://vercel.com)
3. Set environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL)
4. Deploy!

### Backend → Render
1. Push `backend/` to GitHub
2. Create Web Service at [Render](https://render.com)
3. Set environment variables from `render.yaml`
4. Deploy!

---

## 🔑 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| Animations | Framer Motion |
| 3D Graphics | Three.js, React Three Fiber |
| Charts | Recharts |
| State | Zustand + React Query |
| Router | React Router v6 |
| Backend | Node.js, Express |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| AI | Grok API (xAI) |

---

## 📝 License

MIT License — Built with ❤️ for India's financial future.
