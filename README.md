# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Auto Relayer Script

This project includes a Python script to automatically forward saved Telegram Star Gifts.

### Setup

1.  Install the required Python library:
    ```bash
    pip install -r requirements.txt
    ```

2.  Run the script for the first time to log in to your Telegram account and create a `.session` file:
    ```bash
    python scripts/auto_relayer.py
    ```
    You will be prompted for your phone number, password, and a login code sent to you on Telegram.

### Usage

Once you are logged in, you can run the script and provide a target username (e.g., `@username`) to send a gift.

```bash
python scripts/auto_relayer.py
```
