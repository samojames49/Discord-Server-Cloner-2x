# 🤖 Telegram Bot - Email Verification & Message Forwarding

> ربات تلگرام با قابلیت احراز هویت ایمیلی و ارسال پیام به ادمین

## 📋 ویژگی‌ها

- ✅ احراز هویت کاربران با ایمیل
- 📧 ارسال کد تایید ۶ رقمی به ایمیل
- 💬 ارسال و دریافت انواع پیام (متن، عکس، ویدیو، صدا، فایل، استیکر)
- 👤 پنل مدیریت برای پاسخگویی به کاربران
- 🔒 امنیت IP (فقط سرورهای تلگرام)
- 💾 ذخیره‌سازی پیام‌ها در دیتابیس

## 📦 نیازمندی‌ها

- PHP 7.4 یا بالاتر
- MySQL 5.7 یا MariaDB 10.2+
- توابع cURL فعال
- تابع mail() فعال (یا SMTP)
- SSL Certificate (برای Webhook)

## 🚀 نصب و راه‌اندازی

### 1️⃣ آپلود فایل‌ها

فایل‌های پروژه را در سرور خود آپلود کنید.

### 2️⃣ ایجاد دیتابیس

```bash
mysql -u root -p
```

سپس محتوای فایل `database.sql` را اجرا کنید:

```bash
mysql -u root -p < database.sql
```

یا از phpMyAdmin:
- وارد phpMyAdmin شوید
- دیتابیس جدیدی با نام `telegram_bot` بسازید
- محتوای `database.sql` را import کنید

### 3️⃣ تنظیمات

فایل `config.php` را باز کنید و موارد زیر را تنظیم کنید:

```php
define('API_KEY', 'YOUR_BOT_TOKEN_HERE'); // توکن ربات از @BotFather
define('ADMIN_ID', 123456789); // آیدی عددی خودتان

// تنظیمات دیتابیس
define('DB_HOST', 'localhost');
define('DB_NAME', 'telegram_bot');
define('DB_USER', 'root');
define('DB_PASS', 'your_password');

// تنظیمات ایمیل
define('EMAIL_FROM', 'noreply@yourdomain.com');
define('EMAIL_FROM_NAME', 'Telegram Bot');
```

### 4️⃣ تنظیم Webhook

فایل `webhook.php` را باز کنید و آدرس ربات خود را تنظیم کنید:

```php
$webhook_url = "https://yourdomain.com/telegram-bot/bot.php";
```

سپس فایل را در مرورگر باز کنید:
```
https://yourdomain.com/telegram-bot/webhook.php
```

اگر پیغام "✅ Webhook تنظیم شد!" را دیدید، ربات آماده است!

## 📱 نحوه استفاده

### برای کاربران عادی:

1. ربات را استارت کنید: `/start`
2. ایمیل خود را وارد کنید
3. کد ۶ رقمی ارسال شده به ایمیل را وارد کنید
4. پس از تایید، می‌توانید پیام خود را به مدیر ارسال کنید

### برای مدیر:

- برای پاسخ به کاربران، روی پیام آن‌ها **Reply** کنید
- پیام شما به کاربر مورد نظر ارسال می‌شود

## 📁 ساختار پروژه

```
telegram-bot/
├── bot.php              # فایل اصلی ربات (Webhook endpoint)
├── config.php           # تنظیمات و کانفیگ
├── functions.php        # توابع کمکی
├── database.sql         # ساختار دیتابیس
├── webhook.php          # اسکریپت تنظیم Webhook
├── .htaccess           # تنظیمات امنیتی Apache
└── README.md           # مستندات
```

## 🔧 تنظیمات پیشرفته

### تنظیم SMTP برای ایمیل

اگر تابع `mail()` کار نمی‌کند، می‌توانید از کتابخانه PHPMailer استفاده کنید:

```bash
composer require phpmailer/phpmailer
```

سپس تابع `sendEmail()` در `functions.php` را بروزرسانی کنید.

### غیرفعال کردن بررسی IP

اگر می‌خواهید بررسی IP تلگرام را غیرفعال کنید (توصیه نمی‌شود):

در فایل `bot.php` خط زیر را کامنت کنید:
```php
// if (!verifyTelegramIP($telegram_ip_ranges)) { ... }
```

## 🐛 عیب‌یابی

### ربات پاسخ نمی‌دهد

1. Webhook را بررسی کنید:
```
https://api.telegram.org/botYOUR_TOKEN/getWebhookInfo
```

2. لاگ خطاها را چک کنید:
```bash
tail -f error.log
```

3. اطمینان حاصل کنید SSL فعال است

### ایمیل ارسال نمی‌شود

1. تابع `mail()` را تست کنید
2. لاگ سرور را چک کنید
3. از SMTP استفاده کنید

### خطای دیتابیس

1. اطلاعات اتصال در `config.php` را بررسی کنید
2. مجوزهای دیتابیس را چک کنید
3. جداول را دوباره ایجاد کنید

## 📊 جداول دیتابیس

### users
- `id`: شناسه خودکار
- `chat_id`: آیدی کاربر در تلگرام
- `first_name`: نام کاربر
- `username`: یوزرنیم تلگرام
- `email`: ایمیل کاربر
- `verification_code`: کد تایید
- `step`: مرحله فعلی (email/code/none)
- `verified`: وضعیت تایید (0/1)
- `created_at`: تاریخ ثبت‌نام

### messages
- `id`: شناسه خودکار
- `from_chat_id`: فرستنده پیام
- `to_chat_id`: گیرنده پیام
- `message_id`: شناسه پیام در تلگرام
- `message_type`: نوع پیام (text/photo/video/...)
- `sent_at`: تاریخ ارسال

## 🔐 امنیت

- ✅ بررسی IP سرورهای تلگرام
- ✅ محافظت از فایل‌های حساس با .htaccess
- ✅ استفاده از Prepared Statements
- ✅ اعتبارسنجی ایمیل
- ✅ لاگ خطاها

## 📝 مجوز

این پروژه با مجوز MIT منتشر شده است.

## 👨‍💻 سازنده

- **توسعه‌دهنده**: [@Camaeal](https://t.me/Camaeal)
- **کانال**: [@GrokCreator](https://t.me/GrokCreator)
- **ربات‌ساز**: [@GrokCreatorBot](https://t.me/GrokCreatorBot)

---

⭐ اگر این پروژه برای شما مفید بود، حتماً ستاره بدهید!

💙 با تشکر از حمایت شما
