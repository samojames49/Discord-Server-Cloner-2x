<?php
/*
╔════════════════════════════════════╗
║       WEBHOOK SETUP SCRIPT         ║
╠════════════════════════════════════╣
║ 🧠 Dev          : @Camaeal         ║
║ 📡 Channel      : @GrokCreator     ║
║ 🤖 Bot Saz      : @GrokCreatorBot  ║
╚════════════════════════════════════╝
*/

require_once 'config.php';

// Your webhook URL (change this to your actual domain)
$webhook_url = "https://yourdomain.com/telegram-bot/bot.php";

// Set webhook
$response = file_get_contents("https://api.telegram.org/bot" . API_KEY . "/setWebhook?url=" . urlencode($webhook_url));
$result = json_decode($response, true);

if ($result['ok']) {
    echo "✅ Webhook تنظیم شد!\n";
    echo "📡 URL: " . $webhook_url . "\n";
    echo "📝 توضیحات: " . ($result['description'] ?? 'موفق') . "\n";
} else {
    echo "❌ خطا در تنظیم Webhook!\n";
    echo "📝 پیغام خطا: " . ($result['description'] ?? 'نامشخص') . "\n";
}

// Get webhook info
echo "\n📊 اطلاعات Webhook:\n";
$info = file_get_contents("https://api.telegram.org/bot" . API_KEY . "/getWebhookInfo");
$webhook_info = json_decode($info, true);

if ($webhook_info['ok']) {
    echo "URL: " . ($webhook_info['result']['url'] ?? 'تنظیم نشده') . "\n";
    echo "تعداد آپدیت در صف: " . ($webhook_info['result']['pending_update_count'] ?? 0) . "\n";
    echo "آخرین خطا: " . ($webhook_info['result']['last_error_message'] ?? 'ندارد') . "\n";
}

?>
