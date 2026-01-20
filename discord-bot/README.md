# KIWIMU Discord Bot

Discord Bot for KIWIMU MBTI community with automatic role assignment.

## Features

- `/verify` - Verify your MBTI test results and get assigned roles automatically
- Firebase integration to fetch user MBTI data
- Auto-welcome messages
- 16 MBTI role assignments
- VIP tier system

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id
DISCORD_GUILD_ID=your_guild_id
```

3. Place your Firebase service account key as `firebase-adminsdk-key.json`

4. Start the bot:
```bash
npm start
```

## Commands

### /verify
Verifies user's MBTI test results from Firebase and assigns appropriate role.

**Usage:**
```
/verify userid:YOUR_FIREBASE_USER_ID
```

**What it does:**
1. Queries Firebase for user's latest MBTI test result
2. Removes any existing MBTI roles
3. Assigns new MBTI role + "測驗完成者" role
4. Posts welcome message

## Project Structure

```
discord-bot/
├── index.js                    # Main bot file
├── firebase-adminsdk-key.json  # Firebase credentials
├── .env                       # Environment variables
├── WELCOME.md                 # Server welcome guide
└── package.json
```

## Deployment

### Local
```bash
npm start
```

### Production (Heroku/Railway)
Set environment variables and ensure `firebase-adminsdk-key.json` is available.

## Maintenance

- Bot must be running 24/7 for commands to work
- Consider using PM2 or hosting on Heroku/Railway
- Monitor logs for errors

---

**Created for KIWIMU MBTI Community** 🎨
