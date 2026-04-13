#!/bin/bash
# Watchdog: bot çökerse otomatik yeniden başlatır
cd /home/user/ai-ui/telegram-is-asistani

while true; do
    echo "$(date) - Bot baslatiliyor..."
    python main.py 2>&1
    echo "$(date) - Bot durdu! 5 saniye sonra yeniden baslatilacak..."
    sleep 5
done
