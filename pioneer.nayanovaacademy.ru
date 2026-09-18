# ==========================================
# pioneer.nayanovaacademy.ru — конфиг nginx
#
# ВАЖНО про наследование add_header:
# nginx наследует директивы add_header с уровня сервера ТОЛЬКО если
# в location нет ни одной собственной директивы add_header. Поэтому
# набор security-заголовков продублирован в каждом location, который
# задаёт свой Cache-Control.
#
# Сайт полностью статический (Eleventy, без PHP).
# ==========================================

server {
    listen 80;
    server_name pioneer.nayanovaacademy.ru;

    return 301 https://$host$request_uri;
}

# ==========================================
# 2. Основной HTTPS-сервер
# ==========================================
server {
    listen 443 ssl http2;
    server_name pioneer.nayanovaacademy.ru;

    # --- SSL-сертификаты ---
    ssl_certificate     /etc/ssl/certs/nayanovaacademy.ru/cert.pem;
    ssl_certificate_key /etc/ssl/private/nayanovaacademy.ru/key.pem;

    # --- Настройки безопасности SSL ---
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Security Headers — канонический набор (дублируется в location ниже).
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'" always;

    # --- Сжатие gzip ---
    gzip on;
    gzip_types text/css application/javascript text/javascript application/json text/xml image/svg+xml;
    gzip_min_length 1000;
    gzip_comp_level 6;
    gzip_vary on;

    # --- Основные параметры сайта ---
    root /var/www/pioneer.nayanovaacademy.ru/public;
    index index.html;
    autoindex off;

    # Логирование
    access_log /var/log/nginx/pioneer.nayanovaacademy.ru.access.log;
    error_log  /var/log/nginx/pioneer.nayanovaacademy.ru.error.log;

    # 0a. ACME challenge — исключение из общего запрета скрытых путей,
    # иначе не работает продление сертификата через webroot.
    location ^~ /.well-known/acme-challenge/ {
        default_type "text/plain";
        try_files $uri =404;
    }

    # 1. Блокировка служебных файлов сборки
    location ~* ^/(\.env|\.env\.example|deploy\.ps1|ssh-private\.key|lessons\.json|package\.json|package-lock\.json|eleventy\.config\.mjs|build-css\.mjs|build-js\.mjs|build-highlight\.mjs|build-sw\.mjs|build-config-meta\.mjs|build-assets-hash\.mjs|pioneer\.nayanovaacademy\.ru)$ {
        deny all;
        access_log off;
        log_not_found off;
    }

    # 2. Основная маршрутизация
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 2a. Редиректы старой нумерации страниц (до разделения по моделям и добавления урока)
    location = /03-sdk2/   { return 301 /05-sdk2/; }
    location = /04-rknn/   { return 301 /06-rknn/; }
    location = /05-lua/    { return 301 /07-lua/; }
    location = /06-blocks/ { return 301 /08-blocks/; }
    location = /07-base/   { return 301 /04-base/; }
    location = /03-base/   { return 301 /04-base/; }
    location = /04-sdk2/   { return 301 /05-sdk2/; }
    location = /05-rknn/   { return 301 /06-rknn/; }
    location = /06-lua/    { return 301 /07-lua/; }
    location = /07-blocks/ { return 301 /08-blocks/; }
    location = /08-examples/ { return 301 /09-examples/; }
    location = /09-links/  { return 301 /10-links/; }

    # 3. Service Worker без content-hash — не кэшируем,
    # иначе браузер не увидит обновления sw.js.
    # Свой add_header => дублируем security-набор (см. шапку файла).
    location = /sw.js {
        add_header Cache-Control "no-cache, must-revalidate" always;
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'" always;
    }

    # 4. Кэширование статических ресурсов (CSS/JS/изображения/шрифты — 1 год)
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        access_log off;
    }

    # 5. HTML — не кэшируем (контент меняется при деплое)
    location ~* \.html$ {
        add_header Cache-Control "no-cache, must-revalidate" always;
    }

    # 6. Блокировка скрытых файлов (кроме /.well-known/acme-challenge/)
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
