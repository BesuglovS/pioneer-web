---
layout: layout.njk
title: "Программирование на Python"
description: "Справочник по pioneer_sdk2 и pioneer_rknn на борту Пионер Мини 2: подключение, полётные команды, телеметрия, события, камеры, сервопривод, RC-каналы, нейросети на NPU и полные примеры"
pageNumber: 12
pageSlug: "python"
---

<h1>Программирование на Python</h1>
<p>Справочник по библиотекам <code>pioneer_sdk2 0.15.1</code> и <code>pioneer_rknn 1.6.3</code> для вычислительного модуля Пионер Мини 2. Описаны установленные компоненты, подключение и автомат состояний, управление полётом, телеметрия, события, камеры, сервопривод, RC-каналы, нейросети на NPU и готовые примеры.</p>
<div class="sdk-callout">📖 Тот же материал в виде постраничного API-справочника с параметрами и примерами — в разделе <a href="/sdk2/">«Справочник pioneer_sdk2»</a>.</div>

<h2 id="software">1. Установленное ПО</h2>
<div class="tablewrap"><table>
<thead><tr><th>Компонент</th><th>Версия</th><th>Путь</th></tr></thead>
<tbody>
<tr><td>Python</td><td>3.12.3</td><td><code>/usr/bin/python3</code></td></tr>
<tr><td><code>pioneer_sdk2</code></td><td>0.15.1</td><td><code>/usr/local/lib/python3.12/dist-packages/pioneer_sdk2/</code></td></tr>
<tr><td><code>pioneer_rknn</code> (ИИ)</td><td>1.6.3</td><td><code>/usr/local/lib/python3.12/dist-packages/pioneer_rknn/</code></td></tr>
<tr><td><code>rknn-toolkit-lite2</code></td><td>2.3.0</td><td><code>/usr/local/lib/python3.12/dist-packages/rknnlite/</code></td></tr>
<tr><td>OpenCV (<code>cv2</code>)</td><td>4.10.0</td><td><code>/usr/lib/python3.12/dist-packages/cv2/</code></td></tr>
<tr><td>numpy</td><td>1.26.4</td><td>—</td></tr>
<tr><td>pyserial / grpcio</td><td>3.5 / 1.74.0</td><td>—</td></tr>
</tbody></table></div>
<p>Встроенная справка SDK на русском находится в <code>pioneer_sdk2-0.15.1.dist-info/METADATA</code> (966 строк) — это фактически официальная документация.</p>
<p>Зависимости SDK: <code>numpy==1.26.4</code>, <code>opencv-python==4.10.0.84</code>, <code>pyserial==3.5</code>. Поддерживаются Windows 10/11, Linux, macOS (Apple Silicon).</p>

<h2 id="connect">2. Подключение и автомат состояний</h2>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_sdk2 <span class="tok-k">import</span> Pioneer

drone = Pioneer()                                   <span class="tok-c"># TCP 127.0.0.1:20556 (PlazLink)</span>
<span class="tok-c"># Pioneer(serial="/dev/ttyS3", baudrate=57600)       # прямое подключение по UART</span>
<span class="tok-c"># Pioneer(tcp="host:port", wait_callback=True, safety_command=True, logger=True)</span>

drone.close_connection()</code></pre></div>
<div class="tablewrap"><table>
<thead><tr><th>Параметр</th><th>Описание</th></tr></thead>
<tbody>
<tr><td><code>serial</code></td><td>Последовательный порт</td></tr>
<tr><td><code>tcp</code></td><td>127.0.0.1:20556</td></tr>
<tr><td><code>wait_callback</code></td><td>true — ждать события</td></tr>
<tr><td><code>safety_command</code></td><td>true — проверять состояние</td></tr>
</tbody></table></div>
<p>При <code>wait_callback=True</code> и <code>safety_command=True</code> работает контроль последовательности <strong>ON_LAND → ARMED → IN_SKY → ON_LAND</strong>:</p>
<ul>
<li>команда не из текущего состояния — игнорируется (возвращает <code>False</code>);</li>
<li>пропуск обязательного этапа — исключение <code>RuntimeError</code>;</li>
<li>контроль действует только в рамках одной программы.</li>
</ul>

<h2 id="flight">3. Управление полётом</h2>
<h3 id="flight-basic">Основные команды</h3>
<div class="tablewrap"><table>
<thead><tr><th>Метод</th><th>Назначение</th></tr></thead>
<tbody>
<tr><td><code>arm(timeout=5, retries=0)</code></td><td>Запуск моторов (ждёт <code>ENGINES_STARTED</code>)</td></tr>
<tr><td><code>disarm()</code></td><td>Отключение моторов</td></tr>
<tr><td><code>takeoff()</code></td><td>Взлёт (ждёт <code>TAKEOFF_COMPLETE</code>)</td></tr>
<tr><td><code>land()</code></td><td>Посадка (ждёт <code>COPTER_LANDED</code>)</td></tr>
<tr><td><code>rtl()</code></td><td>Возврат домой</td></tr>
<tr><td><code>reboot_board()</code></td><td>Перезагрузка платы</td></tr>
<tr><td><code>point_reached()</code> / <code>point_deceleration()</code></td><td>Достижение/торможение у точки</td></tr>
</tbody></table></div>
<h3 id="flight-nav">Навигация</h3>
<div class="tablewrap"><table>
<thead><tr><th>Метод</th><th>Назначение</th></tr></thead>
<tbody>
<tr><td><code>go_to_local_point(x, y, z, yaw, time=0)</code></td><td>Локальная точка (м, °); time=0 — текущая скорость</td></tr>
<tr><td><code>go_to_local_point_body_fixed(x, y, z, yaw, time=0)</code></td><td>Смещение относительно текущей позиции</td></tr>
<tr><td><code>go_to_global_point(lat, lon, alt, yaw=0)</code></td><td>Глобальная точка по GPS</td></tr>
<tr><td><code>go_to_global_point_relative(lat, lon, alt, yaw)</code></td><td>Смещение по GPS</td></tr>
<tr><td><code>set_yaw(yaw)</code></td><td>Угол рыскания (°)</td></tr>
<tr><td><code>set_manual_speed(vx, vy, vz, yaw_rate, interval=1.0)</code></td><td>Скорость (м/с, рад/с) в глоб. СК</td></tr>
<tr><td><code>set_manual_speed_body_fixed(...)</code></td><td>Скорость относительно корпуса</td></tr>
</tbody></table></div>
<h3 id="flight-state">Состояние и параметры</h3>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_sdk2 <span class="tok-k">import</span> Pioneer, FlyState, NavSystem

state = drone.get_fly_state()          <span class="tok-c"># ON_LAND / ARMED / IN_SKY</span>
nav   = drone.get_nav_system()         <span class="tok-c"># GPS / LPS / OPT</span>
drone.set_param(<span class="tok-s">"Copter_flyWithoutRc"</span>, <span class="tok-n">1.0</span>)
drone.led_control(<span class="tok-n">255</span>, <span class="tok-n">0</span>, <span class="tok-n">1</span>, <span class="tok-n">0</span>)          <span class="tok-c"># все LED — зелёный</span>
drone.grab_open(velocity=<span class="tok-n">100</span>)</code></pre></div>

<h2 id="telemetry">4. Телеметрия и датчики</h2>
<div class="tablewrap"><table>
<thead><tr><th>Метод</th><th>Результат</th></tr></thead>
<tbody>
<tr><td><code>get_battery_status()</code></td><td>tuple(напряжение, температура) | None</td></tr>
<tr><td><code>get_orientation()</code></td><td>tuple(roll, pitch, yaw)</td></tr>
<tr><td><code>get_accel()</code> / <code>get_gyro()</code> / <code>get_mag()</code></td><td>tuple(x, y, z)</td></tr>
<tr><td><code>get_altitude()</code></td><td>высота, м</td></tr>
<tr><td><code>get_dist_sensor_data()</code></td><td>дальность (ToF), м</td></tr>
<tr><td><code>get_motors_rpm()</code></td><td>list[4] оборотов</td></tr>
<tr><td><code>get_ranger_data()</code></td><td>(право, лево, вперёд, назад, верх/низ), м</td></tr>
<tr><td><code>get_local_position_lps()</code> / <code>get_local_velocity_lps()</code></td><td>tuple(x, y, z) / tuple(vx, vy, vz)</td></tr>
<tr><td><code>get_local_yaw_lps()</code></td><td>угол, −180…+180°</td></tr>
<tr><td><code>get_nav_status_lps()</code> / <code>get_nav_status_gps()</code></td><td>NO_DATA / CANNOT / LOW / OK</td></tr>
<tr><td><code>get_optical_data()</code></td><td>tuple[int, int, float] (оптический поток)</td></tr>
<tr><td><code>get_global_position_gps()</code> / <code>get_global_velocity_gps()</code></td><td>координаты / скорости (GPS)</td></tr>
<tr><td><code>get_satellites_count()</code></td><td>tuple(GPS, ГЛОНАСС)</td></tr>
<tr><td><code>time()</code> / <code>uptime()</code> / <code>flight_time()</code></td><td>секунды</td></tr>
</tbody></table></div>
<h3 id="telemetry-states">Классы состояний</h3>
<ul>
<li><code>FlyState</code>: <code>ON_LAND</code>, <code>ARMED</code>, <code>IN_SKY</code></li>
<li><code>NavSystem</code>: <code>GPS</code>, <code>LPS</code>, <code>OPT</code></li>
<li><code>NavStatus</code>: <code>NO_DATA</code>, <code>CANNOT</code>, <code>LOW</code>, <code>OK</code></li>
</ul>

<h2 id="events">5. События и field_watcher</h2>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_sdk2 <span class="tok-k">import</span> Pioneer, Event

<span class="tok-k">def</span> <span class="tok-b">on_point</span>(ev):
    <span class="tok-b">print</span>(<span class="tok-s">"Точка достигнута"</span>)

drone.subscribe(on_point, Event.POINT_REACHED)

<span class="tok-c"># подписка на изменение произвольного поля телеметрии</span>
watcher = {<span class="tok-s">"comp"</span>: <span class="tok-s">"SmartBoard"</span>, <span class="tok-s">"field"</span>: <span class="tok-s">"rcServo"</span>,
           <span class="tok-s">"callback"</span>: <span class="tok-k">lambda</span> v: <span class="tok-b">print</span>(<span class="tok-s">"rcServo ="</span>, v),
           <span class="tok-s">"last_value"</span>: <span class="tok-k">None</span>}
drone.field_watcher.append(watcher)</code></pre></div>
<p><strong>Список событий <code>Event</code>:</strong> <code>ALL</code>, <code>COPTER_LANDED</code>, <code>LOW_VOLTAGE1</code>, <code>LOW_VOLTAGE2</code>, <code>LOW_CHARGE</code>, <code>POINT_REACHED</code>, <code>POINT_DECELERATION</code>, <code>TAKEOFF_COMPLETE</code>, <code>ENGINES_STARTED</code>, <code>SHOCK</code>.</p>

<h2 id="camera">6. Камеры и запись</h2>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_sdk2 <span class="tok-k">import</span> Camera, CameraType, ImageViewer, RecorderControl

cam = Camera(CameraType.MAIN)            <span class="tok-c"># MAIN / OPT (из board_config.json)</span>
frame = cam.get_cv_frame(timeout=<span class="tok-n">5.0</span>)   <span class="tok-c"># numpy BGR</span>

iv = ImageViewer()                       <span class="tok-c"># публикация в RTSP mediamtx</span>
iv.imshow(<span class="tok-s">"test"</span>, frame)                 <span class="tok-c"># rtsp://localhost:8554/test</span>

rec = RecorderControl()
rec.get_camera_recording_configs(CameraType.MAIN)   <span class="tok-c"># [RecordingConfig(w,h,fps)]</span>
rec.start_recording(CameraType.MAIN, output_dir=<span class="tok-s">"/mnt/media/videos/"</span>)
rec.take_photo(<span class="tok-s">"shot.jpg"</span>, CameraType.MAIN, output_dir=<span class="tok-s">"/mnt/media/photos/"</span>)
rec.stop_recording(CameraType.MAIN)

cam.stop(); iv.close()</code></pre></div>
<div class="tablewrap"><table>
<thead><tr><th>Драйвер</th><th>Особенность</th></tr></thead>
<tbody>
<tr><td>gstreamer</td><td>захват из shared memory <code>/tmp/{maincamera,optcamera}</code>; поддерживает <code>ImageViewer</code></td></tr>
<tr><td>rtsp</td><td><code>Camera(camera_type, camera_ip="10.42.0.1:8554")</code></td></tr>
</tbody></table></div>
<p>Режимы записи/фото берутся из <code>board_config.json</code> (поле <code>recordable</code>): MAIN — до 4K/2K/FullHD/720p, OPT — 1280×800. Запись идёт через <code>pm2-jmp-camera-control</code>.</p>

<h2 id="servo">7. Сервопривод камеры</h2>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_sdk2 <span class="tok-k">import</span> ServoCamera, ServoPriority

servo = ServoCamera()
servo.set_angle(<span class="tok-n">-45</span>, ServoPriority.HIGH)   <span class="tok-c"># диапазон -80…+30°, HIGH/MEDIUM/LOW</span></code></pre></div>
<p>Команда уходит в Unix-сокет <code>/tmp/servo.sock</code> и исполняется службой <code>pwm-servo</code> (PWM chip0).</p>

<h2 id="rc">8. RC-каналы</h2>
<p>Перед использованием требуется выставить параметры автопилота:</p>
<div class="codewrap"><pre><code data-lang="python">Copter_man_rcMode0 = <span class="tok-n">6.0</span>
Copter_man_rcMode1 = <span class="tok-n">3.0</span>
Copter_man_rcMode2 = <span class="tok-n">3.0</span>
Copter_flyWithoutRc = <span class="tok-n">1.0</span>
SensorMux_rc = <span class="tok-n">2.0</span>

<span class="tok-c"># непрерывная отправка каналов для поддержания связи</span>
drone.send_rc_channels(channel_1=<span class="tok-n">0</span>, channel_2=<span class="tok-n">0</span>, channel_3=<span class="tok-n">0</span>,
                       channel_4=<span class="tok-n">0</span>, channel_5=<span class="tok-n">1</span>)
ch5, ch7 = drone.rc_sdk1_to_sdk2(...)   <span class="tok-c"># конвертация из SDK1</span></code></pre></div>
<ul>
<li><code>channel_1</code> — правый джойстик: −1 влево, 0, +1 вправо</li>
<li><code>channel_2</code> — правый джойстик: −1 вперёд, 0, +1 назад</li>
<li><code>channel_3</code> — левый джойстик: −1 вниз, 0, +1 вверх</li>
<li><code>channel_4</code> — левый джойстик: +1 влево, 0, −1 вправо</li>
<li><code>channel_5</code> — режим управления; 6–8 — дополнительные</li>
</ul>

<h2 id="npu">9. ИИ на NPU (pioneer_rknn)</h2>
<p>Модели берутся из локального реестра <code>http://127.0.0.1:7777/model</code> (Flask) либо по пути к <code>.rknn</code> файлу.</p>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_rknn <span class="tok-k">import</span> Yolo, YoloPose, PaddleOCR, ModelRegistry

model = Yolo(model_name=<span class="tok-s">"yolov8n"</span>, object_thresh=<span class="tok-n">0.5</span>)     <span class="tok-c"># arch: yolov8, yolov11</span>
boxes, classes, scores = model.run([img])            <span class="tok-c"># img: (1,640,640,3) uint8 BGR</span>
model.release()

pose = YoloPose(model_name=<span class="tok-s">"yolov8n-pose"</span>)            <span class="tok-c"># 17 кейпойнтов COCO</span>
ocr  = PaddleOCR(det_model_name=<span class="tok-s">"PP-OCRv5_mobile_det"</span>,
                 rec_model_name=<span class="tok-s">"eslav_PP-OCRv5_mobile_rec"</span>)
boxes, texts = ocr.run(img)                          <span class="tok-c"># [(текст, уверенность), …]</span></code></pre></div>
<h3 id="npu-models">Доступные модели в реестре</h3>
<div class="tablewrap"><table>
<thead><tr><th>Имя</th><th>Архитектура</th><th>Версия</th></tr></thead>
<tbody>
<tr><td><code>yolov8n</code></td><td>yolov8</td><td>1.0.0</td></tr>
<tr><td><code>yolov8n-pose</code></td><td>yolov8-pose</td><td>1.0.0</td></tr>
<tr><td><code>PP-OCRv5_mobile_det</code></td><td>PP-OCRv5_mobile_det</td><td>0.0.0</td></tr>
<tr><td><code>eslav_PP-OCRv5_mobile_rec</code></td><td>PP-OCRv5_mobile_rec</td><td>0.0.0</td></tr>
</tbody></table></div>
<h3 id="npu-registry">Управление реестром</h3>
<div class="codewrap"><pre><code data-lang="python">reg = ModelRegistry()
reg.list_model()
reg.get_model_info(<span class="tok-s">"yolov8n"</span>)
reg.upload_model(<span class="tok-s">"my_model"</span>, <span class="tok-s">"1.0.0"</span>, <span class="tok-s">"model.rknn"</span>, <span class="tok-s">"yolov8"</span>)
reg.delete_model(<span class="tok-s">"my_model"</span>)</code></pre></div>
<p><code>ModelContainer</code> сам определяет чип по <code>/proc/device-tree/compatible</code> (RK3576) и запускает инференс на NPU-ядре.</p>
<p><strong>Класс ключевых точек YoloPose:</strong> NOSE 0, LEFT/RIGHT_EYE 1/2, LEFT/RIGHT_EAR 3/4, LEFT/RIGHT_SHOULDER 5/6, LEFT/RIGHT_ELBOW 7/8, LEFT/RIGHT_WRIST 9/10, LEFT/RIGHT_HIP 11/12, LEFT/RIGHT_KNEE 13/14, LEFT/RIGHT_ANKLE 15/16.</p>

<h2 id="blockly">10. Визуальное программирование (Blockly)</h2>
<p><code>pioneer-bricks</code> (порт 2020) хранит программы как Blockly-XML и генерирует Python. Пример <code>flight_test</code> использует блоки:</p>
<ul>
<li><code>start_block</code></li>
<li><code>preflight</code></li>
<li><code>take_off</code></li>
<li><code>go_local_point</code></li>
<li><code>controls_whileUntil</code></li>
<li><code>not_point_reached</code></li>
<li><code>cam_get_cv_frame</code></li>
<li><code>imshow</code></li>
<li><code>landing</code></li>
</ul>
<p>Эквивалент на Python:</p>
<div class="codewrap"><pre><code data-lang="python">pioneer.arm()
pioneer.takeoff()
pioneer.go_to_local_point(<span class="tok-n">0</span>, <span class="tok-n">1</span>, <span class="tok-n">1</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>)
<span class="tok-k">while</span> <span class="tok-k">not</span> pioneer.point_reached():
    img = cam_main.get_cv_frame()
    iv.imshow(<span class="tok-s">"test"</span>, img)
pioneer.land()</code></pre></div>

<h2 id="onboard-examples">11. Готовые примеры на борту</h2>
<div class="tablewrap"><table>
<thead><tr><th>Файл</th><th>Что показывает</th></tr></thead>
<tbody>
<tr><td><code>/home/pioneermini/workspace/py.py</code></td><td>Маршрут по точкам с подпиской на <code>POINT_REACHED</code></td></tr>
<tr><td><code>/opt/scripts/test_nn.py</code></td><td>YOLO + ArUco + OpenCV, LED-индикация (многопоточно)</td></tr>
<tr><td><code>/opt/scripts/servo_rc_trigger.py</code></td><td>Серво по RC-триггеру через <code>field_watcher</code></td></tr>
<tr><td><code>/opt/scripts/servo_example.py</code></td><td>Ручное управление углом серво</td></tr>
<tr><td><code>/opt/tests/cam/*.py</code></td><td>Тесты камер, ToF (<code>lasercam.py</code>), EEPROM, серво</td></tr>
<tr><td><code>pioneer-bricks/static/save/flight_test/</code></td><td>Пример блочной программы (XML + Python)</td></tr>
</tbody></table></div>
<p>Запуск: <code>python3 файл.py</code> по SSH либо через <strong>code-server</strong> на <code>http://10.42.1.1:9999</code> (рабочая папка <code>/home/pioneermini/workspace</code>).</p>

<h2 id="full-examples">12. Полные примеры</h2>
<h3 id="full-py">Маршрут по точкам (py.py)</h3>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_sdk2 <span class="tok-k">import</span> Pioneer
<span class="tok-k">import</span> pioneer_sdk2, threading, time

drone = Pioneer()
point_event = threading.Event()

<span class="tok-k">def</span> <span class="tok-b">point_reached</span>(event): point_event.set()

drone.subscribe(point_reached, pioneer_sdk2.Event.POINT_REACHED)

<span class="tok-k">try</span>:
    drone.arm()
    drone.takeoff()
    time.sleep(<span class="tok-n">3</span>)
    <span class="tok-k">for</span> (x, y) <span class="tok-k">in</span> [(<span class="tok-n">0</span>,<span class="tok-n">0</span>), (<span class="tok-n">1</span>,<span class="tok-n">0</span>), (<span class="tok-n">1</span>,<span class="tok-n">2</span>), (<span class="tok-n">-1</span>,<span class="tok-n">2</span>), (<span class="tok-n">-1</span>,<span class="tok-n">0</span>), (<span class="tok-n">0</span>,<span class="tok-n">0</span>)]:
        drone.go_to_local_point(x=x, y=y, z=<span class="tok-n">1</span>, yaw=<span class="tok-n">0</span>, time=<span class="tok-n">3</span>)
        point_event.wait(); point_event.clear()
    drone.land()
<span class="tok-k">except</span> KeyboardInterrupt:
    drone.land()
<span class="tok-k">finally</span>:
    drone.close_connection()</code></pre></div>
<h3 id="full-nn">YOLO + ArUco (фрагмент test_nn.py)</h3>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_sdk2 <span class="tok-k">import</span> Camera, ImageViewer, Pioneer
<span class="tok-k">from</span> pioneer_rknn <span class="tok-k">import</span> Yolo
<span class="tok-k">import</span> cv2, numpy <span class="tok-k">as</span> np

model = Yolo(model_name=<span class="tok-s">"yolov8n"</span>, object_thresh=<span class="tok-n">0.5</span>)
cam   = Camera()
iv    = ImageViewer()
aruco = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_ARUCO_ORIGINAL)

<span class="tok-k">while</span> <span class="tok-k">True</span>:
    img = cam.get_cv_frame()
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    boxes, classes, scores = model.run([np.expand_dims(cv2.resize(img, [<span class="tok-n">640</span>,<span class="tok-n">640</span>]), <span class="tok-n">0</span>)])
    corners, ids, _ = cv2.aruco.detectMarkers(gray, aruco)
    iv.imshow(<span class="tok-s">"XYZ"</span>, img)</code></pre></div>

<h2 id="notes">13. Нюансы и требования</h2>
<ul>
<li>SDK требует поднятого <code>plazlink-core</code> (мост к полётному контроллеру по <code>ttyS3</code>).</li>
<li>Камеры требуют <code>media-server</code> (mediamtx) и shared memory <code>/tmp/maincamera</code>, <code>/tmp/optcamera</code>.</li>
<li>Запись/фото — только при установленном <code>pm2-jmp-camera-control</code>.</li>
<li>GPS-методы — при наличии модуля GNSS; <code>ranger</code>/<code>grab</code> — при установленной нагрузке (в <code>board_config.json</code>: <code>ranger=true, grab=true, cargo=false</code>).</li>
<li><code>CameraType</code> генерируется динамически из секции <code>cameras</code> файла <code>board_config.json</code>.</li>
<li>Событийное управление позволяет реализовать неблокирующую логику.</li>
</ul>
