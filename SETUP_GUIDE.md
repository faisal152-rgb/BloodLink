# BloodLink - Setup Guide

## Project Structure

```
bloodlink/
├── backend/          # Express.js server
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── config/
│   ├── models/
│   ├── routes/
│   └── ...
├── frontend/         # React + Vite app
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── ...
└── README.md
```

## Setup Instructions

### Backend Setup

```bash
cd backend
npm install
npm run dev        # Runs with nodemon (auto-restart on changes)
# OR
npm start          # Runs without auto-restart
```

**Backend runs on:** `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev        # Runs Vite dev server
```

**Frontend runs on:** `http://localhost:5173`

## Environment Variables

Backend requires a `.env` file in the `backend/` folder:

```env
PORT=5000
MONGO_URI=
JWT_SECRET=
CLIENT_URL=http://localhost:5173

GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

FACEBOOK_APP_ID=YOUR_FACEBOOK_APP_ID
FACEBOOK_APP_SECRET=YOUR_FACEBOOK_APP_SECRET

TWITTER_CONSUMER_KEY=YOUR_TWITTER_CONSUMER_KEY
TWITTER_CONSUMER_SECRET=YOUR_TWITTER_CONSUMER_SECRET

ADMIN_EMAILS=
HOSPITAL_EMAILS=
BLOODBANK_EMAILS=
```

## Running Both Together

**Option 1: Terminal Windows**
- Open Terminal 1: `cd backend && npm run dev`
- Open Terminal 2: `cd frontend && npm run dev`

**Option 2: From Root** (if you want to run from root with a single command)
Install concurrently globally or locally:
```bash
npm install -D concurrently
```

Then add a script to root `package.json`:
```json
"scripts": {
  "dev": "concurrently \"cd backend && npm run dev\" \"cd frontend && npm run dev\""
}
```

Then run: `npm run dev`

## Key Changes Made

✅ Separated backend and frontend into independent folders  
✅ Each has its own `package.json` with only required dependencies  
✅ Backend runs on port 5000  
✅ Frontend runs on port 5173  
✅ Can be developed and deployed independently  
✅ Updated `.env` path in backend server.js  

## Database Setup

Ensure MongoDB is running:

```bash
# Windows (if using MongoDB locally)
mongod
```

## Troubleshooting

1. **Port already in use?** Change PORT in backend/.env and CLIENT_URL in frontend/.env or vite.config.js

2. **Dependencies not installed?** Run `npm install` in both backend/ and frontend/ folders

3. **Login not working?** Make sure:
   - Backend server is running on port 5000
   - Frontend CLIENT_URL matches actual frontend port
   - MongoDB is running
   - .env file is in the backend/ folder

4. **CORS errors?** Check that CLIENT_URL in backend/.env matches the frontend's actual URL and port
