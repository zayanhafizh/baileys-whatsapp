# Database-Based Authentication Migration

## Overview

This update migrates the WhatsApp Multi-Session API from file-based authentication storage to database-based authentication storage. This change improves scalability, reliability, and makes the system more suitable for production environments.

## Changes Made

### 1. Database Schema Updates

- **New Model**: `AuthData` - Stores WhatsApp authentication data
- **Updated Model**: `WhatsappSession` - Added relationship to `AuthData`
- **Improved Types**: Changed `message`, `metadata`, and `value` fields to `TEXT` type for larger data storage

### 2. New Files Created

- `src/utils/databaseAuth.ts` - Database authentication state handler
- `src/services/database.ts` - Added auth data management methods

### 3. Updated Files

- `src/services/whatsapp.ts` - Updated to use database auth state
- `src/utils/index.ts` - Added export for database auth utilities
- `prisma/schema.prisma` - Added AuthData model

## Benefits

### Before (File-Based)
- Auth data stored in `auth_info_*` folders
- Difficult to backup and restore
- Not suitable for containerized environments
- Hard to manage multiple instances

### After (Database-Based)
- Auth data stored in database
- Easy backup and restore
- Perfect for containerized environments
- Supports multiple instances sharing same database
- Better performance and reliability

## Database Schema

### AuthData Table
```sql
CREATE TABLE auth_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sessionId VARCHAR(255) NOT NULL,
  key VARCHAR(255) NOT NULL,
  value TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY sessionId_key (sessionId, key),
  FOREIGN KEY (sessionId) REFERENCES whatsapp_sessions(sessionId) ON DELETE CASCADE
);
```

## Migration Guide

### For New Installations
1. Run `npm run db:push` to create the new database schema
2. Start the application normally
3. All session auth data will be stored in the database

### For Existing Installations
1. **Backup your existing auth_info_* folders** (if you want to preserve sessions)
2. Run `npm run db:push` to update the database schema
3. Restart the application
4. Existing sessions will need to be re-authenticated (scan QR code again)
5. Old auth_info_* folders will be automatically cleaned up

## Environment Variables

Make sure your `DATABASE_URL` is properly configured in your `.env` file:

```env
# For MySQL (recommended)
DATABASE_URL="mysql://username:password@localhost:3306/whatsapp_api"

# For PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/whatsapp_api"

# For SQLite (development only)
DATABASE_URL="file:./dev.db"
```

## API Changes

No API changes were made. All endpoints remain the same:
- `POST /sessions/add` - Create new session
- `GET /sessions/:sessionId/qr` - Get QR code
- `GET /sessions/:sessionId/status` - Get session status
- `DELETE /sessions/:sessionId` - Delete session
- All other endpoints remain unchanged

## Troubleshooting

### Session Not Found After Migration
- This is expected. Re-authenticate your sessions by scanning QR codes again.

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Ensure the database server is running
- Check that the database user has proper permissions

### Auth Data Not Persisting
- Check database connection
- Verify the `auth_data` table exists
- Check application logs for errors

## Security Considerations

- Auth data is now stored in the database, ensure your database is properly secured
- Use strong database passwords
- Consider encrypting sensitive database fields in production
- Regularly backup your database

## Performance Benefits

- Faster session startup (no file I/O)
- Better concurrent access handling
- Improved reliability
- Easier horizontal scaling

## Monitoring

You can monitor auth data in the database:

```sql
-- Check active sessions with auth data
SELECT 
  ws.sessionId,
  ws.status,
  COUNT(ad.id) as auth_keys_count
FROM whatsapp_sessions ws
LEFT JOIN auth_data ad ON ws.sessionId = ad.sessionId
GROUP BY ws.sessionId, ws.status;

-- Check auth data size
SELECT 
  sessionId,
  key,
  LENGTH(value) as data_size
FROM auth_data
ORDER BY data_size DESC;
```

## Recovery

If you need to recover from file-based auth to database:

1. Stop the application
2. Manually import auth data from files to database (custom script needed)
3. Restart the application

This migration significantly improves the system's production-readiness and scalability. 