
import json
import asyncio
from telethon import TelegramClient, functions, types, errors

api_id = 16108895
api_hash = "9eeedcc1eb10e1f0a11caf3815a3768d"
session_file = "owner.session"
gift_db_file = "savegifts.json"

client = TelegramClient(session_file, api_id, api_hash)


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
    target_username = input("Target username (@username): ").strip()
    await transfer_gift(target_username)


with client:
    client.loop.run_until_complete(main())
