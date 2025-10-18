# 🚀 Setup Guide - Discord Server Cloner 2.0 Enhanced

## 📋 Prerequisites

- Node.js v16 or higher
- npm or pnpm
- Discord account with token
- Gmail account with app password (for email notifications)

---

## 🔧 Installation

### 1. Install Dependencies

```bash
# Using npm
npm install

# Or using pnpm
pnpm install

# Or using yarn
yarn install
```

This will install all required dependencies including:
- discord.js-selfbot-v13
- nodemailer (NEW)
- chalk
- gradient-string
- boxen
- dotenv
- And all TypeScript types

### 2. Configure Environment Variables (Optional but Recommended)

Create a `.env` file in the root directory:

```env
# Discord Token
TOKEN=your_discord_token_here

# Email Configuration (Currently hardcoded, but better to use .env)
EMAIL_ADDRESS=creepsupp0rter@gmail.com
EMAIL_APP_PASSWORD=kuev pcll maug krbv
```

**Note:** Email credentials are currently hardcoded in `src/utils/emailService.ts`. For better security, consider moving them to environment variables.

---

## 🎮 Running the Application

### Method 1: Using tsx (Recommended)

```bash
# Install tsx globally if not already installed
npm install -g tsx

# Run the application
tsx src/index.ts

# Or use the npm script
npm start
```

### Method 2: Using the start script

```bash
npm start
```

### Method 3: Windows Batch File

```bash
start.bat
```

---

## 📧 Email Configuration

### Getting Gmail App Password:

1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. Scroll to "App passwords"
4. Generate a new app password for "Mail"
5. Use this password in the configuration

### Current Configuration:

The email system is pre-configured with:
- **Email:** creepsupp0rter@gmail.com
- **App Password:** kuev pcll maug krbv

To change this, edit `/workspace/src/utils/emailService.ts`:

```typescript
const EMAIL_CONFIG = {
    email: 'your_email@gmail.com',
    password: 'your_app_password_here'
};
```

---

## 📁 Directory Structure

After installation, your directory structure will look like:

```
workspace/
├── cloner/                    # Backup storage (auto-created)
│   ├── active/               # Active backups
│   ├── archive/              # Archived backups
│   ├── temp/                 # Temporary files
│   ├── metadata.json         # Backup database
│   └── 666.json             # Legacy backup file
├── src/
│   ├── index.ts             # Main entry point
│   ├── src/                 # Core cloner logic
│   │   ├── index.ts
│   │   ├── create.ts
│   │   ├── load.ts
│   │   ├── util.ts
│   │   └── types/           # TypeScript types
│   └── utils/               # Utility modules
│       ├── func.ts          # Main functions
│       ├── emailService.ts  # Email system (NEW)
│       ├── backupDatabase.ts # Database manager (NEW)
│       └── translations.json
├── package.json
├── tsconfig.json
├── DEBUGGING_REPORT.md      # Complete debugging info (NEW)
├── CHANGELOG.md             # Version history (NEW)
├── SETUP_GUIDE.md          # This file (NEW)
└── README.md               # Original readme
```

---

## 🎯 Usage

### 1. First Run

When you run the application for the first time:

1. You'll be prompted for your Discord token (if not in .env)
2. The application will connect to Discord
3. The main menu will appear

### 2. Main Menu Options

```
[1] Clone server to new server
[2] Clone server to existing server
[3] Clone server and create template
[5] Show user information
[6] Show server information
[7] Join support server
[8] Change language (Portuguese/English)
```

### 3. Cloning Process

When cloning a server:

1. Select cloning option (1, 2, or 3)
2. Configure cloning settings or use defaults
3. Enter source server ID
4. Enter destination server ID (if option 2)
5. Wait for cloning to complete
6. **NEW:** Email report will be sent automatically

### 4. Email Notifications

You'll receive emails for:

- ✅ **Successful cloning operations** - With full statistics
- 📦 **Backup creation** - With JSON file attached
- ❌ **Errors** - With error details and stack traces

---

## 🗄️ Backup Management

### Using the Backup Database

The new backup database system provides organized storage:

```typescript
import { backupDb } from './src/utils/backupDatabase';

// List all backups
const backups = backupDb.listBackups();
console.log(`Found ${backups.length} active backups`);

// Get statistics
const stats = backupDb.getStats();
console.log(`Total size: ${stats.totalSizeMB} MB`);

// Archive old backup
backupDb.archiveBackup('backup_id_here');

// Cleanup backups older than 30 days
const cleaned = backupDb.cleanupOldBackups(30);
console.log(`Cleaned up ${cleaned} old backups`);

// Export statistics
const exportPath = backupDb.exportStats();
console.log(`Stats exported to ${exportPath}`);
```

### Backup Locations

- **Active backups:** `cloner/active/`
- **Archived backups:** `cloner/archive/`
- **Legacy backup:** `cloner/666.json`
- **Metadata:** `cloner/metadata.json`

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Email not sending

**Problem:** Email reports not being sent

**Solution:**
- Check Gmail app password is correct
- Ensure 2-step verification is enabled on Gmail
- Check if "Less secure app access" is enabled (if needed)
- Verify internet connection

#### 2. Backup not saving

**Problem:** Backups not being saved

**Solution:**
- Check write permissions on `cloner/` directory
- Ensure enough disk space
- Check console for error messages

#### 3. Token invalid

**Problem:** "Invalid token" error

**Solution:**
- Get a new Discord token
- Make sure it's a user token, not a bot token
- Clear token from .env and try manual entry

#### 4. TypeScript errors

**Problem:** TypeScript compilation errors

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or rebuild
npm run build
```

### Debug Mode

Enable debug mode in configuration:

```typescript
configOptions2.Debug = true;
```

This will show detailed logs for:
- Channel permission fetching
- Voice channel data
- Message fetching
- Thread data

---

## 📊 Features Overview

### ✨ New Features (v2.0 Enhanced)

1. **Email Notification System**
   - Automatic report generation
   - Beautiful HTML templates
   - Attachment support
   - Error notifications

2. **Organized Backup Database**
   - Structured file organization
   - Metadata tracking
   - Statistics and analytics
   - Archive and cleanup features

3. **Enhanced Error Handling**
   - Detailed error tracking
   - Automatic notifications
   - Stack trace logging

4. **Better Logging**
   - Gradient colored output
   - Emoji indicators
   - Clear message types

### 🔧 Bug Fixes

1. Fixed message fetching loop bug
2. Fixed missing channel message assignment

---

## 🔐 Security Best Practices

### 1. Protect Your Credentials

```bash
# Add to .gitignore
echo ".env" >> .gitignore
echo "cloner/" >> .gitignore
```

### 2. Use Environment Variables

Move credentials from code to .env:

```typescript
// In emailService.ts
const EMAIL_CONFIG = {
    email: process.env.EMAIL_ADDRESS,
    password: process.env.EMAIL_APP_PASSWORD
};
```

### 3. Token Security

- Never share your Discord token
- Don't commit tokens to git
- Use .env for token storage
- Regenerate token if exposed

---

## 📝 Configuration Options

### Cloning Configuration

```typescript
configOptions = {
    maxMessagesPerChannel: 0,    // 0 = no messages, 10+ = that many
    jsonSave: true,              // Save backup as JSON
    jsonBeautify: true,          // Pretty-print JSON
    doNotBackup: [               // Skip these items
        "bans",                  // Don't backup bans
        "emojis"                 // Don't backup emojis
    ]
}

configOptions2 = {
    ignoreTickets: false,        // Skip ticket channels
    Debug: false                 // Enable debug logging
}
```

### Email Configuration

Located in `src/utils/emailService.ts`:

```typescript
const EMAIL_CONFIG = {
    email: 'your_email@gmail.com',
    password: 'your_app_password'
};
```

---

## 🎓 Advanced Usage

### Custom Email Templates

Edit `src/utils/emailService.ts` to customize email templates:

```typescript
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        /* Your custom CSS here */
    </style>
</head>
<body>
    <!-- Your custom HTML here -->
</body>
</html>
`;
```

### Backup Database Operations

```typescript
import { backupDb } from './src/utils/backupDatabase';

// Save with custom settings
await backupDb.saveBackup(backupData, false); // No beautify

// Load specific backup
const backup = await backupDb.loadBackup('specific_id');

// Get filtered list
const activeOnly = backupDb.listBackups(false);
const includeArchived = backupDb.listBackups(true);

// Export to custom location
const path = backupDb.exportStats('/custom/path/stats.json');
```

---

## 📞 Support

### Issues

If you encounter any issues:

1. Check this guide first
2. Check `DEBUGGING_REPORT.md` for known issues
3. Enable debug mode for detailed logs
4. Check email notifications for error details

### Contact

- **Email:** creepsupp0rter@gmail.com
- **Discord:** Join support server (option 7 in menu)

---

## 🎉 Getting Started Checklist

- [ ] Install Node.js v16+
- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Configure `.env` file
- [ ] Get Discord token
- [ ] Configure email (or use defaults)
- [ ] Run `npm start`
- [ ] Test with small server first
- [ ] Check email notifications
- [ ] Verify backup creation

---

**Version:** 2.0 Enhanced Edition  
**Last Updated:** 2025-10-18  
**Maintained By:** Development Team
