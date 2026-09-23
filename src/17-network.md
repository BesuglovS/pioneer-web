---
layout: layout.njk
title: "Сеть и PioNet"
description: "Режимы Wi-Fi Пионер Мини 2 (точка доступа, клиент, USB), PioNet, netconfig, статический IP, смена SSID и пароля, карта портов"
pageNumber: 17
pageSlug: "network"
---

<h1>Сеть и PioNet</h1>
<p>Пионер Мини 2 — это полноценный Linux-компьютер с Wi-Fi и USB-сетью. От настройки сети зависит, как вы подключаетесь к коптеру и какие сервисы доступны. Этот урок описывает режимы работы, утилиту <strong>PioNet</strong> и карту портов.</p>

<h2 id="interfaces">Интерфейсы и адреса</h2>
<div class="tablewrap"><table>
<thead><tr><th>Интерфейс</th><th>Роль</th><th>Адрес коптера</th><th>Как подключаться</th></tr></thead>
<tbody>
<tr><td><code>wlan0</code></td><td>Wi-Fi точка доступа (hotspot)</td><td><strong>10.42.0.1</strong></td><td>Подключить ПК/телефон к сети <code>PMINI2-…</code></td></tr>
<tr><td><code>usb0</code></td><td>USB-RNDIS (кабель)</td><td><strong>10.42.1.1</strong></td><td>Соединить коптер с ПК USB-кабелем</td></tr>
<tr><td><code>usb1</code></td><td>USB-RNDIS (второй канал)</td><td>—</td><td>Сконфигурирован, обычно отключён</td></tr>
</tbody></table></div>
<p>Портал Pioneer Code и SSH слушают на всех интерфейсах, поэтому один и тот же адрес сервиса работает и по Wi-Fi, и по USB (с поправкой на адрес интерфейса).</p>

<h2 id="modes">Режимы Wi-Fi</h2>
<ul>
<li><strong>Точка доступа (AP).</strong> Коптер раздаёт Wi-Fi сеть <code>PMINI2-(12 символов)</code> с паролем по умолчанию <code>geoscan123</code>. Это основной режим для занятий.</li>
<li><strong>Клиент (STA).</strong> Коптер подключается к внешней Wi-Fi сети — удобно для доступа к интернету и роевых сценариев. Параметры задаются в <code>/boot/firmware/netconfig</code>.</li>
<li><strong>USB.</strong> Кабельное соединение работает всегда и не зависит от загруженности Wi-Fi.</li>
</ul>

<h2 id="pionet">Утилита PioNet</h2>
<p><strong>PioNet</strong> — штатный инструмент Pioneer OS для управления сетью. Позволяет задать имя и пароль Wi-Fi сети коптера, а также переключить режим работы. На борту установлен пакет <code>pionet</code>; запускается из терминала или через веб-интерфейс Pioneer Code.</p>
<p>Рекомендации:</p>
<ul>
<li>Меняйте пароль по умолчанию <code>geoscan123</code> — он совпадает с паролем <code>sudo</code> прошивки, это единая точка компрометации.</li>
<li>Для класса с несколькими коптерами задавайте уникальные SSID, чтобы не путать устройства.</li>
<li>После смены режима/пароля переподключитесь к сети заново.</li>
</ul>

<h2 id="netconfig">Конфигурация netconfig</h2>
<p>Основные сетевые параметры хранятся в <code>/boot/firmware/netconfig</code>:</p>
<div class="codewrap"><pre><code data-lang="text">HOTSPOT="yes"          # точка доступа включена
HOTSPOT_BAND="5"       # диапазон точки доступа (5 ГГц)
WIFI_SSID="..."        # сеть для режима клиента
WIFI_IP_METHOD="dynamic"   # или static
WIFI_STATIC_ADDRESS="..."  # адрес при статическом режиме
WIFI_STATIC_GATEWAY="..."</code></pre></div>
<p>За сеть отвечает <strong>NetworkManager</strong> (поверх netplan). Текущие соединения: <code>nmcli connection show</code>; активные — <code>nmcli connection show --active</code>.</p>

<h2 id="ports">Карта портов</h2>
<div class="tablewrap"><table>
<thead><tr><th>Порт</th><th>Сервис</th></tr></thead>
<tbody>
<tr><td>22</td><td>SSH</td></tr>
<tr><td>9090</td><td>Веб-меню Pioneer Code</td></tr>
<tr><td>9999</td><td>CodeOss (VS Code)</td></tr>
<tr><td>2020</td><td>Bricks (блочное программирование)</td></tr>
<tr><td>7777</td><td>Реестр моделей ИИ</td></tr>
<tr><td>5000</td><td>Галерея (dufs)</td></tr>
<tr><td>8554</td><td>RTSP (mediamtx)</td></tr>
<tr><td>8889</td><td>WebRTC (mediamtx)</td></tr>
<tr><td>8888 / 8890</td><td>HLS / SRT (mediamtx)</td></tr>
<tr><td>9997</td><td>REST API mediamtx</td></tr>
<tr><td>50051</td><td>gRPC ControlService</td></tr>
<tr><td>20556</td><td>plazlink-server-rs</td></tr>
<tr><td>4000 / 17222</td><td>Онборд-тесты / системный контроль</td></tr>
</tbody></table></div>
<p>Полная карта с процессами и назначением — в уроке <a href="/11-system/">«Исследование системы»</a>.</p>

<h2 id="links">См. также</h2>
<ul>
<li><a href="/02-start/">Быстрый старт</a> — подключение по Wi-Fi и USB.</li>
<li><a href="/16-troubleshooting/">Диагностика и FAQ</a> — проблемы подключения.</li>
<li><a href="/19-swarm/">Роевые полёты</a> — планирование каналов.</li>
</ul>
