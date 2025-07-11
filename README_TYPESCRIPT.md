# WhatsApp Multi-Session API - TypeScript Version

This is a TypeScript refactor of the WhatsApp Multi-Session API built with Express.js and Baileys.

## 🚀 Features

- **Multi-session support** - Handle multiple WhatsApp connections simultaneously
- **TypeScript** - Full type safety and better development experience
- **Modular architecture** - Clean separation of concerns
- **Database integration** - Chat history and session management with Prisma
- **API authentication** - Secure endpoints with API key validation
- **QR code generation** - Easy WhatsApp authentication
- **Message management** - Send single and bulk messages
- **Chat history** - Retrieve conversation history
- **Session persistence** - Sessions survive server restarts

## 📁 Project Structure

```
src/
├── types/           # TypeScript interfaces and types
├── utils/           # Utility functions
├── middleware/      # Express middleware
├── services/        # Business logic layer
├── controllers/     # Route handlers
├── routes/          # API route definitions
└── app.ts          # Main application file

Legacy files:
├── app.js          # Original JavaScript file (for reference)
├── package.json    # Updated with TypeScript dependencies
└── tsconfig.json   # TypeScript configuration
```

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up database:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push database schema

## 📡 API Documentation

### Session Management

#### Create Session
```http
POST /sessions/add
Content-Type: application/json
x-api-key: your-api-key

{
  "sessionId": "session1"
}
```

#### Get Session Status
```http
GET /sessions/session1/status
x-api-key: your-api-key
```

#### Get QR Code
```http
GET /sessions/session1/qr
x-api-key: your-api-key
```

#### List Sessions
```http
GET /sessions
x-api-key: your-api-key
```

#### Delete Session
```http
DELETE /sessions/session1
x-api-key: your-api-key
```

### Messaging

#### Send Message
```http
POST /session1/messages/send
Content-Type: application/json
x-api-key: your-api-key

{
  "jid": "6281234567890",
  "type": "number",
  "message": {
    "text": "Hello World!"
  }
}
```

#### Send Bulk Messages
```http
POST /session1/messages/send/bulk
Content-Type: application/json
x-api-key: your-api-key

[
  {
    "jid": "6281234567890",
    "type": "number",
    "message": { "text": "Hello 1" },
    "delay": 1000
  },
  {
    "jid": "6289876543210",
    "type": "number", 
    "message": { "text": "Hello 2" },
    "delay": 1000
  }
]
```

#### Get Chat History
```http
GET /session1/chats/6281234567890?page=1&limit=25
x-api-key: your-api-key
```

### Legacy Endpoints (Backward Compatibility)

#### Get Status
```http
GET /status
```

#### Get QR (Legacy)
```http
GET /qr?sessionId=session1
x-api-key: your-api-key
```

## 🏗️ Architecture Overview

### Services Layer
- **WhatsAppService**: Handles WhatsApp connections and messaging
- **DatabaseService**: Manages database operations with Prisma

### Controllers Layer
- **SessionController**: Session management endpoints
- **MessageController**: Message and chat history endpoints
- **LegacyController**: Backward compatibility endpoints

### Middleware
- **Authentication**: API key validation
- **Error Handling**: Centralized error management
- **Request Logging**: HTTP request logging
- **CORS**: Cross-origin resource sharing

### Types
- Complete TypeScript interfaces for all data structures
- Type safety throughout the application
- Better IDE support and autocomplete

## 🔧 Configuration

### Environment Variables
```env
PORT=3000
API_KEYS=your-api-key-1,your-api-key-2
DATABASE_URL="postgresql://user:password@localhost:5432/whatsapp_api"
NODE_ENV=development
```

### TypeScript Configuration
The project uses strict TypeScript settings with:
- Strict null checks
- No implicit any
- Path mapping for clean imports
- Source maps for debugging

## 🚦 Development

### Adding New Features
1. Define types in `src/types/`
2. Create services in `src/services/`
3. Add controllers in `src/controllers/`
4. Define routes in `src/routes/`
5. Update middleware if needed

### Code Style
- Use TypeScript strict mode
- Follow ESLint rules
- Use meaningful variable names
- Add JSDoc comments for public APIs
- Use async/await over promises

## 🔄 Migration from JavaScript

The original `app.js` file has been refactored into a modular TypeScript structure:

- **Before**: Single 900+ line JavaScript file
- **After**: Organized TypeScript modules with proper separation of concerns

All functionality remains the same, but with improved:
- Type safety
- Code organization
- Maintainability
- Developer experience

## 🐛 Error Handling

The application includes comprehensive error handling:
- Global error middleware
- Async error wrapper
- Database error management
- WhatsApp connection error handling
- Graceful shutdown procedures

## 📊 Database Schema

The application uses Prisma with the following main models:
- `WhatsappSession`: Session information
- `ChatHistory`: Message history storage

## 🔐 Security

- API key authentication
- Input validation
- Error message sanitization
- CORS protection
- Rate limiting ready (can be added)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details. 