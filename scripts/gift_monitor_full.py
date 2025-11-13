
#!/usr/bin/env python3
# gift_monitor_full.py
# faqat userlar bilan lichkalarni tahlil qiladi
# upgrade yoki transfer bo‘lgan barcha NFT giftlarni to‘liq ma’lumot bilan saqlaydi

import asyncio
import sqlite3
import hashlib
import sys
from datetime import datetime
from telethon import TelegramClient, events
from telethon.tl.types import MessageService, MessageActionStarGiftUnique

API_ID = 16108895
API_HASH = "9eeedcc1eb10e1f0a11caf3815a3768d"
SESSION_FILE = "owner.session"
DB_PATH = "mon.db"
LIMIT_PER_CHAT = 100  # har bir foydalanuvchidan 100 ta xabar tekshiriladi

# === SQLite baza tayyorlash ===
conn = sqlite3.connect(DB_PATH, check_same_thread=False)
cur = conn.cursor()
cur.execute("""
CREATE TABLE IF NOT EXISTS gifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gift_uid TEXT UNIQUE,
    msg_id INTEGER,
    chat_id INTEGER,
    chat_name TEXT,
    sender_id INTEGER,
    sender_name TEXT,
    title TEXT,
    num TEXT,
    model TEXT,
    pattern TEXT,
    backdrop TEXT,
    value_amount REAL,
    value_currency TEXT,
    transferred INTEGER,
    upgrade INTEGER,
    date TEXT,
    inserted_at TEXT
)
""")
conn.commit()

# === Yordamchi funksiyalar ===
def make_uid(chat_id, msg_id, gift_id=None):
    """Bazaga yozish uchun noyob UID"""
    return str(gift_id) if gift_id else hashlib.sha1(f"{chat_id}:{msg_id}".encode()).hexdigest()

def extract_attrs(gift):
    """Gift atributlaridan model, pattern, backdrop nomlarini ajratish"""
    model = pattern = backdrop = None
    try:
        attrs = getattr(gift, "attributes", []) or []
        for a in attrs:
            cls = a.__class__.__name__.lower()
            name = getattr(a, "name", None)
            if "model" in cls:
                model = name
            elif "pattern" in cls:
                pattern = name
            elif "backdrop" in cls:
                backdrop = name
        if not model and len(attrs) > 0:
            model = getattr(attrs[0], "name", None)
        if not pattern and len(attrs) > 1:
            pattern = getattr(attrs[1], "name", None)
        if not backdrop and len(attrs) > 2:
            backdrop = getattr(attrs[2], "name", None)
    except Exception:
        pass
    return model, pattern, backdrop

def save_to_db(data):
    """Giftni bazaga yozish"""
    try:
        cur.execute("""
        INSERT INTO gifts (gift_uid, msg_id, chat_id, chat_name, sender_id, sender_name,
                           title, num, model, pattern, backdrop,
                           value_amount, value_currency, transferred, upgrade, date, inserted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, data)
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        # Already exists, that's fine
        return False

def show_gift(gift, chat_name, msg, sender_name=None):
    """Topilgan gift haqida terminalda ma’lumot chiqarish"""
    model, pattern, backdrop = extract_attrs(gift)
    print("\n🎁 Yangi NFT Gift Topildi!")
    print(f"🆔 Xabar ID: {msg.id}")
    print(f"👤 Kimdan: {sender_name or msg.sender_id}")
    print(f"🎨 Nomi: {gift.title} (#{gift.num})")
    print(f"💎 Model: {model or '-'}")
    print(f"🧵 Naqsh: {pattern or '-'}")
    print(f"🌈 Fon: {backdrop or '-'}")
    print(f"💰 {gift.value_amount} {gift.value_currency}")
    print("──────────────────────────────")

# === Eski xabarlarni tahlil qilish ===
async def scan_old_gifts(client):
    print("🔍 Eski lichka xabarlarini tahlil qilinmoqda...\n")
    dialog_count = 0
    total_found = 0
    async for dialog in client.iter_dialogs():
        dialog_count += 1
        if dialog_count > 50: # Limit scanning to recent 50 dialogs to speed it up
            break

        ent = dialog.entity
        if not dialog.is_user or getattr(ent, "bot", False) or getattr(ent, "is_self", False):
            continue

        first = getattr(ent, "first_name", "") or ""
        last = getattr(ent, "last_name", "") or ""
        name = f"{first} {last}".strip() or str(ent.id)
        chat_id = ent.id
        count = 0

        try:
            # We only need to check the very last message for a new gift
            msgs = await client.get_messages(ent, limit=5)
            for msg in msgs:
                if msg.out:
                    continue
                if isinstance(msg, MessageService) and isinstance(getattr(msg, "action", None), MessageActionStarGiftUnique):
                    action = msg.action
                    # We are looking for gifts sent TO us, so transferred should be false.
                    if getattr(action, "transferred", False):
                        continue
                    gift = action.gift
                    uid = make_uid(chat_id, msg.id, getattr(gift, "gift_id", None))
                    model, pattern, backdrop = extract_attrs(gift)
                    
                    # sender_name should be the name of the person who sent it
                    sender_ent = await client.get_entity(msg.sender_id)
                    sender_first = getattr(sender_ent, "first_name", "") or ""
                    sender_last = getattr(sender_ent, "last_name", "") or ""
                    sender_name = f"{sender_first} {sender_last}".strip() or str(msg.sender_id)

                    is_saved = save_to_db((
                        uid, msg.id, chat_id, name, msg.sender_id, sender_name,
                        gift.title, gift.num, model, pattern, backdrop,
                        gift.value_amount, gift.value_currency,
                        int(action.transferred), int(action.upgrade),
                        str(msg.date), datetime.utcnow().isoformat()
                    ))
                    if is_saved:
                        show_gift(gift, name, msg, sender_name)
                        count += 1
                        total_found += 1
            if count > 0:
                print(f"✅ {name}: {count} ta gift topildi")
        except Exception as e:
            print(f"⚠️ {name} da xato: {e}")
    
    if total_found == 0:
        print("🤷‍♂️ Yangi sovg'alar topilmadi.")

    print("\n🟢 Eski lichkalar tahlili tugadi.\n")


# === Asosiy ishga tushirish ===
async def main(mode):
    client = TelegramClient(SESSION_FILE, API_ID, API_HASH)
    await client.start()
    print("🟢 Telegram session ulandi.\n")
    
    if mode == "scan":
        await scan_old_gifts(client)
    elif mode == "listen":
        client.add_event_handler(monitor_new)
        print("📡 Endi yangi keladigan giftlar avtomatik tahlil qilinmoqda...")
        await client.run_until_disconnected()
    
    await client.disconnect()


if __name__ == "__main__":
    # Default to "scan" if no argument is provided
    run_mode = "scan"
    if len(sys.argv) > 1 and sys.argv[1] == "listen":
        run_mode = "listen"
    
    # Using asyncio.run() is cleaner for top-level async calls
    asyncio.run(main(run_mode))
