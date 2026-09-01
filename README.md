# 🚀 StudyOrbit — Focus & Study Tracker

A sleek, neumorphic study companion featuring focus timers, subject task management, weekly analytics, avatar customization, friends leaderboard, reward store, and AI-powered study assistance.

---

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Local Machine Setup](#-local-machine-setup)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Configure Environment Variables (Placeholders)](#3-configure-environment-variables-placeholders)
  - [4. Run Development Server](#4-run-development-server)
  - [5. Build for Production Locally](#5-build-for-production-locally)
- [Deploying to Vercel via GitHub](#-deploying-to-vercel-via-github)
  - [Step 1: Push Code to GitHub](#step-1-push-code-to-github)
  - [Step 2: Import Project into Vercel](#step-2-import-project-into-vercel)
  - [Step 3: Add Environment Variables in Vercel](#step-3-add-environment-variables-in-vercel)
  - [Step 4: Deploy](#step-4-deploy)
- [🔑 Environment Variables & Value-Placeholders](#-environment-variables--value-placeholders)
- [📁 Project Structure](#-project-structure)
- [🛠 Troubleshooting](#-troubleshooting)

---

## ✨ Features

- **⏱ Neumorphic Focus Timer**: Customizable Pomodoro intervals (25m, 50m, custom breaks) with live SVG progress indicators.
- **📚 Subject & Task Management**: Organize coursework with color-coded subjects, priority levels, and estimated durations.
- **📊 Study Analytics & Progress**: 7-day study bar charts, subject breakdowns, milestones, and streak tracking.
- **🏆 Friends Leaderboard & Profiles**: Compete with friends on study streaks and total hours, customize avatar frames and aesthetics.
- **🪙 Reward Store**: Earn study coins for completed sessions to unlock badges, avatar borders, and themes.
- **🤖 AI Study Assistant**: Powered by Google Gemini for step-by-step topic breakdowns and YouTube study recommendations.

---

## ⚙️ Prerequisites

Before you start, make sure you have the following installed on your computer:

- **Node.js**: `v18.0.0` or higher (Recommended: Node 20+) — [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** / **pnpm** / **bun**
- **Git** — [Download Git](https://git-scm.com/)
- **Google Gemini API Key** — [Get a free API Key from Google AI Studio](https://aistudio.google.com/app/apikey)

---

## 💻 Local Machine Setup

Follow these step-by-step instructions to run the application on your local computer:

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
cd YOUR_REPOSITORY_NAME
```

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Configure Environment Variables (Placeholders)

Create your local `.env` configuration file by copying the sample file:

```bash
# On macOS / Linux:
cp .env.example .env

# On Windows (Command Prompt):
copy .env.example .env

# On Windows (PowerShell):
Copy-Item .env.example .env
```

Open the newly created `.env` file in your code editor (e.g. VS Code) and update the placeholder values:

```env
# ==============================================================================
# ENVIRONMENT VARIABLES & VALUE-PLACEHOLDERS
# ==============================================================================

# 🔑 [REQUIRED] Gemini AI API Key
# Replace "MY_GEMINI_API_KEY" with your actual API key from Google AI Studio:
# https://aistudio.google.com/app/apikey
GEMINI_API_KEY=MY_GEMINI_API_KEY

# 🌐 [OPTIONAL FOR LOCAL] App Host URL
# Default local development URL:
APP_URL=http://localhost:3000
```

> ⚠️ **IMPORTANT**: Replace `MY_GEMINI_API_KEY` with your actual secret key (e.g., `AIzaSy...`). Never commit your `.env` file containing real secret keys to public GitHub repositories.

---

### 4. Run Development Server

Start the fullstack development server (Express + Vite with Hot Module Reloading):

```bash
npm run dev
```

Once started, open your browser and navigate to:
```
http://localhost:3000
```

---

### 5. Build for Production Locally

To build the client SPA and bundled backend server for production:

```bash
npm run build
```

To run the production build locally:

```bash
npm start
```

---

## 🚀 Deploying to Vercel via GitHub

You can deploy this project to [Vercel](https://vercel.com/) directly from your GitHub repository.

### Step 1: Push Code to GitHub

1. Initialize git and commit your files (if not done already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
2. Create a new repository on [GitHub](https://github.com/new).
3. Link and push your repository:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 2: Import Project into Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** ➔ **"Project"**.
3. Select your GitHub repository and click **"Import"**.
4. In the Project Configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build` or `vite build`
   - **Output Directory**: `dist`

---

### Step 3: Add Environment Variables in Vercel

Before clicking Deploy, expand the **"Environment Variables"** section in Vercel:

| Key | Value (Placeholders to Change) | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `YOUR_ACTUAL_GEMINI_API_KEY` | Your Google Gemini API Key from Google AI Studio |
| `APP_URL` | `https://your-project-name.vercel.app` | (Optional) Your production Vercel deployment URL |

> 💡 **Tip:** If you deploy as a static Vite frontend on Vercel, the app includes intelligent built-in fallbacks for all AI study guides and curated YouTube recommendation topics even if backend proxy endpoints are omitted.

---

### Step 4: Deploy

Click **"Deploy"**. Vercel will build and deploy your application. Once finished, you will receive your live URL (e.g. `https://study-orbit.vercel.app`).

---

## 🔑 Environment Variables & Value-Placeholders

Here is a summary of all configuration placeholders:

| Variable Name | Required | Default / Placeholder | Where to get it & What to change |
| :--- | :---: | :--- | :--- |
| `GEMINI_API_KEY` | **Yes** (for AI features) | `"MY_GEMINI_API_KEY"` | Get from [Google AI Studio](https://aistudio.google.com/app/apikey). Replace with your `AIzaSy...` key. |
| `APP_URL` | No | `"http://localhost:3000"` | The public URL of your app (used for links and references). |
| `PORT` | No | `3000` | Port for the Express server (default `3000`). |

---

## 📁 Project Structure

```
├── public/                 # Static public assets & icons
├── src/
│   ├── components/         # React Views & UI Components
│   │   ├── AvatarDisplay.tsx       # Profile avatar & aesthetic frames
│   │   ├── DashboardView.tsx       # Weekly study overview & focus timer widget
│   │   ├── FriendsLeaderboard.tsx  # Friends leaderboard & social streaks
│   │   ├── ProfileView.tsx         # User profile, statistics & avatar customizer
│   │   ├── ProgressView.tsx        # Detailed analytics & subject bar charts
│   │   ├── RewardsStoreView.tsx    # Credit rewards, avatars & badge shop
│   │   ├── TasksTimerView.tsx      # Task organizer & focus station
│   │   └── YouTubeStudyAssistant.tsx # AI YouTube video recommendations
│   ├── data/
│   │   └── mockData.ts     # Initial seed subjects, tasks & rewards
│   ├── types/              # TypeScript interface & type definitions
│   ├── App.tsx             # Main application container & navigation
│   ├── main.tsx            # React application entry point
│   └── index.css           # Tailwind CSS styles
├── server.ts               # Express backend & Gemini AI proxy API
├── vite.config.ts          # Vite build configuration
├── package.json            # Dependencies and npm scripts
├── .env.example            # Environment template with placeholders
└── README.md               # Setup and deployment documentation
```

---

## 🛠 Troubleshooting

<details>
<summary><b>1. Error: GEMINI_API_KEY is missing or invalid</b></summary>
Ensure you created a <code>.env</code> file in the root directory and added your Gemini API key:
<pre>GEMINI_API_KEY=AIzaSyYourActualKeyHere</pre>
Make sure to restart the dev server (<code>npm run dev</code>) after modifying <code>.env</code>.
</details>

<details>
<summary><b>2. Port 3000 is already in use</b></summary>
If port 3000 is occupied by another process:
<ul>
  <li>On macOS/Linux: <code>lsof -i :3000</code> and <code>kill -9 &lt;PID&gt;</code></li>
  <li>On Windows: <code>netstat -ano | findstr :3000</code> and <code>taskkill /PID &lt;PID&gt; /F</code></li>
</ul>
</details>

<details>
<summary><b>3. React Warning: Invalid DOM property class</b></summary>
All JSX attributes in the codebase have been standardized to React's <code>className</code> prop. If you see this in custom added code, replace HTML <code>class="..."</code> with <code>className="..."</code>.
</details>

---

## 📄 License

MIT License. Open source and free to modify for your personal study workflow!
