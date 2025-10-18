<?php
/*
╔════════════════════════════════════╗
║         CONFIG FILE EXAMPLE        ║
╠════════════════════════════════════╣
║ 🧠 Dev          : @Camaeal         ║
║ 📡 Channel      : @GrokCreator     ║
║ 🤖 Bot Saz      : @GrokCreatorBot  ║
╚════════════════════════════════════╝
*/

// Bot Configuration
define('API_KEY', 'YOUR_BOT_TOKEN_HERE'); // توکن ربات از @BotFather
define('ADMIN_ID', 0); // آیدی عددی مالک (عدد بدون گیومه)

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'telegram_bot'); // اسم دیتابیس
define('DB_USER', 'root'); // یوزرنیم MySQL
define('DB_PASS', ''); // پسورد MySQL

// Email Configuration
define('EMAIL_FROM', 'noreply@yourdomain.com');
define('EMAIL_FROM_NAME', 'Telegram Bot');

// Telegram IP Ranges for Security
// این IP ها را تغییر ندهید - مربوط به سرورهای تلگرام است
$telegram_ip_ranges = [
    ['lower' => '149.154.160.0', 'upper' => '149.154.175.255'],
    ['lower' => '91.108.4.0',    'upper' => '91.108.7.255'],
];

?>
