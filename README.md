# Real-Time Chat Application

A full-stack real-time chat application built with React, Node.js, Express, Socket.io, and MongoDB.

**Live Frontend:** https://chat-app-eight-sand-86.vercel.app/ 
**Live Backend API:** https://chat-app-5dn5.onrender.com  
**GitHub Repo:** https://github.com/bellaleprasann20/Chat-App

---

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Socket.io-client, Axios, React Router
- **Backend:** Node.js, Express, Socket.io, Mongoose
- **Database:** MongoDB
- **Auth:** JWT (JSON Web Tokens)
- **Deployment:** Frontend on Vercel, Backend on Render

---

## Project Setup Instructions

### Prerequisites
- Node.js v14 or higher
- MongoDB (local instance or MongoDB Atlas)
- npm or yarn

### Clone the Repository
```bash
git clone https://github.com/your-username/chat-app.git
cd chat-app
```

---

## Steps to Run the Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in the values in .env (see Environment Variables section below)
npm run dev
```

The backend will start on `http://localhost:5000`.

---

## Steps to Run the Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Fill in the values in .env (see Environment Variables section below)
npm run dev
```

The frontend will start on `http://localhost:3000` (or the port Vite assigns).

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the server runs on | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/chatapp` |
| `JWT_SECRET` | Secret key for signing JWTs | `a_long_random_string` |
| `JWT_EXPIRE` | Token expiry duration | `30d` |
| `CORS_ORIGIN` | Allowed frontend origin for CORS | `http://localhost:3000` |
| `SOCKET_CORS_ORIGIN` | Allowed frontend origin for Socket.io | `http://localhost:3000` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend REST API base URL | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Backend Socket.io URL | `http://localhost:5000` |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/profile` | Get logged-in user's profile |

### Chat Rooms
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/chat/rooms` | Get all chat rooms |
| POST | `/api/chat/rooms` | Create a new chat room |
| POST | `/api/chat/rooms/:id/join` | Join a room |

### Messages
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/messages/:roomId` | Fetch chat history for a room |
| POST | `/api/messages` | Send a new message |

---

## Real-Time Events (Socket.io)

| Event | Direction | Description |
|---|---|---|
| `joinRoom` | Client → Server | Join a chat room |
| `leaveRoom` | Client → Server | Leave a chat room |
| `sendMessage` | Client → Server | Send a message to a room |
| `message` | Server → Client | Broadcast a new message |
| `typing` | Client ↔ Server | Typing indicator |
| `onlineUsers` | Server → Client | List of currently online users in a room |
| `userJoined` / `userLeft` | Server → Client | Notify room of user join/leave |

---

## Features

### Core (Required)
- Real-time messaging via Socket.io (no polling)
- Send and receive messages instantly
- Persisted chat history — messages load from MongoDB after refresh
- Message timestamps
- REST API for sending messages and fetching chat history
- Graceful handling of user connect/disconnect

### Bonus (Implemented)
- Username/password authentication with JWT (beyond dummy login)
- Typing indicators ("User is typing…")
- Online/offline user status with live updates
- Messages stored in MongoDB
- Backend deployed on Render, frontend deployed on Vercel

---

## Design Decisions

- **JWT over session-based auth:** chosen for statelessness, making it easy to authenticate both REST requests and Socket.io connections using the same token.
- **Socket.io middleware for auth:** the socket connection is authenticated using the JWT before any events are processed, so only logged-in users can join rooms or send messages.
- **Hybrid REST + Socket.io for messages:** messages are broadcast instantly via Socket.io for real-time delivery, and also persisted via a REST call to MongoDB, so refreshing the page always shows the full history even if a socket event was missed.
- **Room-based architecture:** chat is organized into rooms (documents in MongoDB) with a `members` array, allowing multiple concurrent group conversations rather than a single global chat.
- **Separation of concerns:** backend is split into controllers/models/routes/services/middlewares for maintainability; frontend separates pages, reusable components, context (auth/chat state), and services (API/socket clients).

---

## Assumptions

- Users are trusted to choose unique usernames at registration; no email verification step is required for this assignment.
- A single MongoDB instance is sufficient for this scope (no sharding/replica set considerations).
- The free tier of Render may cause the backend to spin down after inactivity, resulting in a ~30 second delay on the first request after idling — this is expected in the demo, not a bug.
- Message read/delivered receipts are tracked in the data model but not fully surfaced in the UI, since this was listed as optional/bonus.

---

## Known Limitations

- Backend free-tier hosting (Render) may sleep after 15 minutes of inactivity.
- No automated test suite included due to the assignment's time constraints.

---

## Demo

Since this is a React (not React Native) web app, no APK was generated. A screen recording demonstrating registration, login, real-time messaging across two sessions, typing indicators, and message persistence after refresh is included here:

