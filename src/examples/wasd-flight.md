---
layout: layout.njk
title: "Разбор: WASD_flight.py"
description: "Разбор WASD_flight.py из pioneer-sdk2-example: управление дроном и сервокамерой с клавиатуры через SSH, повтор команд по таймеру, видеопоток ImageViewer"
permalink: "/examples/wasd-flight/"
---

<h1 id="top">Разбор: WASD_flight.py</h1>
<p><a class="btn ghost" href="/09-examples/">← Все разборы примеров</a></p>
<p>Источник: репозиторий <a href="https://gitflic.ru/project/pioneer-team/pioneer-sdk2-example" target="_blank" rel="noopener">pioneer-team/pioneer-sdk2-example</a> (GitFlic). Справочник по классам API — на странице <a href="/05-sdk2/">«Pioneer SDK 2»</a>.</p>

<h2 id="w-run">Интерактивное управление с клавиатуры</h2>
<p>Один файл — интерактивный «пульт»: W/S/A/D — движение, Space/Z — вверх/вниз, Q/E — повороты, 1–4 — arm/disarm/takeoff/land, Esc — посадка и выход. Одновременно публикуется RTSP-поток с камеры. Требуется <strong>интерактивный SSH-терминал</strong> или консоль на борту:</p>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-b">print</span>(
    <span class="tok-s">"""
Управление Pioneer Mini 2 через SSH

1 -- arm        2 -- disarm
3 -- takeoff    4 -- land

↶q  w↑  e↷     Space -- вверх
←a      d→      z     -- вниз
    s↓

x -- стоп, Esc -- посадка и выход
"""</span>
)</code></pre></div>
<p>Поток с видео с камеры: <code>rtsp://10.42.0.1:8889/video/</code>.</p>

<h2 id="w-speeds">Таблица скоростей</h2>
<p>Клавиши движения отображаются на команды <code>set_manual_speed_body_fixed()</code> через словарь <code>SPEED_BY_KEY</code>; сами скорости фиксированы константами в начале файла:</p>
<div class="codewrap"><pre><code data-lang="python">LINEAR_SPEED = <span class="tok-n">0.2</span>                             <span class="tok-c"># скорость движения вперед/назад/влево/вправо в м/с</span>
VERTICAL_SPEED = <span class="tok-n">0.2</span>                           <span class="tok-c"># скорость движения вверх/вниз в м/с</span>
YAW_SPEED = <span class="tok-n">0.5</span>                                <span class="tok-c"># скорость поворота в рад/с</span>

COMMAND_INTERVAL = <span class="tok-n">0.3</span>                         <span class="tok-c"># время действия одной команды скорости в секундах</span>
SEND_PERIOD = <span class="tok-n">0.2</span>                              <span class="tok-c"># как часто повторять команду скорости, включая нулевую</span>
KEY_TIMEOUT = <span class="tok-n">0.6</span>                              <span class="tok-c"># через сколько секунд без повтора считать клавишу отпущенной</span>
MAIN_LOOP_DELAY = <span class="tok-n">0.02</span>                         <span class="tok-c"># небольшая задержка главного цикла</span>

ZERO_SPEED = (<span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>)              <span class="tok-c"># нулевая команда: vx, vy, vz, yaw_rate</span>

SPEED_BY_KEY = {                               <span class="tok-c"># таблица соответствия клавиш и скоростей</span>
    <span class="tok-s">"w"</span>: (<span class="tok-n">0.0</span>, LINEAR_SPEED, <span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>),        <span class="tok-c"># вперед относительно корпуса дрона</span>
    <span class="tok-s">"s"</span>: (<span class="tok-n">0.0</span>, -LINEAR_SPEED, <span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>),       <span class="tok-c"># назад относительно корпуса дрона</span>
    <span class="tok-s">"a"</span>: (-LINEAR_SPEED, <span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>),       <span class="tok-c"># влево относительно корпуса дрона</span>
    <span class="tok-s">"d"</span>: (LINEAR_SPEED, <span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>),        <span class="tok-c"># вправо относительно корпуса дрона</span>
    <span class="tok-s">" "</span>: (<span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>, VERTICAL_SPEED, <span class="tok-n">0.0</span>),      <span class="tok-c"># вверх</span>
    <span class="tok-s">"z"</span>: (<span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>, -VERTICAL_SPEED, <span class="tok-n">0.0</span>),     <span class="tok-c"># вниз</span>
    <span class="tok-s">"q"</span>: (<span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>, YAW_SPEED),           <span class="tok-c"># поворот влево</span>
    <span class="tok-s">"e"</span>: (<span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>, -YAW_SPEED),          <span class="tok-c"># поворот вправо</span>
}</code></pre></div>
<p>Обратите внимание: <code>q</code> — поворот влево (положительный <code>yaw_rate</code>), <code>e</code> — вправо (отрицательный); скорости в рад/с, а линейные — в м/с.</p>

<h2 id="w-loop">Главный цикл: таймеры вместо событий</h2>
<p>В SSH-терминале нет события «клавишу отпустили». Скрипт решает это таймером: если автоповтор клавиши давно не приходил, считается, что стики вернулись в нейтраль:</p>
<div class="codewrap"><pre><code data-lang="python">        <span class="tok-c"># В SSH-терминале нет события "клавишу отпустили".</span>
        <span class="tok-c"># Поэтому если автоповтор клавиши давно не приходил, считаем, что клавишу отпустили.</span>
        <span class="tok-k">if</span> last_motion_key <span class="tok-k">is</span> <span class="tok-k">not</span> <span class="tok-k">None</span> <span class="tok-k">and</span> now - last_motion_time &gt; KEY_TIMEOUT:
            last_motion_key = <span class="tok-k">None</span>

        speed = SPEED_BY_KEY.get(last_motion_key, ZERO_SPEED) <span class="tok-c"># движение по клавише или нулевая скорость</span>
        send_due = time.monotonic() - last_send_time &gt;= SEND_PERIOD <span class="tok-c"># пора повторить команду скорости</span>
        speed_changed = speed != last_sent_speed <span class="tok-c"># новую скорость отправляем сразу</span>

        <span class="tok-k">if</span> drone.get_fly_state().name == <span class="tok-s">"IN_SKY"</span> <span class="tok-k">and</span> (speed_changed <span class="tok-k">or</span> send_due):
            drone.set_manual_speed_body_fixed(*speed, COMMAND_INTERVAL)
            last_send_time = time.monotonic()
            last_sent_speed = speed
</code></pre></div>
<div class="tablewrap"><table>
<thead><tr><th>Константа</th><th>Значение</th><th>Смысл</th></tr></thead>
<tbody>
<tr><td><code>KEY_TIMEOUT</code></td><td>0,6 с</td><td>Пауза после последнего автоповтора: клавиша считается отпущенной</td></tr>
<tr><td><code>SEND_PERIOD</code></td><td>0,2 с</td><td>Как часто повторять команду, включая нулевую</td></tr>
<tr><td><code>COMMAND_INTERVAL</code></td><td>0,3 с</td><td>Время действия одной команды (команды должны перекрываться)</td></tr>
</tbody></table></div>
<p>Задача «отправить команду вовремя» решается двумя флагами: <code>speed_changed</code> — новую скорость отправляем немедленно; <code>send_due</code> — неизменённую команду дублируем по таймеру, чтобы дрон не «отвалился» в ручной режим.</p>

<h2 id="w-video">Видео в том же цикле</h2>
<p>Кадры получаются в главном цикле, без отдельного потока; ошибка видеотракта управление не прерывает:</p>
<div class="codewrap"><pre><code data-lang="python">        <span class="tok-k">try</span>:                                   <span class="tok-c"># получаем кадр камеры в основном цикле, без отдельного потока</span>
            frame = camera.get_cv_frame(timeout=<span class="tok-n">0.05</span>)
            <span class="tok-k">if</span> frame <span class="tok-k">is</span> <span class="tok-k">not</span> <span class="tok-k">None</span>:
                viewer.imshow(<span class="tok-s">"video"</span>, frame, fps=<span class="tok-n">30</span>)
        <span class="tok-k">except</span> TimeoutError:                   <span class="tok-c"># если кадр не успел прийти, продолжаем управление</span>
            <span class="tok-k">pass</span>
        <span class="tok-k">except</span> Exception <span class="tok-k">as</span> error:             <span class="tok-c"># ошибка камеры не должна завершать программу управления</span>
            <span class="tok-b">print</span>(<span class="tok-s">"Ошибка видеопотока:"</span>, error)
            time.sleep(<span class="tok-n">0.2</span>)</code></pre></div>

<h2 id="w-state">Штатные команды и завершение</h2>
<p>Клавиши-действия превращаются в команды SDK: 1 — <code>arm()</code>, 2 — <code>disarm()</code>, 3 — <code>takeoff()</code> (с предварительным <code>arm()</code> при необходимости), 4 — нулевая скорость и <code>land()</code>. Проверка <code>sys.stdin.isatty()</code> в начале программно запрещает запуск без терминала. Безопасный выход гарантирован <code>finally</code>:</p>
<div class="codewrap"><pre><code data-lang="python">    state = drone.get_fly_state().name         <span class="tok-c"># проверяем состояние перед выходом</span>
    <span class="tok-k">if</span> state == <span class="tok-s">"IN_SKY"</span>:                      <span class="tok-c"># если программа завершается в полете</span>
        drone.set_manual_speed_body_fixed(*ZERO_SPEED, COMMAND_INTERVAL)
        drone.land()                           <span class="tok-c"># сажаем дрон</span>
    <span class="tok-k">elif</span> state == <span class="tok-s">"ARMED"</span>:                     <span class="tok-c"># если двигатели включены, но взлета не было</span>
        drone.disarm()                         <span class="tok-c"># выключаем двигатели</span>

    drone.close_connection()                   <span class="tok-c"># закрываем соединение с дроном</span></code></pre></div>
<p>Если программа завершается в полёте (<code>IN_SKY</code>), дрон получает нулевую скорость и садится; если двигатели включены, но взлёта не было (<code>ARMED</code>) — они выключаются командой <code>disarm()</code>.</p>
