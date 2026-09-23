---
layout: layout.njk
title: "Диагностика и FAQ"
description: "Типовые проблемы Пионер Мини 2: Wi-Fi, SSH, видеопоток, NPU, двигатели, plazlink; команды диагностики на борту"
pageNumber: 16
pageSlug: "troubleshooting"
---

<h1>Диагностика и FAQ</h1>
<p>Большинство проблем Пионер Мини 2 диагностируются по журналам и состоянию служб прямо на борту. Ниже — типовые ситуации, причины и команды. Все команды выполняются в SSH-сессии к коптеру (<a href="/02-start/">подключение по SSH</a>).</p>

<h2 id="diag-cmds">Базовые команды диагностики</h2>
<div class="tablewrap"><table>
<thead><tr><th>Задача</th><th>Команда</th></tr></thead>
<tbody>
<tr><td>Состояние всех служб</td><td><code>systemctl --failed</code> · <code>systemctl list-units --type=service --state=running</code></td></tr>
<tr><td>Логи текущей загрузки</td><td><code>journalctl -b -p warning</code></td></tr>
<tr><td>Лог полётного моста</td><td><code>cat /tmp/jump_log</code></td></tr>
<tr><td>Адреса интерфейсов</td><td><code>ip -br addr</code> · <code>ip route</code></td></tr>
<tr><td>Открытые порты</td><td><code>ss -tulpn</code></td></tr>
<tr><td>Температура</td><td><code>cat /sys/class/thermal/thermal_zone*/temp</code></td></tr>
<tr><td>Место на диске</td><td><code>df -h</code> · <code>du -sh /mnt/media/*</code></td></tr>
<tr><td>Версии SDK</td><td><code>pip show pioneer_sdk2 pioneer_rknn rknn-toolkit-lite2</code></td></tr>
<tr><td>Модели ИИ</td><td><code>cat /usr/local/bin/model-registry/models/list.json</code></td></tr>
</tbody></table></div>

<h2 id="wifi">Wi-Fi сеть не появляется / не подключается</h2>
<ul>
<li>Убедитесь, что аккумулятор подключён и коптер включён; загрузка занимает до 1–2 минут.</li>
<li>Проверьте состояние точки доступа: <code>nmcli connection show --active</code>, <code>iw dev wlan0 info</code>.</li>
<li>SSID формируется как <code>PMINI2-(12 символов)</code>; пароль по умолчанию <code>geoscan123</code>.</li>
<li>Если сеть пропала после смены настроек — верните конфигурацию через <a href="/17-network/">PioNet</a>.</li>
</ul>

<h2 id="ssh">SSH: ошибки подключения</h2>
<div class="tablewrap"><table>
<thead><tr><th>Сообщение</th><th>Причина и решение</th></tr></thead>
<tbody>
<tr><td><code>Connection closed by 10.42.0.1 port 22</code></td><td>Брандмауэр Windows блокирует исходящее/входящее — создайте правило TCP порт 22</td></tr>
<tr><td><code>Connection timed out</code></td><td>Не тот адрес или интерфейс: по Wi-Fi — <code>10.42.0.1</code>, по USB — <code>10.42.1.1</code></td></tr>
<tr><td><code>Permission denied</code></td><td>Пользователь <code>pioneermini</code>, пароль <code>geoscan123</code>; для Radxa — <code>pioneer</code></td></tr>
</tbody></table></div>

<h2 id="video">Видеопоток не открывается</h2>
<ul>
<li>Проверьте службу: <code>systemctl status media-server</code> и порты <code>ss -tulpn | grep mediamtx</code>.</li>
<li>RTSP — порт <strong>8554</strong>, WebRTC — <strong>8889</strong>, HLS — <strong>8888</strong>, SRT — <strong>8890</strong>. Официальные примеры иногда указывают <code>rtsp://…:8889</code> — используйте 8554.</li>
<li>Поток появляется только при активной публикации (<code>ImageViewer.imshow</code> или камера в режиме стрима).</li>
<li>Список активных путей: <code>curl http://127.0.0.1:9997/v3/paths/list</code>.</li>
</ul>

<h2 id="npu">Нейросеть не запускается</h2>
<ul>
<li>Проверьте реестр моделей: <code>systemctl status model-registry</code>, затем <code>cat …/models/list.json</code>.</li>
<li>Убедитесь, что архитектура модели указана верно (<code>yolov8</code>, <code>yolov8-pose</code>, <code>PP-OCRv5_*</code> или <code>custom</code>).</li>
<li>Проверьте, что модель сконвертирована в RKNN под NPU RK3576 — см. <a href="/21-custom-models/">Свои нейросети</a>.</li>
<li>На борту должны быть <code>pioneer_rknn</code>, <code>rknn-toolkit-lite2</code> и <code>librknnrt</code> (см. <a href="/11-system/">аудит</a>).</li>
</ul>

<h2 id="motors">Двигатели не запускаются / arm не проходит</h2>
<ul>
<li>Проверьте телеметрию и состояние автопилота: флаги <code>SensorMonitor.flags</code>, режим <code>UavMonitor.mode</code>.</li>
<li>Убедитесь, что коптер на ровной поверхности и не находится в состоянии ошибки.</li>
<li>Проверьте заряд АКБ: при низком напряжении arm блокируется.</li>
<li>Проверьте связь с полётным контроллером: <code>systemctl status plazlink-core</code> и <code>cat /tmp/jump_log</code>.</li>
</ul>

<h2 id="plazlink">Телеметрия отсутствует, ошибки plazlink</h2>
<ul>
<li><code>plazlink-core</code> работает поверх UART <code>/dev/ttyS3</code>, 115200; проверьте <code>systemctl status plazlink-core</code>.</li>
<li>В логах возможны сообщения <code>invalid plazlink magic</code>/CRC — при постоянных ошибках проверьте соединение с полётным контроллером.</li>
<li>Убедитесь, что <code>grpc-server</code> подключён: <code>cat /tmp/jump_log</code> должен содержать строку <code>Pioneer connected to 127.0.0.1:20556</code>.</li>
</ul>

<h2 id="thermal">Перегрев и производительность</h2>
<ul>
<li>Смотрите термозоны: <code>for z in /sys/class/thermal/thermal_zone*; do echo $z $(cat $z/temp); done</code>.</li>
<li>Порог ошибки для gRPC-флага перегрева — 80 °C; при нагреве прекратите полёт и дайте остыть.</li>
<li>Высокая нагрузка обычно от GStreamer-пайплайнов и 3A-обработки камер — закройте лишние видеопотоки.</li>
</ul>

<h2 id="disk">Мало места / видео не записывается</h2>
<ul>
<li>Проверьте <code>df -h /</code> и <code>du -sh /mnt/media/*</code>.</li>
<li>Удалите ненужные записи через Галерею (<a href="/02-start/">Pioneer Code</a>, порт 5000) или вручную из <code>/mnt/media</code>.</li>
<li>gRPC-статус отдаёт флаги свободного места (00 / &lt;25% / &lt;5% / &lt;0.5%).</li>
</ul>

<h2 id="time">Сбито время / дата</h2>
<ul>
<li>На борту время может быть не синхронизировано (chrony без источников, RTC в прошлом) — это нормально для изолированной сети.</li>
<li>Проверьте: <code>timedatectl</code> · <code>chronyc sources</code>.</li>
<li>Некорректное время влияет на метки файлов и логов.</li>
</ul>

<h2 id="links">См. также</h2>
<ul>
<li><a href="/11-system/">Исследование системы</a> — карта служб, портов и путей.</li>
<li><a href="/17-network/">Сеть и PioNet</a> — настройка Wi-Fi.</li>
<li><a href="/15-calibration/">Калибровка и обслуживание</a>.</li>
</ul>
