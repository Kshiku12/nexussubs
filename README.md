# NexusSubs

A real-time subscription management dashboard built with Next.js. Track your OTT and gaming subscriptions, get AI-powered movie and game recommendations, and identify media from screenshots — all in one place.

## Features

- **Subscription Tracking** — Automatically scans Gmail for subscription receipts from Netflix, Spotify, Amazon Prime, Xbox Game Pass, and more. Displays active subscriptions with billing details, renewal dates, and payment history.

- **Multi-Account Support** — Link multiple Gmail accounts to aggregate subscriptions from all your email addresses into a single dashboard.

- **SMS Webhook Tracking** — Receives SMS-based subscription alerts via a webhook endpoint for cross-platform tracking.

- **Explore & Discover** — Browse a global catalog of movies and games with rich metadata (ratings, descriptions, posters) powered by OMDb and RAWG APIs.

- **AI Chatbot (Nexus AI)** — Built-in chatbot powered by Google Gemini that can:
  - Recommend movies and games based on your mood
  - Simulate subscription cancellation flows
  - **Identify movies/games from screenshots** — attach a screenshot and the AI tells you what it's from, with a popup showing full details and where to watch/play

- **Google OAuth** — Secure authentication via Google sign-in using NextAuth.js.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Auth | NextAuth.js (Google OAuth) |
| AI | Google Gemini 2.5 Flash (text + vision) |
| Styling | CSS Modules |
| Font | DM Sans |
| APIs | Gmail API, OMDb, RAWG, IMDb Unofficial |
| Icons | Lucide React |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth config
│   │   ├── chat/                # AI chatbot endpoint (text + image)
│   │   ├── google-client-id/    # Client ID endpoint
│   │   ├── proxy-image/         # Image proxy to bypass CORS/adblockers
│   │   ├── sms-webhook/         # SMS subscription alerts receiver
│   │   └── subscriptions/       # Gmail subscription scanner
│   ├── dashboard/               # Main subscription dashboard
│   ├── explore/                 # Movie & game catalog browser
│   ├── login/                   # Authentication page
│   ├── simulate-google-auth/    # Google OAuth popup simulator
│   ├── close-popup/             # OAuth popup close handler
│   ├── globals.css              # Global design tokens & utilities
│   └── layout.tsx               # Root layout with font & providers
├── components/
│   ├── Chatbot.tsx              # AI chatbot with image attachment
│   ├── Chatbot.module.css
│   └── Providers.tsx            # NextAuth session provider
├── lib/
│   ├── auth.ts                  # NextAuth configuration
│   ├── gmail.ts                 # Gmail API integration
│   └── mockDatabase.ts          # Local subscription data store
├── data/
│   └── subscriptions.json       # Default subscription data
└── types/
    └── next-auth.d.ts           # NextAuth type extensions
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/Kshiku12/nexussubs.git
cd nexussubs
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GEMINI_API_KEY=your_gemini_api_key
```

**Where to get these:**

| Variable | Source |
|---|---|
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` or use [generate-secret.vercel.app](https://generate-secret.vercel.app) |
| `GOOGLE_CLIENT_ID` / `SECRET` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) — create an OAuth 2.0 Client ID |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) |

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. (Optional) Configure API keys in the app

For the Explore page to show real movie/game data, you can enter your API keys in the settings panel on the Explore page:

- **OMDb API Key** — Get one free at [omdbapi.com](https://www.omdbapi.com/apikey.aspx)
- **RAWG API Key** — Get one free at [rawg.io](https://rawg.io/apidocs)

## Deployment

### Deploy to Vercel (recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add your environment variables in the Vercel dashboard
4. Click Deploy

After deploying, update:
- `NEXTAUTH_URL` in Vercel to your deployed URL (e.g. `https://nexussubs.vercel.app`)
- Google OAuth redirect URI to `https://your-domain.vercel.app/api/auth/callback/google`

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
