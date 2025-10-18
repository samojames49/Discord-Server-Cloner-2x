# 🚀 راهنمای نصب گام به گام

این راهنما شما را قدم به قدم در نصب و راه‌اندازی ربات تلگرام همراهی می‌کند.

## ✅ پیش‌نیازها

قبل از شروع، مطمئن شوید موارد زیر را دارید:

- [ ] یک سرور با PHP 7.4+ و MySQL
- [ ] دسترسی به cPanel یا SSH
- [ ] گواهی SSL (برای HTTPS)
- [ ] یک ربات تلگرام (از @BotFather)
- [ ] یک آدرس ایمیل معتبر

---

## 📝 مرحله 1: ساخت ربات تلگرام

1. به ربات [@BotFather](https://t.me/BotFather) در تلگرام پیام دهید
2. دستور `/newbot` را ارسال کنید
3. نام ربات را وارد کنید (مثال: My Awesome Bot)
4. یوزرنیم ربات را وارد کنید (باید به bot ختم شود، مثال: myawesomebot)
5. توکن دریافتی را کپی کنید (مثال: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

**نکته**: توکن را در جای امنی ذخیره کنید و با کسی به اشتراک نگذارید!

---

## 📥 مرحله 2: دانلود و آپلود فایل‌ها

### روش 1: با استفاده از cPanel

1. وارد cPanel شوید
2. به File Manager بروید
3. پوشه `public_html` را باز کنید
4. یک پوشه جدید با نام `telegram-bot` بسازید
5. تمام فایل‌های پروژه را در این پوشه آپلود کنید

### روش 2: با استفاده از FTP

1. با نرم‌افزار FileZilla به سرور متصل شوید
2. به مسیر `public_html` بروید
3. پوشه `telegram-bot` را ایجاد کنید
4. فایل‌ها را آپلود کنید

### روش 3: با استفاده از Git (پیشرفته)

```bash
cd /path/to/public_html
git clone [repository-url] telegram-bot
cd telegram-bot
```

---

## 🗄️ مرحله 3: ایجاد دیتابیس

### روش 1: با phpMyAdmin (ساده‌تر)

1. وارد phpMyAdmin شوید
2. روی "New" کلیک کنید
3. نام دیتابیس را `telegram_bot` وارد کنید
4. Collation را `utf8mb4_unicode_ci` انتخاب کنید
5. روی "Create" کلیک کنید
6. دیتابیس ایجاد شده را انتخاب کنید
7. به تب "Import" بروید
8. فایل `database.sql` را انتخاب و import کنید

### روش 2: با MySQL Command Line

```bash
# ایجاد دیتابیس
mysql -u root -p -e "CREATE DATABASE telegram_bot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# import فایل SQL
mysql -u root -p telegram_bot < database.sql
```

### روش 3: از طریق cPanel

1. به cPanel بروید
2. MySQL Databases را باز کنید
3. در بخش "Create New Database"، نام `telegram_bot` را وارد کنید
4. به phpMyAdmin بروید و فایل SQL را import کنید

---

## ⚙️ مرحله 4: تنظیم فایل Config

1. فایل `config.example.php` را کپی کنید و نام آن را به `config.php` تغییر دهید:

```bash
cp config.example.php config.php
```

2. فایل `config.php` را ویرایش کنید:

```php
// توکن ربات که از BotFather گرفتید
define('API_KEY', '123456789:ABCdefGHIjklMNOpqrsTUVwxyz');

// آیدی عددی خودتان (نحوه پیدا کردن در زیر)
define('ADMIN_ID', 123456789);

// تنظیمات دیتابیس
define('DB_HOST', 'localhost');
define('DB_NAME', 'telegram_bot');
define('DB_USER', 'root'); // یا یوزرنیم دیتابیس
define('DB_PASS', 'your_password'); // پسورد دیتابیس

// تنظیمات ایمیل
define('EMAIL_FROM', 'noreply@yourdomain.com');
define('EMAIL_FROM_NAME', 'My Bot');
```

### 🔍 نحوه پیدا کردن Chat ID خودتان:

**روش 1**: از ربات [@userinfobot](https://t.me/userinfobot)
1. ربات را استارت کنید
2. آیدی شما نمایش داده می‌شود

**روش 2**: از ربات [@myidbot](https://t.me/myidbot)
1. دستور `/getid` را ارسال کنید
2. عدد نمایش داده شده را کپی کنید

---

## 🌐 مرحله 5: تنظیم Webhook

1. فایل `webhook.php` را باز کنید
2. آدرس دامنه خود را تنظیم کنید:

```php
$webhook_url = "https://yourdomain.com/telegram-bot/bot.php";
```

**توجه**: 
- حتماً از `https://` استفاده کنید (نه `http://`)
- آدرس را با دامنه واقعی خود جایگزین کنید

3. فایل را در مرورگر باز کنید:

```
https://yourdomain.com/telegram-bot/webhook.php
```

4. باید پیام زیر را ببینید:

```
✅ Webhook تنظیم شد!
📡 URL: https://yourdomain.com/telegram-bot/bot.php
```

---

## 🎯 مرحله 6: تست ربات

1. ربات خود را در تلگرام پیدا کنید (یوزرنیمی که ساختید)
2. دستور `/start` را ارسال کنید
3. باید پیام خوش‌آمدگویی دریافت کنید
4. ایمیل خود را وارد کنید
5. کد دریافتی را چک کنید و وارد کنید
6. اگر همه چیز درست باشد، حساب شما فعال می‌شود! 🎉

---

## ⚠️ عیب‌یابی

### مشکل 1: ربات پاسخ نمی‌دهد

**راه‌حل**:
```bash
# اطلاعات Webhook را چک کنید
https://api.telegram.org/botYOUR_TOKEN/getWebhookInfo
```

اگر `last_error_message` دارید، مشکل را بررسی کنید.

### مشکل 2: خطای 500

**راه‌حل**:
1. لاگ خطای PHP را چک کنید:
```bash
tail -f /path/to/error.log
```

2. مجوزهای فایل‌ها را بررسی کنید:
```bash
chmod 644 *.php
```

### مشکل 3: ایمیل ارسال نمی‌شود

**راه‌حل**:
1. تابع `mail()` را تست کنید:
```php
<?php
mail('your@email.com', 'Test', 'Test message');
echo 'Email sent!';
?>
```

2. اگر کار نکرد، از SMTP استفاده کنید (PHPMailer)

### مشکل 4: خطای دیتابیس

**راه‌حل**:
1. اطلاعات اتصال در `config.php` را دوباره چک کنید
2. مطمئن شوید یوزر دیتابیس مجوزهای لازم را دارد:
```sql
GRANT ALL PRIVILEGES ON telegram_bot.* TO 'user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 🔒 تنظیمات امنیتی (اختیاری اما توصیه می‌شود)

### 1. محافظت از فایل config.php

در فایل `.htaccess` اضافه کنید:

```apache
<Files "config.php">
    Order allow,deny
    Deny from all
</Files>
```

### 2. غیرفعال کردن نمایش خطاها

در `php.ini` یا `.htaccess`:

```php
php_flag display_errors Off
php_flag log_errors On
```

### 3. تنظیم فایروال (اختیاری)

اگر به cPanel دسترسی دارید:
1. به "IP Blocker" بروید
2. فقط IP های تلگرام را مجاز کنید

---

## ✅ چک‌لیست نهایی

قبل از استفاده رسمی، این موارد را بررسی کنید:

- [ ] ربات به درستی پاسخ می‌دهد
- [ ] ایمیل تایید ارسال می‌شود
- [ ] کد تایید کار می‌کند
- [ ] ارسال پیام به ادمین کار می‌کند
- [ ] پاسخ ادمین دریافت می‌شود
- [ ] انواع فایل (عکس، ویدیو، صدا) ارسال می‌شود
- [ ] SSL فعال است
- [ ] لاگ خطاها تنظیم شده

---

## 🎓 نکات مهم

1. **هرگز توکن ربات را با کسی به اشتراک نگذارید**
2. **از SSL استفاده کنید (HTTPS)**
3. **به صورت دوره‌ای از دیتابیس backup بگیرید**
4. **لاگ خطاها را مرتب چک کنید**
5. **فایل config.php را در .gitignore قرار دهید**

---

## 🆘 نیاز به کمک؟

اگر مشکلی دارید:

1. ابتدا مستندات را مطالعه کنید
2. لاگ خطاها را بررسی کنید
3. Webhook Info را چک کنید
4. با سازنده تماس بگیرید: [@Camaeal](https://t.me/Camaeal)

---

## 🎉 تبریک!

اگر به اینجا رسیدید، یعنی ربات شما آماده است! 🚀

حالا می‌توانید از ربات لذت ببرید و آن را سفارشی‌سازی کنید.

**موفق باشید!** 💙
