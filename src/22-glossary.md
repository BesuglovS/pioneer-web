---
layout: layout.njk
title: "Глоссарий и карта системы"
description: "Термины, аббревиатуры, карта портов, служб и ключевых путей бортовой системы Пионер Мини 2"
pageNumber: 22
pageSlug: "glossary"
---

<h1>Глоссарий и карта системы</h1>
<p>Справочная страница: термины, аббревиатуры и сводные таблицы по бортовой системе Пионер Мини 2. Данные по портам, службам и путям получены из <a href="/11-system/">аудита системы</a>.</p>

<h2 id="terms">Термины и аббревиатуры</h2>
<div class="tablewrap"><table>
<thead><tr><th>Термин</th><th>Значение</th></tr></thead>
<tbody>
<tr><td><strong>Pioneer OS</strong></td><td>Бортовая Linux-система (Ubuntu 24.04) вычислительного модуля</td></tr>
<tr><td><strong>Pioneer Code</strong></td><td>Экосистема приложений на борту: Bricks, CodeOss, Галерея, Модели ИИ</td></tr>
<tr><td><strong>Pioneer SDK 2</strong></td><td>Python-библиотека <code>pioneer_sdk2</code> для управления коптером</td></tr>
<tr><td><strong>Pioneer-RKNN</strong></td><td>Библиотека <code>pioneer_rknn</code> для инференса нейросетей на NPU</td></tr>
<tr><td><strong>Bricks</strong></td><td>Блочное программирование в составе Pioneer OS (порт 2020)</td></tr>
<tr><td><strong>CodeOss</strong></td><td>VS Code в браузере (порт 9999)</td></tr>
<tr><td><strong>Jump / Jump 2</strong></td><td>Мобильные приложения для блочного программирования и полётов</td></tr>
<tr><td><strong>PlazLink</strong></td><td>Протокол связи с полётным контроллером (UART <code>/dev/ttyS3</code>, 115200)</td></tr>
<tr><td><strong>NPU</strong></td><td>Нейропроцессор в составе RK3576; ускоряет инференс</td></tr>
<tr><td><strong>RKNN</strong></td><td>Формат модели для NPU Rockchip</td></tr>
<tr><td><strong>ONNX / opset</strong></td><td>Промежуточный формат моделей; сервис загрузки принимает opset=19</td></tr>
<tr><td><strong>mediamtx</strong></td><td>Медиасервер: RTSP/WebRTC/HLS/SRT/RTP</td></tr>
<tr><td><strong>RTSP / WebRTC</strong></td><td>Протоколы видеотрансляции (порты 8554 и 8889)</td></tr>
<tr><td><strong>ImageViewer</strong></td><td>Класс SDK2, публикующий кадр в медиасервер</td></tr>
<tr><td><strong>ArUco</strong></td><td>Метки компьютерного зрения для навигации и координат</td></tr>
<tr><td><strong>ToF</strong></td><td>Time-of-Flight, лазерный дальномер (VI5300)</td></tr>
<tr><td><strong>IMU</strong></td><td>Инерциальный измерительный блок (акселерометр + гироскоп)</td></tr>
<tr><td><strong>ГНСС / GPS</strong></td><td>Спутниковая навигация (Allystar)</td></tr>
<tr><td><strong>RNDIS</strong></td><td>USB-сеть; интерфейсы <code>usb0</code>/<code>usb1</code></td></tr>
<tr><td><strong>Hotspot</strong></td><td>Wi-Fi точка доступа коптера (<code>wlan0</code>, 10.42.0.1)</td></tr>
<tr><td><strong>PioNet</strong></td><td>Утилита настройки сети Pioneer OS</td></tr>
<tr><td><strong>LPS</strong></td><td>Система локального позиционирования (LpsMonitor / USNav)</td></tr>
<tr><td><strong>RC</strong></td><td>Радиоуправление; каналы и режимы полёта</td></tr>
<tr><td><strong>RTL</strong></td><td>Return-to-Launch — возврат в точку взлёта</td></tr>
<tr><td><strong>gRPC</strong></td><td>API управления коптером (ControlService, порт 50051)</td></tr>
</tbody></table></div>

<h2 id="ports">Карта портов</h2>
<div class="tablewrap"><table>
<thead><tr><th>Порт</th><th>Служба</th><th>Назначение</th></tr></thead>
<tbody>
<tr><td>22</td><td>sshd</td><td>SSH</td></tr>
<tr><td>53 / 67</td><td>dnsmasq</td><td>DNS / DHCP</td></tr>
<tr><td>2020</td><td>pioneer-bricks</td><td>Блочное программирование</td></tr>
<tr><td>4000</td><td>pm2-test-server</td><td>Онборд-тесты</td></tr>
<tr><td>5000</td><td>dufs</td><td>Галерея медиафайлов</td></tr>
<tr><td>7777</td><td>model-registry</td><td>Реестр ИИ-моделей</td></tr>
<tr><td>8554</td><td>mediamtx</td><td>RTSP</td></tr>
<tr><td>8888 / 8889 / 8890</td><td>mediamtx</td><td>HLS / WebRTC / SRT</td></tr>
<tr><td>9090</td><td>web_menu.py</td><td>Веб-меню Pioneer Code</td></tr>
<tr><td>9997</td><td>mediamtx</td><td>REST API</td></tr>
<tr><td>9999</td><td>code-server</td><td>VS Code в браузере</td></tr>
<tr><td>17222</td><td>pm2-ctrl-server</td><td>Системный контроль</td></tr>
<tr><td>20556</td><td>plazlink-server-rs</td><td>SDK ↔ автопилот</td></tr>
<tr><td>50051</td><td>grpc-server</td><td>gRPC ControlService</td></tr>
</tbody></table></div>

<h2 id="services">Основные службы systemd</h2>
<div class="codewrap"><pre><code data-lang="text">plazlink-core        → мост PlazLink (ttyS3, 115200)
grpc-server          → управление БПЛА (gRPC :50051)
media-server         → mediamtx (видео)
motion-opt           → обработка оптического потока
pwm-servo / pwm-setup→ сервопривод
pm2-power-manager    → защита серво
model-registry       → реестр ИИ-моделей
pioneer-bricks       → блочное программирование
pioneer-code-web-menu→ веб-меню Pioneer Code
dufs-recordings      → файловый сервер
code-server@…        → VS Code в браузере
rkaiq_3A             → 3A-обработка камер</code></pre></div>

<h2 id="paths">Ключевые пути</h2>
<div class="tablewrap"><table>
<thead><tr><th>Раздел</th><th>Путь</th></tr></thead>
<tbody>
<tr><td>SDK</td><td><code>/usr/local/lib/python3.12/dist-packages/pioneer_sdk2/</code></td></tr>
<tr><td>board_config</td><td><code>…/pioneer_sdk2/board_config.json</code></td></tr>
<tr><td>gRPC / proto</td><td><code>/opt/grpc-server/</code> (<code>mproto/v2/pm2.proto</code>)</td></tr>
<tr><td>Скрипты борта</td><td><code>/opt/scripts/</code></td></tr>
<tr><td>Модели ИИ</td><td><code>/usr/local/bin/model-registry/models/</code></td></tr>
<tr><td>Медиа</td><td><code>/mnt/media/{photos,videos}</code></td></tr>
<tr><td>Рабочая папка</td><td><code>/home/pioneermini/workspace/</code></td></tr>
<tr><td>Сокеты / лог</td><td><code>/tmp/servo.sock</code>, <code>/tmp/jump_log</code></td></tr>
</tbody></table></div>

<h2 id="links">См. также</h2>
<ul>
<li><a href="/11-system/">Исследование системы</a> — полный аудит.</li>
<li><a href="/17-network/">Сеть и PioNet</a> — интерфейсы и адреса.</li>
<li><a href="/10-links/">Ссылки</a> — официальные ресурсы.</li>
</ul>
