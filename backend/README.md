# Campus Life Backend

Express.js + SQLite backend for the Campus Life game MVP.

## Features

- User authentication (register/login)
- Daily check-in system with streak tracking
- Daily missions (3 per day)
- XP tracking
- Notification preferences

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User
- `GET /api/user/:userId` - Get user data
- `PATCH /api/user/:userId/notifications` - Update notification settings

### Check-in
- `POST /api/checkin` - Daily check-in

### Missions
- `POST /api/mission/:missionId/toggle` - Toggle mission completion

## Database

SQLite database stores:
- Users (credentials, streak, XP, preferences)
- Daily missions (per user)
- Check-in history

## Development

Backend runs on port 3000 by default.