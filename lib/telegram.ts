
import { Bot } from 'telegram';
import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
    console.warn("Telegram environment variable TELEGRAM_BOT_TOKEN is not set.");
}

const bot = new Bot(BOT_TOKEN || "");

/**
 * Sends a notification message to a specific chat via Telegram.
 * @param chatId The ID of the chat to send the message to.
 * @param message The text of the message to send. Supports Markdown.
 */
export async function sendTelegramNotification(chatId: string, message: string): Promise<void> {
  if (!BOT_TOKEN) {
    throw new Error("Telegram bot is not configured on the server.");
  }
  if (!chatId) {
    throw new Error("A valid chatId must be provided to send a notification.");
  }

  try {
    await bot.api.sendMessage({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    });
    console.log(`User (${chatId}) ga xabar muvaffaqiyatli yuborildi.`);
  } catch (error) {
    console.error("Foydalanuvchiga xabar yuborishda xatolik yuz berdi:", error);
    // Re-throw the error to be handled by the caller
    throw error;
  }
}
