
import os
import asyncio
from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

# --- SOZLAMALAR ---
# Bu yerga @BotFather orqali olingan o'z bot tokeningizni qo'ying
# Yoki serverda muhit o'zgaruvchisi (environment variable) sifatida saqlang
BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "8108408790:AAHEhCXQXaaZEbQeZfGblqvWKwhNLOfxDco") 
# Xabarlar yuborilishi kerak bo'lgan akkauntning Telegram ID raqami
ADMIN_CHAT_ID = os.environ.get("TELEGRAM_ADMIN_CHAT_ID", "7275593552")
# Veb-saytingizning to'liq manzili, "https://" bilan boshlanishi shart
WEB_APP_URL = "https://nftdokon.onrender.com" 

# --- ASOSIY FUNKSIYALAR ---

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Foydalanuvchi /start buyrug'ini yuborganda ishga tushadi."""
    
    if not update.message:
        return

    # "Webni ochish" tugmasini yaratish
    keyboard = [
        [InlineKeyboardButton("Webni ochish", web_app=WebAppInfo(url=WEB_APP_URL))]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    # Salomlashish xabari
    welcome_message = (
        "Salom! 👋\n\n"
        "TON Gift Marketiga xush kelibsiz! Bu yerda siz noyob NFT sovg'alarni sotib olishingiz, "
        "sotishingiz va auksionga qo'yishingiz mumkin.\n\n"
        "Boshlash uchun quyidagi tugmani bosing:"
    )
    
    await update.message.reply_text(welcome_message, reply_markup=reply_markup)


# --- BOTNI ISHGA TUSHIRISH ---

def main() -> None:
    """Botni ishga tushiradi va /start buyrug'ini kutadi."""
    
    if not BOT_TOKEN or not ADMIN_CHAT_ID:
        print("XATOLIK: Iltimos, BOT_TOKEN va ADMIN_CHAT_ID o'zgaruvchilarini sozlang (bot.py yoki environment variables).")
        return

    application = ApplicationBuilder().token(BOT_TOKEN).build()

    # /start buyrug'i uchun handler qo'shish
    application.add_handler(CommandHandler("start", start))
    
    print("Bot ishga tushdi...")
    # Botni ishga tushirish
    application.run_polling()


if __name__ == '__main__':
    main()
    
# Xabarnoma yuborish logikasi endi saytning backend qismidan (`/api/create-withdrawal`) chaqiriladi.
# Ushbu faylning vazifasi faqat foydalanuvchilar uchun /start buyrug'ini taqdim etishdan iborat.
# Buni alohida ishga tushirib qo'yish kerak (masalan, serverda doimiy ishlaydigan xizmat sifatida).
