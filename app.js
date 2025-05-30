const express = require('express');
const { DisconnectReason, useMultiFileAuthState, makeWASocket } = require('@whiskeysockets/baileys');
const { PrismaClient } = require('@prisma/client');
const P = require('pino');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Initialize Prisma Client
const prisma = new PrismaClient();

// Store untuk menyimpan multiple sessions
const sessions = new Map();
const sessionQRs = new Map();

// Logger
const logger = P({ level: 'silent' });

// API Key Authentication Middleware
const authenticateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
        return res.status(401).json({
            success: false,
            message: 'API key is required'
        });
    }
    
    const validApiKeys = process.env.API_KEYS ? process.env.API_KEYS.split(',') : ['farabimusic'];
    
    if (!validApiKeys.includes(apiKey)) {
        return res.status(401).json({
            success: false,
            message: 'Invalid API key'
        });
    }
    
    next();
};

// Session status helper
function getSessionStatus(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) return 'DISCONNECTED';
    
    if (session.isAuthenticated) return 'AUTHENTICATED';
    if (session.socket?.ws?.readyState === 1) return 'CONNECTED';
    if (session.socket?.ws?.readyState === 0) return 'CONNECTING';
    return 'DISCONNECTED';
}

// Create or get session from database
async function createSessionRecord(sessionId) {
    try {
        const existingSession = await prisma.whatsappSession.findUnique({
            where: { sessionId }
        });

        if (existingSession) {
            await prisma.whatsappSession.update({
                where: { sessionId },
                data: { 
                    status: 'connecting',
                    updatedAt: new Date()
                }
            });
            return existingSession;
        }

        const session = await prisma.whatsappSession.create({
            data: {
                sessionId,
                status: 'connecting',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });
        return session;
    } catch (error) {
        console.error('Error creating session record:', error);
        return null;
    }
}

// Update session status
async function updateSessionStatus(sessionId, status) {
    try {
        await prisma.whatsappSession.update({
            where: { sessionId },
            data: { 
                status,
                updatedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Error updating session status:', error);
    }
}

// Save chat history to database
async function saveChatHistory(sessionId, phoneNumber, message, messageType = 'text', direction = 'outgoing', metadata = {}) {
    try {
        await prisma.chatHistory.create({
            data: {
                sessionId,
                phoneNumber,
                message,
                messageType,
                direction,
                metadata: JSON.stringify(metadata),
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error('Error saving chat history:', error);
    }
}

// Format nomor telepon
function formatPhoneNumber(number) {
    let formatted = number.replace(/\D/g, '');
    
    if (formatted.startsWith('0')) {
        formatted = '62' + formatted.slice(1);
    }
    
    if (!formatted.startsWith('62')) {
        formatted = '62' + formatted;
    }
    
    return formatted + '@s.whatsapp.net';
}

// Create WhatsApp connection
async function createWhatsAppConnection(sessionId, options = {}) {
    try {
        const authDir = `auth_info_${sessionId}`;
        const { state, saveCreds } = await useMultiFileAuthState(authDir);
        
        await createSessionRecord(sessionId);
        
        const socket = makeWASocket({
            auth: state,
            logger,
            printQRInTerminal: false,
            browser: ['WhatsApp API', 'Chrome', '1.0.0'],
            ...options
        });

        const sessionData = {
            socket,
            isAuthenticated: false,
            authDir,
            status: 'connecting'
        };

        sessions.set(sessionId, sessionData);

        // Event handler untuk QR Code
        socket.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                console.log(`QR Code received for session ${sessionId}`);
                const qrImage = await qrcode.toDataURL(qr);
                sessionQRs.set(sessionId, qrImage);
                await updateSessionStatus(sessionId, 'waiting_qr_scan');
            }
            
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log(`Connection closed for session ${sessionId} due to`, lastDisconnect?.error, ', reconnecting', shouldReconnect);
                
                await updateSessionStatus(sessionId, 'disconnected');
                sessionData.isAuthenticated = false;
                
                if (shouldReconnect) {
                    setTimeout(() => createWhatsAppConnection(sessionId, options), 5000);
                } else {
                    sessions.delete(sessionId);
                    sessionQRs.delete(sessionId);
                }
            } else if (connection === 'open') {
                console.log(`WhatsApp connection opened for session ${sessionId}`);
                sessionData.isAuthenticated = true;
                sessionQRs.delete(sessionId);
                await updateSessionStatus(sessionId, 'connected');
            }
        });

        // Event handler untuk pesan masuk
        socket.ev.on('messages.upsert', async (messageUpdate) => {
            const { messages } = messageUpdate;
            
            for (const message of messages) {
                if (message.key.fromMe) continue;
                
                const phoneNumber = message.key.remoteJid?.replace('@s.whatsapp.net', '').replace('@g.us', '');
                if (!phoneNumber) continue;
                
                let messageText = '';
                let messageType = 'unknown';
                let metadata = {};
                
                if (message.message?.conversation) {
                    messageText = message.message.conversation;
                    messageType = 'text';
                } else if (message.message?.extendedTextMessage?.text) {
                    messageText = message.message.extendedTextMessage.text;
                    messageType = 'text';
                } else if (message.message?.imageMessage) {
                    messageText = message.message.imageMessage.caption || '[Image]';
                    messageType = 'image';
                    metadata = {
                        mimetype: message.message.imageMessage.mimetype,
                        fileLength: message.message.imageMessage.fileLength
                    };
                } else if (message.message?.documentMessage) {
                    messageText = message.message.documentMessage.title || '[Document]';
                    messageType = 'document';
                    metadata = {
                        fileName: message.message.documentMessage.fileName,
                        mimetype: message.message.documentMessage.mimetype,
                        fileLength: message.message.documentMessage.fileLength
                    };
                } else if (message.message?.audioMessage) {
                    messageText = '[Audio]';
                    messageType = 'audio';
                    metadata = {
                        mimetype: message.message.audioMessage.mimetype,
                        seconds: message.message.audioMessage.seconds
                    };
                }
                
                await saveChatHistory(sessionId, phoneNumber, messageText, messageType, 'incoming', metadata);
            }
        });

        socket.ev.on('creds.update', saveCreds);

        return sessionData;
    } catch (error) {
        console.error(`Error creating WhatsApp connection for session ${sessionId}:`, error);
        throw error;
    }
}

// Routes

// GET - List Sessions
app.get('/sessions', authenticateApiKey, async (req, res) => {
    try {
        const sessionList = [];
        
        for (const [sessionId] of sessions) {
            sessionList.push({
                id: sessionId,
                status: getSessionStatus(sessionId)
            });
        }
        
        res.json(sessionList);
    } catch (error) {
        console.error('Error listing sessions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to list sessions',
            error: error.message
        });
    }
});

// GET - Find Session
app.get('/sessions/:sessionId', authenticateApiKey, (req, res) => {
    const { sessionId } = req.params;
    
    if (sessions.has(sessionId)) {
        res.json({ message: 'Session found' });
    } else {
        res.status(404).json({ message: 'Session not found' });
    }
});

// GET - Session Status
app.get('/sessions/:sessionId/status', authenticateApiKey, (req, res) => {
    const { sessionId } = req.params;
    const status = getSessionStatus(sessionId);
    
    res.json({ status });
});

// POST - Add Session
app.post('/sessions/add', authenticateApiKey, async (req, res) => {
    try {
        const { sessionId, ...options } = req.body;
        
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required'
            });
        }
        
        if (sessions.has(sessionId)) {
            return res.status(400).json({
                success: false,
                message: 'Session already exists'
            });
        }
        
        await createWhatsAppConnection(sessionId, options);
        
        // Tunggu sebentar untuk QR code
        setTimeout(() => {
            const qr = sessionQRs.get(sessionId);
            if (qr) {
                res.json({ qr });
            } else {
                res.json({ message: 'Session created, waiting for QR code...' });
            }
        }, 2000);
        
    } catch (error) {
        console.error('Error adding session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add session',
            error: error.message
        });
    }
});

// DELETE - Delete Session
app.delete('/sessions/:sessionId', authenticateApiKey, async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const sessionData = sessions.get(sessionId);
        if (sessionData) {
            if (sessionData.socket) {
                await sessionData.socket.logout();
                await sessionData.socket.end();
            }
            
            // Hapus folder auth
            if (fs.existsSync(sessionData.authDir)) {
                fs.rmSync(sessionData.authDir, { recursive: true, force: true });
            }
            
            sessions.delete(sessionId);
            sessionQRs.delete(sessionId);
            
            await updateSessionStatus(sessionId, 'logged_out');
        }
        
        res.json({ message: 'Session deleted' });
    } catch (error) {
        console.error('Error deleting session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete session',
            error: error.message
        });
    }
});

// POST - Send Message
app.post('/:sessionId/messages/send', authenticateApiKey, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { jid, type, message, options = {} } = req.body;
        
        const sessionData = sessions.get(sessionId);
        if (!sessionData || !sessionData.isAuthenticated) {
            return res.status(400).json({
                success: false,
                message: 'Session not found or not authenticated'
            });
        }
        
        if (!jid || !message) {
            return res.status(400).json({
                success: false,
                message: 'JID and message are required'
            });
        }
        
        let targetJid = jid;
        if (type === 'number') {
            targetJid = formatPhoneNumber(jid);
        }
        
        const result = await sessionData.socket.sendMessage(targetJid, message, options);
        
        // Save to database
        const phoneNumber = jid.replace('@s.whatsapp.net', '').replace('@g.us', '');
        const messageText = message.text || JSON.stringify(message);
        await saveChatHistory(sessionId, phoneNumber, messageText, 'text', 'outgoing');
        
        res.json(result);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
});

// POST - Send Bulk Messages
app.post('/:sessionId/messages/send/bulk', authenticateApiKey, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const messages = req.body;
        
        const sessionData = sessions.get(sessionId);
        if (!sessionData || !sessionData.isAuthenticated) {
            return res.status(400).json({
                success: false,
                message: 'Session not found or not authenticated'
            });
        }
        
        const results = [];
        const errors = [];
        
        for (let i = 0; i < messages.length; i++) {
            const { jid, type, message, options = {}, delay = 1000 } = messages[i];
            
            try {
                if (i > 0) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
                
                let targetJid = jid;
                if (type === 'number') {
                    targetJid = formatPhoneNumber(jid);
                }
                
                const result = await sessionData.socket.sendMessage(targetJid, message, options);
                
                // Save to database
                const phoneNumber = jid.replace('@s.whatsapp.net', '').replace('@g.us', '');
                const messageText = message.text || JSON.stringify(message);
                await saveChatHistory(sessionId, phoneNumber, messageText, 'text', 'outgoing');
                
                results.push({ index: i, result });
            } catch (error) {
                errors.push({ index: i, error: error.message });
            }
        }
        
        res.json({ results, errors });
    } catch (error) {
        console.error('Error sending bulk messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send bulk messages',
            error: error.message
        });
    }
});

// GET - Chat History untuk session tertentu
app.get('/:sessionId/chats/:jid?', authenticateApiKey, async (req, res) => {
    try {
        const { sessionId, jid } = req.params;
        const { page = 1, limit = 25, cursor } = req.query;
        
        const where = { sessionId };
        
        if (jid) {
            const phoneNumber = jid.replace('@s.whatsapp.net', '').replace('@g.us', '');
            where.phoneNumber = phoneNumber;
        }
        
        const chatHistory = await prisma.chatHistory.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            skip: cursor ? undefined : (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit),
            ...(cursor && { cursor: { id: parseInt(cursor) } })
        });
        
        const total = await prisma.chatHistory.count({ where });
        
        res.json({
            data: chatHistory.map(chat => ({
                ...chat,
                metadata: chat.metadata ? JSON.parse(chat.metadata) : {}
            })),
            cursor: chatHistory.length > 0 ? chatHistory[chatHistory.length - 1].id : null,
            total
        });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch chat history',
            error: error.message
        });
    }
});

// GET - Contact List
app.get('/:sessionId/contacts', authenticateApiKey, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { limit = 25, cursor, search } = req.query;
        
        const sessionData = sessions.get(sessionId);
        if (!sessionData || !sessionData.isAuthenticated) {
            return res.status(400).json({
                success: false,
                message: 'Session not found or not authenticated'
            });
        }
        
        // Implementasi akan tergantung pada store Baileys
        // Untuk saat ini return empty array
        res.json({
            data: [],
            cursor: null
        });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contacts',
            error: error.message
        });
    }
});

// GET - Session History
app.get('/sessions-history', authenticateApiKey, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        
        const sessions = await prisma.whatsappSession.findMany({
            orderBy: { createdAt: 'desc' },
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit),
            include: {
                _count: {
                    select: { chatHistory: true }
                }
            }
        });
        
        const total = await prisma.whatsappSession.count();
        
        res.json({
            success: true,
            data: sessions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching sessions history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sessions history',
            error: error.message
        });
    }
});

// Backward compatibility routes
app.get('/status', (req, res) => {
    const activeSessions = Array.from(sessions.entries()).map(([id, data]) => ({
        id,
        status: getSessionStatus(id),
        isAuthenticated: data.isAuthenticated
    }));
    
    res.json({
        success: true,
        sessions: activeSessions,
        totalSessions: sessions.size
    });
});

app.get('/qr', authenticateApiKey, (req, res) => {
    const { sessionId } = req.query;
    
    if (!sessionId) {
        return res.status(400).json({
            success: false,
            message: 'Session ID is required'
        });
    }
    
    const qr = sessionQRs.get(sessionId);
    if (qr) {
        res.json({
            qr,
            message: 'Scan QR code dengan WhatsApp Anda',
            sessionId
        });
    } else if (sessions.has(sessionId) && sessions.get(sessionId).isAuthenticated) {
        res.json({
            message: 'WhatsApp sudah terhubung',
            sessionId
        });
    } else {
        res.json({
            message: 'QR code belum tersedia, tunggu sebentar...',
            sessionId
        });
    }
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`WhatsApp Multi-Session API Server running on port ${PORT}`);
    console.log('Server ready for session management');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down...');
    
    for (const [sessionId, sessionData] of sessions) {
        if (sessionData.socket) {
            await sessionData.socket.end();
        }
    }
    
    await prisma.$disconnect();
    process.exit(0);
});