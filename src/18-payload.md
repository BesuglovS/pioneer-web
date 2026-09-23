---
layout: layout.njk
title: "Полезная нагрузка"
description: "Разъёмы Type-C и крепления LEGO Пионер Мини 2, флаги board_config (ranger/grab/cargo/flashlight), управление захватом и грузом из pioneer_sdk2"
pageNumber: 18
pageSlug: "payload"
---

<h1>Полезная нагрузка</h1>
<p>Пионер Мини 2 рассчитан на расширение: два разъёма <strong>Type-C</strong> и крепления формата <strong>LEGO</strong> позволяют подключить до двух собственных модулей одновременно. Нагрузка управляется как из Python-библиотеки <code>pioneer_sdk2</code>, так и из блочных сред.</p>

<h2 id="hardware">Аппаратные возможности</h2>
<ul>
<li><strong>Два разъёма Type-C</strong> — питание и обмен данными с внешними модулями.</li>
<li><strong>Крепления LEGO</strong> — механический монтаж нагрузки (камера, манипулятор, световое устройство).</li>
<li><strong>Съёмная верхняя крышка</strong> — доступ к разъёмам и возможность кастомизации корпуса.</li>
</ul>

<h2 id="boardconfig">Флаги нагрузки в board_config</h2>
<p>Возможности нагрузки описываются в <code>board_config.json</code> (см. <a href="/11-system/">аудит системы</a>). На исследованном борту:</p>
<div class="tablewrap"><table>
<thead><tr><th>Флаг</th><th>Значение</th><th>Смысл</th></tr></thead>
<tbody>
<tr><td><code>ranger</code></td><td><code>true</code></td><td>Доступен дальномер</td></tr>
<tr><td><code>grab</code></td><td><code>true</code></td><td>Доступен механический захват</td></tr>
<tr><td><code>cargo</code></td><td><code>false</code></td><td>Магнитный захват груза не заявлен</td></tr>
<tr><td><code>flashlight</code></td><td><code>false</code></td><td>Подсветка не заявлена</td></tr>
<tr><td><code>recorder</code></td><td><code>true</code></td><td>Доступна запись видео/фото</td></tr>
</tbody></table></div>
<p>Наличие конкретного модуля определяется установленным оборудованием и прошивкой; перед вызовом метода проверяйте поддержку.</p>

<h2 id="api">Управление из pioneer_sdk2</h2>
<p>Методы полезной нагрузки (категория <a href="/sdk2/payload/">«Полезная нагрузка»</a> в справочнике):</p>
<div class="tablewrap"><table>
<thead><tr><th>Метод</th><th>Назначение</th></tr></thead>
<tbody>
<tr><td><code>grab_open()</code></td><td>Открывает механический захват</td></tr>
<tr><td><code>grab_close()</code></td><td>Закрывает механический захват</td></tr>
<tr><td><code>grab_stop()</code></td><td>Останавливает движение захвата</td></tr>
<tr><td><code>cargo_grab()</code></td><td>Включает магнитный захват груза</td></tr>
<tr><td><code>cargo_release()</code></td><td>Выключает магнитный захват груза</td></tr>
</tbody></table></div>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_sdk2 <span class="tok-k">import</span> Pioneer

drone = Pioneer()
<span class="tok-c"># захват и отпускание механического груза</span>
drone.grab_open()
drone.grab_close()
drone.grab_stop()
drone.close_connection()
</code></pre></div>

<h2 id="scenarios">Сценарии применения</h2>
<ul>
<li>Доставка и сброс груза по маршруту (<a href="/sdk2/waypoints/">полёт по точкам</a> + <code>grab_open()</code>).</li>
<li>Световое шоу дронов с управляемой подсветкой (<code>led_control</code> в <a href="/sdk2/system/">категории «Система»</a>).</li>
<li>Собственные модули компьютерного зрения и датчиков через Type-C.</li>
<li>Прохождение 3D-лабиринтов и миссий с манипулятором.</li>
</ul>

<h2 id="safety">Безопасность</h2>
<p>Нагрузка меняет массу и баланс коптера. Перед полётом убедитесь, что крепление надёжно, груз не смещает центр тяжести, а при сбросе под коптером нет людей. Общие правила — в уроке <a href="/13-safety/">«Безопасность и регламенты»</a>.</p>

<h2 id="links">См. также</h2>
<ul>
<li><a href="/sdk2/payload/">Справочник: полезная нагрузка</a>.</li>
<li><a href="/05-sdk2/">Pioneer SDK 2</a> — класс Pioneer.</li>
<li><a href="/11-system/">Исследование системы</a> — board_config.json.</li>
</ul>
