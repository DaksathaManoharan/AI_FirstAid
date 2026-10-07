# AI First Aid Emergency Assistant — Unified ERSS 2.0 Guidance System

AI First Aid is an advanced, bilingual emergency decision-support web application. This application helps bystanders and first-responders during medical crises. It uses the Google Gemini 1.5 Flash API for triage, OpenStreetMap GIS for resource mappings, and Web Speech API synthesizers for hands-free first-aid instructions in Tamil and English, with offline regex-based fallbacks.

---

## 🌟 Key Features

1. **AI Emergency Copilot (Triage)**
   - Text, voice, and image-based triage assessments.
   - Extracts conscious state, breathing status, demographic profile, and bleeding severities.
   - Prompts Google Gemini 1.5 Flash with strict JSON guidelines.
2. **Safety Engine & Local Fallback**
   - Pre-scans inputs for critical keyword identifiers (e.g., "not breathing", "heart attack", "unconscious").
   - Elevates severity status to `CRITICAL` immediately to display ambulance hotline reminders (112/108) without AI lag.
   - Uses local regex rules on the backend if the Gemini API fails or is offline.
3. **Smart First-Aid Guide**
   - Step-by-step instructions for 10 common emergencies.
   - Age-based personalization: Infant, Child, Adult, and Elderly protocols.
   - CPR metronome: Visual pulsing chest compression guide (110 BPM).
4. **Bilingual Speech Synthesis & Recognition**
   - Web Speech API text-to-speech instructions in English (`en-IN`) and Tamil (`ta-IN`).
   - Voice-activated triage chat loops.
5. **Interactive GIS Locator Map**
   - Integrated Leaflet + OpenStreetMap canvas.
   - Queries OpenStreetMap's Overpass API in real time for nearby hospitals, pharmacies, and AEDs.
   - Sorts results by proximity using the Haversine distance formula.
   - Clearly marks seeded database data as "demo data" if APIs fail.
6. **One-Tap SOS Mode**
   - Flashing alarms with a 3-second abort countdown timer.
   - Indian ambulance sirens synthesized via Web Audio API.
   - Coordinate broadcast sharing.
7. **Disaster Preparedness timelines**
   - Timelines (Before, During, After) for Flood, Cyclone, Earthquake, Fire, Lightning, and Heatwaves.
   - Relational checklist database sync.
8. **Authentication & Session History**
   - Secure bcrypt password hashing.
   - Logs history of emergency sessions and preferences.

---

## ⚙️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS (or Custom Glassmorphism System), React Router 6, Leaflet (React Leaflet), Lucide icons, Web Speech API, Geolocation API, Web Audio API.
- **Backend**: Node.js, Express.js, JWT Authentication, Helmet, Express Rate Limit.
- **Database & ORM**: PostgreSQL, Prisma ORM.
- **AI API**: Google Gemini 1.5 Flash (via secure backend REST fetch).

---

## 📂 Project Structure

```text
ai-first-aid/ (Workspace Root)
├── client/
│   ├── src/
│   │   ├── components/      # UI components (Metronomes, buttons)
│   │   ├── pages/           # Pages (Home, Copilot, Smart Guide, Map, SOS, Disaster, Poison, Settings, About)
│   │   ├── layouts/         # Layout wrapper
│   │   ├── services/        # API and Speech services
│   │   ├── context/         # Auth and preference state context
│   │   ├── App.jsx          # Main client application (React Router setup)
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── controllers/     # Route logic (AI, auth, guides, resources, poison, disasters, sessions)
│   │   ├── routes/          # Express route registrations
│   │   ├── services/        # External calls (Gemini API, Overpass API)
│   │   ├── middleware/      # Error handler, rate limit, auth verify
│   │   ├── utils/           # Haversine, rule-based fallback, safety engine
│   │   ├── config/          # Prisma client and environment configuration
│   │   └── server.js        # Main Express server entrypoint
│   ├── prisma/
│   │   ├── schema.prisma    # PostgreSQL Schema models
│   │   └── seed.js          # Seed script for guides
│   ├── package.json
│   └── .env
│
├── package.json             # Root monorepo package.json
├── .gitignore
└── README.md
```

---

## 🚀 Local Installation

### Prerequisites
1. **Node.js** (v18.0.0 or higher).
2. **PostgreSQL** instance running.

### Step 1: Clone and install dependencies
At the root of the project directory, run:
```bash
# Install root, client, and server dependencies
npm install
npm run install:all
```

### Step 2: Configure Environment Variables
Create a `.env` file in the `server/` directory (you can copy `server/.env.example`):
```bash
cp server/.env.example server/.env
```
Update the values:
- `DATABASE_URL`: Set your PostgreSQL connection string:
  `postgresql://username:password@localhost:5432/ai_first_aid?schema=public`
- `GEMINI_API_KEY`: Set your Google Gemini API Key.
- `JWT_SECRET`: Set a secure string for JWT generation.

### Step 3: Run Database Migrations and Seeding
Deploy the schema to your PostgreSQL database and seed the guides:
```bash
# Run migration
npm run prisma:migrate

# Seed guides and checklists
npm run prisma:seed
```

### Step 4: Run Application
Start the concurrent development runner to fire up both client and server:
```bash
npm run dev
```
- Frontend will boot on `http://localhost:5173`
- Backend will run on `http://localhost:5000`

---

## 📡 REST API Documentation

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register a new user profile | No |
| **POST** | `/api/auth/login` | Login user, returns JWT and preferences | No |
| **GET** | `/api/auth/preferences` | Retrieve user preferences | Yes |
| **PUT** | `/api/auth/preferences` | Update user preferences (language, theme) | Yes |
| **POST** | `/api/ai/triage` | Triage description, returns severity classification | No |
| **POST** | `/api/ai/image-analysis` | Process visual injury details | No |
| **GET** | `/api/guides` | Fetch list of first-aid guides | No |
| **GET** | `/api/guides/:type` | Fetch step-by-step guidelines for a type | No |
| **GET** | `/api/resources/nearby` | Fetch clinics, AEDs, or pharmacies | No |
| **GET** | `/api/aed/nearby` | Fetch nearby AED markers | No |
| **GET** | `/api/poison/search` | Search antidote database | No |
| **GET** | `/api/disasters` | Get list of disasters | No |
| **GET** | `/api/disasters/checklist` | Get user's checklist progress | Yes |
| **POST** | `/api/disasters/checklist` | Update user's checklist item | Yes |
| **GET** | `/api/emergency-sessions` | Get user emergency triage logs | Yes |
| **POST** | `/api/emergency-sessions` | Save a new emergency log | Optional |

---

## ⚕️ Safety Disclaimer

AI First Aid is a prototype helper. Suggestions are purely informational. Always contact the official helplines (112 or 108 in India) immediately during life-threatening crises.
