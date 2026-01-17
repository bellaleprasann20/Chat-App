# Chat Application

A real-time chat application that enables users to communicate instantly with features like private messaging, group chats, and online status indicators.

## Features

- Real-time messaging
- User authentication and authorization
- Private one-on-one conversations
- Group chat rooms
- Online/Offline status indicators
- Message notifications
- Emoji support
- File and image sharing
- Message history
- Responsive UI for mobile and desktop

## Technologies Used

### Frontend
- React.js / HTML/CSS/JavaScript
- Socket.io-client
- Tailwind CSS / Bootstrap

### Backend
- Node.js
- Express.js
- Socket.io
- MongoDB / Firebase
- JWT for authentication

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB or Firebase account

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/bellaleprasann20/chat-app.git
```

2. Navigate to backend directory:
```bash
cd chat-app/backend
```

3. Install dependencies:
```bash
npm install
```

4. Create `.env` file and add:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

5. Start the server:
```bash
npm start
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd ../frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Usage

1. Register a new account or login
2. Start a new conversation or join a chat room
3. Send messages, files, and emojis in real-time
4. View online users and message history

## Project Structure

```
chat-app/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js
│   └── public/
└── README.md
```

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/messages/:chatId` - Get chat messages
- `POST /api/messages` - Send new message
- `GET /api/users` - Get all users

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT License

---

**Commit Message:** `docs: add comprehensive README for real-time chat application`