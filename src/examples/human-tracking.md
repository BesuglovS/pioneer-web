---
layout: layout.njk
title: "Разбор: human_tracking"
description: "Разбор примеров сопровождения человека на Pioneer Мини 2: YOLO Pose из Pioneer-RKNN, регулятор разворота, движение по жестам и посадка с защитой от случайных команд"
permalink: "/examples/human-tracking/"
---

<h1 id="top">Разбор: human_tracking</h1>
<p><a class="btn ghost" href="/09-examples/">← Все разборы примеров</a></p>
<p>Источник: репозиторий <a href="https://gitflic.ru/project/pioneer-team/pioneer-sdk2-example" target="_blank" rel="noopener">pioneer-team/pioneer-sdk2-example</a> (GitFlic). Справочник по классам API — на странице <a href="/05-sdk2/">«Pioneer SDK 2»</a>.</p>

<h2 id="h-run">Две версии</h2>
<ul>
<li><code>human_tracking_simple.py</code> — учебный минимум: дрон взлетает, ищет самого крупного человека в кадре, поворачивается к нему, при потере цели зависает. Полёта вперёд/назад нет.</li>
<li><code>human_tracking_rknn.py</code> — расширенный: распознаёт позу, рисует скелет, подтверждает жесты несколькими кадрами подряд, двигает дрон по жестам, делает фото и садится по жесту посадки.</li>
</ul>
<p>Обе программы используют модель <strong>YOLO Pose</strong> из <code>pioneer_rknn</code> (про NPU — на странице <a href="/06-rknn/">«Нейросети (RKNN)»</a>):</p>
<div class="codewrap"><pre><code data-lang="python">from pioneer_sdk2 import Pioneer, Camera, ImageViewer, CameraType
from pioneer_rknn import YoloPose

camera = Camera(camera_type=CameraType.MAIN)     # основная камера
model = YoloPose(model_name="yolov8n-pose")      # модель из реестра Pioneer-RKNN</code></pre></div>
<p>Вход нейросети — 640×640, поэтому кадр масштабируется перед инференсом, а координаты рамок пересчитываются обратно к размеру исходного кадра.</p>

<h2 id="h-simple">human_tracking_simple.py — сопровождение разворотом</h2>
<p>Найдя людей, скрипт выбирает рамку с максимальной площадью и «доворачивает» дрон к её центру. Задача скорости решается простым П-регулятором:</p>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">def</span> select_main_box(boxes):                             <span class="tok-c"># функция выбирает самого крупного человека</span>
    <span class="tok-k">if</span> <span class="tok-k">not</span> boxes:                                       <span class="tok-c"># проверяем, есть ли найденные рамки</span>
        <span class="tok-k">return</span> <span class="tok-k">None</span>                                     <span class="tok-c"># возвращаем None, если человека нет</span>

    <span class="tok-k">def</span> box_area(box):                                  <span class="tok-c"># функция считает площадь рамки</span>
        x1, y1, x2, y2 = box                            <span class="tok-c"># получаем координаты рамки</span>
        <span class="tok-k">return</span> (x2 - x1) * (y2 - y1)                    <span class="tok-c"># возвращаем площадь рамки</span>

    <span class="tok-k">return</span> <span class="tok-b">max</span>(boxes, key=box_area)                     <span class="tok-c"># выбираем рамку с максимальной площадью</span>


<span class="tok-k">def</span> get_tracking_speed(box, frame_width):               <span class="tok-c"># функция считает скорость для сопровождения человека</span>
    x1, _, x2, _ = box                                  <span class="tok-c"># получаем горизонтальные координаты рамки человека</span>
    box_center_x = (x1 + x2) / <span class="tok-n">2</span>                        <span class="tok-c"># центр рамки по X</span>

    yaw_error = frame_width / <span class="tok-n">2</span> - box_center_x          <span class="tok-c"># ошибка по горизонтали: человек левее/правее центра</span>

    vx = <span class="tok-n">0.0</span>                                            <span class="tok-c"># по оси X корпуса в этом примере не двигаемся</span>
    vy = <span class="tok-n">0.0</span>                                            <span class="tok-c"># вперед/назад не летим: расстояние по размеру рамки ненадежно</span>
    vz = <span class="tok-n">0.0</span>                                            <span class="tok-c"># высоту удерживает автопилот после выхода на рабочую высоту</span>
    yaw_rate = limit(YAW_KP * yaw_error, -MAX_YAW_RATE, MAX_YAW_RATE) <span class="tok-c"># скорость поворота</span>

    <span class="tok-k">return</span> vx, vy, vz, yaw_rate                         <span class="tok-c"># возвращаем команду скорости</span>
</code></pre></div>
<ul>
<li><code>yaw_error</code> — ошибка по горизонтали: смещение центра рамки от середины кадра в пикселях.</li>
<li><code>yaw_rate = YAW_KP * yaw_error</code> — классический П-регулятор: чем дальше человек от центра, тем быстрее поворот; <code>limit()</code> ограничивает скорость диапазоном <code>MAX_YAW_RATE</code>.</li>
<li>По осям vx, vy, vz — нули намеренно: README подчёркивает, что оценка расстояния по размеру рамки слишком груба для безопасного учебного примера.</li>
</ul>
<p>Основной цикл типовой: кадр → подготовка → инференс → рамки → команда:</p>
<div class="codewrap"><pre><code data-lang="python">            model_input = resize_for_model(frame)       <span class="tok-c"># подготавливаем кадр для нейросети</span>
            detections = model.run([model_input])       <span class="tok-c"># запускаем распознавание человека</span>
            boxes = get_person_boxes(frame, detections) <span class="tok-c"># получаем рамки найденных людей</span>
            main_box = select_main_box(boxes)           <span class="tok-c"># выбираем самого крупного человека</span>

            <span class="tok-k">if</span> main_box <span class="tok-k">is</span> <span class="tok-k">None</span>:                        <span class="tok-c"># если человек не найден</span>
                speed = ZERO_SPEED                      <span class="tok-c"># задаем нулевую скорость</span>
                send_speed_command(drone, speed)        <span class="tok-c"># отправляем команду зависания</span>
                cv2.putText(frame, <span class="tok-s">"person not found"</span>, (<span class="tok-n">20</span>, <span class="tok-n">40</span>),
                            cv2.FONT_HERSHEY_SIMPLEX, <span class="tok-n">0.8</span>, (<span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">255</span>), <span class="tok-n">2</span>)
            <span class="tok-k">else</span>:
                speed = get_tracking_speed(main_box, frame.shape[<span class="tok-n">1</span>]) <span class="tok-c"># считаем скорость</span>
                send_speed_command(drone, speed, immediate=<span class="tok-k">False</span>) <span class="tok-c"># отправляем скорость по таймеру</span>
                draw_box(frame, main_box, speed)         <span class="tok-c"># рисуем рамку и команду</span>

            viewer.imshow(name=<span class="tok-s">"human_tracking"</span>, frame=frame, fps=<span class="tok-n">30</span>) <span class="tok-c"># публикуем кадр</span>
</code></pre></div>
<p>Три механизма безопасности, повторяющиеся в обоих файлах:</p>
<ul>
<li>Нет кадра (timeout или <code>None</code>) — немедленная нулевая скорость, дрон зависает.</li>
<li>Новая скорость отправляется сразу, а повтор той же — не чаще, чем раз в <code>SEND_PERIOD</code> (0,2 с); интервал действия команды <code>COMMAND_INTERVAL</code> — 0,3 с, так что команды перекрываются.</li>
<li>В <code>finally</code> по <code>get_fly_state().name</code> решается исход: <code>IN_SKY</code> → нулевая скорость + <code>land()</code>; <code>ARMED</code> → <code>disarm()</code>; после освобождаются viewer, camera, соединение и ресурсы модели <code>model.release()</code>.</li>
</ul>

<h2 id="h-gestures">human_tracking_rknn.py — жесты вместо клавиш</h2>
<p>Скелет человека (17 ключевых точек COCO-17) позволяет распознавать жесты математически: сравниваются координаты плеч, локтей, запястий и бёдер. Соответствие жестов и команд:</p>
<div class="tablewrap"><table>
<thead><tr><th>Жест</th><th>Команда дрону</th></tr></thead>
<tbody>
<tr><td>Поднятая вверх согнутая левая рука</td><td>Вперёд, ближе к человеку</td></tr>
<tr><td>Поднятая вверх согнутая правая рука</td><td>Назад, дальше от человека</td></tr>
<tr><td>Вытянутая вбок левая рука</td><td>Влево</td></tr>
<tr><td>Вытянутая вбок правая рука</td><td>Вправо</td></tr>
<tr><td>Сведённые или скрещенные руки перед грудью</td><td>Фото с задержкой 5 с</td></tr>
<tr><td>Две опущенные руки, согнутые в локтях</td><td>Посадка</td></tr>
</tbody></table></div>
<p>Функция <code>classify_gesture()</code> (в файле ~60 строк) по индексам COCO-17 проверяет углы и пропорции рук относительно корпуса. Для обработки ключевых точек важна уверенность детекции:</p>
<div class="codewrap"><pre><code data-lang="python">STABLE_FRAMES = <span class="tok-n">10</span>                                      <span class="tok-c"># сколько кадров подряд нужно видеть жест для подтверждения</span>
LAND_STABLE_FRAMES = <span class="tok-n">18</span>                                 <span class="tok-c"># посадку подтверждаем дольше, чтобы избежать случайного срабатывания</span>
GESTURE_COOLDOWN = <span class="tok-n">2.0</span>                                  <span class="tok-c"># пауза между повторным выполнением одного и того же жеста</span>
PHOTO_DELAY = <span class="tok-n">5.0</span>                                       <span class="tok-c"># задержка перед сохранением фотографии в секундах</span>

</code></pre></div>

<h2 id="h-stable">Стабилизация жеста</h2>
<p>Чтобы случайно поднятая рука не превратилась в команду, жест считается командой только после <code>STABLE_FRAMES</code> кадров подряд; для посадки порог выше — <code>LAND_STABLE_FRAMES</code>. Плюс кулдаун между повторами:</p>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">def</span> get_stable_gesture(raw_gesture):                    <span class="tok-c"># функция подтверждает жест несколькими кадрами подряд</span>
    gesture_history.append(raw_gesture)                 <span class="tok-c"># добавляем текущий жест в общую историю</span>

    <span class="tok-k">if</span> raw_gesture == <span class="tok-s">"none"</span>:                           <span class="tok-c"># none не нужно подтверждать как команду</span>
        <span class="tok-k">return</span> <span class="tok-s">"none"</span>, <span class="tok-k">False</span>                            <span class="tok-c"># возвращаем отсутствие жеста</span>

    required_frames = LAND_STABLE_FRAMES <span class="tok-k">if</span> raw_gesture == <span class="tok-s">"land"</span> <span class="tok-k">else</span> STABLE_FRAMES <span class="tok-c"># для посадки нужен более строгий порог</span>
    recent_gestures = <span class="tok-b">list</span>(gesture_history)[-required_frames:] <span class="tok-c"># берем последние распознанные жесты</span>

    <span class="tok-k">if</span> <span class="tok-b">len</span>(recent_gestures) == required_frames <span class="tok-k">and</span> <span class="tok-b">all</span>(item == raw_gesture <span class="tok-k">for</span> item <span class="tok-k">in</span> recent_gestures): <span class="tok-c"># проверяем стабильность жеста</span>
        <span class="tok-k">return</span> raw_gesture, <span class="tok-k">True</span>                         <span class="tok-c"># возвращаем подтвержденный жест</span>

    <span class="tok-k">return</span> raw_gesture, <span class="tok-k">False</span>                            <span class="tok-c"># жест виден, но еще не подтвержден</span>


<span class="tok-k">def</span> can_execute_action(gesture):                         <span class="tok-c"># функция проверяет задержку между повторными действиями</span>
    now = time.time()                                    <span class="tok-c"># получаем текущее время</span>
    last_time = last_action_time.get(gesture, <span class="tok-n">0</span>)         <span class="tok-c"># получаем время прошлого выполнения жеста</span>

    <span class="tok-k">if</span> now - last_time &lt; GESTURE_COOLDOWN:               <span class="tok-c"># проверяем, прошла ли пауза</span>
        <span class="tok-k">return</span> <span class="tok-k">False</span>                                     <span class="tok-c"># если пауза не прошла, действие не выполняем</span>

    last_action_time[gesture] = now                      <span class="tok-c"># обновляем время выполнения жеста</span>
    <span class="tok-k">return</span> <span class="tok-k">True</span>                                          <span class="tok-c"># разрешаем выполнить действие</span>
</code></pre></div>
<p>Здесь два независимых «замка»:</p>
<ul>
<li><code>get_stable_gesture()</code> следит за <code>deque</code> последних распознанных кадров: команда выполняется, только если <strong>все</strong> последние кадры дают тот же жест.</li>
<li><code>can_execute_action()</code> добавляет паузу <code>GESTURE_COOLDOWN = 2.0</code> с между повторным выполнением одного и того же жеста.</li>
</ul>

<h2 id="h-main">Основной цикл и приоритеты</h2>
<p>Приоритеты решений в главном цикле укладываются в четыре ветки: подтверждённое фото → подтверждённая посадка (выход из цикла) → управляющие жесты; иначе — доворот к человеку:</p>
<div class="codewrap"><pre><code data-lang="python">            <span class="tok-k">if</span> main_pose <span class="tok-k">is</span> <span class="tok-k">not</span> <span class="tok-k">None</span>:                    <span class="tok-c"># проверяем, найден ли человек в кадре</span>
                raw_gesture = classify_gesture(main_pose[<span class="tok-s">"keypoints"</span>]) <span class="tok-c"># определяем текущий жест</span>
                stable_gesture, stable = get_stable_gesture(raw_gesture) <span class="tok-c"># проверяем, стабилен ли жест</span>
                draw_pose(frame, main_pose, raw_gesture, stable)       <span class="tok-c"># рисуем скелет и подпись жеста</span>

                <span class="tok-k">if</span> stable <span class="tok-k">and</span> stable_gesture == <span class="tok-s">"photo"</span> <span class="tok-k">and</span> can_execute_action(<span class="tok-s">"photo"</span>): <span class="tok-c"># проверяем подтвержденный жест фото</span>
                    update_photo_timer(frame)            <span class="tok-c"># запускаем таймер сохранения фото</span>
                <span class="tok-k">elif</span> photo_timer != -<span class="tok-n">1</span>:                  <span class="tok-c"># если таймер фото уже запущен</span>
                    update_photo_timer(frame)            <span class="tok-c"># продолжаем отсчет до сохранения</span>

                <span class="tok-k">if</span> stable <span class="tok-k">and</span> stable_gesture == <span class="tok-s">"land"</span> <span class="tok-k">and</span> can_execute_action(<span class="tok-s">"land"</span>): <span class="tok-c"># проверяем подтвержденный жест посадки</span>
                    <span class="tok-b">print</span>(<span class="tok-s">"Распознан подтвержденный жест посадки"</span>) <span class="tok-c"># выводим сообщение пользователю</span>
                    <span class="tok-k">break</span>                                <span class="tok-c"># выходим из цикла, посадка выполнится в finally</span>

                <span class="tok-k">elif</span> stable <span class="tok-k">and</span> stable_gesture <span class="tok-k">in</span> [<span class="tok-s">"left"</span>, <span class="tok-s">"right"</span>, <span class="tok-s">"forward"</span>, <span class="tok-s">"backward"</span>]: <span class="tok-c"># проверяем управляющие жесты</span>
                    send_gesture_speed(drone, stable_gesture) <span class="tok-c"># отправляем команду движения по жесту</span>
                <span class="tok-k">else</span>:                                    <span class="tok-c"># если управляющий жест не найден</span>
                    send_tracking_speed(drone, main_pose, frame.shape[<span class="tok-n">1</span>]) <span class="tok-c"># разворачиваем дрон к человеку</span>

            <span class="tok-k">else</span>:                                        <span class="tok-c"># если человек не найден</span>
                cv2.putText(frame, <span class="tok-s">"person not found"</span>, (<span class="tok-n">20</span>, <span class="tok-n">40</span>), cv2.FONT_HERSHEY_SIMPLEX, <span class="tok-n">1.0</span>, (<span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">255</span>), <span class="tok-n">2</span>) <span class="tok-c"># пишем сообщение на кадре</span>
                send_hover_speed(drone)                  <span class="tok-c"># отправляем команду зависания</span>

            viewer.imshow(name=<span class="tok-s">"human_tracking"</span>, frame=frame, fps=<span class="tok-n">30</span>) <span class="tok-c"># отправляем кадр в RTSP-трансляцию</span>
</code></pre></div>
<p>Один случайный жест проблем не вызовет: он считается кандидатом (жёлтая подпись на кадре) и исполняется только после подтверждения на <code>STABLE_FRAMES</code> кадрах (зелёная подпись). Полный разбор визуального интерфейса жестов с картинками — в README директории репозитория.</p>

<h2 id="h-run-safe">Запуск и рекомендации</h2>
<div class="codewrap"><pre><code data-lang="bash">python3 human_tracking_simple.py
python3 human_tracking_rknn.py</code></pre></div>
<p>Обработанный кадр — <code>rtsp://10.42.0.1:8554/human_tracking/</code>. Рекомендации README:</p>
<ul>
<li>Контрастный фон и хорошее освещение делают детекцию стабильнее.</li>
<li>Первый полёт — с небольшими <code>MAX_VX</code>, <code>MAX_VY</code> и <code>MAX_YAW_RATE</code>; коэффициенты и ограничители меняйте постепенно.</li>
<li>Не запускайте рядом с людьми, стенами и предметами, которые могут попасть в зону винтов.</li>
</ul>
