---
layout: layout.njk
title: "Разбор: mission_examples"
description: "Разбор полетных примеров pioneer_sdk2: полёт по локальным точкам с событием POINT_REACHED, движение по окружности с видео, миссия с RTSP-потоком и ручное задание скорости"
permalink: "/examples/mission/"
---

<h1 id="top">Разбор: mission_examples</h1>
<p><a class="btn ghost" href="/09-examples/">← Все разборы примеров</a></p>
<p>Источник: репозиторий <a href="https://gitflic.ru/project/pioneer-team/pioneer-sdk2-example" target="_blank" rel="noopener">pioneer-team/pioneer-sdk2-example</a> (GitFlic). Справочник по классам API — на странице <a href="/05-sdk2/">«Pioneer SDK 2»</a>.</p>

<h2 id="m-run">Что внутри и запуск</h2>
<p>Четыре законченных полётных сценария класса <strong>Pioneer</strong>:</p>
<ul>
<li><code>go_to_local_point.py</code> — полёт по нескольким локальным точкам с ожиданием события <code>POINT_REACHED</code>.</li>
<li><code>circle_flight.py</code> — движение по точкам окружности с видеопотоком <code>video</code>.</li>
<li><code>mission_with_frames.py</code> — полёт по списку точек с видеопотоком <code>pioneer_camera</code>.</li>
<li><code>set_manual_speed.py</code> — ручное задание скорости через <code>set_manual_speed()</code>.</li>
</ul>
<p>Скрипты запускаются там, где установлен <code>pioneer_sdk2</code> (см. <a href="/03-launch/">способы запуска</a>):</p>
<div class="codewrap"><pre><code data-lang="bash">python3 go_to_local_point.py
python3 circle_flight.py
python3 mission_with_frames.py
python3 set_manual_speed.py</code></pre></div>

<h2 id="m-local-point">go_to_local_point.py — полёт по точкам с событием</h2>
<p>Дрон взлетает и последовательно летит в три точки: набирает высоту 1 м, смещается на 1 м по Y, затем на 1 м по X. Главная идея примера — не «спать лишнюю минуту», а дождаться прилёта по событию автопилота <code>POINT_REACHED</code>:</p>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_sdk2 <span class="tok-k">import</span> Pioneer              <span class="tok-c"># импортируем класс Pioneer из библиотеки pioneer_sdk2</span>
<span class="tok-k">import</span> pioneer_sdk2                           <span class="tok-c"># импортируем библиотеку pioneer_sdk2 для доступа к событиям</span>
<span class="tok-k">import</span> threading                              <span class="tok-c"># библиотека threading нужна для работы с событием Event</span>
<span class="tok-k">import</span> time                                   <span class="tok-c"># библиотека time содержит функции для работы со временем</span>


drone = Pioneer()                             <span class="tok-c"># создаем экземпляр класса Pioneer, устанавливаем соединение</span>
point_event = threading.Event()               <span class="tok-c"># создаем событие, которое сработает при достижении точки</span>

<span class="tok-k">def</span> point_reached(event):                     <span class="tok-c"># функция вызывается, когда дрон достигает заданной точки</span>
    point_event.set()                         <span class="tok-c"># сообщаем программе, что точка достигнута</span>

<span class="tok-k">def</span> wait_for_point():                         <span class="tok-c"># функция ожидания прилета дрона в точку</span>
    point_event.wait()                        <span class="tok-c"># ждем, пока дрон достигнет заданной точки</span>
    point_event.clear()                       <span class="tok-c"># очищаем событие для следующего ожидания</span>

drone.subscribe(point_reached, pioneer_sdk2.Event.POINT_REACHED) <span class="tok-c"># подписываемся на событие достижения точки</span>

<span class="tok-k">try</span>:                                          <span class="tok-c"># основной код находится внутри блока try</span>
    drone.arm()                               <span class="tok-c"># включаем двигатели</span>
    drone.takeoff()                           <span class="tok-c"># взлетаем</span>

    time.sleep(<span class="tok-n">3</span>)                             <span class="tok-c"># ставим паузу на 3 секунды после взлета</span>

    drone.go_to_local_point(x=<span class="tok-n">0</span>, y=<span class="tok-n">0</span>, z=<span class="tok-n">1</span>, yaw=<span class="tok-n">0</span>, time=<span class="tok-n">3</span>) <span class="tok-c"># летим в точку с координатами x=0, y=0, z=1</span>
                                                          <span class="tok-c"># x, y, z - координаты точки в метрах</span>
                                                          <span class="tok-c"># yaw - поворот по курсу в радианах</span>
                                                          <span class="tok-c"># time - время, за которое требуется достигнуть точку</span>
    wait_for_point()                                      <span class="tok-c"># ждем, пока дрон долетит до заданной точки</span>

    drone.go_to_local_point(x=<span class="tok-n">0</span>, y=<span class="tok-n">1</span>, z=<span class="tok-n">1</span>, yaw=<span class="tok-n">0</span>, time=<span class="tok-n">3</span>) <span class="tok-c"># летим в первую точку с координатами x=0, y=1, z=1</span>
    wait_for_point()                                      <span class="tok-c"># ждем, пока дрон долетит до заданной точки</span>

    drone.go_to_local_point(x=<span class="tok-n">1</span>, y=<span class="tok-n">1</span>, z=<span class="tok-n">1</span>, yaw=<span class="tok-n">0</span>, time=<span class="tok-n">3</span>) <span class="tok-c"># летим во вторую точку с координатами x=1, y=1, z=1</span>
    wait_for_point()                                      <span class="tok-c"># ждем, пока дрон долетит до заданной точки</span>

    drone.land()                              <span class="tok-c"># сажаем дрон, двигатели выключатся автоматически</span>

<span class="tok-k">except</span> KeyboardInterrupt:                     <span class="tok-c"># если пользователь остановил программу сочетанием Ctrl+C</span>
    <span class="tok-b">print</span>(<span class="tok-s">"Остановка программы, производится посадка"</span>) <span class="tok-c"># выводим сообщение об остановке программы</span>
    drone.land()                                       <span class="tok-c"># сажаем дрон</span>

<span class="tok-k">except</span> Exception <span class="tok-k">as</span> error:                    <span class="tok-c"># если произошла любая другая ошибка</span>
    <span class="tok-b">print</span>(<span class="tok-s">"Ошибка:"</span>, error)                   <span class="tok-c"># выводим текст ошибки</span>
    drone.land()                              <span class="tok-c"># сажаем дрон при ошибке</span>

<span class="tok-k">finally</span>:                                      <span class="tok-c"># блок finally выполнится в любом случае</span>
    drone.close_connection()                  <span class="tok-c"># закрываем соединение с дроном</span>
</code></pre></div>
<p>Как это работает:</p>
<ul>
<li><code>Pioneer()</code> устанавливает соединение — после этого можно отправлять команды.</li>
<li><code>go_to_local_point(x, y, z, yaw, time)</code> — <strong>не блокирующий</strong> метод: после вызова программу нужно «остановить» ожиданием, иначе следующая команда перебьёт текущую точку.</li>
<li>Ожидание построено на событии: <code>drone.subscribe(point_reached, Event.POINT_REACHED)</code> регистрирует колбэк, который при прилёте делает <code>set()</code> у <code>threading.Event</code>. Служебная функция <code>wait_for_point()</code> блокируется на <code>point_event.wait()</code> и очищает флаг <code>clear()</code> для следующего ожидания.</li>
<li>Точки задаются в метрах в локальной системе координат; <code>time</code> — время, за которое нужно достичь точку (наши три перелёта по 3 с).</li>
<li><code>arm()</code> и <code>takeoff()</code> обязательно предшествуют полётам: без состояний <code>ARMED</code>/<code>IN_SKY</code> команды полёта игнорируются автопилотом.</li>
<li>Оба <code>except</code> гарантируют <code>land()</code> при Ctrl+C и любой ошибке; <code>finally</code> всегда закрывает соединение.</li>
</ul>
<p>Метод подробно разобран в справочнике: <a href="/05-sdk2/#s-полет-в-координаты-локальные">«Полёт в координаты (локальные)»</a>.</p>

<h2 id="m-circle">circle_flight.py — движение по окружности</h2>
<p>Дрон облетает окружность из 8 точек радиусом 0,7 м на высоте 1 м и по пути транслирует видео в поток <code>video</code>. Координаты точки окружности считаются классической тригонометрией:</p>
<div class="codewrap"><pre><code data-lang="python">circle_radius = <span class="tok-n">0.7</span>                                   <span class="tok-c"># радиус окружности в метрах</span>
circle_points = <span class="tok-n">8</span>                                     <span class="tok-c"># количество точек на окружности</span>
circle_angle = <span class="tok-n">0</span>                                      <span class="tok-c"># стартовый угол на окружности в градусах</span>
z = <span class="tok-n">1.0</span>                                               <span class="tok-c"># высота полета в метрах</span>


<span class="tok-k">def</span> get_point_on_circle(angle, radius):               <span class="tok-c"># функция расчета координат точки на окружности</span>
    radians = math.radians(angle)                     <span class="tok-c"># переводим угол из градусов в радианы</span>
    x = radius * math.cos(radians)                    <span class="tok-c"># вычисляем координату точки по оси X</span>
    y = radius * math.sin(radians)                    <span class="tok-c"># вычисляем координату точки по оси Y</span>
    <span class="tok-k">return</span> x, y                                       <span class="tok-c"># возвращаем координаты X и Y</span></code></pre></div>
<p>Начальные настройки: радиус, число точек, стартовый угол и высота — обычные переменные в начале файла. Полёт сводится к циклу «рассчитать точку → лететь → дождаться»:</p>
<div class="codewrap"><pre><code data-lang="python">    <span class="tok-k">while</span> circle_angle &lt; <span class="tok-n">360</span>:                             <span class="tok-c"># выполняем полет, пока не пройдем полный круг</span>
        frame = camera.get_cv_frame(timeout=<span class="tok-n">1.0</span>)          <span class="tok-c"># получаем один кадр с камеры</span>
                                                          <span class="tok-c"># timeout=1.0 - время ожидания кадра в секундах</span>

        <span class="tok-k">if</span> frame <span class="tok-k">is</span> <span class="tok-k">not</span> <span class="tok-k">None</span>:                             <span class="tok-c"># проверяем, что кадр успешно получен</span>
            video_drone.imshow(<span class="tok-s">"video"</span>, frame, fps=<span class="tok-n">30</span>)    <span class="tok-c"># запускаем трансляцию видео</span>
                                                          <span class="tok-c"># video - название трансляции</span>
                                                          <span class="tok-c"># frame - изображение с камеры</span>
                                                          <span class="tok-c"># fps=30 - количество кадров в секунду</span>

        x, y = get_point_on_circle(circle_angle, circle_radius) <span class="tok-c"># рассчитываем следующую точку окружности</span>

        drone.go_to_local_point(x=x, y=y, z=z, yaw=<span class="tok-n">0</span>, time=<span class="tok-n">3</span>)   <span class="tok-c"># летим в рассчитанную точку окружности</span>
        wait_for_point()                                        <span class="tok-c"># ждем, пока дрон долетит до точки</span>

        circle_angle += <span class="tok-n">360</span> / circle_points             <span class="tok-c"># увеличиваем угол для перехода к следующей точке</span>

    drone.land()                                        <span class="tok-c"># производим посадку после завершения полетного задания</span></code></pre></div>
<p>Три приёма из фрагмента:</p>
<ul>
<li><code>wait_for_point()</code> здесь на polling: цикл ждёт <code>drone.point_reached()</code> с паузой 0,1 с — SDK возвращает флаг достижения точки.</li>
<li>Кадр камеры запрашивается <code>camera.get_cv_frame(timeout=1.0)</code>; если получен, он публикуется командой <code>viewer.imshow("video", frame, fps=30)</code>. Поток <code>video</code> доступен по адресу <code>rtsp://10.42.0.1:8889/video/</code>.</li>
<li>В <code>finally</code> останавливаются и видеотракт (<code>viewer.close()</code>, <code>camera.stop()</code>), и соединение с дроном — пропускать нельзя, RTSP-сервер иначе останется работать.</li>
</ul>

<h2 id="m-frames">mission_with_frames.py — миссия с RTSP-потоком</h2>
<p>Полёт по «квадрату» из четырёх точек с трансляцией <code>pioneer_camera</code>. Программа построена на функциях: точки задаются словарями, ожидание совмещено с показом кадров:</p>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">def</span> wait_for_point():                          <span class="tok-c"># функция ожидания прилета дрона в точку</span>
    <span class="tok-k">while</span> <span class="tok-k">not</span> drone.point_reached():           <span class="tok-c"># ждем, пока дрон не достигнет заданной точки</span>
        show_camera()                          <span class="tok-c"># показываем видео с камеры во время полета</span>
        time.sleep(<span class="tok-n">0.1</span>)                        <span class="tok-c"># ставим небольшую паузу, чтобы не нагружать программу</span></code></pre></div>
<p>Принятие решения о полёте вынесено в <code>fly_through_points()</code>, а точки хранятся в списке словарей:</p>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">def</span> fly_through_points(points):                <span class="tok-c"># функция полета по заданным точкам</span>
    <span class="tok-k">for</span> point <span class="tok-k">in</span> points:                       <span class="tok-c"># перебираем все точки из списка</span>
        drone.go_to_local_point(               <span class="tok-c"># отправляем дрон в текущую точку</span>
            x=point[<span class="tok-s">"x"</span>],                      <span class="tok-c"># координата точки по оси X</span>
            y=point[<span class="tok-s">"y"</span>],                      <span class="tok-c"># координата точки по оси Y</span>
            z=point[<span class="tok-s">"z"</span>],                      <span class="tok-c"># координата точки по оси Z</span>
            yaw=point[<span class="tok-s">"yaw"</span>],                  <span class="tok-c"># поворот по курсу в градусах</span>
            time=<span class="tok-n">3</span>                             <span class="tok-c"># время, за которое нужно достигнуть точку</span>
        )

        wait_for_point()                       <span class="tok-c"># ждем, пока дрон долетит до текущей точки</span>


waypoints = [                                  <span class="tok-c"># список точек для полетного задания</span>
    {<span class="tok-s">"x"</span>: <span class="tok-n">1</span>, <span class="tok-s">"y"</span>: <span class="tok-n">0</span>, <span class="tok-s">"z"</span>: <span class="tok-n">0.7</span>, <span class="tok-s">"yaw"</span>: <span class="tok-n">0</span>},      <span class="tok-c"># точка 1</span>
    {<span class="tok-s">"x"</span>: <span class="tok-n">1</span>, <span class="tok-s">"y"</span>: <span class="tok-n">1</span>, <span class="tok-s">"z"</span>: <span class="tok-n">0.7</span>, <span class="tok-s">"yaw"</span>: <span class="tok-n">0</span>},      <span class="tok-c"># точка 2</span>
    {<span class="tok-s">"x"</span>: <span class="tok-n">0</span>, <span class="tok-s">"y"</span>: <span class="tok-n">1</span>, <span class="tok-s">"z"</span>: <span class="tok-n">0.7</span>, <span class="tok-s">"yaw"</span>: <span class="tok-n">0</span>},      <span class="tok-c"># точка 3</span>
    {<span class="tok-s">"x"</span>: <span class="tok-n">0</span>, <span class="tok-s">"y"</span>: <span class="tok-n">0</span>, <span class="tok-s">"z"</span>: <span class="tok-n">0.7</span>, <span class="tok-s">"yaw"</span>: <span class="tok-n">0</span>},      <span class="tok-c"># возврат к начальной точке</span>
]</code></pre></div>
<p>Кадр здесь публикуется без <code>fps</code>: <code>viewer.imshow("pioneer_camera", frame)</code>; поток доступен по адресу <code>rtsp://10.42.0.1:8889/pioneer_camera/</code>.</p>

<h2 id="m-speed">set_manual_speed.py — ручное задание скорости</h2>
<p>Самый короткий полётный пример: две «прямые» по осям Y и X. Скорость задаётся одной командой из пяти аргументов:</p>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">try</span>:                                          <span class="tok-c"># основной код находится внутри блока try</span>
    drone.arm()                               <span class="tok-c"># включаем двигатели</span>
    drone.takeoff()                           <span class="tok-c"># взлетаем</span>

    time.sleep(<span class="tok-n">3</span>)                             <span class="tok-c"># ставим паузу на 3 секунды после взлета</span>

    drone.set_manual_speed(<span class="tok-n">0</span>, <span class="tok-n">1</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">2</span>)     <span class="tok-c"># летим вперед по оси Y в течение 2 секунд</span>
                                              <span class="tok-c"># vx(0) - скорость по оси "x" в м/с</span>
                                              <span class="tok-c"># vy(1) - скорость по оси "y" в м/с</span>
                                              <span class="tok-c"># vz(0) - скорость по оси "z" в м/с</span>
                                              <span class="tok-c"># yaw_rate(0) - скорость поворота по курсу</span>
                                              <span class="tok-c"># interval(2) - время действия команды в секундах</span>

    time.sleep(<span class="tok-n">2</span>)                             <span class="tok-c"># ставим паузу на 2 секунды перед следующим движением</span>

    drone.set_manual_speed(<span class="tok-n">1</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">2</span>)     <span class="tok-c"># летим вправо по оси X в течение 2 секунд</span>
    time.sleep(<span class="tok-n">2</span>)                             <span class="tok-c"># ставим паузу на 2 секунды перед посадкой</span>

    drone.land()                              <span class="tok-c"># садимся, двигатели выключатся автоматически</span></code></pre></div>
<ul>
<li><code>vx, vy, vz</code> — скорости по осям корпуса в м/с; <code>yaw_rate</code> — скорость рысканья в <strong>рад/с</strong>.</li>
<li><code>interval</code> — сколько секунд действует команда; после этого дрон зависает на месте.</li>
<li>Для управления относительно корпуса в полёте чаще используется <code>set_manual_speed_body_fixed()</code> — она применяется в <a href="/examples/aruco/">aruco_flight.py</a> и <a href="/examples/human-tracking/">human_tracking</a>.</li>
</ul>

<h2 id="m-safety">Безопасность</h2>
<ul>
<li>Проверьте зону полёта, заряд, навигацию (LPS или GPS) и возможность аварийной посадки.</li>
<li>Каждый скрипт сажает дрон по Ctrl+C и по любой ошибке, а соединение закрывается в <code>finally</code>.</li>
<li>Примеры с <code>ImageViewer</code> требуют конфигурации камеры с драйвером <code>gstreamer</code> — см. требования на странице <a href="/09-examples/">«Примеры»</a>.</li>
</ul>
