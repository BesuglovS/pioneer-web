---
layout: layout.njk
title: "Разбор: rc_channels_examples"
description: "Разбор примеров RC-каналов pioneer_sdk2: send_rc_channels с нормированными значениями, параметры автопилота для полёта без пульта и управление по WASD через RC-каналы"
permalink: "/examples/rc-channels/"
---

<h1 id="top">Разбор: rc_channels_examples</h1>
<p><a class="btn ghost" href="/09-examples/">← Все разборы примеров</a></p>
<p>Источник: репозиторий <a href="https://gitflic.ru/project/pioneer-team/pioneer-sdk2-example" target="_blank" rel="noopener">pioneer-team/pioneer-sdk2-example</a> (GitFlic). Справочник по классам API — на странице <a href="/05-sdk2/">«Pioneer SDK 2»</a>.</p>

<h2 id="r-run">Что внутри</h2>
<ul>
<li><code>send_rc_channels.py</code> — постоянная отправка нейтральных значений каналов SDK2.</li>
<li><code>wasd_rc_channels.py</code> — управление дроном по WASD через RC-каналы с восстановлением параметров автопилота при выходе.</li>
<li>README репозитория также упоминает пример <code>rc_sdk1_to_sdk2.py</code> — формулу конвертации значений SDK1 (центр 1500) в нормированные каналы SDK2.</li>
</ul>
<p>Перед отправкой каналов оба скрипта переводят источник RC-команд на SDK настройкой параметров автопилота.</p>

<h2 id="r-params">Параметры автопилота</h2>
<p>Без этого шага каналы до автопилота доходят, но игнорируются им. Пять параметров задают режимы управления, разрешают полёт без аппаратного пульта и переключают источник RC-команд на SDK:</p>
<div class="codewrap"><pre><code data-lang="python">RC_PARAMETERS = {                       <span class="tok-c"># параметры автопилота для управления через RC-каналы</span>
    <span class="tok-s">"Copter_man_rcMode0"</span>: <span class="tok-n">6.0</span>,          <span class="tok-c"># режим управления для положения 0</span>
    <span class="tok-s">"Copter_man_rcMode1"</span>: <span class="tok-n">3.0</span>,          <span class="tok-c"># режим управления для положения 1</span>
    <span class="tok-s">"Copter_man_rcMode2"</span>: <span class="tok-n">3.0</span>,          <span class="tok-c"># режим управления для положения 2</span>
    <span class="tok-s">"Copter_flyWithoutRc"</span>: <span class="tok-n">1.0</span>,         <span class="tok-c"># разрешаем полет без аппаратного пульта</span>
    <span class="tok-s">"SensorMux_rc"</span>: <span class="tok-n">2.0</span>,                <span class="tok-c"># выбираем источник RC-команд от SDK</span>
}


<span class="tok-k">def</span> setup_rc_parameters(drone):         <span class="tok-c"># функция настраивает автопилот для приема RC-каналов от SDK</span>
    <span class="tok-k">for</span> name, value <span class="tok-k">in</span> RC_PARAMETERS.items(): <span class="tok-c"># перебираем параметры ручного управления</span>
        <span class="tok-k">if</span> <span class="tok-k">not</span> drone.set_param(name, value):  <span class="tok-c"># устанавливаем очередной параметр автопилота</span>
            <span class="tok-k">raise</span> RuntimeError(f<span class="tok-s">"Не удалось установить параметр {name}"</span>) <span class="tok-c"># прерываем запуск, если параметр не применился</span></code></pre></div>
<p><code>set_param()</code> возвращает <code>True</code>/<code>False</code>: если параметр не применился, скрипт прерывает запуск понятной ошибкой.</p>

<h2 id="r-send">Семантика каналов SDK2</h2>
<p>Каналы нормированы от −1 до 1. Восемь аргументов <code>send_rc_channels()</code> расшифровываются комментариями в примере:</p>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">try</span>:                                    <span class="tok-c"># основной код находится внутри блока try</span>
    setup_rc_parameters(drone)          <span class="tok-c"># настраиваем автопилот перед отправкой RC-каналов</span>
    <span class="tok-k">while</span> <span class="tok-k">True</span>:                         <span class="tok-c"># запускаем бесконечный цикл</span>
        drone.send_rc_channels(         <span class="tok-c"># отправляем значения каналов пульта</span>
            channel_1=<span class="tok-n">0</span>,                <span class="tok-c"># правый стик: влево -1, центр 0, вправо 1</span>
            channel_2=<span class="tok-n">0</span>,                <span class="tok-c"># правый стик: вперед -1, центр 0, назад 1</span>
            channel_3=<span class="tok-n">0</span>,                <span class="tok-c"># левый стик: вверх 1, центр 0, вниз -1</span>
            channel_4=<span class="tok-n">0</span>,                <span class="tok-c"># левый стик: налево 1, центр 0, направо -1</span>
            channel_5=<span class="tok-n">1</span>,                <span class="tok-c"># тумблер SWC: вверх 0, центр 1, вниз 2</span>
            channel_6=<span class="tok-n">0</span>,                <span class="tok-c"># тумблер SWD: вверх 0, вниз 2</span>
            channel_7=<span class="tok-n">1</span>,                <span class="tok-c"># тумблер SWB: вверх 0, центр 1, вниз 2</span>
            channel_8=<span class="tok-n">0</span>                 <span class="tok-c"># тумблер SWA: вверх 0, вниз 2</span>
        )

        time.sleep(<span class="tok-n">0.05</span>)                <span class="tok-c"># ставим паузу на 0.05 секунды</span>
</code></pre></div>
<ul>
<li><code>channel_1</code> (roll): −1 — стик влево, 1 — вправо.</li>
<li><code>channel_2</code> (pitch): <strong>−1 — вперёд</strong>, 1 — назад (знак инвертирован относительно привычного «вперёд = плюс»).</li>
<li><code>channel_3</code> (throttle): 1 — вверх, −1 — вниз.</li>
<li><code>channel_4</code> (yaw): 1 — влево, <strong>−1 — вправо</strong>.</li>
<li><code>channel_5…8</code> — тумблеры SWC/SWD/SWB/SWA: положения 0/1/2 (SWD и SWA — только 0 и 2).</li>
</ul>
<p>Каналы нужно отправлять постоянно с паузой около 0,05 с, иначе ручной режим от автопилота «отваливается».</p>

<h2 id="r-wasd">wasd_rc_channels.py — WASD через RC-каналы</h2>
<p>Пример добавляет интерактивность: таблица <code>CHANNELS_BY_KEY</code> сопоставляет клавиши и отклонения стиков:</p>
<div class="codewrap"><pre><code data-lang="python">CHANNELS_BY_KEY = {                            <span class="tok-c"># таблица соответствия клавиш и RC-каналов SDK2</span>
    <span class="tok-s">"a"</span>: (-ROLL_VALUE, <span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>),         <span class="tok-c"># channel_1: правый стик влево</span>
    <span class="tok-s">"d"</span>: (ROLL_VALUE, <span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>),          <span class="tok-c"># channel_1: правый стик вправо</span>
    <span class="tok-s">"w"</span>: (<span class="tok-n">0.0</span>, -PITCH_VALUE, <span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>),        <span class="tok-c"># channel_2: правый стик вперед</span>
    <span class="tok-s">"s"</span>: (<span class="tok-n">0.0</span>, PITCH_VALUE, <span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>),         <span class="tok-c"># channel_2: правый стик назад</span>
    <span class="tok-s">"z"</span>: (<span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>, -THROTTLE_VALUE, <span class="tok-n">0.0</span>),     <span class="tok-c"># channel_3: левый стик вниз</span>
    <span class="tok-s">" "</span>: (<span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>, THROTTLE_VALUE, <span class="tok-n">0.0</span>),      <span class="tok-c"># channel_3: левый стик вверх</span>
    <span class="tok-s">"q"</span>: (<span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>, YAW_VALUE),           <span class="tok-c"># channel_4: левый стик поворот влево</span>
    <span class="tok-s">"e"</span>: (<span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>, -YAW_VALUE),          <span class="tok-c"># channel_4: левый стик поворот вправо</span>
}</code></pre></div>
<p>В SSH-терминале нет события «клавишу отпустили», поэтому стики возвращаются в нейтраль, если автоповтор клавиши давно не приходил (<code>KEY_TIMEOUT = 0.2</code> с). Отправка каналов идёт строго по таймеру:</p>
<div class="codewrap"><pre><code data-lang="python">        <span class="tok-c"># В SSH-терминале нет события "клавишу отпустили".</span>
        <span class="tok-c"># Если автоповтор клавиши давно не приходил, считаем, что стики вернулись в нейтраль.</span>
        <span class="tok-k">if</span> last_motion_key <span class="tok-k">is</span> <span class="tok-k">not</span> <span class="tok-k">None</span> <span class="tok-k">and</span> now - last_motion_time &gt; KEY_TIMEOUT:
            last_motion_key = <span class="tok-k">None</span>

        channels = CHANNELS_BY_KEY.get(last_motion_key, NEUTRAL_CHANNELS) <span class="tok-c"># движение по клавише или нейтраль</span>
        send_due = time.monotonic() - last_send_time &gt;= SEND_PERIOD       <span class="tok-c"># пора повторить RC-каналы</span>

        <span class="tok-k">if</span> send_due:
            drone.send_rc_channels(              <span class="tok-c"># постоянно отправляем все каналы, даже нейтральные</span>
                channel_1=channels[<span class="tok-n">0</span>],           <span class="tok-c"># roll:  -1 влево, 0 центр, 1 вправо</span>
                channel_2=channels[<span class="tok-n">1</span>],           <span class="tok-c"># pitch: -1 вперед, 0 центр, 1 назад</span>
                channel_3=channels[<span class="tok-n">2</span>],           <span class="tok-c"># throttle: -1 вниз, 0 центр, 1 вверх</span>
                channel_4=channels[<span class="tok-n">3</span>],           <span class="tok-c"># yaw: 1 влево, 0 центр, -1 вправо</span>
                channel_5=<span class="tok-n">1</span>,                     <span class="tok-c"># положение режима управления</span>
                channel_6=<span class="tok-n">0</span>,                     <span class="tok-c"># дополнительный тумблер</span>
                channel_7=<span class="tok-n">1</span>,                     <span class="tok-c"># дополнительный тумблер</span>
                channel_8=<span class="tok-n">0</span>,                     <span class="tok-c"># дополнительный тумблер</span>
            )
            last_send_time = time.monotonic()</code></pre></div>
<p>Взлёт и посадка выполняются штатными командами <code>arm()</code>/<code>takeoff()</code>/<code>land()</code>, движение после взлёта — через RC-каналы. Приёмы, достойные внимания:</p>
<ul>
<li>Перед выходом скрипт отправляет нейтральные каналы, сажает дрон (или снимает <code>ARMED</code>) и вызывает <code>restore_rc_parameters()</code> — возвращает автопилоту значения, прочитанные <code>get_param()</code> до запуска.</li>
<li><code>setup_rc_parameters()</code> заранее сохраняет старые значения — это правило гигиены: меняешь параметры, верни всё обратно.</li>
<li>Скрипт требует интерактивный терминал (<code>sys.stdin.isatty()</code>); из IDE без stdin не запустится.</li>
</ul>
