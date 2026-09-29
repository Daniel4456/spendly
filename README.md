# Spendly — Take Control of Your Money

> A production-ready, modern, responsive personal expense and income tracking web application built with React, Vite, TypeScript, Tailwind CSS, Lucide icons, Recharts, and Firebase.

![Spendly Logo](/public/logo.svg)

---

## 🌟 Overview

**Spendly** is crafted for everyday users who desire a modern, fast, and intuitive fintech experience to track income, log expenses, manage category budgets, and monitor cash flow without clutter or steep learning curves.

It combines dark-first aesthetics (with complete light mode support), dynamic financial analytics, real-time calculations, responsive charts, and robust security rules.

---

## 🚀 Technology Stack

- **Frontend Core:** React 19, TypeScript
- **Bundler & Build Tool:** Vite 8
- **Styling:** Tailwind CSS (custom fintech design tokens)
- **Routing:** React Router v7 (`/login`, `/signup`, `/forgot-password`, `/dashboard`, `/transactions`, `/budgets`, `/profile`)
- **Visualizations & Charts:** Recharts (AreaChart, PieChart/Donut)
- **Icons:** Lucide React
- **Backend & Authentication:** Firebase Authentication (Email/Password) & Firebase Cloud Firestore (per-user document partitioning)
- **Local Fallback:** Automatic zero-configuration LocalStorage mode when `.env` is unconfigured, allowing immediate offline/development testing.

---

## 🎨 Color System

| Token | Dark Mode Hex | Light Mode Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Background** | `#0B1020` | `#F8FAFC` | Main app background canvas |
| **Secondary Background** | `#11182B` | `#F1F5F9` | Sidebar, navigation, surfaces |
| **Card Background** | `#151D32` | `#FFFFFF` | Core container cards |
| **Elevated Card** | `#1B2540` | `#FFFFFF` | Modals, active states, popovers |
| **Primary Accent** | `#6C63FF` | `#6C63FF` | Primary CTAs, active indicators, brand logo |
| **Income / Secondary Accent** | `#22C55E` | `#16A34A` | Income figures, on-track status, growth |
| **Expense** | `#F43F5E` | `#E11D48` | Expense figures, warnings, destructive buttons |
| **Warning** | `#F59E0B` | `#D97706` | Approaching budget limits, caution notices |
| **Information** | `#38BDF8` | `#0284C7` | Informational chips, helper tooltips |
| **Primary Text** | `#F8FAFC` | `#0F172A` | Headings, amounts, primary labels |
| **Secondary Text** | `#94A3B8` | `#64748B` | Subheadings, dates, timestamps |
| **Border** | `rgba(255,255,255,0.08)` | `#E2E8F0` | Dividers, card strokes |

---

## 📱 Responsive Breakpoints Tested

- **Mobile (320px – 480px):** Single-column layout, bottom fixed navigation with prominent elevated **Add** button, card-based transactions view, touch targets >= 44px.
- **Large Mobile (481px – 767px):** Compact grid arrangements, responsive modal sheets.
- **Tablet (768px – 1023px):** Collapsible sidebar, 2-column dashboard widgets, condensed data tables.
- **Laptop (1024px – 1439px):** Full 3-column statistics grid, expanded area chart and donut chart, full desktop tables.
- **Desktop (1440px+) & Large Desktop (1920px+):** Centered max-w-7xl canvas, high-density charts with smooth rendering.

---

## 🔑 Key Features

1. **Authentication:**
   - Email & password sign up with real-time criteria validation (8+ characters, uppercase, number).
   - Sign in with "Remember me" session persistence and password visibility toggle.
   - Password reset workflow with friendly error handling.
   - Built-in Instant Guest / Demo account for rapid evaluation.

2. **Dashboard Overview:**
   - Dynamic time-aware greeting (*"Good morning / Good afternoon / Good evening, [Name]"*).
   - Premium Balance Card displaying total balance, income, expenses, and dynamic percentage trend calculated from actual user records.
   - 3 Summary cards (Total Income, Total Expenses, Net Savings with positive/negative states).
   - Spending Overview Chart with 7D, 30D, 3M, and 1Y timeframe switching.
   - "Where Your Money Goes" Donut chart with category percentages and legend.
   - Recent Transactions feed with category icons and quick link to full history.

3. **Transaction Management:**
   - Search by title, notes, or category.
   - Filter by Type (All / Income / Expense) and Category.
   - Sort by Newest/Oldest and Highest/Lowest amount.
   - Desktop responsive data table with inline actions; automatic conversion to touch cards on mobile.
   - Add/Edit transaction modal with validation and type selector.
   - Delete confirmation dialog.
   - One-click CSV Export.

4. **Monthly Budgets:**
   - Set monthly spending limits per category (Food, Transport, Bills, Shopping, etc.).
   - Visual progress bars with smart status colors:
     - Normal (<80%): Positive green
     - Near Limit (80%–100%): Warning amber
     - Exceeded (>100%): Non-aggressive alert state
   - Overall monthly utilization gauge.

5. **Profile & Customization:**
   - Profile avatar with user initials.
   - Currency selection: Defaults to Nigerian Naira (`NGN ₦`), plus `USD $`, `EUR €`, `GBP £`, `CAD CA$`, `AUD AU$`, `JPY ¥`, `KES KSh`, `GHS GH₵`, `ZAR R`.
   - Appearance mode: Dark (default), Light, or System OS sync.
   - Notification preference toggles.

6. **Security Rules (`firestore.rules`):**
   - Per-user path authorization (`request.auth.uid == userId`) preventing unauthorized access across accounts.

---

## 🛠️ Getting Started

### 1. Installation

```bash
cd spendly
npm install --legacy-peer-deps
```

### 2. Configure Firebase (Optional)

Create `.env` using `.env.example`:

```bash
cp .env.example .env
```

Populate with your Firebase project credentials from the Firebase Console:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> **Note:** If `.env` is omitted or unconfigured, Spendly automatically functions in **Local Storage Mode**, allowing complete offline testing of all features without crashing!

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### 4. Build for Production

```bash
npm run build
npm run preview
```
