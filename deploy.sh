#!/bin/bash
# Bali Based - Telegram Bot + Dashboard Deploy Script
# VPS'te calistir: curl -sL <URL> | bash

set -e

echo "=== Bali Based Deploy ==="

# 1. Gerekli paketleri kur
echo "[1/6] Paketler kuruluyor..."
apt update -qq
apt install -y -qq python3 python3-pip python3-venv nodejs npm git > /dev/null 2>&1

# 2. Node.js 20+ kontrolu
NODE_VER=$(node -v 2>/dev/null | cut -d. -f1 | tr -d 'v')
if [ "$NODE_VER" -lt 18 ] 2>/dev/null; then
    echo "Node.js 18+ kuruluyor..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
    apt install -y -qq nodejs > /dev/null 2>&1
fi

# 3. Repo'yu klonla
echo "[2/6] Repo klonlaniyor..."
cd /root
rm -rf ai-ui
git clone -b claude/telegram-idea-assistant-AMWaK https://github.com/bartuozkan98/ai-ui.git
cd ai-ui

# 4. Telegram botu kur
echo "[3/6] Telegram botu kuruluyor..."
cd telegram-is-asistani
pip3 install -r requirements.txt -q
cd ..

# 5. Next.js dashboard kur
echo "[4/6] Dashboard kuruluyor..."
npm install --legacy-peer-deps > /dev/null 2>&1
npx next build > /dev/null 2>&1

# 6. Systemd servisleri olustur

# Telegram Bot servisi
echo "[5/6] Servisler olusturuluyor..."
cat > /etc/systemd/system/bali-bot.service << 'SVCEOF'
[Unit]
Description=Bali Telegram Bot
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/ai-ui/telegram-is-asistani
ExecStart=/usr/bin/python3 main.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SVCEOF

# Next.js Dashboard servisi
cat > /etc/systemd/system/bali-dashboard.service << 'SVCEOF'
[Unit]
Description=Bali Dashboard (Next.js)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/ai-ui
ExecStart=/usr/bin/npx next start -p 3005
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=OPENROUTER_API_KEY=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

[Install]
WantedBy=multi-user.target
SVCEOF

# Servisleri baslat
echo "[6/6] Servisler baslatiliyor..."
systemctl daemon-reload
systemctl enable bali-bot bali-dashboard
systemctl restart bali-bot bali-dashboard

sleep 3

# Durum kontrolu
echo ""
echo "=== DEPLOY TAMAMLANDI ==="
echo ""
echo "Bot durumu:"
systemctl is-active bali-bot && echo "  Telegram Bot: CALISIYOR" || echo "  Telegram Bot: HATA"
echo ""
echo "Dashboard durumu:"
systemctl is-active bali-dashboard && echo "  Dashboard: CALISIYOR" || echo "  Dashboard: HATA"
echo ""
echo "Dashboard URL: http://178.104.81.237:3005/planlar"
echo ""
echo "Faydali komutlar:"
echo "  systemctl status bali-bot        # Bot durumu"
echo "  systemctl status bali-dashboard  # Dashboard durumu"
echo "  systemctl restart bali-bot       # Bot yeniden baslat"
echo "  journalctl -u bali-bot -f        # Bot logları"
echo "  journalctl -u bali-dashboard -f  # Dashboard logları"
