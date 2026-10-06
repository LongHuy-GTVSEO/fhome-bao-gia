#!/bin/sh
# Tạo lại wordpress-embed.html (dán vào WordPress) và preview.html (bản xem thử gửi người khác)
# sau khi sửa pricing.js, app.js, style.css hoặc index.html
cd "$(dirname "$0")" || exit 1
BLOCK() { sed -n '/<!--FQ-START-->/,/<!--FQ-END-->/p' index.html; }
{
echo '<!-- Dán TOÀN BỘ nội dung file này vào khối "HTML tùy chỉnh" của trang WordPress. File này được tạo tự động từ index.html, style.css, pricing.js, app.js: sửa số liệu ở pricing.js rồi chạy lại build-embed.sh -->'
echo '<style>'; cat style.css; echo '</style>'
BLOCK
echo '<script>'; cat pricing.js; echo '</script>'
echo '<script>'; cat app.js; echo '</script>'
} > wordpress-embed.html
{
echo '<title>Báo giá nội thất FHome</title>'
echo '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
echo '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap">'
echo '<style>'
echo ':root{--page-bg:#fff;--page-ink:#010101;--page-line:#E0D4C4;color-scheme:light}'
echo 'body{background:var(--page-bg);color:var(--page-ink);margin:0}'
echo '.preview-bar{background:#f4ecdc;color:#1a1408;border-bottom:1px solid var(--page-line);padding:10px 16px;font:14px/1.5 Roboto,system-ui,sans-serif;text-align:center}'
cat style.css
echo '</style>'
echo '<div class="preview-bar">Bản xem thử của tool báo giá. Số liệu lấy từ bảng giá công khai của FHome Sài Gòn. Thông tin nhập ở bước cuối chưa được gửi đi đâu.</div>'
BLOCK
echo '<script>'; cat assets.js; cat pricing.js; echo 'window.FHOME_PRICING.preview=true;'; echo '</script>'
echo '<script>'; cat app.js; echo '</script>'
} > preview.html
