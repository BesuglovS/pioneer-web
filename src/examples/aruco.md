---
layout: layout.njk
title: "Разбор: aruco_examples"
description: "Разбор ArUco-примеров pioneer_sdk2: детекция меток OpenCV, расчёт координат через solvePnP с файлом data.yml и полёт с удержанием метки aruco_flight.py"
permalink: "/examples/aruco/"
---

<h1 id="top">Разбор: aruco_examples</h1>
<p><a class="btn ghost" href="/09-examples/">← Все разборы примеров</a></p>
<p>Источник: репозиторий <a href="https://gitflic.ru/project/pioneer-team/pioneer-sdk2-example" target="_blank" rel="noopener">pioneer-team/pioneer-sdk2-example</a> (GitFlic). Справочник по классам API — на странице <a href="/05-sdk2/">«Pioneer SDK 2»</a>.</p>

<h2 id="a-run">Порядок работы</h2>
<p>Примеры образуют цепочку: калибровка → детекция → координаты → полёт. Перед полётом нужен корректный <code>data.yml</code> — его делает <code>camera_calibration.py</code> (порядок съёмки подробно разобран на странице <a href="/examples/camera/#c-calib">camera_examples</a>):</p>
<div class="codewrap"><pre><code data-lang="bash">python3 camera_calibration.py
python3 detect_aruco.py
python3 detect_aruco_coordinates.py
python3 aruco_flight.py</code></pre></div>

<h2 id="a-detect">detect_aruco.py — базовая детекция</h2>
<p>Самый компактный пример знакомит с ArUco-детекцией OpenCV поверх кадров бортовой камеры:</p>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_sdk2 <span class="tok-k">import</span> Camera, ImageViewer  <span class="tok-c"># импортируем классы Camera и ImageViewer из библиотеки pioneer_sdk2</span>
<span class="tok-k">import</span> cv2                                    <span class="tok-c"># библиотека cv2 содержит функции для работы с изображениями</span>

aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_ARUCO_ORIGINAL) <span class="tok-c"># выбираем словарь ArUco-меток</span>
aruco_params = cv2.aruco.DetectorParameters()                         <span class="tok-c"># создаем параметры для поиска ArUco-меток</span>
aruco_detector = cv2.aruco.ArucoDetector(aruco_dict, aruco_params)    <span class="tok-c"># создаем детектор ArUco-меток</span>

camera = Camera()                             <span class="tok-c"># создаем экземпляр класса Camera для получения кадров с камеры</span>
viewer = ImageViewer()                        <span class="tok-c"># создаем экземпляр класса ImageViewer для трансляции изображения</span>

<span class="tok-k">try</span>:                                          <span class="tok-c"># основной код находится внутри блока try</span>
    <span class="tok-k">while</span> <span class="tok-k">True</span>:                               <span class="tok-c"># запускаем бесконечный цикл</span>
        frame = camera.get_cv_frame(timeout=<span class="tok-n">1.0</span>) <span class="tok-c"># получаем один кадр с камеры</span>
                                                 <span class="tok-c"># timeout=1.0 - время ожидания кадра в секундах</span>

        <span class="tok-k">if</span> frame <span class="tok-k">is</span> <span class="tok-k">None</span>:                     <span class="tok-c"># проверяем, что кадр не был получен</span>
            <span class="tok-k">continue</span>                          <span class="tok-c"># пропускаем текущую итерацию цикла</span>

        corners, ids, rejected = aruco_detector.detectMarkers(frame) <span class="tok-c"># ищем ArUco-метки на изображении</span>

        cv2.aruco.drawDetectedMarkers(frame, corners, ids) <span class="tok-c"># рисуем найденные ArUco-метки на изображении</span>

        viewer.imshow(<span class="tok-s">"aruco"</span>, frame, fps=<span class="tok-n">30</span>) <span class="tok-c"># запускаем трансляцию изображения</span>
                                              <span class="tok-c"># aruco - название трансляции</span>
                                              <span class="tok-c"># frame - изображение с камеры</span>
                                              <span class="tok-c"># fps=30 - количество кадров в секунду</span>

<span class="tok-k">finally</span>:                                      <span class="tok-c"># блок finally выполнится при завершении программы</span>
    camera.stop()                             <span class="tok-c"># останавливаем получение кадров с камеры</span>
    viewer.close()                            <span class="tok-c"># останавливаем видеопоток</span>
</code></pre></div>
<p>Ключевые места:</p>
<ul>
<li>Словарь <code>DICT_ARUCO_ORIGINAL</code> один на всю группу — ваши метки должны быть напечатаны из того же словаря.</li>
<li>В OpenCV 4.7+ детектор — это объект <code>ArucoDetector</code>; <code>detectMarkers(frame)</code> возвращает углы меток, ID и отбракованные области.</li>
<li>Найденные метки рисуются на кадре <code>cv2.aruco.drawDetectedMarkers</code>, и кадр публикуется в поток <code>aruco</code>: <code>rtsp://10.42.0.1:8889/aruco/</code>.</li>
</ul>

<h2 id="a-coords">detect_aruco_coordinates.py — координаты метки (solvePnP)</h2>
<p>Следующий шаг — превратить 2D-обнаружение в 3D-положение метки относительно камеры. Для этого нужны калибровка и известный реальный размер метки:</p>
<div class="codewrap"><pre><code data-lang="python">aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_ARUCO_ORIGINAL) <span class="tok-c"># выбираем словарь ArUco-меток</span>
aruco_params = cv2.aruco.DetectorParameters()                         <span class="tok-c"># создаем параметры для поиска ArUco-меток</span>
aruco_detector = cv2.aruco.ArucoDetector(aruco_dict, aruco_params)    <span class="tok-c"># создаем детектор ArUco-меток</span>

camera_matrix, dist_coeffs = load_coefficients(DATA_PATH) <span class="tok-c"># загружаем коэффициенты калибровки камеры</span>

size_of_marker = <span class="tok-n">0.05</span>                    <span class="tok-c"># задаем размер стороны ArUco-метки в метрах</span>

points_of_marker = np.array([            <span class="tok-c"># задаем координаты углов ArUco-метки</span>
    (size_of_marker / <span class="tok-n">2</span>, -size_of_marker / <span class="tok-n">2</span>, <span class="tok-n">0</span>),
    (-size_of_marker / <span class="tok-n">2</span>, -size_of_marker / <span class="tok-n">2</span>, <span class="tok-n">0</span>),
    (-size_of_marker / <span class="tok-n">2</span>, size_of_marker / <span class="tok-n">2</span>, <span class="tok-n">0</span>),
    (size_of_marker / <span class="tok-n">2</span>, size_of_marker / <span class="tok-n">2</span>, <span class="tok-n">0</span>)
], dtype=np.float32)                      <span class="tok-c"># используем тип float32, который подходит для функций OpenCV</span></code></pre></div>
<ul>
<li><code>load_coefficients()</code> читает из <code>data.yml</code> матрицу камеры <code>mtx</code> и коэффициенты искажений <code>dist</code>; файл ищется рядом со скриптом.</li>
<li><code>size_of_marker = 0.05</code> — сторона метки в метрах. Четыре угла метки задаются в 3D координатами <code>points_of_marker</code> (центр метки — начало координат).</li>
</ul>
<p>Основной цикл отличается тем, что после детекции решается задача PnP — «как нужно расположить метку в 3D, чтобы её углы совпали с найденными на кадре»:</p>
<div class="codewrap"><pre><code data-lang="python">        corners, ids, rejected = aruco_detector.detectMarkers(frame) <span class="tok-c"># ищем ArUco-метки на изображении</span>

        <span class="tok-k">if</span> ids <span class="tok-k">is</span> <span class="tok-k">not</span> <span class="tok-k">None</span> <span class="tok-k">and</span> <span class="tok-b">len</span>(corners) &gt; <span class="tok-n">0</span>: <span class="tok-c"># проверяем, что хотя бы одна ArUco-метка найдена</span>
            image_points = corners[<span class="tok-n">0</span>].reshape(-<span class="tok-n">1</span>, <span class="tok-n">2</span>) <span class="tok-c"># получаем координаты углов первой найденной метки</span>

            success, rvecs, tvecs = cv2.solvePnP(points_of_marker, image_points, camera_matrix, dist_coeffs) <span class="tok-c"># считаем положение метки</span>

            <span class="tok-k">if</span> success:                   <span class="tok-c"># проверяем, что положение метки успешно рассчитано</span>
                <span class="tok-b">print</span>(
                    f<span class="tok-s">"x={tvecs.item(0):.2f},"</span>, <span class="tok-c"># координата метки по оси X</span>
                    f<span class="tok-s">"y={tvecs.item(1):.2f},"</span>, <span class="tok-c"># координата метки по оси Y</span>
                    f<span class="tok-s">"z={tvecs.item(2):.2f}"</span>   <span class="tok-c"># координата метки по оси Z</span>
                )                         <span class="tok-c"># выводим координаты ArUco-метки в терминал</span>

                cv2.drawFrameAxes(frame, camera_matrix, dist_coeffs, rvecs, tvecs, <span class="tok-n">0.1</span>) <span class="tok-c"># рисуем оси координат метки</span>

        cv2.aruco.drawDetectedMarkers(frame, corners, ids) <span class="tok-c"># рисуем найденные ArUco-метки на изображении</span>
        viewer.imshow(<span class="tok-s">"aruco_coordinates"</span>, frame, fps=<span class="tok-n">30</span>)  <span class="tok-c"># запускаем трансляцию изображения</span></code></pre></div>
<p>Вектор <code>tvecs</code> — положение метки относительно камеры: <code>x</code> и <code>y</code> лежат в плоскости кадра, <code>z</code> — вглубь (расстояние до метки). Оси метки рисуются командой <code>cv2.drawFrameAxes</code>; поток <code>aruco_coordinates</code> — <code>rtsp://10.42.0.1:8889/aruco_coordinates/</code>.</p>

<h2 id="a-flight">aruco_flight.py — полёт с удержанием метки</h2>
<p>Крупный пример (~375 строк): дрон по клавише взлетает, а затем визуально удерживает метку в кадре, корректируя дистанцию и высоту. Код разделён на два потока: <strong>VideoProcessingThread</strong> непрерывно детектирует метку и публикует кадр, а главный цикл принимает решения и отправляет скорости. Константы задают «правила игры»:</p>
<div class="codewrap"><pre><code data-lang="python">DATA_PATH = Path(__file__).with_name(<span class="tok-s">"data.yml"</span>)       <span class="tok-c"># путь к файлу калибровки рядом со скриптом</span>
DEBUG_PRINT_INTERVAL = <span class="tok-n">0.5</span>                             <span class="tok-c"># пауза между диагностическими сообщениями в терминал</span>
CAMERA_HORIZONTAL_ANGLE = <span class="tok-n">25</span>                           <span class="tok-c"># угол камеры, при котором она смотрит горизонтально</span>
FORWARD_SPEED = <span class="tok-n">0.4</span>                                    <span class="tok-c"># скорость движения к метке и от метки в м/с</span>
VERTICAL_SPEED = <span class="tok-n">0.25</span>                                  <span class="tok-c"># скорость коррекции высоты по метке в м/с</span>
YAW_RATE = <span class="tok-n">0.4</span>                                         <span class="tok-c"># скорость поворота к метке в рад/с</span>
COMMAND_INTERVAL = <span class="tok-n">0.3</span>                                 <span class="tok-c"># время действия команды скорости в секундах</span>
SEND_PERIOD = <span class="tok-n">0.2</span>                                      <span class="tok-c"># как часто повторять команду скорости, включая нулевую</span>
ZERO_SPEED = (<span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>, <span class="tok-n">0.0</span>)                      <span class="tok-c"># нулевая команда: vx, vy, vz, yaw_rate</span></code></pre></div>
<p>Кадр разбивается на три колонки и три строки — так дрон понимает, куда сместилась метка:</p>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">def</span> get_marker_zone(x_center, frame_width):            <span class="tok-c"># функция определяет, в какой зоне кадра находится метка</span>
    <span class="tok-k">if</span> x_center &lt; frame_width / <span class="tok-n">3</span>:                     <span class="tok-c"># проверяем, что центр метки слева от центральной зоны</span>
        <span class="tok-k">return</span> <span class="tok-s">"left"</span>                                  <span class="tok-c"># возвращаем левую зону</span>
    <span class="tok-k">if</span> x_center &gt; frame_width * <span class="tok-n">2</span> / <span class="tok-n">3</span>:                 <span class="tok-c"># проверяем, что центр метки справа от центральной зоны</span>
        <span class="tok-k">return</span> <span class="tok-s">"right"</span>                                 <span class="tok-c"># возвращаем правую зону</span>
    <span class="tok-k">return</span> <span class="tok-s">"center"</span>                                    <span class="tok-c"># возвращаем центральную зону</span>


<span class="tok-k">def</span> get_vertical_zone(y_center, frame_height):          <span class="tok-c"># функция определяет, выше или ниже центра находится метка</span>
    <span class="tok-k">if</span> y_center &lt; frame_height / <span class="tok-n">3</span>:                    <span class="tok-c"># проверяем, что центр метки выше центральной зоны</span>
        <span class="tok-k">return</span> <span class="tok-s">"top"</span>                                   <span class="tok-c"># возвращаем верхнюю зону</span>
    <span class="tok-k">if</span> y_center &gt; frame_height * <span class="tok-n">2</span> / <span class="tok-n">3</span>:                <span class="tok-c"># проверяем, что центр метки ниже центральной зоны</span>
        <span class="tok-k">return</span> <span class="tok-s">"bottom"</span>                                <span class="tok-c"># возвращаем нижнюю зону</span>
    <span class="tok-k">return</span> <span class="tok-s">"center"</span>                                    <span class="tok-c"># возвращаем центральную зону</span></code></pre></div>
<p>Основное решение главного цикла — три простых порога: по дистанции, по горизонтальной зоне и по вертикальной зоне кадра:</p>
<div class="codewrap"><pre><code data-lang="python">        <span class="tok-k">if</span> in_sky <span class="tok-k">and</span> coordinates <span class="tok-k">is</span> <span class="tok-k">not</span> <span class="tok-k">None</span> <span class="tok-k">and</span> x_center <span class="tok-k">is</span> <span class="tok-k">not</span> <span class="tok-k">None</span> <span class="tok-k">and</span> y_center <span class="tok-k">is</span> <span class="tok-k">not</span> <span class="tok-k">None</span> <span class="tok-k">and</span> frame_width <span class="tok-k">is</span> <span class="tok-k">not</span> <span class="tok-k">None</span> <span class="tok-k">and</span> frame_height <span class="tok-k">is</span> <span class="tok-k">not</span> <span class="tok-k">None</span>: <span class="tok-c"># проверяем, что дрон в воздухе и метка найдена</span>
            distance = <span class="tok-b">float</span>(np.linalg.norm(coordinates)) <span class="tok-c"># вычисляем расстояние до ArUco-метки</span>
            zone = get_marker_zone(x_center, frame_width) <span class="tok-c"># определяем зону кадра с найденной меткой</span>
            vertical_zone = get_vertical_zone(y_center, frame_height) <span class="tok-c"># определяем вертикальную зону кадра с найденной меткой</span>
            status_parts = []                       <span class="tok-c"># создаем список действий, выбранных алгоритмом</span>

            <span class="tok-k">if</span> distance &gt; <span class="tok-n">1.5</span>:                      <span class="tok-c"># проверяем, что дрон далеко от метки</span>
                vy = FORWARD_SPEED                  <span class="tok-c"># задаем скорость движения вперед</span>
                status_parts.append(<span class="tok-s">"forward"</span>)      <span class="tok-c"># сохраняем действие по дистанции</span>
            <span class="tok-k">elif</span> distance &lt; <span class="tok-n">1.0</span>:                    <span class="tok-c"># проверяем, что дрон слишком близко к метке</span>
                vy = -FORWARD_SPEED                 <span class="tok-c"># задаем скорость движения назад</span>
                status_parts.append(<span class="tok-s">"backward"</span>)     <span class="tok-c"># сохраняем действие по дистанции</span>
            <span class="tok-k">else</span>:                                    <span class="tok-c"># если дистанция находится в рабочем диапазоне</span>
                status_parts.append(<span class="tok-s">"hold distance"</span>) <span class="tok-c"># сохраняем действие по дистанции</span>

            <span class="tok-k">if</span> x_center &lt; frame_width / <span class="tok-n">3</span>:          <span class="tok-c"># проверяем, что метка находится слева на изображении</span>
                yaw_rate = YAW_RATE                 <span class="tok-c"># задаем поворот влево</span>
                status_parts.append(<span class="tok-s">"turn left"</span>)    <span class="tok-c"># сохраняем действие по курсу</span>
            <span class="tok-k">elif</span> x_center &gt; frame_width * <span class="tok-n">2</span> / <span class="tok-n">3</span>:    <span class="tok-c"># проверяем, что метка находится справа на изображении</span>
                yaw_rate = -YAW_RATE                <span class="tok-c"># задаем поворот вправо</span>
                status_parts.append(<span class="tok-s">"turn right"</span>)   <span class="tok-c"># сохраняем действие по курсу</span>
            <span class="tok-k">else</span>:                                    <span class="tok-c"># если метка находится в центральной зоне</span>
                status_parts.append(<span class="tok-s">"hold yaw"</span>)     <span class="tok-c"># сохраняем действие по курсу</span>

            <span class="tok-k">if</span> y_center &lt; frame_height / <span class="tok-n">3</span>:          <span class="tok-c"># проверяем, что метка находится выше центральной зоны кадра</span>
                vz = VERTICAL_SPEED                  <span class="tok-c"># задаем набор высоты</span>
                status_parts.append(<span class="tok-s">"up"</span>)            <span class="tok-c"># сохраняем действие по высоте</span>
            <span class="tok-k">elif</span> y_center &gt; frame_height * <span class="tok-n">2</span> / <span class="tok-n">3</span>:    <span class="tok-c"># проверяем, что метка находится ниже центральной зоны кадра</span>
                vz = -VERTICAL_SPEED                 <span class="tok-c"># задаем снижение</span>
                status_parts.append(<span class="tok-s">"down"</span>)          <span class="tok-c"># сохраняем действие по высоте</span>
            <span class="tok-k">else</span>:                                    <span class="tok-c"># если метка находится по центру по вертикали</span>
                status_parts.append(<span class="tok-s">"hold height"</span>)   <span class="tok-c"># сохраняем действие по высоте</span>

            status = <span class="tok-s">", "</span>.join(status_parts)         <span class="tok-c"># собираем текстовое описание действия</span></code></pre></div>
<p>Разбор решения:</p>
<ul>
<li><code>distance = np.linalg.norm(coordinates)</code> — расстояние до метки по 3D-вектору, который дал <code>cv2.solvePnP</code>.</li>
<li>Дистанция 1,0–1,5 м — рабочий диапазон: ближе 1 метра дрон отъезжает, дальше 1,5 метра подъезжает со скоростью 0,4 м/с.</li>
<li>Метка в левой трети кадра → <code>yaw_rate</code> положительный (поворот к метке влево); в правой трети → вправо. Верхняя треть кадра → набор высоты, нижняя → снижение.</li>
<li>Если метка пропала из кадра, состояние <code>marker lost, hover</code>: нулевые скорости, никакого «слепого» поиска.</li>
</ul>
<p>Управление запуск и посадка — с клавиатуры: <code>s</code> — взлёт и набор 1,5 м, <code>q</code> — посадка и выход. Команда скорости повторяется каждые <code>SEND_PERIOD</code> секунд, даже когда нужно отправить нулевую:</p>
<div class="codewrap"><pre><code data-lang="python">        speed_command = (<span class="tok-n">0.0</span>, vy, vz, yaw_rate)      <span class="tok-c"># собираем команду скорости: vx, vy, vz, yaw_rate</span>
        send_due = time.monotonic() - last_speed_send_time &gt;= SEND_PERIOD <span class="tok-c"># проверяем, пора ли повторить команду</span>
        speed_changed = speed_command != last_sent_speed <span class="tok-c"># новую скорость отправляем сразу</span>

        <span class="tok-k">if</span> in_sky <span class="tok-k">and</span> (speed_changed <span class="tok-k">or</span> send_due):   <span class="tok-c"># проверяем, нужно ли отправить команду скорости</span>
            drone.set_manual_speed_body_fixed(*speed_command, COMMAND_INTERVAL) <span class="tok-c"># отправляем команду скорости</span>
            last_speed_send_time = time.monotonic()  <span class="tok-c"># запоминаем время отправки команды</span>
            last_sent_speed = speed_command          <span class="tok-c"># запоминаем последнюю отправленную скорость</span>

        time.sleep(<span class="tok-n">0.05</span>)                            <span class="tok-c"># ставим небольшую паузу, чтобы не нагружать программу</span></code></pre></div>
<p>Размер метки здесь уже 0,1 м, а сервокамера перед стартом ставится на 25° — камера смотрит горизонтально. Гарантию безопасного завершения даёт <code>finally</code>: нулевая скорость и посадка, если дрон всё ещё в воздухе:</p>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">finally</span>:                                            <span class="tok-c"># блок finally выполнится при завершении программы</span>
    restore_terminal(terminal_settings)             <span class="tok-c"># восстанавливаем настройки терминала</span>
    video_thread.stop()                             <span class="tok-c"># останавливаем поток обработки видео</span>
    video_thread.join()                             <span class="tok-c"># ждем завершения потока обработки видео</span>

    <span class="tok-k">if</span> drone.get_fly_state().name == <span class="tok-s">"IN_SKY"</span>:      <span class="tok-c"># проверяем, находится ли дрон в воздухе</span>
        drone.set_manual_speed_body_fixed(*ZERO_SPEED, COMMAND_INTERVAL) <span class="tok-c"># отправляем нулевую скорость перед посадкой</span>
        drone.land()                                <span class="tok-c"># производим посадку</span>
</code></pre></div>

<h2 id="a-safety">Безопасность</h2>
<ul>
<li>Запускайте полётный пример только после проверки калибровки и распознавания метки.</li>
<li>Убедитесь, что <code>data.yml</code> лежит рядом со скриптом, метка хорошо освещена, вокруг свободно.</li>
<li>Потоки группы: <code>calibration</code>, <code>calibration_result</code>, <code>aruco</code>, <code>aruco_coordinates</code>, <code>aruco_flight</code> — все на порту 8889.</li>
</ul>
