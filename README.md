# Campus Life - Daily Streaks Game MVP

A lightweight, mobile-first web game designed for university students to build daily habits through check-ins, missions, and streak tracking.

## 🎮 Features

### Core Gameplay
- **Daily Check-In** - "I Survived Today" button grants +10 XP and extends streak
- **Streak System** - Track consecutive days of activity, resets after missing a day
- **Daily Missions** - 3 static missions per day, each worth +5 XP
- **XP Tracker** - Accumulate experience points with visual progress bar

### User System
- Email/password authentication
- Persistent user data via SQLite
- Local session management with JWT tokens

### UI/UX
- Mobile-first responsive design
- Clean, friendly student-focused aesthetic
- Card-based layout with Tailwind CSS
- Simple interactions (no complex animations)

### Optional Features
- Browser notifications toggle
- Settings page

## 📱 Architecture

```
/workspace
├── index.html           # Landing page
├── script.js            # Frontend SPA (all UI logic)
├── vite.config.js       # Vite dev server config
├── package.json         # Frontend dependencies
└── backend/
    ├── server.js        # Express server
    ├── db.js            # SQLite setup
    ├── package.json     # Backend dependencies
    └── routes/
        ├── auth.js      # Register/login
        ├── user.js      # User data & settings
        ├── checkin.js   # Daily check-in logic
        └── missions.js  # Mission endpoints
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm

### Installation

Backend dependencies:
```bash
cd backend && npm install
```

Frontend dependencies:
```bash
npm install
```

### Development

Start both frontend and backend:
```bash
./start.sh
```

Or start separately:

**Backend (port 3000):**
```bash
cd backend && npm start
```

**Frontend (port 8080):**
```bash
npm run dev
```

## 🎯 Gameplay Loop

1. **Landing** - Student sees intro and clicks "Start Playing"
2. **Register/Login** - Create account or sign in
3. **Dashboard** - Main hub with check-in button, missions, streak, XP
4. **Daily Check-In** - Click "I Survived Today" once per day
   - Streak +1
   - XP +10
5. **Missions** - Complete 3 daily missions for +5 XP each
6. **Settings** - Toggle notifications, view account info

## 📊 Data Model

### Users Table
- `id` - Primary key
- `email` - Unique user email
- `username` - Unique username
- `password_hash` - Bcrypted password
- `streak` - Current streak count
- `total_xp` - Lifetime XP
- `last_active_date` - Last check-in date (for streak logic)
- `notifications_enabled` - Boolean preference

### Daily Missions Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `mission_name` - Mission title
- `completed` - Boolean flag
- `completed_date` - Date mission was completed
- `xp_value` - XP reward (default 5)

### Check-in History Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `checkin_date` - ISO timestamp
- `xp_earned` - XP from this check-in (always 10)

## 🔐 Authentication

- JWT tokens valid for 7 days
- Passwords hashed with bcrypt (10 salt rounds)
- Tokens stored in localStorage on client
- Auth header: `Authorization: Bearer <token>`

## 🛠️ API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login existing user

### User
- `GET /api/user/:userId` - Get user profile & daily missions
- `PATCH /api/user/:userId/notifications` - Toggle notifications

### Check-in
- `POST /api/checkin` - Daily check-in (once per day)

### Missions
- `POST /api/mission/:missionId/toggle` - Toggle mission completion

## 🎨 Design System

- **Color Scheme** - Blue/indigo primary, with accents
- **Typography** - System fonts (San Francisco, Segoe UI)
- **Spacing** - Tailwind defaults
- **Components** - Cards, buttons, checkboxes, toggles
- **Animations** - Minimal (pulse effect on streak emoji)

## 📦 Tech Stack

**Frontend:**
- HTML5
- Vanilla JavaScript
- Tailwind CSS (CDN)
- Fetch API

**Backend:**
- Node.js
- Express.js
- SQLite3
- bcryptjs
- jsonwebtoken

## 🔧 Development Notes

### Streak Logic
Streak is calculated from check-in history. If a user misses a full day, the streak resets to 0. The system checks if the last active date is within the past 24 hours.

### Daily Reset
Missions are reset daily based on date comparison. When a user loads their dashboard, if the current date differs from their last active date, all missions are marked incomplete.

### XP System
- Daily check-in: +10 XP
- Each mission: +5 XP (max +15/day from missions)
- Total possible daily: +25 XP

## 🚀 Deployment

### Frontend
```bash
npm run build
```

Outputs to `/dist` - deploy as static files to any CDN or web server.

### Backend
```bash
cd backend && npm start
```

Requires Node.js environment with write access for SQLite database.

## 📝 Version

MVP v1.0 - Minimal viable product focused on daily check-ins, streaks, and simple missions. Foundation for future expansion (leaderboards, social features, more game mechanics).

## 📄 License

MIT

---

**Built for university students. Keep the fire burning. 🔥**