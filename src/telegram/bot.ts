import dotenv from 'dotenv';
import TelegramBot, { EditMessageTextOptions, SendMessageOptions } from 'node-telegram-bot-api';
import nodemailer from 'nodemailer';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

dotenv.config();

// Simple JSON store
type UserRecord = {
  chatId: number;
  firstName: string;
  username?: string;
  email?: string;
  verificationCode?: string;
  verified: boolean;
  step: 'none' | 'email' | 'code';
  createdAt: string;
};

type MessageRecord = {
  id: string; // `${to}:${messageId}`
  fromChatId: number;
  toChatId: number;
  messageId: number;
  messageType: string;
  sentAt: string;
};

const DATA_DIR = join(__dirname, '..', '..', 'data');
const USERS_JSON = join(DATA_DIR, 'users.json');
const MSGS_JSON = join(DATA_DIR, 'messages.json');

function ensureStore() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(USERS_JSON)) writeFileSync(USERS_JSON, JSON.stringify([], null, 2));
  if (!existsSync(MSGS_JSON)) writeFileSync(MSGS_JSON, JSON.stringify([], null, 2));
}

function loadUsers(): UserRecord[] {
  ensureStore();
  return JSON.parse(readFileSync(USERS_JSON, 'utf-8')) as UserRecord[];
}

function saveUsers(users: UserRecord[]) {
  writeFileSync(USERS_JSON, JSON.stringify(users, null, 2));
}

function getUser(chatId: number): UserRecord | undefined {
  return loadUsers().find(u => u.chatId === chatId);
}

function upsertUser(user: UserRecord) {
  const users = loadUsers();
  const idx = users.findIndex(u => u.chatId === user.chatId);
  if (idx >= 0) users[idx] = user; else users.push(user);
  saveUsers(users);
}

function loadMessages(): MessageRecord[] {
  ensureStore();
  return JSON.parse(readFileSync(MSGS_JSON, 'utf-8')) as MessageRecord[];
}

function saveMessages(msgs: MessageRecord[]) {
  writeFileSync(MSGS_JSON, JSON.stringify(msgs, null, 2));
}

function addMessage(rec: MessageRecord) {
  const msgs = loadMessages();
  msgs.push(rec);
  saveMessages(msgs);
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const ADMIN_ID = Number(process.env.TELEGRAM_ADMIN_ID || 0);

if (!BOT_TOKEN || !ADMIN_ID) {
  // eslint-disable-next-line no-console
  console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_ID in environment');
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Email transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Boolean(process.env.SMTP_SECURE === 'true'),
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
});

async function sendEmail(to: string, code: string) {
  const fromAddr = process.env.SMTP_FROM || 'noreply@example.com';
  const subject = 'کد فعال‌سازی ربات تلگرام';
  const html = `
  <html>
  <head><title>کد فعال‌سازی</title></head>
  <body style="font-family: Tahoma; direction: rtl; text-align: center;">
    <h2>کد فعال‌سازی شما</h2>
    <p style="font-size:24px;color:#2196F3;font-weight:bold;">${code}</p>
    <p>این کد را در ربات وارد کنید</p>
    <hr/>
    <small>با تشکر از شما 💙</small>
  </body>
  </html>`;
  await transporter.sendMail({ from: fromAddr, to, subject, html });
}

function send(chatId: number, text: string, options?: SendMessageOptions) {
  return bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...options });
}

bot.onText(/^\/start$/, async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from?.first_name || '';
  const username = msg.from?.username;
  let user = getUser(chatId);
  if (!user) {
    user = {
      chatId,
      firstName,
      username,
      verified: false,
      step: 'email',
      createdAt: new Date().toISOString(),
    };
    upsertUser(user);
    await send(chatId, `👋 <b>سلام ${firstName} عزیز!</b>\n\n📧 لطفاً ایمیل خود را وارد کنید:`);
    return;
  }
  if (user.verified) {
    const keyboard: EditMessageTextOptions['reply_markup'] = {
      inline_keyboard: [
        [{ text: '📨 ارسال پیام به مدیر', callback_data: 'send_admin' }],
        [{ text: '📊 اطلاعات من', callback_data: 'my_info' }],
      ],
    };
    await send(chatId, '✅ <b>خوش آمدید!</b>\n\n🤖 از منوی زیر گزینه مورد نظر را انتخاب کنید:', { reply_markup: keyboard });
  } else {
    user.step = 'email';
    upsertUser(user);
    await send(chatId, '⏳ حساب شما هنوز فعال نشده است\n\n📧 ایمیل خود را مجدداً وارد کنید:');
  }
});

bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return; // handled by /start or other
  const chatId = msg.chat.id;
  const user = getUser(chatId);
  if (!user) {
    await send(chatId, '❌ لطفاً ابتدا ربات را استارت کنید\n\n/start');
    return;
  }
  if (user.step === 'email') {
    const email = msg.text.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await send(chatId, '❌ <b>ایمیل نامعتبر است!</b>\n\n📧 لطفاً یک ایمیل معتبر وارد کنید:');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.email = email;
    user.verificationCode = code;
    user.step = 'code';
    upsertUser(user);
    try {
      await sendEmail(email, code);
      await send(chatId, '✅ <b>کد فعال‌سازی ارسال شد!</b>\n\n📬 یک ایمیل حاوی کد ۶ رقمی برای شما ارسال شد\n\n🔐 لطفاً کد را وارد کنید:');
    } catch (_e) {
      user.step = 'email';
      upsertUser(user);
      await send(chatId, '❌ خطا در ارسال ایمیل!\n\nلطفاً دوباره تلاش کنید: /start');
    }
    return;
  }
  if (user.step === 'code') {
    if (msg.text.trim() === user.verificationCode) {
      user.verified = true;
      user.step = 'none';
      upsertUser(user);
      const keyboard: EditMessageTextOptions['reply_markup'] = {
        inline_keyboard: [
          [{ text: '📨 ارسال پیام به مدیر', callback_data: 'send_admin' }],
          [{ text: '📊 اطلاعات من', callback_data: 'my_info' }],
        ],
      };
      await send(chatId, '🎉 <b>تبریک!</b>\n\n✅ حساب شما با موفقیت فعال شد\n\n🤖 اکنون می‌توانید از ربات استفاده کنید', { reply_markup: keyboard });
      await send(ADMIN_ID, `👤 <b>کاربر جدید:</b>\n\n🆔 ID: <code>${chatId}</code>\n👤 نام: ${user.firstName}\n📧 ایمیل: ${user.email}`);
    } else {
      await send(chatId, '❌ <b>کد اشتباه است!</b>\n\n🔐 لطفاً کد صحیح را وارد کنید:');
    }
    return;
  }

  // Verified users: forward to admin
  if (user.verified) {
    try {
      let sent;
      if (msg.photo?.length) {
        const photo = msg.photo[msg.photo.length - 1];
        sent = await bot.sendPhoto(ADMIN_ID, photo.file_id, {
          caption: `📸 <b>پیام جدید از:</b>\n\n👤 ${user.firstName}\n🆔 <code>${chatId}</code>\n\n${msg.caption || ''}`,
          parse_mode: 'HTML',
        });
      } else if (msg.video) {
        sent = await bot.sendVideo(ADMIN_ID, msg.video.file_id, {
          caption: `🎥 <b>پیام جدید از:</b>\n\n👤 ${user.firstName}\n🆔 <code>${chatId}</code>\n\n${msg.caption || ''}`,
          parse_mode: 'HTML',
        });
      } else if (msg.document) {
        sent = await bot.sendDocument(ADMIN_ID, msg.document.file_id, {
          caption: `📎 <b>پیام جدید از:</b>\n\n👤 ${user.firstName}\n🆔 <code>${chatId}</code>\n\n${msg.caption || ''}`,
          parse_mode: 'HTML',
        });
      } else if (msg.voice) {
        sent = await bot.sendVoice(ADMIN_ID, msg.voice.file_id, { caption: `🎤 پیام صوتی از: ${user.firstName} (${chatId})` });
      } else if (msg.sticker) {
        sent = await bot.sendSticker(ADMIN_ID, msg.sticker.file_id);
        await send(ADMIN_ID, `😊 استیکر از: ${user.firstName} (${chatId})`);
      } else {
        sent = await send(ADMIN_ID, `💬 <b>پیام جدید از:</b>\n\n👤 ${user.firstName}\n🆔 <code>${chatId}</code>\n\n📝 <i>${msg.text}</i>`);
      }
      if (sent?.message_id) {
        addMessage({
          id: `${ADMIN_ID}:${sent.message_id}`,
          fromChatId: chatId,
          toChatId: ADMIN_ID,
          messageId: sent.message_id,
          messageType: 'text',
          sentAt: new Date().toISOString(),
        });
      }
      await send(chatId, '✅ <b>پیام شما ارسال شد!</b>\n\n⏳ لطفاً منتظر پاسخ مدیر باشید...');
    } catch (_e) {
      await send(chatId, '❌ خطایی رخ داد. بعداً تلاش کنید.');
    }
  }
});

bot.on('callback_query', async (query) => {
  const data = query.data;
  const callbackChat = query.message?.chat.id;
  if (!data || !callbackChat) return;
  if (data === 'send_admin') {
    await bot.answerCallbackQuery(query.id, { text: '✅ پیام خود را ارسال کنید' });
    await send(callbackChat, '✍️ <b>پیام خود را بنویسید:</b>\n\n📨 هر چیزی که ارسال کنید به مدیر فرستاده می‌شود');
  } else if (data === 'my_info') {
    const user = getUser(callbackChat);
    if (!user) return;
    const text = `👤 <b>اطلاعات شما:</b>\n\n` +
      `🆔 آیدی: <code>${callbackChat}</code>\n` +
      `📧 ایمیل: ${user.email || '-'}\n` +
      `✅ وضعیت: ${user.verified ? 'فعال' : 'غیرفعال'}\n` +
      `📅 تاریخ عضویت: ${user.createdAt}`;
    await bot.answerCallbackQuery(query.id, { text: '✅ اطلاعات شما' });
    await send(callbackChat, text);
  }
});

// Admin reply routing: when admin replies to a forwarded message
bot.on('message', async (msg) => {
  if (msg.chat.id !== ADMIN_ID) return;
  const replyTo = msg.reply_to_message;
  if (!replyTo) return;
  const key = `${ADMIN_ID}:${replyTo.message_id}`;
  const match = loadMessages().find(m => m.id === key);
  if (!match) return;
  const userChat = match.fromChatId;
  try {
    if (msg.photo?.length) {
      const photo = msg.photo[msg.photo.length - 1];
      await bot.sendPhoto(userChat, photo.file_id, { caption: `📩 <b>پاسخ مدیر:</b>\n\n${msg.caption || ''}`, parse_mode: 'HTML' });
    } else if (msg.video) {
      await bot.sendVideo(userChat, msg.video.file_id, { caption: `📩 <b>پاسخ مدیر:</b>\n\n${msg.caption || ''}`, parse_mode: 'HTML' });
    } else if (msg.document) {
      await bot.sendDocument(userChat, msg.document.file_id, { caption: `📩 <b>پاسخ مدیر:</b>\n\n${msg.caption || ''}`, parse_mode: 'HTML' });
    } else if (msg.voice) {
      await bot.sendVoice(userChat, msg.voice.file_id);
    } else if (msg.sticker) {
      await bot.sendSticker(userChat, msg.sticker.file_id);
    } else if (msg.text) {
      await send(userChat, `📩 <b>پاسخ مدیر:</b>\n\n${msg.text}`);
    }
    await send(ADMIN_ID, '✅ پیام شما ارسال شد');
  } catch (_e) {
    await send(ADMIN_ID, '❌ کاربر مقصد یافت نشد یا خطا رخ داد');
  }
});

// Ready log
// eslint-disable-next-line no-console
console.log('Telegram bot is running with polling');
