---
layout: layout.njk
title: "Миграция SDK1 → SDK2"
description: "Переход со старой библиотеки pioneer_sdk на pioneer_sdk2: различия, карта методов, конвертация RC-каналов rc_sdk1_to_sdk2 и класс VideoStream"
pageNumber: 20
pageSlug: "migration"
---

<h1>Миграция SDK1 → SDK2</h1>
<p>В серии «Пионер» исторически было две Python-библиотеки: <strong>pioneer_sdk</strong> (первое поколение, SDK1) и <strong>pioneer_sdk2</strong> (SDK2). Пионер Мини 2 работает с SDK2; SDK1 остаётся для «Базового» с платой-адаптером и старых учебных материалов. Этот урок помогает перенести код.</p>

<h2 id="which">Какая библиотека где</h2>
<div class="tablewrap"><table>
<thead><tr><th>Библиотека</th><th>Кому подходит</th><th>Установка</th></tr></thead>
<tbody>
<tr><td><code>pioneer_sdk</code> (SDK1)</td><td>Пионер Базовый с платой-адаптером; старые примеры</td><td><code>pip install pioneer_sdk</code></td></tr>
<tr><td><code>pioneer_sdk2</code> (SDK2)</td><td>Пионер Мини 2; Базовый с Radxa Zero 3W / Pi Zero 2W</td><td><code>pip install pioneer_sdk2</code></td></tr>
</tbody></table></div>
<p>На Пионере Мини 2 SDK2 уже установлена на борту (версия 0.15.1 в снимке — см. <a href="/11-system/">аудит</a>).</p>

<h2 id="concept">Главное различие: RC-каналы</h2>
<p>В SDK1 каналы задавались «пультовыми» значениями ШИМ (обычно около 1000–2000 мкс), а в SDK2 — <strong>нормированными</strong> значениями от −1 до 1. Для перехода между форматами в SDK2 есть готовый метод:</p>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-c"># rc_sdk1_to_sdk2: PWM-каналы SDK1 -> нормированные каналы SDK2</span>
ch1, ch2, ch3, ch4, ch5 = rc_sdk1_to_sdk2(channel_1, channel_2, channel_3, channel_4, channel_5=<span class="tok-n">2000</span>)
</code></pre></div>
<p>Семантика нормированных каналов SDK2 (метод <code>send_rc_channels()</code>):</p>
<div class="tablewrap"><table>
<thead><tr><th>Канал</th><th>Стик</th><th>Значения</th></tr></thead>
<tbody>
<tr><td><code>channel_1</code></td><td>правый</td><td>−1 влево, 0 центр, 1 вправо</td></tr>
<tr><td><code>channel_2</code></td><td>правый</td><td>−1 вперёд, 0 центр, 1 назад</td></tr>
<tr><td><code>channel_3</code></td><td>левый</td><td>−1 вниз, 0 центр, 1 вверх</td></tr>
<tr><td><code>channel_4</code></td><td>левый</td><td>1 влево, 0 центр, −1 вправо</td></tr>
<tr><td><code>channel_5</code></td><td>—</td><td>канал режима управления</td></tr>
</tbody></table></div>
<p>Для отправки RC-каналов нужны параметры автопилота <code>Copter_man_rcMode0=6.0</code>, <code>Copter_man_rcMode1=3.0</code>, <code>Copter_man_rcMode2=3.0</code>, <code>Copter_flyWithoutRc=1.0</code>, <code>SensorMux_rc=2.0</code>. Подробнее — в <a href="/sdk2/rc/send_rc_channels/">справочнике</a> и уроке <a href="/09-examples/">«Примеры»</a> (<code>wasd_rc_channels.py</code>).</p>

<h2 id="video">Видео: VideoStream → ImageViewer</h2>
<p>В SDK1 вывод изображения с камеры выполнялся классом <code>VideoStream</code>. В SDK2 его заменяет <strong><code>ImageViewer</code></strong> (публикация кадра в RTSP/WebRTC через mediamtx) и класс <code>Camera</code> для получения кадров:</p>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-c"># SDK2</span>
<span class="tok-k">from</span> pioneer_sdk2 <span class="tok-k">import</span> Camera, CameraType, ImageViewer

cam = Camera(CameraType.MAIN)
iv = ImageViewer()
frame = cam.get_cv_frame(timeout=<span class="tok-n">5.0</span>)
iv.imshow(<span class="tok-s">"video"</span>, frame, fps=<span class="tok-n">30</span>)
</code></pre></div>

<h2 id="api-map">Карта соответствий (обзор)</h2>
<div class="tablewrap"><table>
<thead><tr><th>Задача</th><th>SDK1</th><th>SDK2</th></tr></thead>
<tbody>
<tr><td>Соединение</td><td><code>Pioneer()</code></td><td><code>Pioneer()</code> (по умолчанию TCP <code>127.0.0.1:20556</code>)</td></tr>
<tr><td>Взлёт/посадка</td><td><code>arm</code>/<code>takeoff</code>/<code>land</code></td><td><code>arm()</code>/<code>takeoff()</code>/<code>land()</code></td></tr>
<tr><td>Полёт в точку</td><td>локальные/глобальные команды</td><td><code>go_to_local_point()</code>, <code>go_to_global_point()</code></td></tr>
<tr><td>Ручное управление</td><td>RC в значениях ШИМ</td><td><code>send_rc_channels()</code> (нормированные)</td></tr>
<tr><td>Видео</td><td><code>VideoStream</code></td><td><code>Camera</code> + <code>ImageViewer</code></td></tr>
<tr><td>Серво камеры</td><td>серво-команды</td><td><code>ServoCamera.set_angle()</code></td></tr>
<tr><td>Телеметрия</td><td>чтение компонентов</td><td><code>Pioneer.messenger.hub[...]</code>, события</td></tr>
</tbody></table></div>

<h2 id="checklist">Чек-лист миграции</h2>
<ol>
<li>Замените импорты <code>pioneer_sdk</code> → <code>pioneer_sdk2</code>.</li>
<li>Переведите RC-значения в нормированный вид (или используйте <code>rc_sdk1_to_sdk2()</code>).</li>
<li>Замените <code>VideoStream</code> на <code>Camera</code> + <code>ImageViewer</code>.</li>
<li>Проверьте параметры автопилота под новый способ управления.</li>
<li>Оберните миссию в <code>try/finally</code> с безопасным завершением (см. <a href="/13-safety/">Безопасность</a>).</li>
<li>Протестируйте на малой высоте без нагрузки.</li>
</ol>

<h2 id="links">См. также</h2>
<ul>
<li><a href="/sdk2/rc/rc_sdk1_to_sdk2/">Справочник: rc_sdk1_to_sdk2</a>.</li>
<li><a href="/04-base/">Пионер Базовый</a> — выбор SDK.</li>
<li><a href="/09-examples/">Примеры</a> — готовые скрипты SDK2.</li>
</ul>
