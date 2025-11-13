
import { Bot } from 'telegram';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8108408790:AAHEhCXQXaaZEbQeZfGblqvWKwhNLOfxDco";
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || "7275593552";

if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
    console.warn("Telegram environment variables (TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID) are not set.");
}

const bot = new Bot(BOT_TOKEN);

/**
 * Sends a notification message to the admin via Telegram.
 * @param message The text of the message to send. Supports Markdown.
 */
export async function sendTelegramNotification(message: string): Promise<void> {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
    throw new Error("Telegram bot is not configured on the server.");
  }

  try {
    await bot.api.sendMessage({
      chat_id: ADMIN_CHAT_ID,
      text: message,
      parse_mode: 'Markdown',
    });
    console.log(`Admin (${ADMIN_CHAT_ID})ga xabar muvaffaqiyatli yuborildi.`);
  } catch (error) {
    console.error("Adminga xabar yuborishda xatolik yuz berdi:", error);
    // Re-throw the error to be handled by the caller
    throw error;
  }
}
