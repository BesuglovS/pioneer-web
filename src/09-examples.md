---
layout: layout.njk
title: "Примеры"
description: "Примеры программ для Пионер Мини 2: полёты, телеметрия, камера, ArUco, следование за человеком"
pageNumber: 9
pageSlug: "examples"
---

<h1>Примеры программ</h1>
<p>Официальные демонстрационные примеры собраны в репозитории <a href="https://gitflic.ru/project/pioneer-team/pioneer-sdk2-example" target="_blank" rel="noopener"><strong>pioneer-team/pioneer-sdk2-example</strong></a> (GitFlic). Примеры рассчитаны на учебное использование: от чтения телеметрии и работы с камерой до простых полётных миссий, ArUco-навигации и управления по жестам.</p>

<h2 id="ex-walkthroughs">Разборы примеров</h2>
<p>Для каждой группы примеров на сайте есть отдельная страница разбора: как устроен код, какие методы SDK применяются и на что обратить внимание при запуске.</p>
<div class="tablewrap"><table>
<thead><tr><th>Разбор</th><th>Примеры</th><th>Содержание</th></tr></thead>
<tbody>
<tr><td><a href="/examples/mission/">Полётные миссии</a></td><td><code>mission_examples/</code></td><td>Полёт по точкам с событием <code>POINT_REACHED</code>, окружность с видео, ручная скорость</td></tr>
<tr><td><a href="/examples/get-telemetry/">Телеметрия</a></td><td><code>get_telemetry/</code></td><td>17 скриптов: аккумулятор, позиция, скорость, навигация, датчики</td></tr>
<tr><td><a href="/examples/camera/">Камера</a></td><td><code>camera_examples/</code></td><td>Кадры, RTSP через <code>ImageViewer</code>, сервокамера, калибровка</td></tr>
<tr><td><a href="/examples/aruco/">ArUco</a></td><td><code>aruco_examples/</code></td><td>Детекция меток, координаты через <code>solvePnP</code>, полёт с удержанием метки</td></tr>
<tr><td><a href="/examples/rc-channels/">RC-каналы</a></td><td><code>rc_channels_examples/</code></td><td>Каналы управления SDK2, параметры автопилота, WASD-управление</td></tr>
<tr><td><a href="/examples/human-tracking/">Сопровождение человека</a></td><td><code>human_tracking/</code></td><td>YOLO Pose из Pioneer-RKNN, разворот к человеку, управление жестами</td></tr>
<tr><td><a href="/examples/wasd-flight/">WASD_flight.py</a></td><td><code>WASD_flight.py</code></td><td>Интерактивное управление с клавиатуры через SSH с видеопотоком</td></tr>
<tr><td><a href="/examples/events/">События автопилота</a></td><td><code>subscribe_event.py</code>, <code>unsubscribe_event.py</code></td><td>Подписка колбэков на события автопилота и отписка</td></tr>
</tbody></table></div>

<h2 id="ex-struct">Структура репозитория</h2>
<div class="codewrap"><pre><code data-lang="text">.
├── aruco_examples          # поиск ArUco-меток, координаты метки, полет с удержанием метки
├── camera_examples         # кадры, RTSP-трансляция через ImageViewer, сервокамера, калибровка
├── get_telemetry           # аккумулятор, положение, скорость, навигация, датчики
├── human_tracking          # сопровождение человека и распознавание жестов (Pioneer-RKNN)
├── mission_examples        # взлет, полет в точки, движение по окружности, ручная скорость
├── rc_channels_examples    # настройка автопилота, ручные каналы, конвертация из SDK1
├── subscribe_event.py      # подписка на события автопилота
├── unsubscribe_event.py    # отписка от событий
├── WASD_flight.py          # управление дроном и сервокамерой с клавиатуры + видеопоток
└── README.md</code></pre></div>

<h2 id="ex-groups">Группы примеров</h2>
<p>Краткая сводка (подробности — в разборах выше):</p>
<div class="tablewrap"><table>
<thead><tr><th>Группа</th><th>Содержание</th></tr></thead>
<tbody>
<tr><td><code>camera_examples</code></td><td>Получение кадров, RTSP-трансляция через <code>ImageViewer</code>, поворот сервокамеры и калибровка камеры.</td></tr>
<tr><td><code>get_telemetry</code></td><td>Чтение состояния аккумулятора, положения, скорости, навигации и данных датчиков.</td></tr>
<tr><td><code>mission_examples</code></td><td>Взлёт, полёт в локальные точки, движение по окружности и ручное задание скорости.</td></tr>
<tr><td><code>aruco_examples</code></td><td>Поиск ArUco-меток, расчёт координат метки и полёт с удержанием метки.</td></tr>
<tr><td><code>rc_channels_examples</code></td><td>Настройка автопилота, отправка каналов ручного управления, конвертация значений из формата SDK1.</td></tr>
<tr><td><code>human_tracking</code></td><td>Сопровождение человека и распознавание жестов через <code>Pioneer-RKNN</code>.</td></tr>
<tr><td><code>WASD_flight.py</code></td><td>Интерактивное управление дроном и сервокамерой с клавиатуры с видеопотоком.</td></tr>
<tr><td><code>subscribe_event.py</code> / <code>unsubscribe_event.py</code></td><td>Подписка и отписка от событий автопилота.</td></tr>
</tbody></table></div>

<h2 id="ex-req">Требования</h2>
<ul>
<li>Python 3.12.</li>
<li>Установленная и настроенная библиотека <code>pioneer_sdk2</code>.</li>
<li><code>opencv-python</code> и <code>numpy</code> — для примеров камеры и ArUco.</li>
<li><code>pioneer_rknn</code> — для примера <code>human_tracking</code>.</li>
</ul>
<p>Примеры с <code>ImageViewer</code> предполагают конфигурацию камеры с драйвером <code>gstreamer</code>. На конфигурациях с <code>rtsp</code> класс <code>ImageViewer</code> может быть недоступен.</p>

<h2 id="ex-run">Запуск</h2>
<p>Перейдите в нужную директорию и запустите выбранный файл:</p>
<div class="codewrap"><pre><code data-lang="bash" class="bash">python3 camera_stream.py</code></pre></div>
<p>Для полётных примеров проверьте зону полёта, заряд аккумулятора, систему навигации и возможность аварийной посадки. Большинство полётных скриптов завершают соединение с дроном в <code>finally</code>, но физическая безопасность зависит от корректной подготовки площадки. Примеры с камерой и <code>ImageViewer</code> запускаются на борту Мини 2.</p>

<h2 id="ex-viewer">Видеопоток ImageViewer</h2>
<p><code>ImageViewer</code> публикует обработанный кадр по имени потока:</p>
<div class="codewrap"><pre><code data-lang="python">viewer = ImageViewer()
viewer.imshow(name="video", frame=frame, fps=30)</code></pre></div>
<p>Поток <code>video</code> доступен по адресу:</p>
<div class="codewrap"><pre><code data-lang="text">rtsp://10.42.0.1:8889/video/</code></pre></div>
<p>Для других примеров имя потока указано в README соответствующей директории.</p>

<h2 id="ex-typical">Типовые задачи (из официальной документации)</h2>
<ul>
<li>Управление через клавиатуру с видео и управлением грузом (адаптация примера Pioneer-SDK).</li>
<li>Смена цвета светодиодов в зависимости от высоты (определение высоты по дальномеру).</li>
<li>Полёт по окружности с видео.</li>
<li>Калибровка камеры для ArUco-маркеров, обнаружение маркера и его координат.</li>
<li>Следование за ArUco-маркером.</li>
<li>Вывод изображения с камеры без обработки (класс VideoStream из Pioneer-SDK 1).</li>
</ul>
