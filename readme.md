# WhatsApp Multi-Session API

API untuk mengelola multiple session WhatsApp dengan dukungan penuh untuk mengirim pesan, menerima pesan, dan menyimpan history chat. Dibangun menggunakan Express.js dan Baileys library.

## 🚀 Fitur

- **Multi-Session Support**: Kelola beberapa akun WhatsApp dalam satu aplikasi
- **QR Code Authentication**: Scan QR code untuk autentikasi
- **Chat History**: Penyimpanan otomatis riwayat chat
- **Bulk Messaging**: Kirim pesan ke multiple kontak sekaligus
- **Media Support**: Dukungan untuk gambar, dokumen, dan audio
- **Session Management**: Monitoring status session real-time
- **API Key Authentication**: Keamanan dengan API key
- **Auto Reconnect**: Reconnect otomatis saat koneksi terputus
- **Database Integration**: Integrasi dengan MySQL/PostgreSQL/SQLite

## 📋 Requirements

- Node.js >= 20.x
- MySQL/PostgreSQL/SQLite
- NPM atau Yarn

## 🛠️ Instalasi

### 1. Clone Repository

```bash
git clone [<repository-url>](https://github.com/afrzl/baileys-whatsapp.git)
cd baileys-whatsapp
```

### 2. Install Dependencies

```bash
npm install
# atau
yarn install
```

### 3. Setup Database

**Untuk MySQL:**
```bash
# Buat database
mysql -u root -p
CREATE DATABASE whatsapp_api;
```

**Untuk PostgreSQL:**
```bash
# Buat database
psql -U postgres
CREATE DATABASE whatsapp_api;
```

### 4. Konfigurasi Environment

Buat file `.env` dari template:

```bash
cp .env.example .env
```

Edit file `.env`:

```env
# Database Configuration
DATABASE_URL="mysql://root:password@localhost:3306/whatsapp_api"
# Untuk PostgreSQL: DATABASE_URL="postgresql://username:password@localhost:5432/whatsapp_api"
# Untuk SQLite: DATABASE_URL="file:./dev.db"

# API Keys (pisahkan dengan koma untuk multiple keys)
API_KEYS="your-api-key-here,another-key"

# Server Configuration
PORT=3000
NODE_ENV=development

# Multi-Session Configuration
MAX_SESSIONS=10
RECONNECT_DELAY=5000
MAX_RECONNECT_ATTEMPTS=5

# Optional: Webhook Configuration
WEBHOOK_URL=""
WEBHOOK_SECRET=""

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=30

# Security
SESSION_SECRET="your-session-secret"
CORS_ORIGIN="*"

# Logging
LOG_LEVEL="info"
```

### 5. Setup Prisma Database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Optional: Open Prisma Studio untuk melihat data
npx prisma studio
```

### 6. Jalankan Aplikasi

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server akan berjalan di `http://localhost:3000`

## Quick Reference
PM2 Commands Cheat Sheet
``` bash
pm2 start app.js --name whatsapp-api
pm2 stop whatsapp-api
pm2 restart whatsapp-api
pm2 delete whatsapp-api
pm2 list
```

## 📖 Penggunaan API

### Authentication

Semua endpoint memerlukan API key yang dikirim melalui header:

```bash
# Menggunakan header x-api-key
curl -H "x-api-key: your-api-key" http://localhost:3000/sessions

# Atau menggunakan Authorization header
curl -H "Authorization: Bearer your-api-key" http://localhost:3000/sessions
```

### Endpoints

#### 1. Session Management

**List All Sessions**
```http
GET /sessions
```

**Get Session Status**
```http
GET /sessions/{sessionId}/status
```

**Add New Session**
```http
POST /sessions/add
Content-Type: application/json

{
  "sessionId": "user001"
}
```

**Get QR Code**
```http
GET /sessions/{sessionId}/qr
```

**Delete Session**
```http
DELETE /sessions/{sessionId}
```

#### 2. Messaging

**Send Message**
```http
POST /{sessionId}/messages/send
Content-Type: application/json

{
  "jid": "6281234567890",
  "type": "number",
  "message": {
    "text": "Hello World!"
  }
}
```

**Send Bulk Messages**
```http
POST /{sessionId}/messages/send/bulk
Content-Type: application/json

[
  {
    "jid": "6281234567890",
    "type": "number",
    "message": {
      "text": "Hello!"
    },
    "delay": 1000
  },
  {
    "jid": "6281234567891",
    "type": "number",
    "message": {
      "text": "Hi there!"
    },
    "delay": 2000
  }
]
```

#### 3. Chat History

**Get Chat History**
```http
GET /{sessionId}/chats
GET /{sessionId}/chats/{jid}?page=1&limit=25
```

**Get Sessions History**
```http
GET /sessions-history?page=1&limit=20
```

## 💡 Contoh Penggunaan

### 1. Membuat Session Baru

```javascript
// 1. Buat session baru
const response = await fetch('http://localhost:3000/sessions/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key'
  },
  body: JSON.stringify({
    sessionId: 'user001'
  })
});

const result = await response.json();

// 2. Jika berhasil, akan mendapat QR code
if (result.success && result.qr) {
  console.log('Scan QR code:', result.qr);
  // Tampilkan QR code di frontend
}
```

### 2. Mengecek Status Session

```javascript
const checkStatus = async (sessionId) => {
  const response = await fetch(`http://localhost:3000/sessions/${sessionId}/status`, {
    headers: {
      'x-api-key': 'your-api-key'
    }
  });
  
  const status = await response.json();
  console.log('Session status:', status.status);
  
  return status.status === 'AUTHENTICATED';
};
```

### 3. Mengirim Pesan

```javascript
const sendMessage = async (sessionId, phoneNumber, message) => {
  const response = await fetch(`http://localhost:3000/${sessionId}/messages/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'your-api-key'
    },
    body: JSON.stringify({
      jid: phoneNumber,
      type: 'number',
      message: {
        text: message
      }
    })
  });
  
  return await response.json();
};

// Contoh penggunaan
await sendMessage('user001', '6281234567890', 'Hello from API!');
```

### 4. Mengirim Pesan dengan Media

```javascript
// Mengirim gambar
const sendImage = async (sessionId, phoneNumber, imageUrl, caption) => {
  const response = await fetch(`http://localhost:3000/${sessionId}/messages/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'your-api-key'
    },
    body: JSON.stringify({
      jid: phoneNumber,
      type: 'number',
      message: {
        image: { url: imageUrl },
        caption: caption
      }
    })
  });
  
  return await response.json();
};
```

## 🔧 Konfigurasi Advanced

### Custom Browser Options

```javascript
// Saat membuat session, bisa menambahkan options
const options = {
  browser: ['Custom Bot', 'Chrome', '1.0.0'],
  connectTimeoutMs: 60000,
  defaultQueryTimeoutMs: 60000,
  keepAliveIntervalMs: 30000
};

// POST /sessions/add dengan body:
{
  "sessionId": "user001",
  ...options
}
```

### Webhook Configuration

Untuk menerima pesan masuk secara real-time:

```env
WEBHOOK_URL="https://your-server.com/webhook"
WEBHOOK_SECRET="your-webhook-secret"
```

## 🐛 Troubleshooting

### Session Tidak Terhubung

1. **Cek koneksi internet**
2. **Pastikan QR code sudah di-scan**
3. **Restart session jika perlu**:
   ```bash
   # Delete session lama
   curl -X DELETE -H "x-api-key: your-key" http://localhost:3000/sessions/user001
   
   # Buat session baru
   curl -X POST -H "x-api-key: your-key" -H "Content-Type: application/json" \
        -d '{"sessionId":"user001"}' http://localhost:3000/sessions/add
   ```

### QR Code Tidak Muncul

1. **Tunggu beberapa detik** (biasanya 5-10 detik)
2. **Cek log server** untuk error
3. **Pastikan port tidak diblokir firewall**

### Pesan Tidak Terkirim

1. **Verifikasi session sudah authenticated**:
   ```bash
   curl -H "x-api-key: your-key" http://localhost:3000/sessions/user001/status
   ```
2. **Cek format nomor telepon** (harus format internasional tanpa +)
3. **Pastikan nomor terdaftar di WhatsApp**

### Database Error

1. **Cek koneksi database**:
   ```bash
   npx prisma db push
   ```
2. **Reset database jika perlu**:
   ```bash
   npx prisma migrate reset
   npx prisma db push
   ```

## 📝 Log Files

Log aplikasi tersimpan di:
- Console output
- File: `logs/app.log` (jika dikonfigurasi)

## 🔒 Security Notes

1. **Jangan expose API key** di frontend
2. **Gunakan HTTPS** di production
3. **Limit rate limiting** sesuai kebutuhan
4. **Backup database** secara berkala
5. **Monitor session usage** untuk mencegah abuse

## 📊 Database Schema

### WhatsappSession Table
- `id`: Primary key
- `sessionId`: Unique session identifier
- `status`: Session status (connecting, waiting_qr_scan, connected, etc.)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### ChatHistory Table
- `id`: Primary key
- `sessionId`: Foreign key to WhatsappSession
- `phoneNumber`: Contact phone number
- `message`: Message content
- `messageType`: Type of message (text, image, document, etc.)
- `direction`: Message direction (incoming, outgoing)
- `metadata`: Additional data (JSON string)
- `timestamp`: Message timestamp

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add some amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:
1. Check this documentation first
2. Review the error logs
3. Search existing issues in the repository
4. Create a new issue with detailed information
5. Contact me directly for urgent matters