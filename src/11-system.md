---
layout: layout.njk
title: "Исследование системы"
description: "Аудит бортового компьютера Пионер Мини 2: платформа Rockchip RK3576, камеры и сенсоры, сеть, службы systemd, порты, полётная архитектура, gRPC API, NPU и файловая система"
pageNumber: 11
pageSlug: "system"
---

<h1>Исследование бортовой системы</h1>
<p>Отчёт об исследовании вычислительного модуля Пионер Мини 2 (<code>pioneermini@10.42.0.1</code>), выполненном в режиме «только чтение». Описаны аппаратная платформа, камеры и сенсоры, сеть, службы systemd, карта портов, полётная архитектура, gRPC API, видео, нейроускоритель и ключевые пути файловой системы.</p>
<p>Данные получены в SSH-сессии к бортовому компьютеру; файлы, службы, сетевые настройки и полётное ПО на борту не изменялись.</p>

<h2 id="ident">1. Общая идентификация</h2>
<div class="tablewrap"><table>
<thead><tr><th>Параметр</th><th>Значение</th></tr></thead>
<tbody>
<tr><td>Hostname / модель</td><td><code>pioneermini</code> / <code>PioneerMini 2</code></td></tr>
<tr><td>ОС</td><td>PioneerOS (Ubuntu 24.04.4 LTS, noble), сборка Geoscan, версия 0.9.0</td></tr>
<tr><td>Ядро</td><td><code>6.1.99-geoscan-sdk-rk3576</code> (aarch64), сборка 20.02.2026</td></tr>
<tr><td>Uptime / load</td><td>~47 мин, load avg 3.5 / 3.1 / 2.8</td></tr>
<tr><td>Время</td><td>UTC; системные часы 2026-05-08, RTC = 2021-01-01, NTP не синхронизирован</td></tr>
<tr><td>Загрузчик</td><td>U-Boot, DTB <code>rockchip/rk3576-pioneermini2.dtb</code></td></tr>
</tbody></table></div>

<h2 id="hardware">2. Аппаратная платформа (Rockchip RK3576)</h2>
<div class="tablewrap"><table>
<thead><tr><th>Компонент</th><th>Значение</th></tr></thead>
<tbody>
<tr><td>CPU</td><td>4×A72 @2.11 ГГц + 4×A53 @1.92 ГГц</td></tr>
<tr><td>RAM / Swap</td><td>3.8 ГиБ / zram 1.9 ГиБ</td></tr>
<tr><td>ПЗУ</td><td>eMMC 28.9 ГБ (занято 5 ГБ, 19%)</td></tr>
<tr><td>GPU / NPU</td><td>Mali-G52 / rknpu + RKNN</td></tr>
</tbody></table></div>
<ul>
<li><strong>zram1 50 МБ</strong> смонтирован на <code>/var/log</code> (armbian-zram-config) — снижение износа eMMC.</li>
<li><strong>Термозоны:</strong> soc 66.5 °C, bigcore 67.5, little-core 70.2, ddr 67.5, npu 66.5, gpu 69.3 °C. Порог ошибки gRPC — 80 °C.</li>
<li><strong>PMIC</strong> RK806 (i2c-1 0x23) · <strong>RTC</strong> HYM8563 (i2c-6) · <strong>EEPROM</strong> 24C08 (i2c-3 0x50, UUID).</li>
<li><strong>GPIO:</strong> gpiochip0–5; <strong>PWM</strong> <code>pwmchip0</code> (1 канал) — сервопривод.</li>
<li><strong>CAN0:</strong> rk3576_canfd, 1 Мбит/с, FD off, ERROR-ACTIVE, активный обмен (~57 МБ принято).</li>
<li><strong>USB:</strong> два OTG-контроллера, сконфигурированы как два RNDIS-гаджета (usb0 / usb1).</li>
</ul>

<h2 id="cameras">3. Камеры и сенсоры</h2>
<div class="tablewrap"><table>
<thead><tr><th>Устройство</th><th>Модель</th><th>Подключение / роль</th></tr></thead>
<tbody>
<tr><td>Основная камера</td><td>OV13B10 13 МП</td><td>i2c-2; RKISP/RKCIF → rkvpss; программа 1080×720@30, запись до 4K</td></tr>
<tr><td>Оптический поток</td><td>OV9281 (глобальный затвор)</td><td>i2c-0; 1280×800@30/60</td></tr>
<tr><td>Дальномер ToF</td><td>VI5300</td><td>i2c-0, ioctl <code>/dev/vi5300</code></td></tr>
<tr><td>Полётные сенсоры</td><td>IMU / магнитометр / баро / GPS / RC</td><td>через полётный контроллер по PlazLink (не через Linux)</td></tr>
</tbody></table></div>

<h2 id="network">4. Сеть</h2>
<div class="tablewrap"><table>
<thead><tr><th>Интерфейс</th><th>Режим</th><th>Адрес</th><th>Примечание</th></tr></thead>
<tbody>
<tr><td><code>usb0</code></td><td>RNDIS, shared</td><td>10.42.0.1/24</td><td>борт раздаёт адрес ПК; канал SSH (клиент 10.42.0.54)</td></tr>
<tr><td><code>usb1</code></td><td>RNDIS</td><td>—</td><td>сконфигурирован, DOWN</td></tr>
<tr><td><code>wlan0</code></td><td>AP (hotspot)</td><td>10.42.1.1/24</td><td>SSID <code>PMINI2-…</code>, 5 ГГц ch36, dnsmasq</td></tr>
</tbody></table></div>
<ul>
<li>Netplan → NetworkManager; <code>/boot/firmware/netconfig</code>: <code>HOTSPOT=yes</code>, band 5; клиентский Wi-Fi <code>ubnt</code>.</li>
<li><strong>SSH:</strong> порт 22, <code>PermitRootLogin yes</code>, <code>PasswordAuthentication yes</code>.</li>
<li><code>openvpn.service</code> числится active, но реальных конфигов нет (пустышка пакета).</li>
<li>vnStat: wlan0 tx ~427 МБ (исходящее видео), can0 rx ~57 МБ.</li>
</ul>

<h2 id="services">5. Службы systemd</h2>
<p>Отказов служб нет, ошибок в журнале загрузки нет. Основные сервисы:</p>
<div class="codewrap"><pre><code data-lang="text">plazlink-core        → PlazLink-мост (ttyS3, 115200)
grpc-server          → управление БПЛА (gRPC :50051)
media-server         → mediamtx (RTSP/WebRTC/SRT)
motion-opt           → обработка оптического потока
pwm-setup + pwm-servo→ привод сервопривода
pm2-power-manager    → защита серво по току/GPIO
servo-rc-trigger     → серво по RC-каналу
setup-can            → инициализация can0 (1 Мбит/с)
usb-gadget           → два RNDIS-гаджета
manage-connection    → hotspot / клиент Wi-Fi
model-registry       → реестр ИИ-моделей (:7777)
pioneer-bricks       → блочное программирование (:2020)
pioneer-code-web-menu→ веб-меню (:9090)
pm2-ctrl-server      → системный контроль (:17222)
pm2-test-server      → онборд-тесты (:4000)
dufs-recordings      → файловый сервер (:5000)
rkaiq_3A             → 3A-обработка камер
code-server@…        → VS Code в браузере (:9999)</code></pre></div>

<h2 id="ports">6. Карта портов и сервисов</h2>
<div class="tablewrap"><table>
<thead><tr><th>Порт</th><th>Процесс</th><th>Назначение</th></tr></thead>
<tbody>
<tr><td>22</td><td>sshd</td><td>SSH</td></tr>
<tr><td>20556</td><td>plazlink-server-rs</td><td>мост PlazLink ↔ TCP</td></tr>
<tr><td><strong>50051</strong></td><td>python3 grpc-server</td><td><strong>gRPC ControlService</strong></td></tr>
<tr><td>8554/8889/8890/8000-8001/8189</td><td>mediamtx</td><td>RTSP / WebRTC / SRT / RTP</td></tr>
<tr><td>9997</td><td>mediamtx</td><td>REST API стримера</td></tr>
<tr><td>2020</td><td>pioneer-bricks</td><td>Web-UI программирования</td></tr>
<tr><td>9090</td><td>web_menu.py</td><td>Web-меню Pioneer Code</td></tr>
<tr><td>7777</td><td>model_registry.py</td><td>реестр ИИ-моделей</td></tr>
<tr><td>4000</td><td>pm2-test-server</td><td>онборд-тесты (actix/WS)</td></tr>
<tr><td>17222</td><td>pm2-ctrl-server</td><td>системный контроль (axum)</td></tr>
<tr><td>5000</td><td>dufs</td><td>файлы <code>/mnt/media</code> (delete/archive)</td></tr>
<tr><td>9999</td><td>code-server</td><td>VS Code в браузере</td></tr>
<tr><td>53/67</td><td>dnsmasq</td><td>DNS/DHCP shared-интерфейсов</td></tr>
</tbody></table></div>

<h2 id="flight">7. Полётная архитектура (ядро системы)</h2>
<ul>
<li>Полётный контроллер подключён по <strong>UART <code>/dev/ttyS3</code>, 115200 8N1</strong> (активный обмен ~2.1 МБ rx). Протокол — <strong>PlazLink</strong> (Rust-сервер, есть loopback, parser ловит <code>invalid plazlink magic</code>/CRC).</li>
<li><strong>Pioneer SDK 2</strong> 0.15.1 — основной API: <code>Pioneer</code>, <code>Camera</code>, <code>ServoCamera</code>, <code>RecorderControl</code>. Ядро протокола — Cython-модуль <code>proto</code> (Component/Field/FieldSet).</li>
<li><strong>Компоненты телеметрии:</strong> <code>Battery</code> (charge/voltage/temperature), <code>UavMonitor.mode</code>, <code>SensorMonitor.flags</code>, <code>SmartBoard</code> (rcChan/rcServo), <code>Allystar</code> (GNSS), <code>LpsMonitor</code>/<code>USNav_module</code> (локальная навигация).</li>
<li><code>board_config.json</code>: board_type 23, серво −80…+30°, ranger/grab = true, cargo/flashlight = false.</li>
<li>SDK: arm / disarm / takeoff / land / rtl, <code>go_to_local_point</code> / <code>go_to_global_point</code>, скорость и рыскание, каналы RC, события (<code>POINT_REACHED</code>, <code>LOW_VOLTAGE</code>, <code>ENGINES_STARTED</code>), IMU/GPS/высота/дальномеры, LED, параметры автопилота.</li>
</ul>

<h2 id="grpc">8. gRPC API (ControlService)</h2>
<div class="tablewrap"><table>
<thead><tr><th>RPC</th><th>Назначение</th></tr></thead>
<tbody>
<tr><td><code>GetTelemetry</code></td><td>напряжение/температура/заряд батареи, скорость (LPS), высота (ToF), FlightState</td></tr>
<tr><td><code>GetStatus</code></td><td>флаги автопилота + linux: перегрев, неисправность серво, остаток места</td></tr>
<tr><td><code>StreamControls</code></td><td>стрим RC (aileron/elevator/throttle/rudder/mode), 100 Гц, таймаут 5 с</td></tr>
<tr><td><code>FlyCommand</code></td><td>arm / disarm / land / takeoff</td></tr>
<tr><td><code>VideoCommand</code></td><td>старт/стоп стрима, запись, фото (4K/2K/FullHD)</td></tr>
<tr><td><code>ServoCommand</code></td><td>угол −80…+30 через Unix-сокет <code>/tmp/servo.sock</code></td></tr>
</tbody></table></div>
<p>Лог <code>/tmp/jump_log</code>: PlazLink подключён, <code>ControlService listening on [::]:50051</code>, <code>SensorMux_rc set to 0</code>.</p>

<h2 id="video">9. Видео и запись</h2>
<ul>
<li><strong>GStreamer 1.24.2</strong> + патчи Geoscan, MPP-энкодер <code>mpph264enc</code>, RGA.</li>
<li>mediamtx поднимает по требованию: <code>maincamera</code> → /dev/video44 (crop 1080×720@30), <code>optcamera</code> → /dev/video47 (1280×800@30).</li>
<li><code>pm2-jmp-camera-control</code> публикует <code>__jmp_stream</code> (video42, 1920×1088) и <code>__jmp_opt</code> (video46, 1280×800). WebRTC: <code>http://10.42.1.1:8889/MAIN/</code>, <code>/OPT/</code>.</li>
<li><code>motion-opt</code> гоняет <code>mvopt.sh</code> — тракт обработки оптического потока для навигации.</li>
<li>Записи/фото: <code>/mnt/media/{videos,photos}</code>, права 777, раздача через dufs (5000). Файлов пока нет.</li>
</ul>

<h2 id="npu">10. ИИ / NPU</h2>
<ul>
<li><code>pioneer-rknn</code> 1.6.3, <code>rknn-toolkit-lite2</code> 2.3.0, <code>librknnrt</code> 2.3.0.</li>
<li><code>model-registry</code> (:7777): архитектуры <code>yolov8</code>, <code>yolov8-pose</code>, <code>yolov11</code>, <code>PP-OCRv5_mobile_det/rec</code>.</li>
<li>Веса: <code>yolov8n.rknn</code>, <code>yolov8n_pose.rknn</code>, OCR det/rec в <code>/usr/local/bin/model-registry/models</code>.</li>
</ul>

<h2 id="tools">11. Инструменты разработки и пользователи</h2>
<ul>
<li><strong>code-server 4.105.1 / VS Code 1.105.1</strong> (:9999), рабочая папка <code>/home/pioneermini/workspace</code> (пример <code>py.py</code> — автономный маршрут по точкам).</li>
<li><code>pioneer-bricks</code> (:2020) и <code>pioneer-code-web-menu</code> (:9090) — визуальное/блочное программирование.</li>
<li>Пользователь <code>pioneermini</code> (uid 1000) в группах <code>sudo, dialout, video, netdev, systemd-journal, input</code>; sudo требует пароль. Root-SSH разрешён, <code>authorized_keys</code> пуст.</li>
</ul>
<p><strong>Безопасность по умолчанию:</strong> парольная аутентификация + root-логин по SSH, отсутствие firewall, открытые без авторизации dufs / mediamtx / веб-UI (2020, 9090, 7777).</p>

<h2 id="fs">12. Файловая система и обновления</h2>
<ul>
<li><code>/</code> ext4, <code>noatime,commit=120,errors=remount-ro</code>; <code>/tmp</code> tmpfs (nosuid); <code>/var/log</code> — zram.</li>
<li>Пакеты Geoscan: <code>aic8800-*</code>, <code>camera-engine-rkaiq-rk3576</code>, <code>iqfiles-mini2</code>, <code>gstpm2-image-processing</code>, <code>linux-*-geoscan-sdk-rk3576</code>, <code>motion-opt</code>, <code>plazlink-*</code>, <code>pm2-*</code>, <code>pioneer-*</code>, <code>dufs-geoscan-assets-mini2</code>, <code>pionet</code>.</li>
<li>Обновления: <code>unattended-upgrades</code> активен; присутствует cloud-init.</li>
<li>Конфиги: <code>/boot/firmware/netconfig</code>, <code>/etc/pm2-power-manager/default.json</code>, <code>/opt/configs/code/*.json</code>, <code>/usr/local/etc/mediamtx.yml</code>.</li>
</ul>

<h2 id="risks">13. Наблюдения и потенциальные риски</h2>
<p><strong>Часы:</strong> системное время 2026-05-08, RTC 2021-01-01, NTP не синхронизирован — влияет на метки файлов/логов.</p>
<p><strong>Слабая защита:</strong> root-SSH, парольная аутентификация, нет firewall, открытые без аутентификации dufs/mediamtx/веб-UI на USB- и Wi-Fi-интерфейсах.</p>
<p><strong>Wi-Fi hotspot</strong> виден всем и использует дефолтный пароль <code>geoscan123</code> (если не переопределён в netconfig). <code>sudo</code>-пароль совпадает с Wi-Fi-паролем прошивки — единая точка компрометации.</p>
<p><strong>Нагрузка</strong> (load ~3.5) в основном от GStreamer-пайплайнов (H.264 двух камер) и <code>rkaiq_3A_server</code>.</p>
<p><code>/opt/scripts/{get_uid, range_calibration}</code> — root-only бинарники калибровки.</p>

<h2 id="paths">14. Сводка ключевых путей</h2>
<div class="tablewrap"><table>
<thead><tr><th>Раздел</th><th>Пути</th></tr></thead>
<tbody>
<tr><td>SDK</td><td><code>/usr/local/lib/python3.12/dist-packages/pioneer_sdk2/</code> · <code>/usr/lib/python3/dist-packages/proto*.so</code></td></tr>
<tr><td>gRPC / proto</td><td><code>/opt/grpc-server/</code> (main.py, mproto/v2/pm2.proto)</td></tr>
<tr><td>Скрипты борта</td><td><code>/opt/scripts/</code> (can.sh, pwm-setup.sh, setup_twousbotg.sh, manage-network.sh…)</td></tr>
<tr><td>Сервисы</td><td><code>/etc/systemd/system/*.service</code>, <code>/usr/lib/systemd/system/{grpc-server,pwm-servo,pm2-*}.service</code></td></tr>
<tr><td>Медиа / сокеты</td><td><code>/mnt/media/{photos,videos}</code>; <code>/tmp/{maincamera,optcamera,servo.sock}</code>, <code>/tmp/jump_log</code></td></tr>
<tr><td>Логи</td><td><code>journalctl</code>, <code>/var/log/syslog</code>, <code>/var/log/auth.log</code>, <code>/var/log/kern.log</code></td></tr>
</tbody></table></div>
