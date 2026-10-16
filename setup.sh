#!/usr/bin/env bash
# setup.sh — Cài templexa-ops trên máy mới (cloud Muse, máy nhân viên). Chạy lại nhiều lần không sao.
#
#   ./setup.sh                      # clone/pull Templexa vào ./Templexa + cài thư viện + kiểm công cụ
#   REPO=https://github.com/<user>/Templexa.git ./setup.sh   # đổi nguồn repo
#
# Trên máy chủ shop (đã có ../Templexa cạnh thư mục này) script chỉ kiểm tra, không clone thêm.
set -euo pipefail
cd "$(dirname "$0")"
REPO="${REPO:-git@github.com:phuocpt98/Templexa.git}"

say() { printf '\n▸ %s\n' "$*"; }
need() { command -v "$1" >/dev/null 2>&1; }

say "Kiểm Node (cần ≥ 20)"
need node || { echo "✗ Chưa có Node"; exit 1; }
node -e 'process.exit(+process.versions.node.split(".")[0] >= 20 ? 0 : 1)' || { echo "✗ Node quá cũ: $(node -v)"; exit 1; }

if [ -d ../Templexa/.git ] && [ ! -e Templexa ]; then
  TPX=../Templexa
  say "Dùng code có sẵn ở ../Templexa"
elif [ -d Templexa/.git ]; then
  TPX=Templexa
  say "Cập nhật Templexa"
  git -C Templexa switch -q main && git -C Templexa pull --ff-only
else
  TPX=Templexa
  say "Clone Templexa (chỉ lịch sử gần nhất cho nhẹ)"
  git clone --depth 50 "$REPO" Templexa
fi

say "Cài thư viện (sharp, puppeteer, qrcode)"
( cd "$TPX" && npm ci --no-audit --no-fund )

say "Công cụ phụ (giải nén, ảnh iPhone HEIC)"
if need apt-get; then
  MISSING=""
  need unzip || MISSING="$MISSING unzip"
  need 7z || MISSING="$MISSING p7zip-full"
  need heif-convert || MISSING="$MISSING libheif-examples"
  need ffmpeg || MISSING="$MISSING ffmpeg"
  [ -n "$MISSING" ] && { echo "Cài:$MISSING"; sudo apt-get install -y $MISSING || echo "! Không cài được — tự cài sau: sudo apt-get install -y$MISSING"; }
fi

say "Thử mở trình duyệt headless (dùng để chụp ảnh thiệp)"
( cd "$TPX" && node -e "require('puppeteer').launch({args:['--no-sandbox']}).then(b=>b.close()).then(()=>console.log('✓ Chrome OK'))" ) \
  || echo "! Chrome lỗi — Ubuntu: (cd $TPX && npx puppeteer browsers install chrome) và cài thư viện: sudo apt-get install -y libnss3 libatk-bridge2.0-0 libgbm1 libxkbcommon0 libasound2t64"

say "Đăng nhập Cloudflare (deploy)"
( cd "$TPX" && npx --yes wrangler whoami 2>/dev/null | grep -qi "associated with" ) && echo "✓ wrangler đã đăng nhập" \
  || echo "! Chưa đăng nhập: cd $TPX && npx wrangler login   (hoặc đặt CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID)"

say "Git user (để commit có tên người làm)"
git -C "$TPX" config user.name >/dev/null || echo "! Đặt tên: git -C $TPX config user.name \"Muse\" && git -C $TPX config user.email \"<email>\""

mkdir -p jobs/_archive
node scripts/job.js index >/dev/null
say "Xong. Đọc AGENT.md rồi flows/00-nhan-viec.md"
