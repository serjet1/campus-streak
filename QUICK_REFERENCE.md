# Campus Life - Quick Reference Card

## 🎯 One-Minute Summary

**Campus Life** is a web game for university students to build daily habits. Students check in daily, complete missions, and maintain streaks for XP.

- **Frontend**: Single-page web app (Vanilla JS + Tailwind CSS)
- **Backend**: Express.js + SQLite
- **Gameplay**: Check-in daily for +10 XP, complete 3 missions for +5 XP each, maintain streaks
- **Status**: ✅ Ready to run

---

## 🚀 Quick Start (2 Minutes)

### Terminal 1 - Start Backend
```bash
cd /workspace/backend
npm start
```

### Terminal 2 - Start Frontend
```bash
cd /workspace
npm run dev
```

### Browser
Open: **http://localhost:8080**

---

## 📚 Documentation Map

| Document | Purpose |
|----------|---------|
| **README.md** | Full project overview & features |
| **SETUP.md** | Detailed setup & troubleshooting |
| **ARCHITECTURE.md** | System design & data flows |
| **PROJECT_STATUS.md** | Build status & verification checklist |
| **QUICK_REFERENCE.md** | This file - fast lookup |

---

## 🎮 Game Flow

```
Landing → Register/Login → Dashboard → Check-In & Missions → Settings
```

### Dashboard
- **Top**: 🔥 Streak count (animated)
- **Middle**: "I Survived Today" button (+10 XP daily)
- **Below**: Total XP with progress bar
- **Bottom**: 3 daily missions with checkboxes (+5 XP each)
- **Menu**: ⚙️ Settings button (top right)

---

## 📊 Key Numbers

| Item | Value |
|------|-------|
| Daily Check-In XP | +10 |
| Mission XP | +5 per mission |
| Max Daily XP | 25 (1 check-in + 3 missions) |
| XP Milestone | 200 (progress bar) |
| Streak Reset | After 1+ day missed |
| Token Expiry | 7 days |
| Missions Daily | 3 (same each day) |
| Backend Port | 3000 |
| Frontend Port | 8080 |

---

## 🛠️ Useful Commands

```bash
# Start both servers at once
./start.sh

# Run API test suite
./test-api.sh

# Build frontend for production
npm run build

# Backend health check
curl http://localhost:3000/api/health
```

---

## 🔐 Authentication

**Registration**: Email + Username + Password (8+ chars recommended)

**Login**: Email + Password

**Session**: JWT token stored in localStorage (7 day expiry)

---

## 📱 Pages

### Landing
- Intro + feature highlights
- "Start Playing" button

### Auth (Register/Login)
- Email input
- Username input (register only)
- Password input
- Register/Login buttons

### Dashboard
- Streak counter (large, animated 🔥)
- Daily check-in button
- XP total + progress bar
- 3 daily missions
- Settings button

### Settings
- Notifications toggle
- About section
- Back button

---

## 🎯 Daily Loop (Best Practice)

1. **Open app** at any time of day
2. **Click** "I Survived Today" button (+10 XP)
3. **Check off** 1-3 missions you completed today (+5 XP each)
4. **Keep streak** alive by checking in next day

---

## 📁 Important File Paths

```
Frontend:
  /workspace/index.html      ← Main page
  /workspace/script.js       ← All game logic

Backend:
  /workspace/backend/server.js       ← Server entry
  /workspace/backend/routes/*.js     ← API endpoints
  /workspace/backend/database.db     ← SQLite database
```

---

## 🔌 API Endpoints (Quick Reference)

```
POST   /api/auth/register          → Register user
POST   /api/auth/login             → Login user
GET    /api/user/:userId           → Get user data & missions
PATCH  /api/user/:userId/notifications → Toggle notifications
POST   /api/checkin                → Daily check-in
POST   /api/mission/:missionId/toggle → Toggle mission
```

---

## 🧪 Testing Quick Checks

✅ **Can register?** → Auth working
✅ **Can check in?** → API connected
✅ **XP increases?** → Calculation working
✅ **Persists on reload?** → Database working
✅ **Streak shows?** → Streak logic working
✅ **Mobile responsive?** → UI flexible

---

## 🎨 Customization Hotspots

| Item | File | Line/Section |
|------|------|---|
| Colors | script.js | `bg-blue-600` replace with `bg-purple-600` |
| Missions | backend/routes/auth.js | ~line 30 |
| XP Values | backend/routes/checkin.js | Line 60 (hardcoded 10) |
| API URL | script.js | Line 3 |
| Brand Text | script.js | Search "Campus Life" |

---

## 🚨 Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| "Cannot GET /" | Frontend not running on port 8080 |
| Connection refused port 3000 | Backend not running |
| CORS error | Backend not listening on all interfaces |
| Already checked in | Normal! Max 1 check-in per day |
| Streak reset | Missed checking in for 1+ full day |
| Missions not showing | Page not loading user data properly |

---

## 📈 Scaling Notes

**SQLite limitation**: ~100 concurrent users max
**To scale**: Switch to PostgreSQL + Redis (see ARCHITECTURE.md)

---

## 🔄 Dev Workflow

1. **Frontend changes**: Save `script.js` → Auto-reload in browser
2. **Backend changes**: Stop server → Edit file → Restart with `npm start`
3. **Database changes**: Delete `database.db` → Restart backend (auto-recreates)

---

## 🎓 Example Test Sequence

```
1. Go to http://localhost:8080
2. Click "Start Playing"
3. Register: 
   - Email: student@uni.edu
   - Username: john_doe
   - Password: test123
4. Click "I Survived Today" → See +10 XP, streak 1
5. Check 2 missions → See +10 more XP (now 20)
6. Settings → Toggle notifications on
7. Logout → Back to landing
8. Login with same credentials → Data persists!
```

---

## 📞 Support

- **Full docs**: See README.md
- **Setup help**: See SETUP.md
- **Architecture**: See ARCHITECTURE.md
- **Status**: See PROJECT_STATUS.md

---

## ✅ Pre-Launch Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 8080
- [ ] Browser opens http://localhost:8080
- [ ] Can register new user
- [ ] Can log in
- [ ] Check-in button works
- [ ] XP increases
- [ ] Missions work
- [ ] Page persists after reload
- [ ] Settings accessible

---

**Ready to build campus habits? Fire it up! 🔥**