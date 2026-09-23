---
layout: layout.njk
title: "Исследование системы"
description: "Аудит бортового компьютера Пионер Мини 2: платформа Rockchip RK3576, PioneerOS 0.9.0, камеры и сенсоры, сеть, службы systemd, порты, полётная архитектура, gRPC API, NPU, прошивка и файловая система"
pageNumber: 11
pageSlug: "system"
---

<h1>Исследование бортовой системы</h1>
<p>Отчёт об исследовании вычислительного модуля Пионер Мини 2 (<code>pioneermini@10.42.0.1</code>), выполненном в режиме «только чтение» по SSH. Описаны аппаратная платформа, камеры и сенсоры, сеть, службы systemd, карта портов, полётная архитектура, gRPC API, видео, нейроускоритель и ключевые пути файловой системы.</p>
<p>Данные получены в SSH-сессии к бортовому компьютеру; файлы, службы, сетевые настройки и полётное ПО на борту не изменялись. Это <strong>снимок одной прошивки</strong> (PioneerOS 0.9.0, ядро сборки 20.02.2026): часть значений (температуры, загрузка, счётчики трафика, время работы) меняется от запуска к запуску и приведена как ориентир.</p>

<h2 id="ident">1. Общая идентификация</h2>
<div class="tablewrap"><table>
<thead><tr><th>Параметр</th><th>Значение</th></tr></thead>
<tbody>
<tr><td>Hostname / модель</td><td><code>pioneermini</code> / <code>PioneerMini 2</code></td></tr>
<tr><td>Device Tree</td><td>model <code>PioneerMini 2</code>, compatible <code>geoscan,pioneermini2</code> + <code>rockchip,rk3576</code></td></tr>
<tr><td>ОС</td><td>PioneerOS (Ubuntu 24.04.4 LTS, noble)</td></tr>
<tr><td>Версия образа</td><td><code>/etc/armbian-release</code>: BOARD <code>pioneer-mini2</code>, VERSION/REVISION <code>0.9.0</code>, commit <code>d0a28f33d</code>, ARCH <code>arm64</code></td></tr>
<tr><td>Ядро</td><td><code>6.1.99-geoscan-sdk-rk3576</code> (aarch64), сборка <code>#1 SMP Fri Feb 20 13:37:44 UTC 2026</code></td></tr>
<tr><td>machine-id</td><td><code>47a9b5dca98d49008d1850e9c7da0a4d</code></td></tr>
<tr><td>Загрузчик</td><td>U-Boot (<code>linux-u-boot-pioneer-mini2-geoscan-sdk 0.9.0</code>), DTB <code>rockchip/rk3576-pioneermini2.dtb</code></td></tr>
<tr><td>Время</td><td>UTC; служба chrony запущена, но <strong>без источников синхронизации</strong>, системные часы не синхронизированы, RTC <code>2021-01-01</code></td></tr>
</tbody></table></div>

<h2 id="hardware">2. Аппаратная платформа (Rockchip RK3576)</h2>
<div class="tablewrap"><table>
<thead><tr><th>Компонент</th><th>Значение</th></tr></thead>
<tbody>
<tr><td>CPU</td><td>8 ядер: 4×Cortex-A72 (CPU part <code>0xd08</code>) + 4×Cortex-A53 (<code>0xd03</code>), <code>nproc</code> = 8</td></tr>
<tr><td>RAM / Swap</td><td>3.8 ГиБ (MemTotal 3995012 кБ) / zram0 1.9 ГиБ</td></tr>
<tr><td>ПЗУ</td><td>eMMC 28.9 ГБ (<code>mmcblk0</code>), корень на <code>mmcblk0p1</code> ext4 (занято 5.0 ГБ, 19%)</td></tr>
<tr><td>GPU / NPU</td><td>Mali-G52 (libmali-bifrost-g52) / RKNPU (<code>librknnrt</code>)</td></tr>
</tbody></table></div>
<ul>
<li><strong>zram:</strong> zram0 — swap 1.9 ГиБ; zram1 (50 МБ) смонтирован на <code>/var/log</code> (armbian-zram-config) для снижения износа eMMC.</li>
<li><strong>Термозоны</strong> (<code>/sys/class/thermal</code>): <code>soc-thermal</code>, <code>bigcore-thermal</code>, <code>little-core-thermal</code>, <code>ddr-thermal</code>, <code>npu-thermal</code>, <code>gpu-thermal</code>. В снимке ~57–61 °C; порог перегрева для флага gRPC — 80 °C.</li>
<li><strong>Периферия:</strong> <code>gpiochip0…5</code>; I²C-шины <code>i2c-0,1,2,3,6</code>; UART <code>ttyS3</code>, <code>ttyS5</code>; дальномер <code>/dev/vi5300</code>; видеоконвейер <code>video0…48</code> + <code>video-dec0</code> / <code>video-enc0</code>.</li>
<li><strong>CAN0:</strong> контроллер <code>rk3576_canfd</code>, битрейт ≈1 Мбит/с (<code>996644</code>), состояние ERROR-ACTIVE, активный обмен.</li>
<li><strong>USB:</strong> два OTG-контроллера, сконфигурированы как два RNDIS-гаджета (<code>usb0</code> и <code>usb1</code>) скриптом <code>setup_twousbotg.sh</code>.</li>
<li><strong>Сервопривод:</strong> <code>pwm-setup.service</code> + <code>pwm-servo.service</code>, управление через Unix-сокет <code>/tmp/servo.sock</code>; аппаратный PWM через sysfs (файла <code>/dev/pwmchip*</code> в снимке нет).</li>
</ul>

<h2 id="cameras">3. Камеры и сенсоры</h2>
<div class="tablewrap"><table>
<thead><tr><th>Устройство</th><th>Модель</th><th>Подключение / роль</th></tr></thead>
<tbody>
<tr><td>Основная камера</td><td>OV13B10 13 Мпикс</td><td>i2c-2; RKISP/RKCIF → rkvpss; программируемый поток 1080×720@30, запись до 4K</td></tr>
<tr><td>Оптический поток</td><td>OV9281 (глобальный затвор)</td><td>i2c-0; 1280×800@60</td></tr>
<tr><td>Дальномер ToF</td><td>VI5300</td><td>i2c-0, ioctl через <code>/dev/vi5300</code></td></tr>
<tr><td>Полётные сенсоры</td><td>IMU / магнитометр / баро / GPS / RC</td><td>через полётный контроллер по PlazLink (не через Linux)</td></tr>
</tbody></table></div>
<p>Отображение видеоконвейера (имена из <code>/sys/class/video4linux</code>): <code>video41</code> = rkvpss_scale0 (record_device основной камеры), <code>video42</code> = scale1, <code>video44</code> = scale3 (программируемый поток основной камеры, crop 1080×720), <code>video46</code> = scale1 (запись/поток оптической камеры), <code>video47</code> = scale2 (оптическая камера, 1280×800), <code>video48</code> = scale3.</p>

<h2 id="network">4. Сеть</h2>
<div class="tablewrap"><table>
<thead><tr><th>Интерфейс</th><th>Режим</th><th>Адрес</th><th>Примечание</th></tr></thead>
<tbody>
<tr><td><code>wlan0</code></td><td>AP (hotspot)</td><td><strong>10.42.0.1/24</strong></td><td>точка доступа, 5 ГГц ch36 (5180 МГц), SSID <code>PMINI2-…</code>, MAC <code>88:00:33:77:ad:e1</code></td></tr>
<tr><td><code>usb0</code></td><td>RNDIS</td><td><strong>10.42.1.1/24</strong></td><td>USB-шлюз (MAC <code>42:6c:84:78:26:78</code>) — по нему подключается ПК</td></tr>
<tr><td><code>usb1</code></td><td>RNDIS</td><td>—</td><td>сконфигурирован, DOWN</td></tr>
<tr><td><code>can0</code></td><td>CAN-FD</td><td>—</td><td>1 Мбит/с, полётная шина</td></tr>
</tbody></table></div>
<p><strong>Важно про адреса:</strong> по Wi-Fi коптер доступен как <code>10.42.0.1</code> (wlan0), по USB-кабелю — как <code>10.42.1.1</code> (usb0). Портал Pioneer Code и SSH слушают на всех интерфейсах, поэтому работают по любому из адресов.</p>
<ul>
<li>Netplan → NetworkManager; соединения: <code>hotspot</code> (wlan0), <code>netplan-usb0</code>, <code>netplan-usb1</code>, <code>client-usb0</code>.</li>
<li>Конфиг <code>/boot/firmware/netconfig</code>: <code>HOTSPOT=yes</code>, <code>HOTSPOT_BAND=5</code>, клиентский Wi-Fi <code>WIFI_SSID=ubnt</code>. SSID точки доступа формируется автоматически как <code>PMINI2-&lt;случайный суффикс&gt;</code>.</li>
<li>SSH: порт 22, <code>PermitRootLogin yes</code>, <code>PasswordAuthentication yes</code>.</li>
<li>DNS/DHCP на USB- и Wi-Fi-интерфейсах раздаёт dnsmasq (порты 53/67).</li>
</ul>

<h2 id="services">5. Службы systemd</h2>
<p>Отказов служб в снимке нет. Запущенные сервисы:</p>
<div class="codewrap"><pre><code data-lang="text">plazlink-core         → PlazLink-мост (ttyS3, 115200)
grpc-server           → управление БПЛА (gRPC :50051)
media-server          → mediamtx (RTSP/WebRTC/SRT/RTP)
motion-opt            → обработка оптического потока
pwm-servo + pwm-setup → привод сервопривода
pm2-power-manager     → защита серво по току/GPIO
servo-rc-trigger      → серво по RC-каналу
setup-can             → инициализация can0 (1 Мбит/с)
usb-gadget            → два RNDIS-гаджета
manage-connection     → hotspot / клиент Wi-Fi
model-registry        → реестр ИИ-моделей (:7777)
pioneer-bricks        → блочное программирование (:2020)
pioneer-code-web-menu → веб-меню Pioneer Code (:9090)
pm2-ctrl-server       → системный контроль (:17222)
pm2-test-server       → онборд-тесты (:4000)
dufs-recordings       → файловый сервер (:5000)
rkaiq_3A              → 3A-обработка камер
code-server@…         → VS Code в браузере (:9999)</code></pre></div>
<p>Помимо них работают системные: <code>chrony</code>, <code>cron</code>, <code>dbus</code>, <code>NetworkManager</code>, <code>wpa_supplicant</code>, <code>rpcbind</code>, <code>rsyslog</code>, <code>vnstat</code>, <code>unattended-upgrades</code>, <code>rng-tools</code>, <code>user@1000</code> и сессии getty.</p>

<h2 id="ports">6. Карта портов и сервисов</h2>
<div class="tablewrap"><table>
<thead><tr><th>Порт</th><th>Процесс</th><th>Назначение</th></tr></thead>
<tbody>
<tr><td>22</td><td>sshd</td><td>SSH</td></tr>
<tr><td>20556</td><td>plazlink-server-rs</td><td>мост PlazLink ↔ TCP (Pioneer SDK по TCP)</td></tr>
<tr><td><strong>50051</strong></td><td>python3 grpc-server</td><td><strong>gRPC ControlService</strong></td></tr>
<tr><td>8554</td><td>mediamtx</td><td>RTSP</td></tr>
<tr><td>8889</td><td>mediamtx</td><td>WebRTC (HTTP)</td></tr>
<tr><td>8000/8001/8189/8890</td><td>mediamtx</td><td>RTP / SRT / UDP</td></tr>
<tr><td>9997</td><td>mediamtx</td><td>REST API стримера</td></tr>
<tr><td>2020</td><td>pioneer-bricks</td><td>Web-UI блочного программирования</td></tr>
<tr><td>9090</td><td>web_menu.py</td><td>Web-меню Pioneer Code</td></tr>
<tr><td>7777</td><td>model_registry.py</td><td>реестр ИИ-моделей</td></tr>
<tr><td>4000</td><td>pm2-test-server</td><td>онборд-тесты (actix/WS)</td></tr>
<tr><td>17222</td><td>pm2-ctrl-server</td><td>системный контроль (axum)</td></tr>
<tr><td>5000</td><td>dufs</td><td>файлы <code>/mnt/media</code></td></tr>
<tr><td>9999</td><td>code-server</td><td>VS Code в браузере</td></tr>
<tr><td>53/67</td><td>dnsmasq</td><td>DNS/DHCP интерфейсов</td></tr>
<tr><td>111</td><td>rpcbind</td><td>RPC (NFS-клиент)</td></tr>
</tbody></table></div>

<h2 id="flight">7. Полётная архитектура (ядро системы)</h2>
<ul>
<li>Полётный контроллер подключён по <strong>UART <code>/dev/ttyS3</code>, 115200 8N1</strong>. Протокол — <strong>PlazLink</strong> (Rust-сервер <code>plazlink-server-rs 0.2.1</code>, порт 20556).</li>
<li><strong>Pioneer SDK 2</strong> 0.15.1 — основной API: <code>Pioneer</code>, <code>Camera</code>, <code>ImageViewer</code>, <code>ServoCamera</code>, <code>RecorderControl</code>. Ядро протокола — Cython-модуль <code>proto</code> (Component/Field/FieldSet). Основной файл — <code>piosdk2.py</code>.</li>
<li><strong>Компоненты телеметрии:</strong> <code>Battery</code> (charge/voltage/temperature), <code>SensorMonitor</code> (voltage, flags), <code>UavMonitor.mode</code>, <code>SmartBoard.rcChan</code>/<code>rcServo</code>, <code>Allystar</code> (GNSS), <code>LpsMonitor</code> / <code>USNav_module</code> (локальная навигация).</li>
<li><code>board_config.json</code> (см. §8): board_type 23, серво −80…+30°, ranger/grab = true, cargo/flashlight = false.</li>
<li>SDK: arm / disarm / takeoff / land, <code>go_to_local_point</code> / <code>go_to_local_point_body_fixed</code> / <code>go_to_global_point</code>, скорость и рыскание, каналы RC, события (<code>POINT_REACHED</code>, <code>LOW_VOLTAGE</code>, <code>ENGINES_STARTED</code>), IMU/GPS/высота/дальномеры, LED, параметры автопилота.</li>
</ul>

<h2 id="grpc">8. gRPC API (ControlService)</h2>
<p>Файл <code>/opt/grpc-server/mproto/v2/pm2.proto</code>, пакет <code>mproto.v2</code>, служба <code>ControlService</code> на порту 50051. Сервер (<code>/opt/grpc-server/main.py</code>) поднимает <code>Pioneer</code> из <code>pioneer_sdk2</code> через <code>--plazlink-host 127.0.0.1</code>.</p>
<div class="tablewrap"><table>
<thead><tr><th>RPC</th><th>Сообщения / назначение</th></tr></thead>
<tbody>
<tr><td><code>GetTelemetry</code></td><td>Ответ: <code>battery_voltage</code>, <code>battery_info</code> (%), <code>battery_temp</code>, <code>speed</code>, <code>height_opt</code> (ToF), <code>state</code></td></tr>
<tr><td><code>GetStatus</code></td><td><code>autopilot</code> (флаги SensorMonitor) + <code>linux</code>: 0x1 — перегрев, 0x2 — неисправность серво, биты 0xC — свободное место (00 норма, 01 &lt;25%, 10 &lt;5%, 11 &lt;0.5%)</td></tr>
<tr><td><code>StreamControls</code></td><td>Стрим RC: <code>aileron</code>, <code>elevator</code>, <code>throttle</code>, <code>rudder</code> ∈ [−1…1] / [0…1], <code>mode</code>; 100 Гц, таймаут 5 с</td></tr>
<tr><td><code>FlyCommand</code></td><td>oneof: arm / disarm / land / takeoff</td></tr>
<tr><td><code>VideoCommand</code></td><td>oneof: start/stop стрима, start/stop записи, фото; разрешение enum <code>Resolution</code> = FOURK / TWOK / FULLHD</td></tr>
<tr><td><code>ServoCommand</code></td><td><code>angle</code> (sint32, комментарий в proto: [−90…30]) + <code>Priority</code> (UNSPECIFIED / MAX / DEFAULT / MIN); фактически через Unix-сокет <code>/tmp/servo.sock</code></td></tr>
</tbody></table></div>
<p>Перечисления: <code>FlightState</code> = NULL, ARMED, TAKEOFF_COMPLETED, POINT_REACHED, LANDED, DISARMED. Режимы RC (<code>RC_MODES</code> в <code>main.py</code>): STABILIZE, ALTHOLD, LOITER, HEADLESS, PROGRAMM.</p>
<p>Лог <code>/tmp/jump_log</code>: <code>Pioneer connected to 127.0.0.1:20556 (persistent connection)</code>, <code>SensorMux_rc set to 0: True</code>, <code>ControlService listening on [::]:50051</code>.</p>

<h2 id="boardconfig">9. Конфигурация борта (board_config.json)</h2>
<div class="tablewrap"><table>
<thead><tr><th>Параметр</th><th>Значение</th></tr></thead>
<tbody>
<tr><td>board_type / board_name</td><td>23 / «Pioneer Mini 2»; <code>gtlp_version</code> 2</td></tr>
<tr><td>Основная камера</td><td>driver <code>gstreamer</code>; программируемый поток 1080×720@30; записываемые: 3840×2160, 2560×1440, 1920×1080, 1280×720 (все @30); <code>record_device</code> 41</td></tr>
<tr><td>Оптическая камера</td><td>1280×800@60, program + recordable, <code>record_device</code> 46</td></tr>
<tr><td>Сервопривод</td><td><code>min</code> −80, <code>max</code> 30 (градусы)</td></tr>
<tr><td>Датчики</td><td>battery (SensorMonitor.voltage, Battery.temperature), rc (SmartBoard.rcChan), gnss <code>Allystar</code>, lps <code>LpsMonitor</code> + <code>USNav_module</code></td></tr>
<tr><td>Полезная нагрузка</td><td><code>ranger</code> true, <code>grab</code> true, <code>cargo</code> false, <code>flashlight</code> false, recorder true</td></tr>
</tbody></table></div>

<h2 id="video">10. Видео и запись</h2>
<ul>
<li><strong>GStreamer 1.24.2</strong> + патчи Geoscan, MPP-энкодер <code>mpph264enc</code>, RGA.</li>
<li>mediamtx поднимает по требованию: <code>maincamera</code> → /dev/video44 (crop 1080×720@30), <code>optcamera</code> → /dev/video47 (1280×800@30).</li>
<li><code>pm2-jmp-camera-control</code> публикует потоки <code>__jmp_stream</code> (video42, 1920×1088) и <code>__jmp_opt</code> (video46, 1280×800). WebRTC: <code>http://10.42.0.1:8889/MAIN/</code>, <code>/OPT/</code>; RTSP: <code>rtsp://10.42.0.1:8554/&lt;путь&gt;</code>.</li>
<li>mediamtx REST API — порт <code>9997</code> (в <code>mediamtx.yml</code> <code>authMethod: internal</code>, пользователь <code>any</code> может publish/read).</li>
<li><code>motion-opt</code> запускает <code>mvopt.sh</code> — тракт обработки оптического потока для навигации.</li>
<li>Записи/фото: <code>/mnt/media/{videos,photos}</code> (права 777), раздача через dufs (5000). В снимке файлов нет.</li>
</ul>

<h2 id="npu">11. ИИ / NPU</h2>
<ul>
<li><code>pioneer-rknn</code> 1.6.3, <code>rknn-toolkit-lite2</code> 2.3.0, <code>librknnrt</code> 2.3.0.</li>
<li><code>model-registry</code> 1.3.4 (:7777): архитектуры <code>yolov8</code>, <code>yolov8-pose</code>, <code>PP-OCRv5_mobile_det</code>, <code>PP-OCRv5_mobile_rec</code>.</li>
<li>Веса в <code>/usr/local/bin/model-registry/models</code> (<code>list.json</code>): <code>yolov8n.rknn</code> (yolov8), <code>yolov8n_pose.rknn</code> (yolov8-pose), <code>eslav_PP-OCRv5_mobile_rec_h48w960.rknn</code>, <code>PP-OCRv5_mobile_det_hw640.rknn</code>.</li>
<li>В составе Python есть <code>numpy</code> 1.26.4, <code>pillow</code> 10.2.0, <code>OpenCV</code> 4.10.0 (пакет <code>opencv</code>), <code>psutil</code>, <code>ruamel.yaml</code>.</li>
</ul>

<h2 id="tools">12. Инструменты разработки и пользователи</h2>
<ul>
<li><strong>code-server 4.105.1</strong> (:9999), рабочая папка <code>/home/pioneermini/workspace</code>: клон репозитория <code>pioneer-sdk2-example</code> и <code>data.yml</code> (калибровка камеры).</li>
<li><code>pioneer-bricks</code> 2.1.1 (:2020) и <code>pioneer-code-web-menu</code> 2.2.1 (:9090) — визуальное/блочное программирование.</li>
<li>Пользователь <code>pioneermini</code> (uid 1000) в группах <code>sudo, tty, disk, dialout, audio, video, plugdev, users, netdev, input, systemd-journal</code>; <code>sudo</code> требует пароль. Root-SSH разрешён, <code>authorized_keys</code> пуст.</li>
</ul>
<p><strong>Безопасность по умолчанию:</strong> парольная аутентификация + root-логин по SSH, отсутствие firewall, открытые без авторизации dufs / mediamtx / веб-UI (2020, 9090, 7777) на USB- и Wi-Fi-интерфейсах. Это удобно для учебного класса, но требует доверенной сети.</p>

<h2 id="fs">13. Файловая система и обновления</h2>
<ul>
<li><code>/</code> — ext4 на eMMC; <code>/tmp</code> — tmpfs; <code>/var/log</code> — zram (сбрасывается при перезагрузке); <code>/dev/shm</code> — tmpfs 2 ГБ.</li>
<li>Пакеты Geoscan: <code>aic8800-*</code> (Wi-Fi/BT), <code>camera-engine-rkaiq-rk3576</code>, <code>iqfiles-mini2</code>, <code>gstpm2-image-processing</code>, <code>linux-*-geoscan-sdk-rk3576 0.9.0</code>, <code>motion-opt 1.7.5</code>, <code>plazlink-server-rs</code> + <code>plazlink-flasher</code>, <code>pm2-*</code>, <code>pioneer-bricks</code>, <code>pioneer-code-codeoss-mini2</code>, <code>pioneer-code-web-menu</code>, <code>pioneer-rknn</code>, <code>model-registry</code>, <code>dufs</code> + <code>dufs-geoscan-assets-mini2</code>, <code>pionet 0.2.1</code>.</li>
<li>Обновления: <code>unattended-upgrades</code> активен; присутствует cloud-init.</li>
<li>Конфиги: <code>/boot/firmware/netconfig</code>, <code>/etc/NetworkManager/system-connections/</code>, <code>/opt/configs/code/*.json</code>, <code>/usr/local/etc/mediamtx.yml</code>.</li>
<li>Каталог <code>/opt</code>: <code>configs/</code>, <code>grpc-server/</code>, <code>scripts/</code>, <code>tests/</code>. Скрипты борта: <code>can.sh</code>, <code>pwm-setup.sh</code>, <code>setup_twousbotg.sh</code>, <code>setup-hotspot.sh</code>, <code>manage-network.sh</code>, <code>internet-usb-client.sh</code>, <code>mvopt.sh</code>, <code>servo_example.py</code>, <code>servo_rc_trigger.py</code>, <code>test_nn.py</code>, root-only <code>get_uid</code> и <code>range_calibration</code>. Тесты камер: <code>/opt/tests/cam/{maincam,optcam,lasercam,servocam,eepromcam,util}.py</code>.</li>
</ul>

<h2 id="risks">14. Наблюдения и потенциальные риски</h2>
<p><strong>Часы:</strong> chrony запущен без источников, системное время и RTC не синхронизированы — это влияет на метки файлов, логов и на TLS-соединения.</p>
<p><strong>Слабая защита:</strong> root-SSH, парольная аутентификация, нет firewall, открытые без аутентификации dufs/mediamtx/веб-UI на USB- и Wi-Fi-интерфейсах.</p>
<p><strong>Wi-Fi hotspot</strong> виден всем; пароль по умолчанию — <code>geoscan123</code> (если не переопределён). Пароль <code>sudo</code> совпадает с Wi-Fi-паролем прошивки — единая точка компрометации.</p>
<p><strong>Нагрузка</strong> в основном от GStreamer-пайплайнов (H.264 двух камер), <code>rkaiq_3A_server</code> и python-сервисов.</p>
<p><code>/var/log</code> живёт в zram и не сохраняется между перезагрузками — для длительного анализа используйте <code>journalctl</code> или rsyslog в реальном времени.</p>

<h2 id="paths">15. Сводка ключевых путей</h2>
<div class="tablewrap"><table>
<thead><tr><th>Раздел</th><th>Пути</th></tr></thead>
<tbody>
<tr><td>SDK</td><td><code>/usr/local/lib/python3.12/dist-packages/pioneer_sdk2/</code> (<code>piosdk2.py</code>, <code>board_config.json</code>, <code>modules/</code>) · <code>/usr/lib/python3/dist-packages/proto*.so</code></td></tr>
<tr><td>gRPC / proto</td><td><code>/opt/grpc-server/</code> (<code>main.py</code>, <code>mproto/v2/pm2.proto</code>, <code>handlers/</code>, <code>servo/</code>, <code>thermal/</code>)</td></tr>
<tr><td>Скрипты борта</td><td><code>/opt/scripts/</code> (can.sh, pwm-setup.sh, setup_twousbotg.sh, manage-network.sh, test_nn.py…)</td></tr>
<tr><td>Сервисы</td><td><code>/etc/systemd/system/*.service</code>, <code>/usr/lib/systemd/system/{grpc-server,pwm-servo,pm2-*}.service</code></td></tr>
<tr><td>Модели ИИ</td><td><code>/usr/local/bin/model-registry/models/</code></td></tr>
<tr><td>Медиа / сокеты</td><td><code>/mnt/media/{photos,videos}</code>; <code>/tmp/{maincamera,optcamera,servo.sock}</code>, <code>/tmp/jump_log</code></td></tr>
<tr><td>Рабочая папка</td><td><code>/home/pioneermini/workspace/</code> (<code>pioneer-sdk2-example</code>, <code>data.yml</code>)</td></tr>
<tr><td>Логи</td><td><code>journalctl</code>, <code>/var/log/syslog</code>, <code>/var/log/auth.log</code>, <code>/var/log/kern.log</code> (в zram)</td></tr>
</tbody></table></div>
