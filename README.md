# TON Gift Marketplace

Bu loyiha Next.js, Firebase va Telegram API yordamida qurilgan NFT sovg'alar bozoridir. Foydalanuvchilar o'zlarining Telegram orqali olgan NFT sovg'alarini ilovaga qo'shishlari (deposit), sotishlari, auksionga qo'yishlari va yechib olishlari (withdraw) mumkin.

## Asosiy Texnologiyalar

-   **Frontend:** Next.js, React, ShadCN UI, Tailwind CSS
-   **Backend:** Next.js API Routes, Firebase (Firestore, Authentication)
-   **Telegram Integratsiyasi:** `python-telegram-bot`, `telethon`

---

## Loyihani Sozlash va Ishga Tushirish

Loyihani to'liq ishga tushirish uchun bir necha bosqichlarni bajarish kerak:

### 1. Kerakli Dasturlarni O'rnatish

-   **Node.js:** (v18 yoki undan yuqori)
-   **Python:** (v3.8 yoki undan yuqori)
-   **pip:** Python paket menejeri

### 2. Telegram Ma'lumotlarini Olish

Sizga ikkita turdagi Telegram ma'lumotlari kerak bo'ladi:

#### a) Bot uchun Token:

1.  Telegramda **@BotFather** ni toping va unga `/start` buyrug'ini yuboring.
2.  `/newbot` buyrug'ini yuboring va ko'rsatmalarga amal qilib, yangi bot yarating.
3.  @BotFather sizga bot uchun noyob **API token** beradi. Bu tokenni saqlab qo'ying.

#### b) Shaxsiy Akkaunt uchun API ID va Hash:

1.  **my.telegram.org** saytiga o'z telefon raqamingiz bilan kiring.
2.  "API development tools" bo'limiga o'ting.
3.  Yangi ilova yaratish formasini to'ldiring (nomiga xohlagan narsani yozishingiz mumkin).
4.  Shundan so'ng sizga **`api_id`** va **`api_hash`** taqdim etiladi. Bu ma'lumotlarni saqlab qo'ying. Bu sizning shaxsiy akkauntingizdan sovg'alarni boshqarish uchun kerak bo'ladi.

### 3. Loyiha Konfiguratsiyasi (.env)

1.  Loyihaning asosiy papkasida `.env.example` faylidan nusxa olib, yangi `.env` nomli fayl yarating.
2.  `.env` faylini ochib, quyidagi maydonlarni o'zingizning ma'lumotlaringiz bilan to'ldiring:

    ```env
    # 1-bosqichda @BotFather'dan olingan bot tokeni
    TELEGRAM_BOT_TOKEN="sizning_bot_tokeningiz"

    # 2-bosqichda my.telegram.org'dan olingan ma'lumotlar
    TELEGRAM_API_ID="sizning_api_id"
    TELEGRAM_API_HASH="sizning_api_hash"

    # Ilovangizni serverga joylashtirganingizdan so'ng olinadigan manzil
    # Masalan: https://my-nft-app.onrender.com
    WEB_APP_URL="sizning_web_app_manzilingiz"

    # Firebase'dan olingan Service Account Key (JSON formatida, bir qatorda)
    # Firebase Project Settings -> Service accounts -> Generate new private key
    FIREBASE_SERVICE_ACCOUNT_KEY='{"type": "service_account", ...}'
    ```

### 4. Python Bog'liqliklarini O'rnatish

Terminalda quyidagi buyruqni ishga tushiring:

```bash
pip install -r requirements.txt
```

### 5. Telegram Sessiyasini Yaratish

Bu eng muhim qadamlardan biri. Skriptlar sizning nomingizdan ishlashi uchun sessiya faylini yaratishingiz kerak.

1.  Terminalda quyidagi buyruqni ishga tushiring:
    ```bash
    python -c "from scripts.auto_relayer import client; client.start()"
    ```
2.  Sizdan telefon raqamingiz, parolingiz (agar o'rnatilgan bo'lsa) va Telegram orqali kelgan tasdiqlash kodi so'raladi.
3.  Ma'lumotlarni to'g'ri kiriting. Muvaffaqiyatli yakunlangach, loyiha papkasida `owner.session` nomli fayl paydo bo'ladi.

### 6. Ilovani Ishga Tushirish

1.  **Frontend va Backend (Next.js):**
    ```bash
    npm install
    npm run dev
    ```
    Bu ilovani `http://localhost:3000` manzilida ishga tushiradi.

2.  **Telegram Bot (`bot.py`):**
    Alohida terminal oynasida botni ishga tushiring. Bu bot foydalanuvchilarga Web App'ni ochish tugmasini yuboradi.
    ```bash
    python bot.py
    ```

Endi sizning Telegram botingiz ishga tushdi va Web App'ingiz mahalliy kompyuteringizda ishlamoqda. @BotFather orqali botingizga kirib, `/start` buyrug'ini yuborsangiz, "Webni ochish" tugmasi paydo bo'ladi.
