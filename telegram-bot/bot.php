<?php
/*
╔════════════════════════════════════╗
║      🚨        S O U R C E    🚨   ║
╠════════════════════════════════════╣
║ 🧠 Dev          : @Camaeal         ║
║ 📡 Channel      : @GrokCreator     ║
║ 🤖 Bot Saz      : @GrokCreatorBot  ║
╠════════════════════════════════════╣
║   ☠️  کپی بدون ذکر منبع،            ║
║       مثل این است که مادرت را      ║
║       فروخته‌ای 👩                  ║
╚════════════════════════════════════╝
*/

// Load configuration and functions
require_once 'config.php';
require_once 'functions.php';

// Security: Verify Telegram IP
if (!verifyTelegramIP($telegram_ip_ranges)) {
    http_response_code(403);
    exit("Access denied");
}

// Initialize database
$pdo = initDatabase();

// Get update from Telegram
$update = json_decode(file_get_contents('php://input'), true);

// Handle callback queries
if (isset($update['callback_query'])) {
    $callback = $update['callback_query'];
    $callback_id = $callback['id'];
    $callback_data = $callback['data'];
    $callback_chat = $callback['message']['chat']['id'];
    
    if ($callback_data == 'send_admin') {
        bot('answerCallbackQuery', [
            'callback_query_id' => $callback_id, 
            'text' => '✅ پیام خود را ارسال کنید'
        ]);
        sendMessage($callback_chat, "✍️ <b>پیام خود را بنویسید:</b>\n\n📨 هر چیزی که ارسال کنید به مدیر فرستاده می‌شود");
    } elseif ($callback_data == 'my_info') {
        $user_info = getUserData($pdo, $callback_chat);
        $text = "👤 <b>اطلاعات شما:</b>\n\n";
        $text .= "🆔 آیدی: <code>$callback_chat</code>\n";
        $text .= "📧 ایمیل: " . $user_info['email'] . "\n";
        $text .= "✅ وضعیت: فعال\n";
        $text .= "📅 تاریخ عضویت: " . $user_info['created_at'];
        
        bot('answerCallbackQuery', [
            'callback_query_id' => $callback_id, 
            'text' => '✅ اطلاعات شما'
        ]);
        sendMessage($callback_chat, $text);
    }
    exit;
}

// Handle messages
if (!isset($update['message'])) {
    exit;
}

$message = $update['message'];
$chat_id = $message['chat']['id'] ?? 0;
$message_id = $message['message_id'] ?? 0;
$from_id = $message['from']['id'] ?? 0;
$first_name = $message['from']['first_name'] ?? '';
$username = $message['from']['username'] ?? '';
$text = $message['text'] ?? '';

// Check message types
$photo = isset($message['photo']);
$video = isset($message['video']);
$sticker = isset($message['sticker']);
$document = isset($message['document']);
$audio = isset($message['audio']);
$voice = isset($message['voice']);
$is_reply = isset($message['reply_to_message']);

// Get user data
$user = getUserData($pdo, $chat_id);

// Force /start if user not registered
if (!$user && $text != '/start') {
    sendMessage($chat_id, "❌ لطفاً ابتدا ربات را استارت کنید\n\n/start");
    exit;
}

// Handle /start command
if ($text == '/start') {
    if (!$user) {
        createUser($pdo, $chat_id, $first_name, $username);
        sendMessage($chat_id, "👋 <b>سلام $first_name عزیز!</b>\n\n📧 لطفاً ایمیل خود را وارد کنید:");
    } else {
        if ($user['verified'] == 1) {
            $keyboard = [
                'inline_keyboard' => [
                    [['text' => '📨 ارسال پیام به مدیر', 'callback_data' => 'send_admin']],
                    [['text' => '📊 اطلاعات من', 'callback_data' => 'my_info']]
                ]
            ];
            sendMessage($chat_id, "✅ <b>خوش آمدید!</b>\n\n🤖 از منوی زیر گزینه مورد نظر را انتخاب کنید:", $keyboard);
        } else {
            sendMessage($chat_id, "⏳ حساب شما هنوز فعال نشده است\n\n📧 ایمیل خود را مجدداً وارد کنید:");
            updateUserData($pdo, $chat_id, 'step', 'email');
        }
    }
    exit;
}

$step = $user['step'] ?? 'none';

// Handle email verification step
if ($step == 'email') {
    if (!filter_var($text, FILTER_VALIDATE_EMAIL)) {
        sendMessage($chat_id, "❌ <b>ایمیل نامعتبر است!</b>\n\n📧 لطفاً یک ایمیل معتبر وارد کنید:");
    } else {
        $code = rand(100000, 999999);
        updateUserData($pdo, $chat_id, 'email', $text);
        updateUserData($pdo, $chat_id, 'verification_code', $code);
        updateUserData($pdo, $chat_id, 'step', 'code');
        
        if (sendEmail($text, $code)) {
            sendMessage($chat_id, "✅ <b>کد فعال‌سازی ارسال شد!</b>\n\n📬 یک ایمیل حاوی کد ۶ رقمی برای شما ارسال شد\n\n🔐 لطفاً کد را وارد کنید:");
        } else {
            sendMessage($chat_id, "❌ خطا در ارسال ایمیل!\n\nلطفاً دوباره تلاش کنید: /start");
            updateUserData($pdo, $chat_id, 'step', 'email');
        }
    }
    exit;
}

// Handle verification code step
if ($step == 'code') {
    if ($text == $user['verification_code']) {
        updateUserData($pdo, $chat_id, 'verified', 1);
        updateUserData($pdo, $chat_id, 'step', 'none');
        
        $keyboard = [
            'inline_keyboard' => [
                [['text' => '📨 ارسال پیام به مدیر', 'callback_data' => 'send_admin']],
                [['text' => '📊 اطلاعات من', 'callback_data' => 'my_info']]
            ]
        ];
        
        sendMessage($chat_id, "🎉 <b>تبریک!</b>\n\n✅ حساب شما با موفقیت فعال شد\n\n🤖 اکنون می‌توانید از ربات استفاده کنید", $keyboard);
        sendMessage(ADMIN_ID, "👤 <b>کاربر جدید:</b>\n\n🆔 ID: <code>$chat_id</code>\n👤 نام: $first_name\n📧 ایمیل: " . $user['email']);
    } else {
        sendMessage($chat_id, "❌ <b>کد اشتباه است!</b>\n\n🔐 لطفاً کد صحیح را وارد کنید:");
    }
    exit;
}

// Handle verified users
if ($user['verified'] == 1) {
    // Admin handling replies to users
    if ($chat_id == ADMIN_ID) {
        if ($is_reply) {
            $reply_to_msg = $message['reply_to_message'];
            $stmt = $pdo->prepare("SELECT from_chat_id FROM messages WHERE to_chat_id = ? AND message_id = ? ORDER BY id DESC LIMIT 1");
            $stmt->execute([ADMIN_ID, $reply_to_msg['message_id']]);
            $original = $stmt->fetch();
            
            if ($original) {
                $user_chat = $original['from_chat_id'];
                
                if ($photo) {
                    bot('sendPhoto', [
                        'chat_id' => $user_chat,
                        'photo' => $message['photo'][count($message['photo']) - 1]['file_id'],
                        'caption' => "📩 <b>پاسخ مدیر:</b>\n\n" . ($message['caption'] ?? ''),
                        'parse_mode' => 'HTML'
                    ]);
                } elseif ($video) {
                    bot('sendVideo', [
                        'chat_id' => $user_chat,
                        'video' => $message['video']['file_id'],
                        'caption' => "📩 <b>پاسخ مدیر:</b>\n\n" . ($message['caption'] ?? ''),
                        'parse_mode' => 'HTML'
                    ]);
                } elseif ($document) {
                    bot('sendDocument', [
                        'chat_id' => $user_chat,
                        'document' => $message['document']['file_id'],
                        'caption' => "📩 <b>پاسخ مدیر:</b>\n\n" . ($message['caption'] ?? ''),
                        'parse_mode' => 'HTML'
                    ]);
                } elseif ($voice) {
                    bot('sendVoice', [
                        'chat_id' => $user_chat, 
                        'voice' => $message['voice']['file_id']
                    ]);
                    sendMessage($user_chat, "📩 <b>پیام صوتی از مدیر</b>");
                } elseif ($sticker) {
                    bot('sendSticker', [
                        'chat_id' => $user_chat, 
                        'sticker' => $message['sticker']['file_id']
                    ]);
                } else {
                    sendMessage($user_chat, "📩 <b>پاسخ مدیر:</b>\n\n$text");
                }
                
                sendMessage($chat_id, "✅ پیام شما ارسال شد");
            } else {
                sendMessage($chat_id, "❌ کاربر مقصد یافت نشد!");
            }
        } else {
            sendMessage($chat_id, "💡 <b>پنل مدیریت</b>\n\n📨 برای پاسخ به کاربران، روی پیام آن‌ها Reply کنید");
        }
    } 
    // Regular users sending messages to admin
    else {
        if ($photo) {
            $sent = bot('sendPhoto', [
                'chat_id' => ADMIN_ID,
                'photo' => $message['photo'][count($message['photo']) - 1]['file_id'],
                'caption' => "📸 <b>پیام جدید از:</b>\n\n👤 $first_name\n🆔 <code>$chat_id</code>\n\n" . ($message['caption'] ?? ''),
                'parse_mode' => 'HTML'
            ]);
        } elseif ($video) {
            $sent = bot('sendVideo', [
                'chat_id' => ADMIN_ID,
                'video' => $message['video']['file_id'],
                'caption' => "🎥 <b>پیام جدید از:</b>\n\n👤 $first_name\n🆔 <code>$chat_id</code>\n\n" . ($message['caption'] ?? ''),
                'parse_mode' => 'HTML'
            ]);
        } elseif ($document) {
            $sent = bot('sendDocument', [
                'chat_id' => ADMIN_ID,
                'document' => $message['document']['file_id'],
                'caption' => "📎 <b>پیام جدید از:</b>\n\n👤 $first_name\n🆔 <code>$chat_id</code>\n\n" . ($message['caption'] ?? ''),
                'parse_mode' => 'HTML'
            ]);
        } elseif ($voice) {
            $sent = bot('sendVoice', [
                'chat_id' => ADMIN_ID,
                'voice' => $message['voice']['file_id']
            ]);
            sendMessage(ADMIN_ID, "🎤 پیام صوتی از: $first_name (<code>$chat_id</code>)");
        } elseif ($sticker) {
            $sent = bot('sendSticker', [
                'chat_id' => ADMIN_ID, 
                'sticker' => $message['sticker']['file_id']
            ]);
            sendMessage(ADMIN_ID, "😊 استیکر از: $first_name (<code>$chat_id</code>)");
        } else {
            $sent = sendMessage(ADMIN_ID, "💬 <b>پیام جدید از:</b>\n\n👤 $first_name\n🆔 <code>$chat_id</code>\n\n📝 <i>$text</i>");
        }
        
        // Save message for reply tracking
        if (isset($sent['result']['message_id'])) {
            saveMessage($pdo, $chat_id, ADMIN_ID, $sent['result']['message_id'], 'text');
        }
        
        sendMessage($chat_id, "✅ <b>پیام شما ارسال شد!</b>\n\n⏳ لطفاً منتظر پاسخ مدیر باشید...");
    }
}

?>
