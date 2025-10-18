<?php
/*
╔════════════════════════════════════╗
║         FUNCTIONS FILE             ║
╠════════════════════════════════════╣
║ 🧠 Dev          : @Camaeal         ║
║ 📡 Channel      : @GrokCreator     ║
║ 🤖 Bot Saz      : @GrokCreatorBot  ║
╚════════════════════════════════════╝
*/

/**
 * Initialize database connection
 */
function initDatabase() {
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", 
            DB_USER, 
            DB_PASS
        );
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch (PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        die("Database connection failed");
    }
}

/**
 * Call Telegram Bot API
 */
function bot($method, $datas = []) {
    $url = "https://api.telegram.org/bot" . API_KEY . "/" . $method;
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $datas);
    $res = curl_exec($ch);
    
    if (curl_errno($ch)) {
        error_log('Curl error: ' . curl_error($ch));
    }
    
    curl_close($ch);
    return json_decode($res, true);
}

/**
 * Send text message
 */
function sendMessage($chat_id, $text, $reply_markup = null) {
    $data = [
        'chat_id' => $chat_id,
        'text' => $text,
        'parse_mode' => 'HTML'
    ];
    
    if ($reply_markup) {
        $data['reply_markup'] = json_encode($reply_markup);
    }
    
    return bot('sendMessage', $data);
}

/**
 * Forward message
 */
function forwardMessage($to_chat, $from_chat, $message_id) {
    return bot('forwardMessage', [
        'chat_id' => $to_chat,
        'from_chat_id' => $from_chat,
        'message_id' => $message_id
    ]);
}

/**
 * Get user data from database
 */
function getUserData($pdo, $chat_id) {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE chat_id = ?");
    $stmt->execute([$chat_id]);
    return $stmt->fetch();
}

/**
 * Update user data
 */
function updateUserData($pdo, $chat_id, $field, $value) {
    $allowed_fields = ['email', 'verification_code', 'step', 'verified'];
    
    if (!in_array($field, $allowed_fields)) {
        return false;
    }
    
    $stmt = $pdo->prepare("UPDATE users SET $field = ? WHERE chat_id = ?");
    return $stmt->execute([$value, $chat_id]);
}

/**
 * Create new user
 */
function createUser($pdo, $chat_id, $first_name, $username) {
    try {
        $stmt = $pdo->prepare("INSERT INTO users (chat_id, first_name, username, step, verified) VALUES (?, ?, ?, 'email', 0)");
        return $stmt->execute([$chat_id, $first_name, $username]);
    } catch (PDOException $e) {
        error_log("Error creating user: " . $e->getMessage());
        return false;
    }
}

/**
 * Save message to database
 */
function saveMessage($pdo, $from_chat, $to_chat, $message_id, $message_type) {
    try {
        $stmt = $pdo->prepare("INSERT INTO messages (from_chat_id, to_chat_id, message_id, message_type, sent_at) VALUES (?, ?, ?, ?, NOW())");
        return $stmt->execute([$from_chat, $to_chat, $message_id, $message_type]);
    } catch (PDOException $e) {
        error_log("Error saving message: " . $e->getMessage());
        return false;
    }
}

/**
 * Send verification email
 */
function sendEmail($to, $code) {
    $subject = "🔐 کد فعال‌سازی ربات تلگرام";
    $message = "
    <html>
    <head>
        <meta charset='UTF-8'>
        <title>کد فعال‌سازی</title>
    </head>
    <body style='font-family: Tahoma, Arial, sans-serif; direction: rtl; text-align: center; background-color: #f4f4f4; padding: 20px;'>
        <div style='max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>
            <h2 style='color: #2196F3;'>کد فعال‌سازی شما</h2>
            <div style='background-color: #f0f8ff; padding: 20px; border-radius: 5px; margin: 20px 0;'>
                <p style='font-size: 32px; color: #2196F3; font-weight: bold; letter-spacing: 5px; margin: 0;'>$code</p>
            </div>
            <p style='color: #666; font-size: 16px;'>این کد را در ربات وارد کنید</p>
            <p style='color: #999; font-size: 14px; margin-top: 30px;'>⚠️ این کد فقط یکبار قابل استفاده است</p>
            <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'>
            <small style='color: #999;'>با تشکر از شما 💙</small>
        </div>
    </body>
    </html>
    ";
    
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8\r\n";
    $headers .= "From: " . EMAIL_FROM_NAME . " <" . EMAIL_FROM . ">\r\n";
    
    return mail($to, $subject, $message, $headers);
}

/**
 * Verify Telegram IP
 */
function verifyTelegramIP($telegram_ip_ranges) {
    if (!filter_var($_SERVER['REMOTE_ADDR'], FILTER_VALIDATE_IP)) {
        return false;
    }
    
    $ip_dec = (float) sprintf("%u", ip2long($_SERVER['REMOTE_ADDR']));
    
    foreach ($telegram_ip_ranges as $range) {
        $lower_dec = (float) sprintf("%u", ip2long($range['lower']));
        $upper_dec = (float) sprintf("%u", ip2long($range['upper']));
        
        if ($ip_dec >= $lower_dec && $ip_dec <= $upper_dec) {
            return true;
        }
    }
    
    return false;
}

?>
