
import json
import asyncio
import sys
import os
from telethon import TelegramClient, functions, types, errors
from dotenv import load_dotenv

# .env faylidagi o'zgaruvchilarni yuklash
load_dotenv()

# my.telegram.org saytidan olingan shaxsiy API ma'lumotlari
api_id = os.getenv("TELEGRAM_API_ID")
api_hash = os.getenv("TELEGRAM_API_HASH")

session_file = "owner.session"
gift_db_file = "savegifts.json"

if not api_id or not api_hash:
    print("XATOLIK: .env faylida TELEGRAM_API_ID va TELEGRAM_API_HASH o'zgaruvchilarini sozlang.")
    sys.exit(1)

client = TelegramClient(session_file, int(api_id), api_hash)


async def fetch_real_saved_gifts():
    """Telegramdan real saqlangan gifts ro'yxatini olish"""
    try:
        result = await client(functions.payments.GetUserStarGiftsRequest())

        gifts = []
        for g in result.gifts:
            gifts.append({
                "msg_id": g.id,
                "title": g.title
            })

        # Faylga saqlash
        with open(gift_db_file, "w", encoding="utf-8") as f:
            json.dump(gifts, f, ensure_ascii=False, indent=4)

        print(f"✅ {len(gifts)} ta REAL gift olindi va saqlandi!")
        return gifts

    except Exception as e:
        print("❌ Giftlarni olishda xato:", e)
        return []


async def load_saved_gifts():
    """JSONdagi saved gifts ni o'qish"""
    try:
        with open(gift_db_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return []


async def transfer_gift(username: str):
    try:
        target = await client.get_entity(username)
        target_input = types.InputPeerUser(target.id, target.access_hash)
        saved_gifts = await load_saved_gifts()
        if not saved_gifts:
            print("⚠️ JSON bo'sh giftlarni qidiryapman...")
            saved_gifts = await fetch_real_saved_gifts()
            while not saved_gifts:
                print("⏳ Hozircha gift yoq Yangi gift kelishini kutyapman...")
                await asyncio.sleep(10)
                saved_gifts = await fetch_real_saved_gifts()
        gift = saved_gifts.pop(0)
        msg_id = gift["msg_id"]
        title = gift["title"]
        print(f"🎁 Tanlangan gift: {title} | msg_id={msg_id}")
        invoice = types.InputInvoiceStarGiftTransfer(
            stargift=types.InputSavedStarGiftUser(msg_id=msg_id),
            to_id=target_input
        )
        form = await client(functions.payments.GetPaymentFormRequest(invoice=invoice))
        result = await client(functions.payments.SendStarsFormRequest(
            form_id=form.form_id,
            invoice=invoice
        ))
        print(f"✅ Gift muvaffaqiyatli yuborildi: @{username}")
        with open(gift_db_file, 'w', encoding='utf-8') as f:
            json.dump(saved_gifts, f, ensure_ascii=False, indent=4)

        return True

    except errors.RPCError as e:
        print(f"❌ RPCError: {e}")
        return False

    except Exception as e:
        print(f"❌ Xato: {e}")
        return False


async def main():
    if len(sys.argv) < 2:
        print("Iltimos, argument sifatida yuboriladigan foydalanuvchi nomini kiriting (@username).")
        print("Masalan: python scripts/auto_relayer.py @durov")
        return

    target_username = sys.argv[1].strip()
    await transfer_gift(target_username)


async def initialize_session():
    """Faqat sessiya yaratish uchun ishga tushiriladigan funksiya"""
    print("Sessiya faylini yaratish uchun tizimga kirilmoqda...")
    await client.send_message('me', 'Sessiya yaratildi!')
    print("✅ Sessiya muvaffaqiyatli yaratildi va 'owner.session' fayliga saqlandi.")


if __name__ == "__main__":
    async def run():
        await client.connect()
        if not await client.is_user_authorized():
            print("Avtorizatsiyadan o'tilmagan. Iltimos, telefon raqamingiz va kodni kiriting.")
            # Bu yerda interaktiv tarzda telefon raqam va kod so'rash mantiqini qo'shish mumkin,
            # ammo hozircha dastlabki ishga tushirish uchun qo'lda avtorizatsiya qilish tavsiya etiladi.
            # `python -c "import asyncio; from scripts.auto_relayer import initialize_session; asyncio.run(initialize_session())"`
            # buyrug'i orqali sessiya yarating.
            print("Iltimos, avval sessiya faylini yarating.")
            return

        # Skript argumentlar bilan ishga tushirilgan bo'lsa, asosiy mantiqni bajarish
        if len(sys.argv) > 1:
            await main()
        else:
             # Agar argument bo'lmasa, sessiya yaratish yo'riqnomasini ko'rsatish
            print("Argumentlar yo'q. Skript to'g'ri ishga tushirilganiga ishonch hosil qiling.")
            print("Sessiya yaratish uchun: python -c \"from scripts.auto_relayer import client; client.start()\"")


    client.loop.run_until_complete(run())
