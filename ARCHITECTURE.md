# Campus Life - Architecture Documentation

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Vanilla JavaScript SPA                  │   │
│  │  • Landing Page                                      │   │
│  │  • Auth (Register/Login)                             │   │
│  │  • Dashboard (Main Game UI)                          │   │
│  │  • Settings                                          │   │
│  │                                                      │   │
│  │  Local Storage:                                      │   │
│  │  • JWT Token (7 days)                                │   │
│  │  • User ID                                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                        ↓↑ (HTTP/REST)                       │
└─────────────────────────────────────────────────────────────┘
                    :3000 API Endpoints
┌─────────────────────────────────────────────────────────────┐
│                   SERVER (Node.js/Express)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Route Handlers                            │   │
│  │  • /api/auth/register  ─────────┐                    │   │
│  │  • /api/auth/login             │                    │   │
│  │  • /api/user/:id           Auth Middleware           │   │
│  │  • /api/checkin          (JWT Verification)         │   │
│  │  • /api/mission/:id            │                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                        ↓↑ (SQL)                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          SQLite Database                             │   │
│  │  • Users                                             │   │
│  │  • Daily Missions                                    │   │
│  │  • Check-in History                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow

### User Registration Flow
```
1. User enters email, username, password
   ↓
2. Frontend POST /api/auth/register
   ↓
3. Backend validates input
   ↓
4. Backend hashes password with bcrypt (10 rounds)
   ↓
5. Backend inserts user + creates 3 default missions
   ↓
6. Backend generates JWT token (7 day expiry)
   ↓
7. Frontend stores token + userId in localStorage
   ↓
8. Frontend navigates to Dashboard
```

### Daily Check-In Flow
```
1. User clicks "I Survived Today" button
   ↓
2. Frontend POST /api/checkin with userId
   ↓
3. Backend verifies JWT token
   ↓
4. Backend checks if user already checked in today
   ├─ YES: Return error "Already checked in today"
   └─ NO: Continue
   ↓
5. Backend calculates streak from check-in history
   ├─ Is last check-in < 24 hours ago?
   │  ├─ YES: Increment streak
   │  └─ NO: Reset streak to 1
   └─ Record check-in with +10 XP
   ↓
6. Backend updates user.total_xp += 10
                   user.streak = calculated_streak
                   user.last_active_date = now()
   ↓
7. Backend returns updated stats
   ↓
8. Frontend disables button until tomorrow
   ↓
9. Frontend updates UI (streak, XP, button state)
```

### Mission Completion Flow
```
1. User clicks mission checkbox
   ↓
2. Frontend toggles local mission.completed flag
   ↓
3. Frontend POST /api/mission/{missionId}/toggle
   ↓
4. Backend verifies JWT token
   ↓
5. Backend checks if mission completed on different day
   ├─ YES: Reset it (new day started)
   └─ NO: Toggle completed status
   ↓
6. Backend calculates XP delta based on action
   ├─ Completing: +5 XP
   └─ Uncompleting: -5 XP
   ↓
7. Backend updates user.total_xp += delta
                   mission.completed = !mission.completed
   ↓
8. Frontend updates XP display
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  streak INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  last_active_date TEXT,
  notifications_enabled INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Purpose**: Store user accounts and game state
**Key Logic**:
- `streak` - Calculated from check-in history, displayed to user
- `last_active_date` - Used to determine if a full day was missed
- `total_xp` - Sum of all XP earned (check-ins + missions)

### Daily Missions Table
```sql
CREATE TABLE daily_missions (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  mission_name TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  completed_date TEXT,
  xp_value INTEGER DEFAULT 5,
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

**Purpose**: Track 3 missions per user (same missions daily)
**Key Logic**:
- 3 missions created per user on registration
- `completed` reset to 0 when new day starts (checked on each load)
- `completed_date` used to detect new day

### Check-in History Table
```sql
CREATE TABLE checkin_history (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  checkin_date TEXT NOT NULL,
  xp_earned INTEGER DEFAULT 10,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

**Purpose**: Audit trail for check-ins and streak calculation
**Key Logic**:
- Used to calculate actual streak (consecutive days with check-ins)
- Provides historical data for analytics
- Each check-in always awards 10 XP

## 🔐 Authentication & Security

### JWT Implementation
```javascript
// Token Generation
jwt.sign({ id: userId }, SECRET, { expiresIn: '7d' })

// Token Verification
jwt.verify(token, SECRET)
// Returns: { id: userId, iat: timestamp, exp: expiry_timestamp }
```

**Security Measures**:
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens valid for 7 days
- Tokens stored in localStorage (accessible to XSS)
- No refresh token rotation (simple MVP)
- CORS enabled for all origins (development only)

### Request Validation
```javascript
// Auth Middleware
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })
  
  try {
    const decoded = jwt.verify(token, SECRET)
    req.userId = decoded.id
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// Route-level checks
if (parseInt(userId) !== req.userId) {
  return res.status(403).json({ error: 'Unauthorized' })
}
```

## 📱 Frontend Architecture

### State Management
```javascript
let appState = {
  streak: 0,           // Current streak
  totalXP: 0,          // Lifetime XP
  dailyMissions: [],   // 3 missions with completion status
  lastActiveDate: null,// Last check-in timestamp
  notificationsEnabled: false
}

let currentUser = {
  id: userId,
  token: jwtToken
}
```

**Rationale**: Simple global state sufficient for MVP. No Redux/Vuex needed.

### Page System
```javascript
// Simple router via showPage() function
currentPage = 'landing' | 'auth' | 'dashboard' | 'settings'

// Render based on page
function renderPage() {
  switch (currentPage) {
    case 'landing': app.innerHTML = renderLanding()
    case 'auth': app.innerHTML = renderAuth()
    case 'dashboard': app.innerHTML = renderDashboard()
    case 'settings': app.innerHTML = renderSettings()
  }
}
```

**Rationale**: SPA with single index.html, no build step needed.

### API Client Pattern
```javascript
// All requests follow this pattern:
async function makeRequest(endpoint, method, body) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: method,
    headers: {
      'Authorization': `Bearer ${currentUser.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  
  const data = await response.json()
  
  if (response.ok) {
    // Update appState
    // renderPage()
  } else {
    // Show error
  }
}
```

## 🎮 Game Logic

### Streak Calculation
```
Check-in History: [2024-02-18, 2024-02-17, 2024-02-16, ...]

Streak = Count of consecutive dates from most recent:
  2024-02-18 (today)     ✓ +1
  2024-02-17 (yesterday) ✓ +1
  2024-02-16 (2 days ago) ✓ +1
  2024-02-15 (3 days ago) ✗ Stop (gap found)
  
Streak = 3

If user doesn't check in for a full day:
  Last check-in: 2024-02-17
  Today: 2024-02-20
  Gap > 1 day → Streak resets to 0
```

### Daily Reset Mechanism
```javascript
// When user loads dashboard:
const today = new Date().toDateString()
const lastActiveDate = user.last_active_date?.toDateString()

if (lastActiveDate !== today) {
  // New day detected
  db.run('UPDATE daily_missions SET completed = 0 WHERE user_id = ?')
  // Missions reset for new day
}
```

**Why this works**:
- Date comparison is timezone-safe (uses client date)
- Checks happen on page load (lazy reset)
- No midnight-based reset timers needed

### XP System
```
Daily Check-In: +10 XP (once per day)
Missions (3x):  +5 XP each (once per day)

Max Daily XP: 10 + (5 × 3) = 25 XP

Progress Milestones: 0, 200, 400, 600... (200 XP intervals)
```

**Rationale**: Simple linear system with no level cap. Suitable for MVP.

## 🚀 Deployment Architecture

### Frontend
```
1. Build step: npm run build
2. Output: /dist folder (static files)
3. Deployment: CDN or static web server
4. CORS headers not needed (static origin)
5. API_URL config: Points to backend domain
```

### Backend
```
1. Environment: Node.js 16+
2. Port: 3000 (configurable via PORT env var)
3. Database: SQLite (database.db file)
4. Persistence: Writable file system for .db file
5. Scaling: Single process (no clustering in MVP)
6. CORS: Enabled for all origins (should be restricted in production)
```

## 🔄 Request/Response Examples

### POST /api/auth/register
```json
// Request
{
  "email": "student@university.edu",
  "username": "john_doe",
  "password": "securepassword"
}

// Response (201)
{
  "token": "eyJhbGc...",
  "userId": 42,
  "message": "Registration successful"
}

// Error Response (400)
{
  "error": "Email or username already exists"
}
```

### GET /api/user/:userId
```json
// Request Headers
Authorization: Bearer eyJhbGc...

// Response (200)
{
  "id": 42,
  "email": "student@university.edu",
  "username": "john_doe",
  "streak": 7,
  "total_xp": 150,
  "last_active_date": "2024-02-21T15:30:00Z",
  "notifications_enabled": true,
  "daily_missions": [
    { "id": 101, "name": "Attended lectures today", "completed": true, "xp": 5 },
    { "id": 102, "name": "Read something today", "completed": false, "xp": 5 },
    { "id": 103, "name": "Didn't skip class", "completed": true, "xp": 5 }
  ]
}
```

### POST /api/checkin
```json
// Request
{
  "userId": 42
}

// Response (200)
{
  "success": true,
  "streak": 8,
  "total_xp": 160,
  "last_active_date": "2024-02-21T15:30:00Z",
  "xp_earned": 10
}

// Error Response (400)
{
  "error": "Already checked in today"
}
```

## 📈 Scalability Considerations

### Current Limitations (MVP)
- Single SQLite database (not distributed)
- No horizontal scaling
- No caching layer
- No background jobs
- All operations synchronous

### Future Improvements
- Switch to PostgreSQL for production
- Add Redis for session/caching
- Implement message queues for notifications
- Add API rate limiting
- Implement proper error logging
- Add metrics/analytics endpoints
- Separate read/write replicas

## 🧪 Testing Strategy

### Manual Testing
- Registration with new email/username
- Login with correct/incorrect credentials
- Daily check-in (once per day limit)
- Mission completion/toggle
- Streak display and reset
- XP accumulation
- Settings toggle

### API Testing
```bash
./test-api.sh  # Comprehensive API test suite
```

### Browser Testing
- Desktop (Chrome, Firefox, Safari)
- Mobile (iOS Safari, Android Chrome)
- Responsive layout
- Touch interactions

---

**Architecture designed for MVP simplicity with growth potential.**