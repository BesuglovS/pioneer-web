---
layout: layout.njk
title: "Разбор: get_telemetry"
description: "Разбор примеров get_telemetry из pioneer-sdk2-example: 17 скриптов чтения телеметрии класса Pioneer — аккумулятор, позиция, скорость, навигация, датчики"
permalink: "/examples/get-telemetry/"
---

<h1 id="top">Разбор: get_telemetry</h1>
<p><a class="btn ghost" href="/09-examples/">← Все разборы примеров</a></p>
<p>Источник: репозиторий <a href="https://gitflic.ru/project/pioneer-team/pioneer-sdk2-example" target="_blank" rel="noopener">pioneer-team/pioneer-sdk2-example</a> (GitFlic). Справочник по классам API — на странице <a href="/05-sdk2/">«Pioneer SDK 2»</a>.</p>

<h2 id="t-run">Что внутри и запуск</h2>
<p>Директория из 17 скриптов: каждый читает одну группу телеметрии методом класса <strong>Pioneer</strong>, печатает её в цикле и закрывает соединение при завершении. Это «читающие» примеры — полётов и событий нет, с них удобно начинать после <a href="/02-start/">быстрого старта</a>:</p>
<div class="codewrap"><pre><code data-lang="bash">python3 get_battery_status.py</code></pre></div>
<p>Циклы останавливаются сочетанием <code>Ctrl+C</code>.</p>

<h2 id="t-list">Скрипты и методы</h2>
<div class="tablewrap"><table>
<thead><tr><th>Скрипт</th><th>Метод SDK</th><th>Данные</th></tr></thead>
<tbody>
<tr><td><code>get_accel.py</code></td><td><code>get_accel()</code></td><td>Ускорение по осям X, Y, Z</td></tr>
<tr><td><code>get_altitude.py</code></td><td><code>get_altitude()</code></td><td>Высота</td></tr>
<tr><td><code>get_battery_status.py</code></td><td><code>get_battery_status()</code></td><td>Напряжение и температура аккумулятора</td></tr>
<tr><td><code>get_dist_sensor.py</code></td><td><code>get_dist_sensor_data()</code></td><td>Данные дальномера</td></tr>
<tr><td><code>get_global_position_gps.py</code></td><td><code>get_global_position_gps()</code></td><td>GPS-координаты</td></tr>
<tr><td><code>get_global_velocity.py</code></td><td><code>get_global_velocity_gps()</code></td><td>Скорость по GPS</td></tr>
<tr><td><code>get_local_position.py</code></td><td><code>get_local_position_lps()</code></td><td>Локальная позиция LPS</td></tr>
<tr><td><code>get_local_velocity_lps.py</code></td><td><code>get_local_velocity_lps()</code></td><td>Локальная скорость LPS</td></tr>
<tr><td><code>get_local_yaw_lps.py</code></td><td><code>get_local_yaw_lps()</code></td><td>Курс LPS</td></tr>
<tr><td><code>get_mag.py</code></td><td><code>get_mag()</code></td><td>Магнитометр</td></tr>
<tr><td><code>get_motors_rpm.py</code></td><td><code>get_motors_rpm()</code></td><td>Обороты двигателей</td></tr>
<tr><td><code>get_nav_status_gps.py</code></td><td><code>get_nav_status_gps()</code></td><td>Статус GPS-навигации</td></tr>
<tr><td><code>get_nav_status_lps.py</code></td><td><code>get_nav_status_lps()</code></td><td>Статус LPS-навигации</td></tr>
<tr><td><code>get_nav_system.py</code></td><td><code>get_nav_system()</code></td><td>Активная система навигации</td></tr>
<tr><td><code>get_optical_data.py</code></td><td><code>get_optical_data()</code></td><td>Данные оптической навигации</td></tr>
<tr><td><code>get_orientation.py</code></td><td><code>get_orientation()</code></td><td>Roll, pitch, yaw</td></tr>
<tr><td><code>get_satellites_count.py</code></td><td><code>get_satellites_count()</code></td><td>Количество спутников GPS и ГЛОНАСС</td></tr>
</tbody></table></div>

<h2 id="t-pattern">Общий каркас — get_battery_status.py</h2>
<p>Все скрипты группы устроены одинаково: соединение → бесконечный цикл чтения с паузой 1 с → закрытие в <code>finally</code>:</p>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_sdk2 <span class="tok-k">import</span> Pioneer      <span class="tok-c"># импортируем класс Pioneer из библиотеки pioneer_sdk2</span>
<span class="tok-k">import</span> time                           <span class="tok-c"># библиотека time содержит функции для работы со временем</span>

drone = Pioneer()                     <span class="tok-c"># создаем экземпляр класса Pioneer, устанавливаем соединение</span>

<span class="tok-k">try</span>:                                  <span class="tok-c"># основной код находится внутри блока try</span>
    <span class="tok-k">while</span> <span class="tok-k">True</span>:                       <span class="tok-c"># запускаем бесконечный цикл</span>
        <span class="tok-b">print</span>(drone.get_battery_status()) <span class="tok-c"># вызываем метод</span>
        time.sleep(<span class="tok-n">1</span>)                     <span class="tok-c"># ставим паузу на 1 секунду</span>

<span class="tok-k">finally</span>:                              <span class="tok-c"># блок finally выполнится при завершении программы</span>
    drone.close_connection()          <span class="tok-c"># закрываем соединение</span>
</code></pre></div>
<p>Если датчик или навигационный модуль недоступен, пример выведет сообщение вместо падения с ошибкой.</p>

<h2 id="t-unpack">Распаковка значений — get_local_position.py</h2>
<p>Часть методов возвращает массив, откуда значения берут по индексу:</p>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">try</span>:                                    <span class="tok-c"># основной код находится внутри блока try</span>
    <span class="tok-k">while</span> <span class="tok-k">True</span>:                         <span class="tok-c"># запускаем бесконечный цикл</span>
        <span class="tok-c"># получаем текущие координаты дрона в метрах</span>
        array_of_coordinates = drone.get_local_position_lps()

        <span class="tok-c"># выводим координаты x, y, z в консоль</span>
        <span class="tok-b">print</span>(f<span class="tok-s">'x={array_of_coordinates[0]} , y={array_of_coordinates[1]}, z={array_of_coordinates[2]}'</span>)

        <span class="tok-c"># print(f'x={array_of_coordinates[0]}') # пример вывода координаты x отдельно</span>

        time.sleep(<span class="tok-n">1</span>)                   <span class="tok-c"># ставим паузу на 1 секунду</span></code></pre></div>
<p><code>get_local_position_lps()</code> возвращает массив [x, y, z] в метрах в системе локальной навигации (LPS). Аналогично устроены скорость и курс LPS — см. <a href="/05-sdk2/">справочник</a>.</p>

<h2 id="t-format">Форматированный вывод — get_dist_sensor.py</h2>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">try</span>:                                    <span class="tok-c"># основной код находится внутри блока try</span>
    <span class="tok-k">while</span> <span class="tok-k">True</span>:                         <span class="tok-c"># запускаем бесконечный цикл</span>
        distance = drone.get_dist_sensor_data() <span class="tok-c"># получаем данные с дальномера</span>
        <span class="tok-b">print</span>(f<span class="tok-s">'Расстояние: {distance:.2f} м'</span>) <span class="tok-c"># выводим расстояние в консоль</span>
        time.sleep(<span class="tok-n">1</span>)                          <span class="tok-c"># ставим паузу на 1 секунду</span>

<span class="tok-k">finally</span>:                                <span class="tok-c"># блок finally выполнится при завершении программы</span>
    drone.close_connection()            <span class="tok-c"># закрываем соединение</span></code></pre></div>
<p>Здесь показан и форматированный вывод f-строкой: <code>print(f'Расстояние: {distance:.2f} м')</code>. По README группы, если датчик или модуль недоступен, пример выведет сообщение вместо падения с ошибкой.</p>

<h2 id="t-motors">Особый случай — get_motors_rpm.py</h2>
<p>Единственный скрипт группы, который включает моторы: он вызывает <code>arm()</code>, читает обороты двигателей в цикле, а в <code>finally</code> выключает их. Внимание: включение (<code>arm()</code>) раскручивает винты сразу, поэтому перед запуском проверьте окружение.</p>
