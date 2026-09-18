---
layout: layout.njk
title: "Разбор: события автопилота"
description: "Разбор subscribe_event.py и unsubscribe_event.py из pioneer-sdk2-example: подписка на события автопилота Pioneer SDK 2, отписка и управление светодиодом"
permalink: "/examples/events/"
---

<h1 id="top">Разбор: события автопилота</h1>
<p><a class="btn ghost" href="/09-examples/">← Все разборы примеров</a></p>
<p>Источник: репозиторий <a href="https://gitflic.ru/project/pioneer-team/pioneer-sdk2-example" target="_blank" rel="noopener">pioneer-team/pioneer-sdk2-example</a> (GitFlic). Справочник по классам API — на странице <a href="/05-sdk2/">«Pioneer SDK 2»</a>.</p>

<h2 id="e-subscribe">subscribe_event.py — подписка</h2>
<p>Компактный скрипт демонстрирует реактивный стиль программирования дрона: вместо цикла опроса вы <strong>подписываете функцию</strong> на события автопилота, и SDK вызывает её сам:</p>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_sdk2 <span class="tok-k">import</span> Pioneer, Event  <span class="tok-c"># импортируем классы Pioneer и Event из библиотеки pioneer_sdk2</span>
<span class="tok-k">import</span> time                              <span class="tok-c"># библиотека time содержит функции для работы со временем</span>

<span class="tok-k">def</span> event_activate(event):               <span class="tok-c"># функция вызывается при получении события от дрона</span>
    <span class="tok-k">if</span> event == Event.TAKEOFF_COMPLETE:  <span class="tok-c"># если пришло событие завершения взлета</span>
        drone.led_control(r=<span class="tok-n">0</span>, g=<span class="tok-n">1</span>, b=<span class="tok-n">0</span>) <span class="tok-c"># включаем зеленый свет</span>

    <span class="tok-k">elif</span> event == Event.COPTER_LANDED:   <span class="tok-c"># если пришло событие завершения посадки</span>
        drone.led_control(r=<span class="tok-n">1</span>, g=<span class="tok-n">0</span>, b=<span class="tok-n">0</span>) <span class="tok-c"># включаем красный свет</span>

drone = Pioneer()                        <span class="tok-c"># создаем экземпляр класса Pioneer, устанавливаем соединение</span>

drone.subscribe(event_activate, Event.TAKEOFF_COMPLETE) <span class="tok-c"># вызываем функцию event_activate при завершении взлета</span>
drone.subscribe(event_activate, Event.COPTER_LANDED)    <span class="tok-c"># вызываем функцию event_activate при завершении посадки</span>

<span class="tok-k">try</span>:                                     <span class="tok-c"># основной код находится внутри блока try</span>
    drone.arm()                          <span class="tok-c"># включаем двигатели</span>
    drone.takeoff()                      <span class="tok-c"># взлетаем</span>
    time.sleep(<span class="tok-n">3</span>)                        <span class="tok-c"># ставим паузу на 3 секунды</span>
    drone.land()                         <span class="tok-c"># садимся, двигатели выключатся автоматически</span>

<span class="tok-k">finally</span>:                                 <span class="tok-c"># блок finally выполнится при завершении программы</span>
    drone.close_connection()             <span class="tok-c"># закрываем соединение</span></code></pre></div>
<p>Механика:</p>
<ul>
<li><code>drone.subscribe(fn, Event.X)</code> регистрирует колбэк <code>fn</code> на конкретное событие. Колбэк получает само событие — поэтому один <code>event_activate()</code> способен обслуживать два источника.</li>
<li>В примере подписаны два события: <code>TAKEOFF_COMPLETE</code> → зелёные светодиоды, <code>COPTER_LANDED</code> → красные. Управление светодиодом — <code>led_control(r, g, b)</code> значениями 0/1.</li>
<li>Полезные события из этой группы: <code>TAKEOFF_COMPLETE</code>, <code>COPTER_LANDED</code>, <code>POINT_REACHED</code> (см. <a href="/examples/mission/#m-local-point">mission_examples</a> — там <code>POINT_REACHED</code> используется для ожидания прилёта в точку).</li>
</ul>

<h2 id="e-unsubscribe">unsubscribe_event.py — отписка</h2>
<p>Показывает зеркальную команду <code>drone.unsubscribe()</code>. Подписка может быть <strong>временной</strong> — снять её можно прямо в середине программы:</p>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_sdk2 <span class="tok-k">import</span> Pioneer, Event  <span class="tok-c"># импортируем классы Pioneer и Event из библиотеки pioneer_sdk2</span>
<span class="tok-k">import</span> time                              <span class="tok-c"># библиотека time содержит функции для работы со временем</span>

<span class="tok-k">def</span> event_activate(event):               <span class="tok-c"># функция вызывается при получении события от дрона</span>
    <span class="tok-k">if</span> event == Event.TAKEOFF_COMPLETE:  <span class="tok-c"># если пришло событие завершения взлета</span>
        drone.led_control(r=<span class="tok-n">0</span>, g=<span class="tok-n">1</span>, b=<span class="tok-n">0</span>) <span class="tok-c"># включаем зеленый свет</span>

drone = Pioneer()                        <span class="tok-c"># создаем экземпляр класса Pioneer, устанавливаем соединение</span>

<span class="tok-k">try</span>:                                     <span class="tok-c"># основной код находится внутри блока try</span>
    drone.subscribe(event_activate, Event.TAKEOFF_COMPLETE) <span class="tok-c"># подписываем функцию на событие завершения взлета</span>

    drone.arm()                          <span class="tok-c"># включаем двигатели</span>
    drone.takeoff()                      <span class="tok-c"># взлетаем</span>

    time.sleep(<span class="tok-n">3</span>)                        <span class="tok-c"># ставим паузу на 3 секунды</span>

    drone.unsubscribe(event_activate, Event.TAKEOFF_COMPLETE) <span class="tok-c"># отписываем функцию от события завершения взлета</span>

    drone.land()                         <span class="tok-c"># садимся, двигатели выключатся автоматически</span>

<span class="tok-k">finally</span>:                                 <span class="tok-c"># блок finally выполнится при завершении программы</span>
    drone.close_connection()             <span class="tok-c"># закрываем соединение</span></code></pre></div>
<p>Колбэк живёт только между <code>subscribe()</code> и <code>unsubscribe()</code>: на взлёте LED загорается зелёным, но к моменту посадки подписки уже нет — красный свет не включится.</p>

<h2 id="e-usage">Когда это полезно</h2>
<ul>
<li>Вместо «слепых» пауз: после <code>takeoff()</code> ждите <code>TAKEOFF_COMPLETE</code>, а не <code>time.sleep(10)</code>.</li>
<li>Цепочки действий: по <code>POINT_REACHED</code> — отправляется следующая точка маршрута; по <code>TAKEOFF_COMPLETE</code> — начинается миссия.</li>
<li>Отписка пригодится в сложных программах: например, при переходе в ручной режим снять реакцию на служебные события.</li>
</ul>
