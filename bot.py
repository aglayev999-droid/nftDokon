
import os
import asyncio
from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

# --- SOZLAMALAR ---
# Bu yerga @BotFather orqali olingan o'z bot tokeningizni qo'ying
BOT_TOKEN = "YOUR_BOT_TOKEN_HERE" 
# Xabarlar yuborilishi kerak bo'lgan akkauntning Telegram ID raqami
ADMIN_CHAT_ID = "YOUR_ADMIN_CHAT_ID"  # Misol uchun: 123456789
# Veb-saytingizning to'liq manzili
WEB_APP_URL = "https://your-website-url.com" 

# --- ASOSIY FUNKSIYALAR ---

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Foydalanuvchi /start buyrug'ini yuborganda ishga tushadi."""
    
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

async def send_withdrawal_notification(context: ContextTypes.DEFAULT_TYPE, user_id: str, nft_name: str, target_username: str) -> None:
    """Adminisztratorga yangi yechib olish so'rovi haqida xabar yuboradi."""
    
    message_text = (
        "📢 Yangi yechib olish so'rovi!\n\n"
        f"👤 Foydalanuvchi ID: `{user_id}`\n"
        f"🎁 NFT Nomi: *{nft_name}*\n"
        f"🎯 Telegram Manzili: `{target_username}`\n\n"
        "Iltimos, `auto_relayer.py` skripti yordamida sovg'ani ushbu manzilga yuboring."
    )
    
    try:
        await context.bot.send_message(
            chat_id=ADMIN_CHAT_ID,
            text=message_text,
            parse_mode='Markdown'
        )
        print(f"Admin ({ADMIN_CHAT_ID})ga xabar muvaffaqiyatli yuborildi.")
    except Exception as e:
        print(f"Adminga xabar yuborishda xatolik yuz berdi: {e}")

# --- BOTNI ISHGA TUSHIRISH ---

def main() -> None:
    """Botni ishga tushiradi va /start buyrug'ini kutadi."""
    
    if BOT_TOKEN == "YOUR_BOT_TOKEN_HERE" or ADMIN_CHAT_ID == "YOUR_ADMIN_CHAT_ID":
        print("XATOLIK: Iltimos, `bot.py` faylidagi BOT_TOKEN va ADMIN_CHAT_ID o'zgaruvchilarini to'ldiring.")
        return

    application = ApplicationBuilder().token(BOT_TOKEN).build()

    # /start buyrug'i uchun handler qo'shish
    application.add_handler(CommandHandler("start", start))
    
    print("Bot ishga tushdi...")
    # Botni ishga tushirish
    application.run_polling()


if __name__ == '__main__':
    main()
    
# --- QANDAY ISHLATILADI? ---
# 1. Serverda (masalan, Firebase Functions, Heroku, AWS Lambda) yechib olish so'rovi yaratilganda,
#    Firestore'dagi o'zgarishni kuzatadigan trigger yarating.
# 2. Ushbu trigger ishga tushganda, `send_withdrawal_notification` funksiyasini chaqiring.
#    Bu funksiya asinxron bo'lgani uchun, uni to'g'ri ishlatish kerak.
# 
# Misol uchun (bu kodni alohida server logikasida ishlatish kerak):
# async def handle_new_withdrawal(data):
#     bot_app = ApplicationBuilder().token(BOT_TOKEN).build()
#     await send_withdrawal_notification(
#         context=ContextTypes.DEFAULT_TYPE(bot_app, chat_id=ADMIN_CHAT_ID),
#         user_id=data['userId'],
#         nft_name=data['nftName'],
#         target_username=data['telegramUsername']
#     )
# 
# Bu faylning o'zini `python bot.py` buyrug'i bilan ishga tushirsangiz,
# u faqat Telegramdan keladigan /start buyrug'iga javob beradi.
# Xabarnoma yuborish logikasi asosiy saytning backend qismidan chaqirilishi kerak.
