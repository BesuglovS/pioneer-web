---
layout: layout.njk
title: "Свои нейросети на NPU"
description: "Обучение, экспорт в ONNX (opset=19), конвертация в RKNN и регистрация собственной модели в model-registry Пионер Мини 2"
pageNumber: 21
pageSlug: "custom-models"
---

<h1>Свои нейросети на NPU</h1>
<p>Пионер Мини 2 выполняет инференс нейросетей прямо на борту — на NPU процессора RK3576 через библиотеку <code>pioneer_rknn</code>. Можно использовать готовые модели или обучить и зарегистрировать собственную. Этот урок описывает полный маршрут: от обучения до запуска на борту.</p>

<h2 id="pipeline">Маршрут модели</h2>
<div class="codewrap"><pre><code data-lang="text">обучение (PyTorch/Ultralytics)
      │
      ▼
экспорт в ONNX  (opset=19)
      │
      ▼
конвертация в RKNN  (rknn-toolkit2, x86 Linux)
      │
      ▼
загрузка на борт  (сервис «Модели ИИ», :7777)
      │
      ▼
инференс  (pioneer_rknn, NPU)</code></pre></div>

<h2 id="train">1. Обучение</h2>
<p>Модель обучается на компьютере (не на борту). Для детекции удобно использовать Ultralytics YOLO; для поз — YOLO-pose. Рекомендованный набор библиотек для обучения приведён в уроке <a href="/02-start/">«Быстрый старт»</a> (раздел «Модели ИИ»).</p>
<p>Поддерживаемые на борту архитектуры (по данным <code>model-registry</code>):</p>
<div class="tablewrap"><table>
<thead><tr><th>Архитектура</th><th>Задача</th></tr></thead>
<tbody>
<tr><td><code>yolov8</code></td><td>Детекция объектов</td></tr>
<tr><td><code>yolov8-pose</code></td><td>Оценка позы (скелет)</td></tr>
<tr><td><code>PP-OCRv5_mobile_det</code> / <code>PP-OCRv5_mobile_rec</code></td><td>Распознавание текста (детекция и распознавание)</td></tr>
<tr><td><code>custom</code></td><td>Своя архитектура (без авто-постобработки)</td></tr>
</tbody></table></div>

<h2 id="export">2. Экспорт в ONNX (opset=19)</h2>
<p>Экспортируйте модель в ONNX с <strong>opset=19</strong> — именно этот вариант принимает сервис загрузки моделей на борту. Пример для Ultralytics:</p>
<div class="codewrap"><pre><code data-lang="python">model.export(format=<span class="tok-s">"onnx"</span>, opset=<span class="tok-n">19</span>, simplify=<span class="tok-k">True</span>, imgsz=<span class="tok-n">640</span>)
</code></pre></div>

<h2 id="convert">3. Конвертация в RKNN</h2>
<p>RKNN-модель собирается утилитой <strong>rknn-toolkit2</strong> на компьютере под Linux x86_64. На борту установлена только <code>rknn-toolkit-lite2</code> (инференс) и <code>librknnrt</code> — конвертация на коптере не выполняется. Для конвертации нужны целевая платформа RK3576 и калибровочный датасет (для квантования).</p>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> rknn.api <span class="tok-k">import</span> RKNN

rknn = RKNN()
rknn.config(target_platform=<span class="tok-s">"rk3576"</span>)
rknn.load_onnx(model=<span class="tok-s">"best.onnx"</span>)
rknn.build(do_quantization=<span class="tok-k">True</span>, dataset=<span class="tok-s">"dataset.txt"</span>)
rknn.export_rknn(<span class="tok-s">"best.rknn"</span>)
</code></pre></div>

<h2 id="upload">4. Загрузка и регистрация на борту</h2>
<ol>
<li>Подключитесь к коптеру и откройте сервис <a href="http://10.42.0.1:7777/" target="_blank" rel="noopener">«Модели ИИ»</a>.</li>
<li>Загрузите <code>.rknn</code>-файл кнопкой <code>Загрузить модель</code>.</li>
<li>Укажите архитектуру (<code>yolov8</code>, <code>yolov8-pose</code>, <code>PP-OCRv5_*</code> или <code>custom</code>) и описание.</li>
</ol>
<p>Реестр хранится в <code>/usr/local/bin/model-registry/models</code>, список — в <code>list.json</code> (см. <a href="/11-system/">аудит системы</a>).</p>

<h2 id="run">5. Запуск на борту</h2>
<p>Инференс выполняется классом <code>Yolo</code> из <code>pioneer_rknn</code> (а также <code>YoloPose</code>, <code>PaddleOCR</code>, <code>ModelRegistry</code>). Полный разбор — в уроке <a href="/06-rknn/">«Нейросети (RKNN)»</a> и <a href="/sdk2/neural/">справочнике</a>.</p>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_rknn <span class="tok-k">import</span> Yolo
<span class="tok-k">from</span> pioneer_sdk2 <span class="tok-k">import</span> Camera, CameraType

yolo = Yolo(model_name=<span class="tok-s">"yolov8n"</span>)
cam = Camera(CameraType.MAIN)
frame = cam.get_cv_frame()
boxes, scores, classes = yolo.inference(frame)
</code></pre></div>

<h2 id="tips">Практические советы</h2>
<ul>
<li>Начинайте с готовой <code>yolov8n</code> и лишь затем обучайте свою — так проще проверить весь маршрут.</li>
<li>Качество модели на NPU зависит от квантования: подбирайте репрезентативный калибровочный набор.</li>
<li>Проверяйте входной размер (<code>imgsz</code>) — он должен совпадать с тем, что ожидает постобработка.</li>
<li>Нагрузка NPU повышает температуру борта — следите за термозонами (см. <a href="/16-troubleshooting/">Диагностику</a>).</li>
</ul>

<h2 id="links">См. также</h2>
<ul>
<li><a href="/06-rknn/">Нейросети (RKNN)</a>.</li>
<li><a href="/02-start/">Быстрый старт</a> — сервис «Модели ИИ».</li>
<li><a href="/11-system/">Исследование системы</a> — версии RKNN и список моделей.</li>
</ul>
