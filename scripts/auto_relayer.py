
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

if not api_id or not api_hash:
    print("XATOLIK: .env faylida TELEGRAM_API_ID va TELEGRAM_API_HASH o'zgaruvchilarini sozlang.")
    sys.exit(1)

client = TelegramClient(session_file, int(api_id), api_hash)

async def transfer_specific_gift(username: str, gift_uid_to_send: str):
    """Finds a specific gift by its unique ID and transfers it."""
    try:
        target = await client.get_entity(username)
        target_input = types.InputPeerUser(target.id, target.access_hash)
        
        print("🔍 Zaxiradagi barcha sovg'alarni qidirilmoqda...")
        result = await client(functions.payments.GetUserStarGiftsRequest())
        
        found_gift = None
        for gift in result.gifts:
            # The gift.id from GetUserStarGiftsRequest is the unique ID we need
            if str(gift.id) == gift_uid_to_send:
                found_gift = gift
                break
        
        if not found_gift:
            print(f"❌ Kerakli gift topilmadi: UID={gift_uid_to_send}")
            # This exit code will be caught by the Node.js server
            sys.exit(1)
            
        print(f"🎁 Topilgan gift: {found_gift.title} | msg_id={found_gift.id}")

        invoice = types.InputInvoiceStarGiftTransfer(
            stargift=types.InputSavedStarGiftUser(msg_id=found_gift.id),
            to_id=target_input
        )
        
        form = await client(functions.payments.GetPaymentFormRequest(invoice=invoice))
        
        await client(functions.payments.SendStarsFormRequest(
            form_id=form.form_id,
            invoice=invoice
        ))
        
        print(f"✅ Gift muvaffaqiyatli yuborildi: @{username}")
        return True

    except errors.RPCError as e:
        print(f"❌ RPCError: {e}")
        # Exit with a non-zero code to indicate failure to the calling Node.js script
        sys.exit(1)

    except Exception as e:
        print(f"❌ Xato: {e}")
        sys.exit(1)


async def main():
    if len(sys.argv) < 3:
        print("Iltimos, argument sifatida yuboriladigan foydalanuvchi nomini (@username) va gift UID'sini kiriting.")
        print("Masalan: python scripts/auto_relayer.py @durov 123456789")
        return

    target_username = sys.argv[1].strip()
    target_gift_uid = sys.argv[2].strip()
    await transfer_specific_gift(target_username, target_gift_uid)


async def initialize_session():
    """Faqat sessiya yaratish uchun ishga tushiriladigan funksiya"""
    print("Sessiya faylini yaratish uchun tizimga kirilmoqda...")
    await client.send_message('me', 'Sessiya yaratildi!')
    print("✅ Sessiya muvaffaqiyatli yaratildi va 'owner.session' fayliga saqlandi.")


if __name__ == "__main__":
    async def run():
        await client.connect()
        if not await client.is_user_authorized():
            print("Avtorizatsiyadan o'tilmagan. Sessiya yaratish uchun buyruqni ishga tushiring:")
            print("python -c \"from scripts.auto_relayer import client; client.start()\"")
            return

        if len(sys.argv) > 2:
            await main()
        else:
            print("Argumentlar yetarli emas. Skript to'g'ri chaqirilganiga ishonch hosil qiling.")
            print("Foydalanish: python scripts/auto_relayer.py <username> <gift_uid>")

    client.loop.run_until_complete(run())
