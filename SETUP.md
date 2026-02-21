# Campus Life - Quick Start Guide

## 📋 Project Status

✅ **Complete and Ready to Run**

All files have been created and dependencies installed. The app is ready to launch.

## 🚀 Quick Start (3 Steps)

### Step 1: Start the Backend
```bash
cd backend
npm start
```

You should see:
```
🎓 Campus Life server running on http://0.0.0.0:3000
✅ Connected to SQLite database
```

### Step 2: Start the Frontend (in a new terminal)
```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:8080/
```

### Step 3: Open in Browser
Go to: **http://localhost:8080**

---

## 🎮 Test the App

### Landing Page
- You should see the Campus Life intro with icons
- Click "Start Playing"

### Create Account
- Enter email, username, and password
- Click "Register"

### Dashboard
- You'll see the main game interface
- Try clicking "I Survived Today" (you get +10 XP)
- Try checking off missions (each +5 XP)
- Visit Settings (gear icon) to toggle notifications

### Multiple Sessions
- Open an incognito window and create another account to test multiple users
- Each user has isolated data

---

## 📁 File Structure

```
/workspace/
├── index.html              # Landing page
├── script.js               # Complete frontend app (SPA)
├── vite.config.js          # Vite dev config
├── package.json            # Frontend deps
├── README.md               # Full documentation
├── SETUP.md                # This file
├── start.sh                # Optional: run both servers
└── backend/
    ├── server.js           # Express server
    ├── db.js               # SQLite initialization
    ├── package.json        # Backend deps
    ├── database.db         # SQLite database (auto-created)
    ├── middleware/
    │   └── auth.js         # JWT middleware
    └── routes/
        ├── auth.js         # Auth endpoints
        ├── user.js         # User data endpoints
        ├── checkin.js      # Check-in logic
        └── missions.js     # Mission endpoints
```

---

## 🔑 Key Features to Test

### 1. Authentication
- Register with email, username, password
- Login with different credentials
- Session persists on page reload (token in localStorage)

### 2. Daily Check-In
- Button is enabled once per day
- After clicking, it shows "✓ Checked In Today" and becomes disabled
- Refresh page at midnight (in real time) to re-enable

### 3. Streak Tracking
- Streak increases by 1 each day you check in
- Resets to 0 if you miss a full day
- Fire emoji pulses gently

### 4. Missions
- 3 missions display daily
- Click checkbox to toggle completion
- Each grants +5 XP when completed

### 5. XP System
- Check-in: +10 XP
- Each mission: +5 XP
- Progress bar shows progress to 200 XP milestone

### 6. Notifications
- Go to Settings (gear icon)
- Toggle notifications on/off
- Browser will ask for permission

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check port 3000 is not in use
lsof -i :3000

# If something is using it, kill it
kill -9 <PID>
```

### Frontend won't connect to backend
- Ensure backend is running on port 3000
- Check browser console (F12) for CORS errors
- Verify network tab shows requests going to http://localhost:3000

### Database errors
- SQLite database auto-creates on first run
- Check `/workspace/backend/database.db` exists
- Permissions issue? Try: `chmod 666 /workspace/backend/database.db`

### CORS issues
- Backend has CORS enabled for all origins
- If still getting errors, check backend is running
- Verify `http://localhost:3000` in frontend API_URL

---

## 📊 API Testing

Test the backend directly with curl:

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@uni.edu","username":"testuser","password":"pass123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@uni.edu","password":"pass123"}'
```

---

## 🎨 Customization Ideas

### Color Scheme
- Edit Tailwind classes in `script.js` (e.g., `bg-blue-600` → `bg-purple-600`)
- Modify gradient in `index.html` if needed

### Missions
- Edit default missions in `backend/routes/auth.js` (line ~30)
- Or make them dynamic by fetching from a mission list endpoint

### XP Values
- Daily check-in: `backend/routes/checkin.js` (line ~60, hardcoded as 10)
- Missions: `backend/routes/missions.js` (uses `mission.xp_value` from DB)

### Notifications
- Customize message in frontend when notification is sent
- Add scheduled notifications with service workers

---

## 🚀 Production Deployment

### Frontend
```bash
npm run build
# Deploy /dist folder to CDN or static hosting
```

### Backend
```bash
# Set environment variables
export JWT_SECRET="your-secret-key"
export NODE_ENV=production
export PORT=3000

# Start server
cd backend && npm start
```

---

## 📚 Next Steps / Future Features

- [ ] Leaderboards (top streaks, top XP)
- [ ] Social features (friends, challenges)
- [ ] Custom missions
- [ ] Achievements/badges
- [ ] Daily rewards/bonuses
- [ ] Mobile app (React Native)
- [ ] Email reminders
- [ ] Analytics dashboard

---

## ✅ You're All Set!

Your Campus Life MVP is ready. Students can now:
- 🔥 Build daily streaks
- ⭐ Earn XP
- ✅ Complete missions
- 📱 Use on any device

**Start the servers and visit http://localhost:8080 to play!**

Questions? Check the main README.md for full documentation.