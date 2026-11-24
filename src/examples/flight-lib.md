---
layout: layout.njk
title: "Разбор: библиотека полёта flight_lib"
description: "Библиотека flight_lib для «Пионер Мини 2»: взлёт с удержанием высоты, движение по корпусу, развороты, распознавание цвета A4, поиск объекта по высоте, watchdog и готовые примеры миссий"
permalink: "/examples/flight-lib/"
---

<h1 id="top"><code>flight_lib</code> — библиотека полёта «Пионер Мини 2»</h1>
<p><a class="btn ghost" href="/09-examples/">← Все разборы примеров</a></p>
<p>Библиотека прячет служебную часть полёта: подключение, проверки, удержание высоты по дальномеру, движение относительно корпуса, развороты, камеру, распознавание цвета, поиск объекта по высоте, watchdog, логи и аварийную посадку. В главном файле миссии остаются только команды полёта.</p>

<h2 id="fl-composition">Состав</h2>
<div class="tablewrap"><table>
<thead><tr><th>Файл</th><th>Назначение</th></tr></thead>
<tbody>
<tr><td><code>flight_lib.py</code></td><td>сама библиотека</td></tr>
<tr><td><code>color_turn_flight.py</code></td><td>пример: взлёт, вперёд, цвет A4, поворот, посадка</td></tr>
<tr><td><code>object_search_flight.py</code></td><td>пример: поиск объекта по высоте в прямоугольнике</td></tr>
<tr><td><code>camera_check.py</code></td><td>проверка камеры без моторов</td></tr>
</tbody></table></div>
<p>Требования: Pioneer OS, <code>pioneer_sdk2</code>, <code>opencv-python</code>, <code>numpy</code>. Файлы должны лежать в одном каталоге на борту, например <code>/home/pioneermini/tournament/</code>.</p>

<h2 id="fl-quickstart">Быстрый старт</h2>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> flight_lib <span class="tok-k">import</span> execute_mission


<span class="tok-k">def</span> mission(flight) -&gt; <span class="tok-k">None</span>:
    flight.takeoff(<span class="tok-n">1.2</span>)
    flight.forward(<span class="tok-n">0.5</span>)
    flight.land()


<span class="tok-k">if</span> __name__ == <span class="tok-s">"__main__"</span>:
    <span class="tok-k">raise</span> <span class="tok-b">SystemExit</span>(execute_mission(mission))
</code></pre></div>
<p>Запуск:</p>
<div class="codewrap"><pre><code data-lang="bash">python3 mission.py --dry-run
python3 mission.py
python3 mission.py --no-confirm --log flight.log</code></pre></div>
<p><code>execute_mission</code> делает всё служебное:</p>
<ul>
<li>разбирает <code>--dry-run</code>, <code>--no-confirm</code>, <code>--log</code>;</li>
<li>настраивает журнал;</li>
<li>подключает <code>Pioneer()</code> и выполняет <code>preflight()</code>;</li>
<li>спрашивает подтверждение, если не указан <code>--no-confirm</code>;</li>
<li>вызывает <code>mission(flight)</code>;</li>
<li>ловит ошибки и <code>Ctrl+C</code>, при необходимости сажает дрон;</li>
<li>закрывает камеру и соединение, пишет <code>color_flight_done.txt</code>;</li>
<li>возвращает код завершения.</li>
</ul>
<p>Успешная миссия должна сама вызвать <code>flight.land()</code>: <code>execute_mission</code> не сажает дрон автоматически после успешного <code>mission()</code>.</p>

<h2 id="fl-commands">Команды <code>Flight</code></h2>
<div class="tablewrap"><table>
<thead><tr><th>Команда</th><th>Что делает</th></tr></thead>
<tbody>
<tr><td><code>takeoff(altitude_m=1.2)</code></td><td>arm, взлёт, выход на высоту по дальномеру</td></tr>
<tr><td><code>forward(distance_m)</code></td><td>вперёд по носу, м</td></tr>
<tr><td><code>backward(distance_m)</code></td><td>назад по носу, м</td></tr>
<tr><td><code>strafe_right(distance_m)</code></td><td>вправо относительно корпуса, м</td></tr>
<tr><td><code>strafe_left(distance_m)</code></td><td>влево относительно корпуса, м</td></tr>
<tr><td><code>turn(angle_deg, clockwise=True)</code></td><td>разворот на угол, по/против часовой</td></tr>
<tr><td><code>detect_color()</code></td><td>один раз определить цвет листа A4</td></tr>
<tr><td><code>search_object(...)</code></td><td>поиск объекта по высоте в прямоугольнике</td></tr>
<tr><td><code>land()</code></td><td>посадка</td></tr>
<tr><td><code>set_watchdog_timeout(seconds)</code></td><td>продлить/отключить общий watchdog</td></tr>
<tr><td><code>preflight()</code></td><td>проверки АКБ, навигации и высотомера</td></tr>
<tr><td><code>emergency_land()</code></td><td>посадка/disarm при ошибке</td></tr>
</tbody></table></div>
<p>Все движения удерживают высоту по дальномеру. <code>forward/backward</code> используют <code>vy</code>, <code>strafe_right/strafe_left</code> — <code>vx</code> в <code>set_manual_speed_body_fixed</code>.</p>

<h2 id="fl-move">Движение по корпусу</h2>
<div class="codewrap"><pre><code data-lang="python">flight.takeoff(<span class="tok-n">1.2</span>)

flight.forward(<span class="tok-n">0.5</span>)       <span class="tok-c"># вперёд 50 см</span>
flight.strafe_right(<span class="tok-n">0.3</span>)  <span class="tok-c"># вправо 30 см</span>
flight.backward(<span class="tok-n">0.2</span>)      <span class="tok-c"># назад 20 см</span>
flight.strafe_left(<span class="tok-n">0.3</span>)   <span class="tok-c"># влево 30 см</span>

flight.land()</code></pre></div>
<p>Скорость — <code>BODY_SPEED_M_S = 0.15</code> м/с, дистанция задаётся временем. После каждого отрезка библиотека гасит скорость и удерживает высоту.</p>

<h2 id="fl-turns">Развороты</h2>
<div class="codewrap"><pre><code data-lang="python">flight.turn(<span class="tok-n">90</span>, clockwise=<span class="tok-k">True</span>)    <span class="tok-c"># 90° по часовой</span>
flight.turn(<span class="tok-n">90</span>, clockwise=<span class="tok-k">False</span>)   <span class="tok-c"># 90° против часовой</span>
flight.turn(<span class="tok-n">180</span>, clockwise=<span class="tok-k">True</span>)   <span class="tok-c"># 180° по часовой</span></code></pre></div>
<p>Разворот выполняется ручной скоростью рыскания <code>0,63 рад/с</code> по таймеру: телеметрия <code>get_local_yaw_lps()</code> в OPT не обновляется, поэтому обратная связь по курсу не используется.</p>

<h2 id="fl-color">Цвет листа A4</h2>
<div class="codewrap"><pre><code data-lang="python">color = flight.detect_color()

<span class="tok-k">if</span> color == <span class="tok-s">"red"</span>:
    flight.turn(<span class="tok-n">180</span>, clockwise=<span class="tok-k">True</span>)
<span class="tok-k">elif</span> color == <span class="tok-s">"blue"</span>:
    flight.turn(<span class="tok-n">90</span>, clockwise=<span class="tok-k">True</span>)
<span class="tok-k">elif</span> color == <span class="tok-s">"green"</span>:
    flight.turn(<span class="tok-n">90</span>, clockwise=<span class="tok-k">False</span>)</code></pre></div>
<ul>
<li>камера не поворачивается: сервопривод остаётся в выставленном положении;</li>
<li>берутся 3 кадра, решение принимается большинством;</li>
<li>анализируется центральная область кадра;</li>
<li>первый кадр сохраняется в <code>color_frame.jpg</code>;</li>
<li>если цвет не определён, возвращается <code>None</code>.</li>
</ul>

<h2 id="fl-search">Поиск объекта по высоте</h2>
<p>Объект — это возвышение на полу. Дрон летит на высоте <code>altitude</code>, лазерный высотомер измеряет дальность до пола. Над объектом дальность уменьшается на его высоту, поэтому объект ищется по просадке:</p>
<div class="codewrap"><pre><code data-lang="text">distance &lt; baseline - min_object_height</code></pre></div>
<div class="codewrap"><pre><code data-lang="python">result = flight.search_object(
    x_min=<span class="tok-n">0.0</span>, x_max=<span class="tok-n">2.5</span>,
    y_min=<span class="tok-n">0.0</span>, y_max=<span class="tok-n">2.5</span>,
    start=(<span class="tok-n">1.25</span>, <span class="tok-n">0.0</span>),        <span class="tok-c"># любая точка на границе</span>
    altitude=<span class="tok-n">1.2</span>,
    min_object_height=<span class="tok-n">0.25</span>,   <span class="tok-c"># минимальная высота объекта, м</span>
    pattern=<span class="tok-s">"lawnmower"</span>,      <span class="tok-c"># lawnmower | spiral</span>
    step=<span class="tok-n">0.25</span>,
    direction=<span class="tok-s">"x"</span>,
    speed=<span class="tok-n">0.4</span>,
    samples=<span class="tok-n">3</span>,
    poll_hz=<span class="tok-n">20.0</span>,
    center=<span class="tok-k">True</span>,
    center_max=<span class="tok-n">1.0</span>,
    center_step=<span class="tok-n">0.05</span>,
)</code></pre></div>
<p>Алгоритм:</p>
<ol>
<li>Проверяет, что <code>start</code> лежит на границе прямоугольника.</li>
<li>Строит маршрут змейкой или спиралью, начиная от <code>start</code>.</li>
<li>Измеряет baseline — медиану дальномера на старте.</li>
<li>Идёт по точкам и опрашивает высотомер.</li>
<li>При подтверждённой просадке <strong>останавливает маршрут</strong>.</li>
<li>Центрируется над объектом: прощупывает края вперёд/назад и влево/вправо.</li>
<li>Остаётся висеть и возвращает <code>SearchResult</code>.</li>
</ol>
<p>Если объекта нет, область проходит полностью и возвращает <code>found=False, scanned=True</code>.</p>

<h3 id="fl-result"><code>SearchResult</code></h3>
<div class="tablewrap"><table>
<thead><tr><th>Поле</th><th>Значение</th></tr></thead>
<tbody>
<tr><td><code>found</code></td><td>объект найден</td></tr>
<tr><td><code>scanned</code></td><td>область просмотрена до конца</td></tr>
<tr><td><code>x</code>, <code>y</code></td><td>центр объекта или последняя точка</td></tr>
<tr><td><code>height</code></td><td>измеренная высота объекта, м</td></tr>
<tr><td><code>baseline</code></td><td>базовая дальность до пола, м</td></tr>
<tr><td><code>threshold</code></td><td><code>min_object_height</code></td></tr>
<tr><td><code>centered</code></td><td>удалось ли уйти с края</td></tr>
<tr><td><code>entry</code>, <code>exit</code></td><td>точки входа/выхода при обнаружении</td></tr>
<tr><td><code>waypoints_total</code></td><td>всего точек маршрута</td></tr>
<tr><td><code>waypoints_done</code></td><td>пройдено точек</td></tr>
</tbody></table></div>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">if</span> result.found:
    <span class="tok-b">print</span>(<span class="tok-s">f"Объект: x={result.x:.2f}, y={result.y:.2f}, "</span>
          <span class="tok-s">f"высота={result.height:.2f} м, centered={result.centered}"</span>)
<span class="tok-k">else</span>:
    <span class="tok-b">print</span>(<span class="tok-s">"Область просмотрена, объекта нет"</span>)</code></pre></div>
<p>Метод <strong>не садится сам</strong>: после возврата дрон висит, и главная программа решает, что делать — <code>land()</code>, <code>rtl()</code> или продолжить.</p>

<h3 id="fl-spiral">Спираль</h3>
<div class="codewrap"><pre><code data-lang="python">result = flight.search_object(
    x_min=-<span class="tok-n">2.0</span>, x_max=<span class="tok-n">2.0</span>,
    y_min=-<span class="tok-n">2.0</span>, y_max=<span class="tok-n">2.0</span>,
    start=(<span class="tok-n">0.0</span>, -<span class="tok-n">2.0</span>),
    altitude=<span class="tok-n">1.2</span>,
    min_object_height=<span class="tok-n">0.2</span>,
    pattern=<span class="tok-s">"spiral"</span>,
    step=<span class="tok-n">0.4</span>,
    speed=<span class="tok-n">0.4</span>,
)</code></pre></div>

<h2 id="fl-watchdog">Watchdog</h2>
<p>При взлёте запускается общий watchdog: по умолчанию 40 с. Поиск автоматически продлевает его на время маршрута и центрирования. После возврата результата даётся 60 с на решение главной программы.</p>
<div class="codewrap"><pre><code data-lang="python">flight.set_watchdog_timeout(<span class="tok-n">120</span>)   <span class="tok-c"># продлить</span>
flight.set_watchdog_timeout(<span class="tok-k">None</span>)  <span class="tok-c"># отключить автоматическую посадку</span></code></pre></div>
<p>Если главная программа не успела ничего сделать, watchdog посадит дрон.</p>

<h2 id="fl-dryrun">Свой план для <code>--dry-run</code></h2>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> flight_lib <span class="tok-k">import</span> execute_mission


<span class="tok-k">def</span> mission(flight):
    ...


<span class="tok-k">def</span> print_plan():
    <span class="tok-b">print</span>(<span class="tok-s">"Моя миссия: взлёт, квадрат, посадка"</span>)


<span class="tok-k">if</span> __name__ == <span class="tok-s">"__main__"</span>:
    <span class="tok-k">raise</span> <span class="tok-b">SystemExit</span>(
        execute_mission(
            mission,
            plan_fn=print_plan,
            title=<span class="tok-s">"Моя миссия"</span>,
        )
    )</code></pre></div>

<h2 id="fl-examples">Примеры</h2>

<h3 id="fl-square">Квадрат</h3>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> flight_lib <span class="tok-k">import</span> execute_mission


<span class="tok-k">def</span> mission(flight):
    flight.takeoff(<span class="tok-n">1.2</span>)
    <span class="tok-k">for</span> _ <span class="tok-k">in</span> <span class="tok-b">range</span>(<span class="tok-n">4</span>):
        flight.forward(<span class="tok-n">0.5</span>)
        flight.turn(<span class="tok-n">90</span>, clockwise=<span class="tok-k">True</span>)
    flight.land()


<span class="tok-k">if</span> __name__ == <span class="tok-s">"__main__"</span>:
    <span class="tok-k">raise</span> <span class="tok-b">SystemExit</span>(execute_mission(mission))</code></pre></div>

<h3 id="fl-color-example">Цвет A4</h3>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> flight_lib <span class="tok-k">import</span> execute_mission


<span class="tok-k">def</span> mission(flight):
    flight.takeoff(<span class="tok-n">1.2</span>)
    flight.forward(<span class="tok-n">0.5</span>)

    color = flight.detect_color()
    <span class="tok-k">if</span> color == <span class="tok-s">"red"</span>:
        flight.turn(<span class="tok-n">180</span>, clockwise=<span class="tok-k">True</span>)
    <span class="tok-k">elif</span> color == <span class="tok-s">"blue"</span>:
        flight.turn(<span class="tok-n">90</span>, clockwise=<span class="tok-k">True</span>)
    <span class="tok-k">elif</span> color == <span class="tok-s">"green"</span>:
        flight.turn(<span class="tok-n">90</span>, clockwise=<span class="tok-k">False</span>)

    flight.land()


<span class="tok-k">if</span> __name__ == <span class="tok-s">"__main__"</span>:
    <span class="tok-k">raise</span> <span class="tok-b">SystemExit</span>(execute_mission(mission))</code></pre></div>

<h3 id="fl-search-example">Поиск и решение main</h3>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> flight_lib <span class="tok-k">import</span> execute_mission


<span class="tok-k">def</span> mission(flight):
    flight.takeoff(<span class="tok-n">1.2</span>)

    result = flight.search_object(
        x_min=<span class="tok-n">0.0</span>, x_max=<span class="tok-n">2.5</span>,
        y_min=<span class="tok-n">0.0</span>, y_max=<span class="tok-n">2.5</span>,
        start=(<span class="tok-n">1.25</span>, <span class="tok-n">0.0</span>),
        altitude=<span class="tok-n">1.2</span>,
        min_object_height=<span class="tok-n">0.25</span>,
        step=<span class="tok-n">0.25</span>,
    )

    <span class="tok-k">if</span> result.found:
        <span class="tok-b">print</span>(<span class="tok-s">"Найден:"</span>, result.x, result.y, result.height)
        flight.turn(<span class="tok-n">90</span>, clockwise=<span class="tok-k">True</span>)
    <span class="tok-k">else</span>:
        <span class="tok-b">print</span>(<span class="tok-s">"Не найден"</span>)

    flight.land()


<span class="tok-k">if</span> __name__ == <span class="tok-s">"__main__"</span>:
    <span class="tok-k">raise</span> <span class="tok-b">SystemExit</span>(execute_mission(mission))</code></pre></div>

<h2 id="fl-limits">Ограничения</h2>
<ul>
<li>Для OPT нужна текстурная поверхность: на гладком белом листе позиция уплывает.</li>
<li>Телеметрия yaw в OPT не обновляется; развороты выполняются по таймеру.</li>
<li>Камера не поворачивается программно.</li>
<li>Светодиоды на текущей прошивке Mini 2 недоступны: в <code>board_config</code> нет <code>LedModule</code>/<code>LedBar</code>.</li>
<li>Движение вперёд/вбок — открытый контур по времени; точная дистанция зависит от калибровки скорости.</li>
<li>Поиск работает по лазерному высотомеру: объект должен быть выше пола, а точка старта — свободна от объекта.</li>
</ul>

<h2 id="fl-deploy">Запуск на дроне</h2>
<div class="codewrap"><pre><code data-lang="bash">scp flight_lib.py mission.py pioneermini@10.42.0.1:/home/pioneermini/tournament/
ssh pioneermini@10.42.0.1
cd /home/pioneermini/tournament
python3 mission.py --dry-run
python3 mission.py</code></pre></div>
<p>Пароль SSH по умолчанию — <code>geoscan123</code>.</p>
