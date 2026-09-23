---
layout: layout.njk
title: "Разбор: camera_examples"
description: "Разбор примеров камеры pioneer_sdk2: классы Camera, ImageViewer и ServoCamera; получение кадров, RTSP-трансляция, поворот сервокамеры и калибровка камеры с data.yml"
permalink: "/examples/camera/"
---

<h1 id="top">Разбор: camera_examples</h1>
<p><a class="btn ghost" href="/09-examples/">← Все разборы примеров</a></p>
<p>Источник: репозиторий <a href="https://gitflic.ru/project/pioneer-team/pioneer-sdk2-example" target="_blank" rel="noopener">pioneer-team/pioneer-sdk2-example</a> (GitFlic). Справочник по классам API — на странице <a href="/05-sdk2/">«Pioneer SDK 2»</a>.</p>

<h2 id="c-run">Что внутри и запуск</h2>
<ul>
<li><code>get_frames_from_camera.py</code> — бесконечный цикл кадров + RTSP-поток <code>video</code>.</li>
<li><code>camera_stream.py</code> — то же самое короче, с таймером на 30 с.</li>
<li><code>camera_calibration.py</code> — калибровка камеры по шахматной доске, результат в <code>data.yml</code>.</li>
<li><code>set_camera_angle.py</code> — поворот сервопривода камеры.</li>
<li><code>take_photo_angles.py</code> — фото при углах −25°, 0° и 25°.</li>
</ul>
<p>Примеры с кадрами и <code>ImageViewer</code> запускаются на борту Мини 2; потоки открываются на ПК (VLC, ffplay) по адресам вида <code>rtsp://10.42.0.1:8554/video/</code>.</p>

<h2 id="c-frames">get_frames_from_camera.py — базовый цикл кадра</h2>
<p>Компактный пример знакомит с двумя классами SDK: <strong>Camera</strong> и <strong>ImageViewer</strong>:</p>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_sdk2 <span class="tok-k">import</span> Camera, ImageViewer          <span class="tok-c"># импортируем классы Camera и ImageViewer из библиотеки pioneer_sdk2</span>

camera = Camera()                                      <span class="tok-c"># создаем экземпляр класса Camera</span>
viewer = ImageViewer()                                 <span class="tok-c"># создаем экземпляр класса ImageViewer</span>

<span class="tok-k">try</span>:                                                    <span class="tok-c"># основной код находится внутри блока try</span>
    <span class="tok-k">while</span> <span class="tok-k">True</span>:                                         <span class="tok-c"># запускаем бесконечный цикл</span>
        frame = camera.get_cv_frame(timeout=<span class="tok-n">5.0</span>)        <span class="tok-c"># сохраняем изображение в переменную frame</span>
                                                        <span class="tok-c"># timeout=5.0 - время ожидания кадра в секундах</span>

        <span class="tok-k">if</span> frame <span class="tok-k">is</span> <span class="tok-k">not</span> <span class="tok-k">None</span>:                           <span class="tok-c"># проверяем, что изображение получено</span>
            viewer.imshow(<span class="tok-s">"video"</span>, frame, fps=<span class="tok-n">30</span>)       <span class="tok-c"># отправляем изображение в RTSP-трансляцию</span>

<span class="tok-k">except</span> KeyboardInterrupt:                               <span class="tok-c"># если пользователь остановил программу сочетанием Ctrl+C</span>
    <span class="tok-b">print</span>(<span class="tok-s">"Остановка программы"</span>)                        <span class="tok-c"># выводим сообщение об остановке программы</span>

<span class="tok-k">finally</span>:                                                <span class="tok-c"># блок finally выполнится при завершении программы</span>
    viewer.close()                                      <span class="tok-c"># останавливаем RTSP-трансляцию</span>
    camera.stop()                                       <span class="tok-c"># закрываем передачу кадров</span>
</code></pre></div>
<p>Ключевые места:</p>
<ul>
<li><code>Camera()</code> подключается к бортовой камере; <code>get_cv_frame(timeout=5.0)</code> возвращает кадр OpenCV (BGR) или <code>None</code> по таймауту.</li>
<li><code>ImageViewer()</code> — RTSP-издатель: <code>imshow(name, frame, fps)</code> публикует кадр в поток с заданным именем. Адрес состоит из IP дрона (по умолчанию <code>10.42.0.1</code> — это адрес хот-спота), порта <code>8889</code> и имени потока — первого аргумента <code>imshow</code>.</li>
<li><code>viewer.close()</code> и <code>camera.stop()</code> в <code>finally</code> обязательны: камера и RTSP-сервер не останавливаются сами.</li>
</ul>

<h2 id="c-stream">camera_stream.py — вариант с таймером</h2>
<p>Тот же цикл, но без <code>try/finally</code>: перед стартом запоминается время, длительность управляется переменной <code>cycle_time</code>:</p>
<div class="codewrap"><pre><code data-lang="python">viewer = ImageViewer()                <span class="tok-c"># создаем экземпляр класса ImageViewer</span>
camera = Camera()                     <span class="tok-c"># создаем экземпляр класса Camera</span>

my_time = time.time()                        <span class="tok-c"># объявляем переменную my_time, присваиваем текущее время (в секундах с 1970 года)</span>
cycle_time = <span class="tok-n">30</span>                              <span class="tok-c"># объявляем переменную cycle_time, присваиваем желаемую длительность цикла</span>

<span class="tok-k">while</span> time.time() - my_time &lt; cycle_time:        <span class="tok-c"># запускаем цикл, код будет повторяться, пока условие верно</span>
    frame = camera.get_cv_frame()                <span class="tok-c"># получаем кадр и присваиваем данные переменной frame</span>
    viewer.imshow(<span class="tok-s">"video"</span>, frame, fps=<span class="tok-n">30</span>)        <span class="tok-c"># запускаем трансляцию, содержит аргументы:</span>
                                                 <span class="tok-c"># video - название трансляции</span>
                                                 <span class="tok-c"># frame - переменная с ранее полученным кадром</span>
                                                 <span class="tok-c"># fps=30 - количество кадров в секунду при передаче видео</span>

                                                 <span class="tok-c"># трансляция выполняется по адресу: 10.42.0.1:8554/video</span>
</code></pre></div>
<p>Условие <code>time.time() - my_time &lt; cycle_time</code> — простая ограниченная по времени трансляция (30 с); после выхода <code>viewer.close()</code> останавливает поток.</p>

<h2 id="c-servo">set_camera_angle.py — сервокамера</h2>
<p>Подвес камеры Мини 2 поворачивается в диапазоне <strong>−80°…+30°</strong> (по данным <code>board_config.json</code>). В примерах ниже используются ±25° как безопасный учебный диапазон. Класс <strong>ServoCamera</strong> скрывает протокол и позволяет повернуть камеру одной командой:</p>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_sdk2 <span class="tok-k">import</span> ServoCamera <span class="tok-c"># импортируем класс ServoCamera из библиотеки pioneer_sdk2</span>
<span class="tok-k">import</span> time                          <span class="tok-c"># библиотека time содержит функции для работы со временем</span>

servo_drone_1 = ServoCamera()        <span class="tok-c"># создаем экземпляр класса ServoCamera, проверяет поддержку сервомотора</span>

servo_drone_1.set_angle(<span class="tok-n">25</span>)  <span class="tok-c"># устанавливаем угол камеры на 25 градусов</span>
time.sleep(<span class="tok-n">3</span>)                <span class="tok-c"># ставим паузу на 3 секунды</span>
servo_drone_1.set_angle(-<span class="tok-n">25</span>) <span class="tok-c"># устанавливаем угол камеры на -25 градусов</span></code></pre></div>
<p><code>set_angle(25)</code> — камера вверх, <code>set_angle(-25)</code> — вниз. Углы в градусах; между командами нужна пауза, чтобы сервопривод успел отработать.</p>

<h2 id="c-photo">take_photo_angles.py — фото по углам</h2>
<p>Комбинация двух классов выше: повернуть камеру, дождаться её стабилизации, снять кадр и сохранить JPG:</p>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">def</span> take_photo_at_angle(angle):     <span class="tok-c"># функция поворачивает камеру на нужный угол и сохраняет фото</span>
    servo_camera.set_angle(angle)   <span class="tok-c"># устанавливаем угол поворота камеры</span>

    time.sleep(<span class="tok-n">3</span>)                   <span class="tok-c"># ждём 3 секунды, чтобы камера успела повернуться</span>

    frame = camera.get_cv_frame(timeout=<span class="tok-n">5.0</span>) <span class="tok-c"># получаем один кадр с камеры</span>

    <span class="tok-k">if</span> frame <span class="tok-k">is</span> <span class="tok-k">None</span>:               <span class="tok-c"># проверяем, удалось ли получить кадр</span>
        <span class="tok-b">print</span>(f<span class="tok-s">"Не удалось получить фото при угле {angle}"</span>) <span class="tok-c"># выводим сообщение об ошибке</span>
        <span class="tok-k">return</span>                      <span class="tok-c"># выходим из функции, если кадр не получен</span>

    file_name = f<span class="tok-s">"photo_angle_{angle}.jpg"</span> <span class="tok-c"># задаём имя файла для фотографии</span>
    cv2.imwrite(file_name, frame)          <span class="tok-c"># сохраняем кадр в файл</span>

    <span class="tok-b">print</span>(f<span class="tok-s">"Фото сохранено: {file_name}"</span>) <span class="tok-c"># выводим сообщение об успешном сохранении</span>


take_photo_at_angle(-<span class="tok-n">25</span>)        <span class="tok-c"># делаем фото при угле камеры -25 градусов</span>
take_photo_at_angle(<span class="tok-n">0</span>)          <span class="tok-c"># делаем фото при угле камеры 0 градусов</span>
take_photo_at_angle(<span class="tok-n">25</span>)         <span class="tok-c"># делаем фото при угле камеры 25 градусов</span>

camera.stop()                   <span class="tok-c"># останавливаем работу камеры</span></code></pre></div>
<p>После <code>set_angle(angle)</code> обязательно <code>time.sleep(3)</code> — камера должна успеть установиться, и только затем кадр сохраняется через <code>cv2.imwrite(...)</code>.</p>

<h2 id="c-calib">camera_calibration.py — калибровка по шахматной доске</h2>
<p>Скрипт создаёт <code>data.yml</code> — файл с параметрами камеры, без которого координаты ArUco-меток считаются неточно. Порядок работы из README:</p>
<ol>
<li>Напечатайте <a href="https://raw.githubusercontent.com/opencv/opencv/master/doc/pattern.png" target="_blank" rel="noopener">шаблон OpenCV</a> (шахматная доска 6×9 внутренних углов) на А4 без масштабирования.</li>
<li>Подключите дрон и запустите <code>python3 camera_calibration.py</code>; откройте поток <code>rtsp://10.42.0.1:8554/calibration/</code>.</li>
<li>Сделайте 10–15 снимков с разных ракурсов: в терминале вводите <code>1</code> + Enter для снимка; когда снимков достаточно — <code>q</code> + Enter.</li>
<li>Проверьте найденные углы в потоке <code>rtsp://10.42.0.1:8554/calibration_result/</code>.</li>
<li>Дождитесь сохранения <code>data.yml</code> рядом со скриптом.</li>
</ol>
<p>Внутри всё делает OpenCV: ищутся углы доски, уточняются субпиксельно, затем вычисляется матрица камеры. Настройки поиска:</p>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">def</span> calibrate(images, viewer=<span class="tok-k">None</span>):                         <span class="tok-c"># функция для калибровки камеры по снимкам шахматной доски</span>
    CHECKERBOARD = (<span class="tok-n">6</span>, <span class="tok-n">9</span>)                                   <span class="tok-c"># количество внутренних углов шахматной доски</span>
                                                            <span class="tok-c"># 6 - количество углов по одной стороне, 9 - по другой</span>

    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, <span class="tok-n">30</span>, <span class="tok-n">0.001</span>) <span class="tok-c"># критерий точности поиска углов</span>
                                                            <span class="tok-c"># 30 - максимальное количество итераций</span>
                                                            <span class="tok-c"># 0.001 - требуемая точность</span>
    calibration_flags = (                                   <span class="tok-c"># флаги для поиска углов шахматной доски</span>
        cv2.CALIB_CB_ADAPTIVE_THRESH                        <span class="tok-c"># используем адаптивную обработку изображения</span>
        + cv2.CALIB_CB_FAST_CHECK                           <span class="tok-c"># ускоряем проверку наличия шахматной доски</span>
        + cv2.CALIB_CB_NORMALIZE_IMAGE                      <span class="tok-c"># нормализуем изображение для лучшего поиска углов</span>
    )
</code></pre></div>
<p>Углы ищутся с флагами <code>ADAPTIVE_THRESH</code>/<code>FAST_CHECK</code>/<code>NORMALIZE_IMAGE</code>, критерий уточняет позиции до 0,001. Итоговая калибровка — классический <code>cv2.calibrateCamera</code>:</p>
<div class="codewrap"><pre><code data-lang="python">    <span class="tok-k">if</span> image_size <span class="tok-k">is</span> <span class="tok-k">None</span> <span class="tok-k">or</span> <span class="tok-k">not</span> imgpoints:                 <span class="tok-c"># проверяем, что есть данные для калибровки</span>
        <span class="tok-k">raise</span> RuntimeError(<span class="tok-s">"Не удалось найти углы шахматной доски для калибровки"</span>)

    camera_matrix = np.zeros((<span class="tok-n">3</span>, <span class="tok-n">3</span>), np.float64)             <span class="tok-c"># матрица камеры будет рассчитана OpenCV</span>
    dist_coeffs = np.zeros((<span class="tok-n">5</span>, <span class="tok-n">1</span>), np.float64)               <span class="tok-c"># коэффициенты искажений будут рассчитаны OpenCV</span>

    ret, mtx, dist, rvecs, tvecs = cv2.calibrateCamera(      <span class="tok-c"># выполняем калибровку камеры</span>
        objpoints,                                          <span class="tok-c"># передаем 3D-точки шахматной доски</span>
        imgpoints,                                          <span class="tok-c"># передаем 2D-точки на изображениях</span>
        image_size,                                         <span class="tok-c"># передаем размер изображения</span>
        camera_matrix,                                      <span class="tok-c"># передаем матрицу камеры для заполнения</span>
        dist_coeffs                                         <span class="tok-c"># передаем коэффициенты искажений для заполнения</span>
    )

    <span class="tok-k">return</span> mtx, dist                                        <span class="tok-c"># возвращаем матрицу камеры и коэффициенты искажений</span>
</code></pre></div>
<p>Матрица и коэффициенты сохраняются через <code>cv2.FileStorage</code> в <code>data.yml</code>; файл лежит рядом со скриптом (<code>Path(__file__).with_name("data.yml")</code>), поэтому примеры можно запускать из любого каталога. Скрипты <a href="/examples/aruco/">aruco_examples</a> читают этот файл.</p>
