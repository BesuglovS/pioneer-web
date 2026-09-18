---
layout: layout.njk
title: "Нейросети (RKNN)"
description: "Pioneer-RKNN — инференс нейросетей на борту Пионер Мини 2: YOLO, YOLOSeg, YOLOPose, PaddleOCR, жесты, собственные модели"
pageNumber: 6
pageSlug: "rknn"
---

<h1>Pioneer-RKNN — нейросети на борту</h1>
<p><code>pioneer_rknn</code> — набор классов и функций для работы с моделями машинного обучения на бортовом нейроускорителе Пионера Мини 2. Поддерживаются детекция объектов (YOLO), сегментация (YOLOSeg), оценка поз (YOLOPose), распознавание текста (PaddleOCR) и загрузка собственных моделей. Инференс выполняется прямо на коптере — без внешнего сервера.</p>

<section class="docblock"><h2 id="s-pioneer-rknn"><a class="anchor" href="#s-pioneer-rknn" aria-hidden="true">§</a>Pioneer-RKNN</h2>
<p>Представляет собой набор классов и функций для работы с моделями машинного обучения</p>
<h3 id="s-поддержка-pioneer-rknn-квадрокоптерами-серии-пионер"><a class="anchor" href="#s-поддержка-pioneer-rknn-квадрокоптерами-серии-пионер" aria-hidden="true">§</a>Поддержка Pioneer-RKNN квадрокоптерами серии Пионер</h3>
<div class="tablewrap"><table><thead><tr><th>Квадрокоптеры</th><th>Pioneer-RKNN</th><th>Взаимодействие через:</th></tr></thead><tbody><tr><td>Мини 2</td><td>✅</td><td>PioneerOS (предустановлен)</td></tr><tr><td>Мини</td><td>❌</td><td>❌</td></tr><tr><td>Базовый</td><td>✅</td><td>модуль radxa zero</td></tr><tr><td>FPV</td><td>❌</td><td>❌</td></tr><tr><td>Макс (ROS программирование)</td><td>❌</td><td>❌</td></tr></tbody></table></div>
<h3 id="s-ai-модели-и-поддерживаемые-архитектуры"><a class="anchor" href="#s-ai-модели-и-поддерживаемые-архитектуры" aria-hidden="true">§</a>AI модели и поддерживаемые архитектуры</h3>
<div class="tablewrap"><table><thead><tr><th>Yolo</th><th>YoloSeg</th><th>YoloPose</th><th>PaddleOCR</th></tr></thead><tbody><tr><td>yolov8</td><td>yolov8-seg</td><td>yolov8-pose</td><td>PP-OCRv5_mobile_det</td></tr><tr><td>yolov11</td><td>yolov11-seg</td><td></td><td>PP-OCRv5_mobile_rec</td></tr><tr><td>yolov26</td><td>yolov26-seg</td><td></td><td></td></tr></tbody></table></div>
<h3 id="s-запуск-python-скрипта"><a class="anchor" href="#s-запуск-python-скрипта" aria-hidden="true">§</a>Запуск Python скрипта</h3>
<p>В целях безопасности, при выполнении полётного задания, автопилот проверяет &quot;наличие пилота&quot; и при его отсутствии откажется выполнять полёт. Подключите пульт управления и переведите тумблер <code>SWB</code> в нижнее положение, при необходимости, проверку можно отключить отредактировав параметр <code>Copter_flyWithoutRc = 1</code> в конфигураторе Pioneer Station, а непосредственно запуск производится в используемой вами IDE, например, Visual Studio Code.</p>
<h3 id="s-примеры-скриптов"><a class="anchor" href="#s-примеры-скриптов" aria-hidden="true">§</a>Примеры скриптов</h3>
<p>Более подробное описание примеров для работы с библиотекой Pioneer-RKNN в GitFlic.</p>
<h4 id="s-переопределение-метода-run-для-использования-с-собственной-м"><a class="anchor" href="#s-переопределение-метода-run-для-использования-с-собственной-м" aria-hidden="true">§</a>Переопределение метода run для использования с собственной моделью</h4>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_rknn <span class="tok-k">import</span> ModelContainer <span class="tok-c"># импортируем класс ModelContainer из библиотеки pioneer_rknn</span>

<span class="tok-k">class</span> MyAiClass(ModelContainer):        <span class="tok-c"># создаем собственный класс наследуя возможности класса ModelContainer</span>
    arch = ["myarch"]                   <span class="tok-c"># имя архитектуры вашей модели, необходимо для поиска в регистре моделей</span>

    <span class="tok-c"># создаем конструктор класса</span>
    <span class="tok-k">def</span> __init__(<span class="tok-b">self</span>, model_path: <span class="tok-b">str</span> | <span class="tok-k">None</span> = <span class="tok-k">None</span>, model_name: <span class="tok-b">str</span> | <span class="tok-k">None</span> = <span class="tok-k">None</span>, npu_core: <span class="tok-b">list</span>[<span class="tok-b">int</span>] | <span class="tok-k">None</span> = <span class="tok-k">None</span>) -> <span class="tok-k">None</span>:
        <span class="tok-b">super</span>().__init__(model_path, model_name, npu_core) <span class="tok-c"># вызываем конструктор родительского класса</span>

    <span class="tok-c"># создаем функцию обработки результатов</span>
    <span class="tok-k">def</span> post_process(<span class="tok-b">self</span>, outputs: <span class="tok-b">list</span>) -> <span class="tok-b">list</span>:
        <span class="tok-c"># здесь можно добавить вашу собственную обработку результатов</span>
        <span class="tok-k">return</span> outputs <span class="tok-c"># возвращаем результат обработки</span>

    <span class="tok-c"># создаем функцию run для инференса</span>
    <span class="tok-k">def</span> run(<span class="tok-b">self</span>, inputs: <span class="tok-b">list</span>) -> <span class="tok-b">list</span> | <span class="tok-k">None</span>:
        outputs = <span class="tok-b">super</span>().run(inputs)     <span class="tok-c"># вызываем метод run родительского класса, получаем необработанные данные из NPU</span>
        <span class="tok-k">return</span> <span class="tok-b">self</span>.post_process(outputs) <span class="tok-c"># возвращаем объекту результат инференса полученных ранее данных после собственной обработки</span></code></pre></div>
<h4 id="s-yolo-детекция-всех-классов"><a class="anchor" href="#s-yolo-детекция-всех-классов" aria-hidden="true">§</a>Yolo - детекция всех классов</h4>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">import</span> cv2
<span class="tok-k">import</span> numpy <span class="tok-k">as</span> np
<span class="tok-k">from</span> pioneer_rknn <span class="tok-k">import</span> Yolo
<span class="tok-k">from</span> pioneer_sdk2 <span class="tok-k">import</span> Camera, ImageViewer, CameraType

<span class="tok-c"># Глобальные переменные — изображения и результаты детекции</span>
image_1 = <span class="tok-k">None</span>
image_2 = <span class="tok-k">None</span>
object_1 = <span class="tok-k">None</span>
object_2 = <span class="tok-k">None</span>

<span class="tok-c"># Список классов объектов (содержит все возможные объекты в YOLO)</span>
classNames = ["person", "bicycle", "car", "motorbike", "aeroplane", "bus", "train", "truck", "boat",
    "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat",
    "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella",
    "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball", "kite", "baseball bat",
    "baseball glove", "skateboard", "surfboard", "tennis racket", "bottle", "wine glass", "cup",
    "fork", "knife", "spoon", "bowl", "banana", "apple", "sandwich", "orange", "broccoli",
    "carrot", "hot dog", "pizza", "donut", "cake", "chair", "sofa", "pottedplant", "bed",
    "diningtable", "toilet", "tvmonitor", "laptop", "mouse", "remote", "keyboard", "cell phone",
    "microwave", "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase", "scissors",
    "teddy bear", "hair drier", "toothbrush"]

<span class="tok-k">def</span> resize_img(img):
    """
    Изменяет размер изображения до IMG_SIZE и добавляет ось batch

    Args:
        img (numpy.ndarray): Исходное изображение

    Returns:
        numpy.ndarray: Изображение с размером IMG_SIZE и добавленной осью batch
    """
    <span class="tok-c"># Изменяем размер изображения до IMG_SIZE</span>
    img_copy = cv2.resize(img, IMG_SIZE)

    <span class="tok-c"># Добавляем ось batch (для RKNN)</span>
    img_copy = np.expand_dims(img_copy, <span class="tok-n">0</span>)
    <span class="tok-k">return</span> img_copy

<span class="tok-k">def</span> yolo_find_on_image(img, results, classNames, class_filter=<span class="tok-k">None</span>, score_thr=<span class="tok-k">None</span>):
    """
    Фильтрует результаты детекции YOLO по классам и уверенности

    Args:
        img (numpy.ndarray): Исходное изображение
        results (<span class="tok-b">tuple</span>): Результаты детекции (boxes, classes, scores)
        classNames (<span class="tok-b">list</span>): Список названий классов
        class_filter (<span class="tok-b">list</span> <span class="tok-k">or</span> <span class="tok-k">None</span>): Список классов для фильтрации
        score_thr (<span class="tok-b">float</span> <span class="tok-k">or</span> <span class="tok-k">None</span>): Порог уверенности

    Returns:
        <span class="tok-b">dict</span>: Фильтрованные результаты детекции
    """
    boxes, classes, scores = results <span class="tok-c"># Распаковываем результаты</span>

    <span class="tok-c"># Если нет данных — возвращаем пустой словарь</span>
    <span class="tok-k">if</span> boxes <span class="tok-k">is</span> <span class="tok-k">None</span> <span class="tok-k">or</span> classes <span class="tok-k">is</span> <span class="tok-k">None</span> <span class="tok-k">or</span> scores <span class="tok-k">is</span> <span class="tok-k">None</span> <span class="tok-k">or</span> <span class="tok-b">len</span>(boxes) == <span class="tok-n">0</span>:
        <span class="tok-k">return</span> {
            "boxes": np.zeros((<span class="tok-n">0</span>, <span class="tok-n">4</span>), dtype=np.float32),
            "classes": np.zeros((<span class="tok-n">0</span>,), dtype=np.int32),
            "scores": np.zeros((<span class="tok-n">0</span>,), dtype=np.float32),
            "orig_shape": img.shape[:<span class="tok-n">2</span>],
            "classNames": classNames
        }

    <span class="tok-c"># Преобразуем данные в массивы NumPy</span>
    boxes = np.array(boxes)
    classes = np.array(classes)
    scores = np.array(scores)

    indices = np.arange(<span class="tok-b">len</span>(boxes))  <span class="tok-c"># Индексы всех детекций</span>

    <span class="tok-c"># Фильтрация по классам (если указано)</span>
    <span class="tok-k">if</span> class_filter <span class="tok-k">is</span> <span class="tok-k">not</span> <span class="tok-k">None</span>:
        allowed = [classNames.index(cls_name) <span class="tok-k">for</span> cls_name <span class="tok-k">in</span> class_filter <span class="tok-k">if</span> cls_name <span class="tok-k">in</span> classNames]
        indices = [i <span class="tok-k">for</span> i <span class="tok-k">in</span> indices <span class="tok-k">if</span> classes[i] <span class="tok-k">in</span> allowed]

    <span class="tok-c"># Фильтрация по уверенности (если указано)</span>
    <span class="tok-k">if</span> score_thr <span class="tok-k">is</span> <span class="tok-k">not</span> <span class="tok-k">None</span>:
        indices = [i <span class="tok-k">for</span> i <span class="tok-k">in</span> indices <span class="tok-k">if</span> scores[i] >= score_thr]

    <span class="tok-c"># Возвращаем фильтрованные данные</span>
    <span class="tok-k">return</span> {
        "boxes": boxes[indices],
        "classes": classes[indices],
        "scores": scores[indices],
        "orig_shape": img.shape[:<span class="tok-n">2</span>],
        "classNames": classNames
    }

<span class="tok-k">def</span> draw_yolo_on_image(img, yolo_obj, color=(<span class="tok-n">0</span>,<span class="tok-n">255</span>,<span class="tok-n">0</span>), thickness=<span class="tok-n">2</span>):
    """
    Отрисовывает детекции YOLO на изображении

    Args:
        img (numpy.ndarray): Изображение для отрисовки
        yolo_obj (<span class="tok-b">dict</span>): Результаты детекции
        color (<span class="tok-b">tuple</span>): Цвет рамки
        thickness (<span class="tok-b">int</span>): Толщина линии
    """
    boxes = yolo_obj["boxes"]
    classes = yolo_obj["classes"]
    classNames = yolo_obj["classNames"]
    orig_h, orig_w = yolo_obj["orig_shape"]

    <span class="tok-c"># Множители для масштабирования координат</span>
    scale_x = orig_w / IMG_SIZE[<span class="tok-n">0</span>]
    scale_y = orig_h / IMG_SIZE[<span class="tok-n">1</span>]

    <span class="tok-c"># Отрисовываем каждую детекцию</span>
    <span class="tok-k">for</span> box, cl <span class="tok-k">in</span> <span class="tok-b">zip</span>(boxes, classes):
        left, top, right, bottom = [<span class="tok-b">int</span>(coord) <span class="tok-k">for</span> coord <span class="tok-k">in</span> box] <span class="tok-c"># Координаты бокса</span>

        <span class="tok-c"># Масштабируем координаты к оригинальному изображению</span>
        left   = <span class="tok-b">int</span>(left * scale_x)
        right  = <span class="tok-b">int</span>(right * scale_x)
        top    = <span class="tok-b">int</span>(top * scale_y)
        bottom = <span class="tok-b">int</span>(bottom * scale_y)

        <span class="tok-c"># Рисуем рамку</span>
        cv2.rectangle(img, (left, top), (right, bottom), color, thickness)

        <span class="tok-c"># Рисуем надпись</span>
        label = f"{classNames[cl]}"
        cv2.putText(img, label, (left, top-<span class="tok-n">10</span>), cv2.FONT_HERSHEY_SIMPLEX, <span class="tok-n">0.9</span>, color, <span class="tok-n">2</span>)

<span class="tok-c"># Инициализация камер</span>
cam_main, cam_opt = Camera(camera_type=CameraType.MAIN), Camera(camera_type=CameraType.OPT)

iv = ImageViewer() <span class="tok-c"># Инициализация отображения изображений</span>

<span class="tok-k">def</span> hex_to_bgr(hex_color: <span class="tok-b">str</span>) -> <span class="tok-b">tuple</span>[<span class="tok-b">int</span>, <span class="tok-b">int</span>, <span class="tok-b">int</span>]:
    """
    Преобразует HEX-цвет в BGR (OpenCV формат)

    Args:
        hex_color (<span class="tok-b">str</span>): HEX цвет в формате <span class="tok-c">#RRGGBB</span>

    Returns:
        <span class="tok-b">tuple</span>[<span class="tok-b">int</span>, <span class="tok-b">int</span>, <span class="tok-b">int</span>]: Цвет в формате BGR
    """
    <span class="tok-c"># Убираем символ #</span>
    <span class="tok-k">if</span> hex_color.startswith("<span class="tok-c">#"):</span>
        hex_color = hex_color[<span class="tok-n">1</span>:]

    <span class="tok-c"># Проверяем длину</span>
    <span class="tok-k">if</span> <span class="tok-b">len</span>(hex_color) != <span class="tok-n">6</span>:
        <span class="tok-k">raise</span> ValueError("Hex color must be <span class="tok-k">in</span> format <span class="tok-c">#RRGGBB")</span>

    <span class="tok-c"># Преобразуем HEX в BGR</span>
    r = <span class="tok-b">int</span>(hex_color[<span class="tok-n">0</span>:<span class="tok-n">2</span>], <span class="tok-n">16</span>)
    g = <span class="tok-b">int</span>(hex_color[<span class="tok-n">2</span>:<span class="tok-n">4</span>], <span class="tok-n">16</span>)
    b = <span class="tok-b">int</span>(hex_color[<span class="tok-n">4</span>:<span class="tok-n">6</span>], <span class="tok-n">16</span>)

    <span class="tok-k">return</span> (b, g, r)

<span class="tok-k">if</span> __name__ == "__main__":
    <span class="tok-b">print</span>("Выбрана модель:Yolo")
    IMG_SIZE = (<span class="tok-n">640</span>, <span class="tok-n">640</span>)

    <span class="tok-c"># Загрузка модели Yolo</span>
    model = Yolo(model_name="yolov8n")
    <span class="tok-k">while</span> <span class="tok-k">True</span>:
        <span class="tok-c"># Получаем кадры с камер</span>
        image_1 = cam_main.get_cv_frame()
        image_2 = cam_opt.get_cv_frame()

        <span class="tok-c"># Выполняем детекцию на первом и втором кадре по всем классам</span>
        object_1 = yolo_find_on_image(image_1, results_image_1 := model.run([resize_img(image_1)]), classNames, class_filter=<span class="tok-k">None</span>)
        object_2 = yolo_find_on_image(image_2, results_image_2 := model.run([resize_img(image_2)]), classNames, class_filter=<span class="tok-k">None</span>)

        <span class="tok-c"># Отрисовываем детекции</span>
        draw_yolo_on_image(image_1, object_1, hex_to_bgr("<span class="tok-c">#ff4040"))</span>
        draw_yolo_on_image(image_2, object_2, hex_to_bgr("<span class="tok-c">#000099"))</span>

        <span class="tok-c"># Отображаем изображения</span>
        iv.imshow(name=<span class="tok-s">'first'</span>, frame=image_1)
        iv.imshow(name=<span class="tok-s">'second'</span>, frame=image_2)</code></pre></div>
<h4 id="s-yolo-детекция-выбранных-классов"><a class="anchor" href="#s-yolo-детекция-выбранных-классов" aria-hidden="true">§</a>Yolo - детекция выбранных классов</h4>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">import</span> cv2
<span class="tok-k">import</span> numpy <span class="tok-k">as</span> np
<span class="tok-k">from</span> pioneer_rknn <span class="tok-k">import</span> Yolo
<span class="tok-k">from</span> pioneer_sdk2 <span class="tok-k">import</span> Camera, ImageViewer, CameraType

<span class="tok-c"># Глобальные переменные — изображения и результаты детекции</span>
image_1 = <span class="tok-k">None</span>
image_2 = <span class="tok-k">None</span>
object_1 = <span class="tok-k">None</span>
object_2 = <span class="tok-k">None</span>

<span class="tok-c"># Список классов объектов (содержит все возможные объекты в YOLO)</span>
classNames = ["person", "bicycle", "car", "motorbike", "aeroplane", "bus", "train", "truck", "boat",
    "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat",
    "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella",
    "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball", "kite", "baseball bat",
    "baseball glove", "skateboard", "surfboard", "tennis racket", "bottle", "wine glass", "cup",
    "fork", "knife", "spoon", "bowl", "banana", "apple", "sandwich", "orange", "broccoli",
    "carrot", "hot dog", "pizza", "donut", "cake", "chair", "sofa", "pottedplant", "bed",
    "diningtable", "toilet", "tvmonitor", "laptop", "mouse", "remote", "keyboard", "cell phone",
    "microwave", "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase", "scissors",
    "teddy bear", "hair drier", "toothbrush"]

<span class="tok-k">def</span> resize_img(img):
    """
    Изменяет размер изображения до IMG_SIZE и добавляет ось batch

    Args:
        img (numpy.ndarray): Исходное изображение

    Returns:
        numpy.ndarray: Изображение с размером IMG_SIZE и добавленной осью batch
    """
    <span class="tok-c"># Изменяем размер изображения до IMG_SIZE</span>
    img_copy = cv2.resize(img, IMG_SIZE)

    <span class="tok-c"># Добавляем ось batch (для RKNN)</span>
    img_copy = np.expand_dims(img_copy, <span class="tok-n">0</span>)
    <span class="tok-k">return</span> img_copy

<span class="tok-k">def</span> yolo_find_on_image(img, results, classNames, class_filter=<span class="tok-k">None</span>, score_thr=<span class="tok-k">None</span>):
    """
    Фильтрует результаты детекции YOLO по классам и уверенности

    Args:
        img (numpy.ndarray): Исходное изображение
        results (<span class="tok-b">tuple</span>): Результаты детекции (boxes, classes, scores)
        classNames (<span class="tok-b">list</span>): Список названий классов
        class_filter (<span class="tok-b">list</span> <span class="tok-k">or</span> <span class="tok-k">None</span>): Список классов для фильтрации
        score_thr (<span class="tok-b">float</span> <span class="tok-k">or</span> <span class="tok-k">None</span>): Порог уверенности

    Returns:
        <span class="tok-b">dict</span>: Фильтрованные результаты детекции
    """
    boxes, classes, scores = results <span class="tok-c"># Распаковываем результаты</span>

    <span class="tok-c"># Если нет данных — возвращаем пустой словарь</span>
    <span class="tok-k">if</span> boxes <span class="tok-k">is</span> <span class="tok-k">None</span> <span class="tok-k">or</span> classes <span class="tok-k">is</span> <span class="tok-k">None</span> <span class="tok-k">or</span> scores <span class="tok-k">is</span> <span class="tok-k">None</span> <span class="tok-k">or</span> <span class="tok-b">len</span>(boxes) == <span class="tok-n">0</span>:
        <span class="tok-k">return</span> {
            "boxes": np.zeros((<span class="tok-n">0</span>, <span class="tok-n">4</span>), dtype=np.float32),
            "classes": np.zeros((<span class="tok-n">0</span>,), dtype=np.int32),
            "scores": np.zeros((<span class="tok-n">0</span>,), dtype=np.float32),
            "orig_shape": img.shape[:<span class="tok-n">2</span>],
            "classNames": classNames
        }

    <span class="tok-c"># Преобразуем данные в массивы NumPy</span>
    boxes = np.array(boxes)
    classes = np.array(classes)
    scores = np.array(scores)

    indices = np.arange(<span class="tok-b">len</span>(boxes))  <span class="tok-c"># Индексы всех детекций</span>

    <span class="tok-c"># Фильтрация по классам (если указано)</span>
    <span class="tok-k">if</span> class_filter <span class="tok-k">is</span> <span class="tok-k">not</span> <span class="tok-k">None</span>:
        allowed = [classNames.index(cls_name) <span class="tok-k">for</span> cls_name <span class="tok-k">in</span> class_filter <span class="tok-k">if</span> cls_name <span class="tok-k">in</span> classNames]
        indices = [i <span class="tok-k">for</span> i <span class="tok-k">in</span> indices <span class="tok-k">if</span> classes[i] <span class="tok-k">in</span> allowed]

    <span class="tok-c"># Фильтрация по уверенности (если указано)</span>
    <span class="tok-k">if</span> score_thr <span class="tok-k">is</span> <span class="tok-k">not</span> <span class="tok-k">None</span>:
        indices = [i <span class="tok-k">for</span> i <span class="tok-k">in</span> indices <span class="tok-k">if</span> scores[i] >= score_thr]

    <span class="tok-c"># Возвращаем фильтрованные данные</span>
    <span class="tok-k">return</span> {
        "boxes": boxes[indices],
        "classes": classes[indices],
        "scores": scores[indices],
        "orig_shape": img.shape[:<span class="tok-n">2</span>],
        "classNames": classNames
    }

<span class="tok-k">def</span> draw_yolo_on_image(img, yolo_obj, color=(<span class="tok-n">0</span>,<span class="tok-n">255</span>,<span class="tok-n">0</span>), thickness=<span class="tok-n">2</span>):
    """
    Отрисовывает детекции YOLO на изображении

    Args:
        img (numpy.ndarray): Изображение для отрисовки
        yolo_obj (<span class="tok-b">dict</span>): Результаты детекции
        color (<span class="tok-b">tuple</span>): Цвет рамки
        thickness (<span class="tok-b">int</span>): Толщина линии
    """
    boxes = yolo_obj["boxes"]
    classes = yolo_obj["classes"]
    classNames = yolo_obj["classNames"]
    orig_h, orig_w = yolo_obj["orig_shape"]

    <span class="tok-c"># Множители для масштабирования координат</span>
    scale_x = orig_w / IMG_SIZE[<span class="tok-n">0</span>]
    scale_y = orig_h / IMG_SIZE[<span class="tok-n">1</span>]

    <span class="tok-c"># Отрисовываем каждую детекцию</span>
    <span class="tok-k">for</span> box, cl <span class="tok-k">in</span> <span class="tok-b">zip</span>(boxes, classes):
        left, top, right, bottom = [<span class="tok-b">int</span>(coord) <span class="tok-k">for</span> coord <span class="tok-k">in</span> box] <span class="tok-c"># Координаты бокса</span>

        <span class="tok-c"># Масштабируем координаты к оригинальному изображению</span>
        left   = <span class="tok-b">int</span>(left * scale_x)
        right  = <span class="tok-b">int</span>(right * scale_x)
        top    = <span class="tok-b">int</span>(top * scale_y)
        bottom = <span class="tok-b">int</span>(bottom * scale_y)

        <span class="tok-c"># Рисуем рамку</span>
        cv2.rectangle(img, (left, top), (right, bottom), color, thickness)

        <span class="tok-c"># Рисуем надпись</span>
        label = f"{classNames[cl]}"
        cv2.putText(img, label, (left, top-<span class="tok-n">10</span>), cv2.FONT_HERSHEY_SIMPLEX, <span class="tok-n">0.9</span>, color, <span class="tok-n">2</span>)

<span class="tok-c"># Инициализация камер</span>
cam_main, cam_opt = Camera(camera_type=CameraType.MAIN), Camera(camera_type=CameraType.OPT)

iv = ImageViewer() <span class="tok-c"># Инициализация отображения изображений</span>

<span class="tok-k">def</span> hex_to_bgr(hex_color: <span class="tok-b">str</span>) -> <span class="tok-b">tuple</span>[<span class="tok-b">int</span>, <span class="tok-b">int</span>, <span class="tok-b">int</span>]:
    """
    Преобразует HEX-цвет в BGR (OpenCV формат)

    Args:
        hex_color (<span class="tok-b">str</span>): HEX цвет в формате <span class="tok-c">#RRGGBB</span>

    Returns:
        <span class="tok-b">tuple</span>[<span class="tok-b">int</span>, <span class="tok-b">int</span>, <span class="tok-b">int</span>]: Цвет в формате BGR
    """
    <span class="tok-c"># Убираем символ #</span>
    <span class="tok-k">if</span> hex_color.startswith("<span class="tok-c">#"):</span>
        hex_color = hex_color[<span class="tok-n">1</span>:]

    <span class="tok-c"># Проверяем длину</span>
    <span class="tok-k">if</span> <span class="tok-b">len</span>(hex_color) != <span class="tok-n">6</span>:
        <span class="tok-k">raise</span> ValueError("Hex color must be <span class="tok-k">in</span> format <span class="tok-c">#RRGGBB")</span>

    <span class="tok-c"># Преобразуем HEX в BGR</span>
    r = <span class="tok-b">int</span>(hex_color[<span class="tok-n">0</span>:<span class="tok-n">2</span>], <span class="tok-n">16</span>)
    g = <span class="tok-b">int</span>(hex_color[<span class="tok-n">2</span>:<span class="tok-n">4</span>], <span class="tok-n">16</span>)
    b = <span class="tok-b">int</span>(hex_color[<span class="tok-n">4</span>:<span class="tok-n">6</span>], <span class="tok-n">16</span>)

    <span class="tok-k">return</span> (b, g, r)

<span class="tok-k">if</span> __name__ == "__main__":
    <span class="tok-b">print</span>("Выбрана модель:Yolo")
    IMG_SIZE = (<span class="tok-n">640</span>, <span class="tok-n">640</span>)

    <span class="tok-c"># Загрузка модели Yolo</span>
    model = Yolo(model_name="yolov8n")
    <span class="tok-k">while</span> <span class="tok-k">True</span>:
        <span class="tok-c"># Получаем кадры с камер</span>
        image_1 = cam_main.get_cv_frame()
        image_2 = cam_opt.get_cv_frame()

        <span class="tok-c"># Выполняем детекцию на первом кадре (по клавиатуре)</span>
        object_1 = yolo_find_on_image(image_1, results_image_1 := model.run([resize_img(image_1)]), classNames, class_filter=["keyboard"])

        <span class="tok-c"># Выполняем детекцию на втором кадре (по человеку)</span>
        object_2 = yolo_find_on_image(image_2, results_image_2 := model.run([resize_img(image_2)]), classNames, class_filter=["person"])

        <span class="tok-c"># Отрисовываем детекции</span>
        draw_yolo_on_image(image_1, object_1, hex_to_bgr("<span class="tok-c">#ff4040"))</span>
        draw_yolo_on_image(image_2, object_2, hex_to_bgr("<span class="tok-c">#000099"))</span>

        <span class="tok-c"># Отображаем изображения</span>
        iv.imshow(name=<span class="tok-s">'first'</span>, frame=image_1)
        iv.imshow(name=<span class="tok-s">'second'</span>, frame=image_2)</code></pre></div>
<h4 id="s-yolopose-детекция-жестов"><a class="anchor" href="#s-yolopose-детекция-жестов" aria-hidden="true">§</a>YoloPose - детекция жестов</h4>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">import</span> cv2
<span class="tok-k">import</span> sys
<span class="tok-k">from</span> collections <span class="tok-k">import</span> defaultdict
<span class="tok-k">import</span> numpy <span class="tok-k">as</span> np
<span class="tok-k">from</span> pioneer_rknn <span class="tok-k">import</span> YoloPose
<span class="tok-k">from</span> pioneer_sdk2 <span class="tok-k">import</span> Camera, ImageViewer, CameraType
<span class="tok-k">import</span> math
<span class="tok-k">from</span> collections <span class="tok-k">import</span> deque, defaultdict

<span class="tok-c"># Глобальные переменные — изображение и результат детекции</span>
image_1 = <span class="tok-k">None</span>
object_1 = <span class="tok-k">None</span>

<span class="tok-c"># Список классов объектов</span>
classNames = ["person"]

<span class="tok-c"># Пороги для обработки ключевых точек</span>
MIN_KPT_CONF = <span class="tok-n">0.20</span> <span class="tok-c"># Минимальная уверенность ключевой точки</span>
STABLE_FRAMES = <span class="tok-n">18</span> <span class="tok-c"># Количество кадров для стабильности</span>
HYSTERESIS_FRAMES = <span class="tok-n">8</span> <span class="tok-c"># Количество кадров для гистерезиса (переключения)</span>
THRESHOLD = HYSTERESIS_FRAMES <span class="tok-c"># Используется как порог для переключения</span>

<span class="tok-c"># Цветовая палитра для отрисовки</span>
POSE_PALETTE = np.array(
    [
        [<span class="tok-n">255</span>, <span class="tok-n">128</span>, <span class="tok-n">0</span>], [<span class="tok-n">255</span>, <span class="tok-n">153</span>, <span class="tok-n">51</span>], [<span class="tok-n">255</span>, <span class="tok-n">178</span>, <span class="tok-n">102</span>], [<span class="tok-n">230</span>, <span class="tok-n">230</span>, <span class="tok-n">0</span>], [<span class="tok-n">255</span>, <span class="tok-n">153</span>, <span class="tok-n">255</span>],
        [<span class="tok-n">153</span>, <span class="tok-n">204</span>, <span class="tok-n">255</span>], [<span class="tok-n">255</span>, <span class="tok-n">102</span>, <span class="tok-n">255</span>], [<span class="tok-n">255</span>, <span class="tok-n">51</span>, <span class="tok-n">255</span>], [<span class="tok-n">102</span>, <span class="tok-n">178</span>, <span class="tok-n">255</span>], [<span class="tok-n">51</span>, <span class="tok-n">153</span>, <span class="tok-n">255</span>],
        [<span class="tok-n">255</span>, <span class="tok-n">153</span>, <span class="tok-n">153</span>], [<span class="tok-n">255</span>, <span class="tok-n">102</span>, <span class="tok-n">102</span>], [<span class="tok-n">255</span>, <span class="tok-n">51</span>, <span class="tok-n">51</span>], [<span class="tok-n">153</span>, <span class="tok-n">255</span>, <span class="tok-n">153</span>], [<span class="tok-n">102</span>, <span class="tok-n">255</span>, <span class="tok-n">102</span>],
        [<span class="tok-n">51</span>, <span class="tok-n">255</span>, <span class="tok-n">51</span>], [<span class="tok-n">0</span>, <span class="tok-n">255</span>, <span class="tok-n">0</span>], [<span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">255</span>], [<span class="tok-n">255</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>], [<span class="tok-n">255</span>, <span class="tok-n">255</span>, <span class="tok-n">255</span>]
    ], dtype=np.uint8
)

<span class="tok-c"># Цвета для ключевых точек</span>
KPT_COLOR = POSE_PALETTE[[<span class="tok-n">16</span>, <span class="tok-n">16</span>, <span class="tok-n">16</span>, <span class="tok-n">16</span>, <span class="tok-n">16</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">9</span>, <span class="tok-n">9</span>, <span class="tok-n">9</span>, <span class="tok-n">9</span>, <span class="tok-n">9</span>, <span class="tok-n">9</span>]]

<span class="tok-c"># Пары связей (кости) для отрисовки</span>
SKELETON_PAIRS = [
    [<span class="tok-n">16</span>, <span class="tok-n">14</span>], [<span class="tok-n">14</span>, <span class="tok-n">12</span>], [<span class="tok-n">17</span>, <span class="tok-n">15</span>], [<span class="tok-n">15</span>, <span class="tok-n">13</span>], [<span class="tok-n">12</span>, <span class="tok-n">13</span>], [<span class="tok-n">6</span>, <span class="tok-n">12</span>], [<span class="tok-n">7</span>, <span class="tok-n">13</span>], [<span class="tok-n">6</span>, <span class="tok-n">7</span>], [<span class="tok-n">6</span>, <span class="tok-n">8</span>],
    [<span class="tok-n">7</span>, <span class="tok-n">9</span>], [<span class="tok-n">8</span>, <span class="tok-n">10</span>], [<span class="tok-n">9</span>, <span class="tok-n">11</span>], [<span class="tok-n">2</span>, <span class="tok-n">3</span>], [<span class="tok-n">1</span>, <span class="tok-n">2</span>], [<span class="tok-n">1</span>, <span class="tok-n">3</span>], [<span class="tok-n">2</span>, <span class="tok-n">4</span>], [<span class="tok-n">3</span>, <span class="tok-n">5</span>], [<span class="tok-n">4</span>, <span class="tok-n">6</span>], [<span class="tok-n">5</span>, <span class="tok-n">7</span>]
]

<span class="tok-c"># Цвета для костей</span>
LIMB_COLOR = POSE_PALETTE[[<span class="tok-n">9</span>, <span class="tok-n">9</span>, <span class="tok-n">9</span>, <span class="tok-n">9</span>, <span class="tok-n">7</span>, <span class="tok-n">7</span>, <span class="tok-n">7</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">16</span>, <span class="tok-n">16</span>, <span class="tok-n">16</span>, <span class="tok-n">16</span>, <span class="tok-n">16</span>, <span class="tok-n">16</span>, <span class="tok-n">16</span>]]
SKELETON = [(a - <span class="tok-n">1</span>, b - <span class="tok-n">1</span>) <span class="tok-k">for</span> a, b <span class="tok-k">in</span> SKELETON_PAIRS]

<span class="tok-c"># Индексы ключевых точек (COCO-17)</span>
LS, RS, LW, RW, LH, RH = <span class="tok-n">5</span>, <span class="tok-n">6</span>, <span class="tok-n">9</span>, <span class="tok-n">10</span>, <span class="tok-n">11</span>, <span class="tok-n">12</span>

<span class="tok-c"># Размер изображения</span>
IMG_SIZE = (<span class="tok-n">640</span>, <span class="tok-n">640</span>)

<span class="tok-c"># Инициализация камер</span>
cam_main, cam_opt = Camera(camera_type=CameraType.MAIN), Camera(camera_type=CameraType.OPT)

<span class="tok-c"># Инициализация отображения изображений</span>
iv = ImageViewer()

<span class="tok-k">def</span> resize_img(img):
    """
    Изменяет размер изображения до IMG_SIZE и добавляет ось batch

    Args:
        img (numpy.ndarray): Исходное изображение

    Returns:
        numpy.ndarray: Изображение с размером IMG_SIZE и добавленной осью batch
    """
    <span class="tok-c"># Изменяем размер изображения</span>
    img_copy = cv2.resize(img, IMG_SIZE)

    <span class="tok-c"># Добавляем ось batch (для RKNN)</span>
    img_copy = np.expand_dims(img_copy, <span class="tok-n">0</span>)
    <span class="tok-k">return</span> img_copy

<span class="tok-k">def</span> find_poses(img, det_boxes):
    """
    Преобразует детекции в формат ключевых точек и боксов

    Args:
        img (numpy.ndarray): Исходное изображение
        det_boxes (<span class="tok-b">list</span>): Список детекций с координатами и ключевыми точками

    Returns:
        <span class="tok-b">dict</span>: Словарь с poses и total_dets
    """
    ih, iw = img.shape[:<span class="tok-n">2</span>] <span class="tok-c"># Высота и ширина исходного изображения</span>

    <span class="tok-c"># Множители для масштабирования координат сетки → оригинальное изображение</span>
    sx = iw / <span class="tok-b">float</span>(IMG_SIZE[<span class="tok-n">0</span>])
    sy = ih / <span class="tok-b">float</span>(IMG_SIZE[<span class="tok-n">1</span>])

    poses = [] <span class="tok-c"># Список найденных поз</span>
    <span class="tok-k">for</span> box <span class="tok-k">in</span> det_boxes:
        x1, y1, x2, y2 = <span class="tok-b">float</span>(box.xmin), <span class="tok-b">float</span>(box.ymin), <span class="tok-b">float</span>(box.xmax), <span class="tok-b">float</span>(box.ymax)

        <span class="tok-c"># Получаем массив ключевых точек и фильтруем недопустимые</span>
        karr = get_kpts_array(np.asarray(box.keypoint))
        <span class="tok-k">if</span> karr <span class="tok-k">is</span> <span class="tok-k">None</span>:
            <span class="tok-k">continue</span>

        <span class="tok-c"># Масштабируем ключевые точки и bbox к оригинальному изображению</span>
        karr = karr.copy()
        karr[:, <span class="tok-n">0</span>] *= sx
        karr[:, <span class="tok-n">1</span>] *= sy
        bbox_scaled = [x1 * sx, y1 * sy, x2 * sx, y2 * sy]

        poses.append({
            <span class="tok-s">'bbox'</span>: bbox_scaled,
            <span class="tok-s">'kpts'</span>: karr,
        })

    <span class="tok-k">return</span> {
        <span class="tok-s">'poses'</span>: poses,
        <span class="tok-s">'total_dets'</span>: <span class="tok-b">len</span>(det_boxes),
    }

<span class="tok-k">def</span> draw_pose(frame, kpts_arr, thickness=<span class="tok-n">3</span>, bbox=<span class="tok-k">None</span>, label=<span class="tok-k">None</span>, label_color=(<span class="tok-n">50</span>, <span class="tok-n">220</span>, <span class="tok-n">50</span>)):
    """
    Отрисовывает позу на кадре

    Args:
        frame (numpy.ndarray): Кадр для отрисовки
        kpts_arr (numpy.ndarray): Массив ключевых точек (17x3)
        thickness (<span class="tok-b">int</span>): Толщина линии
        bbox (<span class="tok-b">list</span>): Координаты бокса
        label (<span class="tok-b">str</span>): Название жеста
        label_color (<span class="tok-b">tuple</span>): Цвет надписи
    """
    xy = kpts_arr[:, :<span class="tok-n">2</span>].astype(<span class="tok-b">int</span>) <span class="tok-c"># Координаты точек</span>
    conf = kpts_arr[:, <span class="tok-n">2</span>]           <span class="tok-c"># Уверенность точек</span>
    valid = (conf > MIN_KPT_CONF) & ~np.all(xy == <span class="tok-n">0</span>, axis=<span class="tok-n">1</span>) <span class="tok-c"># Фильтр недопустимых точек</span>

    <span class="tok-c"># Отрисовываем точки</span>
    <span class="tok-k">for</span> idx, (x, y) <span class="tok-k">in</span> <span class="tok-b">enumerate</span>(xy):
        <span class="tok-k">if</span> valid[idx]:
            col = <span class="tok-b">tuple</span>(<span class="tok-b">int</span>(c) <span class="tok-k">for</span> c <span class="tok-k">in</span> KPT_COLOR[idx])
            cv2.circle(frame, (x, y), thickness + <span class="tok-n">2</span>, col, -<span class="tok-n">1</span>, lineType=cv2.LINE_AA)

    <span class="tok-c"># Отрисовываем кости</span>
    <span class="tok-k">for</span> i, (p1, p2) <span class="tok-k">in</span> <span class="tok-b">enumerate</span>(SKELETON):
        <span class="tok-k">if</span> valid[p1] <span class="tok-k">and</span> valid[p2]:
            pt1, pt2 = <span class="tok-b">tuple</span>(xy[p1]), <span class="tok-b">tuple</span>(xy[p2])
            col = <span class="tok-b">tuple</span>(<span class="tok-b">int</span>(c) <span class="tok-k">for</span> c <span class="tok-k">in</span> LIMB_COLOR[i])
            cv2.line(frame, pt1, pt2, col, thickness, lineType=cv2.LINE_AA)

    <span class="tok-c"># Отрисовываем бокс и надпись</span>
    <span class="tok-k">if</span> bbox <span class="tok-k">is</span> <span class="tok-k">not</span> <span class="tok-k">None</span>:
        x1, y1, x2, y2 = map(<span class="tok-b">int</span>, bbox)
        cv2.rectangle(frame, (x1, y1), (x2, y2), (<span class="tok-n">13</span>, <span class="tok-n">76</span>, <span class="tok-n">236</span>), thickness + <span class="tok-n">1</span>)
        <span class="tok-k">if</span> label:
            cv2.putText(
                frame,
                label,
                (x1, <span class="tok-b">max</span>(<span class="tok-n">0</span>, y1 - <span class="tok-n">10</span>)),
                cv2.FONT_HERSHEY_SIMPLEX,
                <span class="tok-n">0.8</span>,
                label_color,
                <span class="tok-b">max</span>(<span class="tok-n">1</span>, thickness - <span class="tok-n">1</span>),
                lineType=cv2.LINE_AA,
            )

<span class="tok-k">def</span> get_kpts_array(kpts_obj):
    """
    Преобразует объект ключевых точек в массив numpy

    Args:
        kpts_obj (object): Объект ключевых точек (обычно .data или <span class="tok-b">list</span>)

    Returns:
        numpy.ndarray: Массив ключевых точек (17x3) или <span class="tok-k">None</span> если ошибки
    """
    <span class="tok-c"># Если объект имеет атрибут .data — используем его</span>
    <span class="tok-k">if</span> hasattr(kpts_obj, <span class="tok-s">'data'</span>):
        raw = kpts_obj.data
        <span class="tok-k">try</span>:
            raw = raw.cpu().numpy()
        <span class="tok-k">except</span> Exception:
            raw = np.asarray(raw)
        raw = np.squeeze(raw)
        arr = np.asarray(raw)
    <span class="tok-k">else</span>:
        arr = np.asarray(kpts_obj)

    <span class="tok-k">if</span> arr.size == <span class="tok-n">0</span>:
        <span class="tok-k">return</span> <span class="tok-k">None</span>

    <span class="tok-c"># Преобразуем в массив (..., 3)</span>
    arr = arr.astype(<span class="tok-b">float</span>).reshape(-<span class="tok-n">1</span>)
    <span class="tok-k">if</span> arr.size % <span class="tok-n">3</span> != <span class="tok-n">0</span>:
        <span class="tok-k">return</span> <span class="tok-k">None</span>
    arr = arr.reshape(-<span class="tok-n">1</span>, <span class="tok-n">3</span>)

    <span class="tok-c"># Проверяем размер: минимум 17 точек</span>
    <span class="tok-k">if</span> arr.shape[<span class="tok-n">0</span>] < <span class="tok-n">17</span>:
        <span class="tok-k">return</span> <span class="tok-k">None</span>
    arr = arr[:<span class="tok-n">17</span>, :]
    <span class="tok-k">return</span> arr

<span class="tok-k">def</span> _angle_deg(dx, dy):
    """
    Вычисляет угол между вектором и вертикальной осью

    Args:
        dx (<span class="tok-b">float</span>): Смещение по X
        dy (<span class="tok-b">float</span>): Смещение по Y

    Returns:
        <span class="tok-b">float</span>: Угол в градусах
    """
    <span class="tok-c"># Возвращает абсолютное значение угла</span>
    <span class="tok-k">return</span> <span class="tok-b">abs</span>(math.degrees(math.atan2(dx, dy)))

<span class="tok-c"># Состояние временного сглаживания (функциональное)</span>
<span class="tok-k">def</span> smoother_new(stable_frames=STABLE_FRAMES, hysteresis_frames=HYSTERESIS_FRAMES):
    """
    Создаёт состояние для временного сглаживания

    Args:
        stable_frames (<span class="tok-b">int</span>): Количество кадров для стабильности
        hysteresis_frames (<span class="tok-b">int</span>): Количество кадров для гистерезиса

    Returns:
        <span class="tok-b">dict</span>: Состояние с историей и текущим значением
    """
    <span class="tok-k">return</span> {
        <span class="tok-s">'history'</span>: deque(maxlen=<span class="tok-b">max</span>(stable_frames, hysteresis_frames)),
        <span class="tok-s">'stable_frames'</span>: stable_frames,
        <span class="tok-s">'hysteresis_frames'</span>: hysteresis_frames,
        <span class="tok-s">'current'</span>: <span class="tok-s">'none'</span>,
    }

<span class="tok-k">def</span> smoother_update(state, gesture):
    """
    Обновляет состояние сглаживания

    Args:
        state (<span class="tok-b">dict</span>): Состояние сглаживания
        gesture (<span class="tok-b">str</span>): Новый жест

    Returns:
        <span class="tok-b">tuple</span>: (current_gesture, is_stable)
    """
    <span class="tok-c"># Добавляем новый жест в историю</span>
    state[<span class="tok-s">'history'</span>].append(gesture)

    <span class="tok-c"># Подсчитываем частоту жестов</span>
    counts = defaultdict(<span class="tok-b">int</span>)
    <span class="tok-k">for</span> g <span class="tok-k">in</span> state[<span class="tok-s">'history'</span>]:
        counts[g] += <span class="tok-n">1</span>

    <span class="tok-c"># Определяем победителя по частоте</span>
    winner = <span class="tok-b">max</span>(counts.items(), key=<span class="tok-k">lambda</span> x: x[<span class="tok-n">1</span>])[<span class="tok-n">0</span>]

    <span class="tok-c"># Если победитель изменился и его частота >= hysteresis_frames — обновляем текущий</span>
    <span class="tok-k">if</span> winner != state[<span class="tok-s">'current'</span>]:
        <span class="tok-k">if</span> counts[winner] >= state[<span class="tok-s">'hysteresis_frames'</span>]:
            state[<span class="tok-s">'current'</span>] = winner

    <span class="tok-c"># Проверяем, стабилен ли текущий жест</span>
    stable = counts[state[<span class="tok-s">'current'</span>]] >= state[<span class="tok-s">'stable_frames'</span>]
    <span class="tok-k">return</span> state[<span class="tok-s">'current'</span>], stable

<span class="tok-c"># Используется для трекинга по IoU (функциональное)</span>
<span class="tok-k">def</span> iou_xyxy(a, b):
    """
    Вычисляет IoU между двумя bbox

    Args:
        a (<span class="tok-b">list</span>): Бокс A [x1, y1, x2, y2]
        b (<span class="tok-b">list</span>): Бокс B [x1, y1, x2, y2]

    Returns:
        <span class="tok-b">float</span>: IoU значение
    """
    ax1, ay1, ax2, ay2 = a
    bx1, by1, bx2, by2 = b

    <span class="tok-c"># Вычисляем пересечение</span>
    ix1, iy1 = <span class="tok-b">max</span>(ax1, bx1), <span class="tok-b">max</span>(ay1, by1)
    ix2, iy2 = <span class="tok-b">min</span>(ax2, bx2), <span class="tok-b">min</span>(ay2, by2)
    iw, ih = <span class="tok-b">max</span>(<span class="tok-n">0</span>, ix2 - ix1), <span class="tok-b">max</span>(<span class="tok-n">0</span>, iy2 - iy1)
    inter = iw * ih

    <span class="tok-c"># Вычисляем площади</span>
    area_a = <span class="tok-b">max</span>(<span class="tok-n">0</span>, ax2 - ax1) * <span class="tok-b">max</span>(<span class="tok-n">0</span>, ay2 - ay1)
    area_b = <span class="tok-b">max</span>(<span class="tok-n">0</span>, bx2 - bx1) * <span class="tok-b">max</span>(<span class="tok-n">0</span>, by2 - by1)
    union = area_a + area_b - inter + 1e-<span class="tok-n">6</span>
    <span class="tok-k">return</span> inter / union

<span class="tok-k">def</span> tracker_new(iou_thr=<span class="tok-n">0.35</span>):
    """
    Создаёт состояние трекера

    Args:
        iou_thr (<span class="tok-b">float</span>): Порог IoU для совпадения

    Returns:
        <span class="tok-b">dict</span>: Состояние трекера
    """
    <span class="tok-k">return</span> {
        <span class="tok-s">'tracks'</span>: {},   <span class="tok-c"># tid -> {'bbox': list[4], 'smoother': smoother_state}</span>
        <span class="tok-s">'next_id'</span>: <span class="tok-n">1</span>,
        <span class="tok-s">'iou_thr'</span>: iou_thr,
    }

<span class="tok-k">def</span> tracker_match_and_update(state, boxes):
    """
    Сопоставляет и обновляет треки по IoU

    Args:
        state (<span class="tok-b">dict</span>): Состояние трекера
        boxes (<span class="tok-b">list</span>): Список новых боксов

    Returns:
        <span class="tok-b">dict</span>: Сопоставление (j -> tid)
    """
    assigns = {} <span class="tok-c"># Сопоставления</span>
    unmatched = <span class="tok-b">set</span>(<span class="tok-b">range</span>(<span class="tok-b">len</span>(boxes))) <span class="tok-c"># Не сопоставленные</span>

    <span class="tok-c"># Пытаемся сопоставить существующие треки</span>
    <span class="tok-k">for</span> tid, tr <span class="tok-k">in</span> <span class="tok-b">list</span>(state[<span class="tok-s">'tracks'</span>].items()):
        best_j, best_iou = <span class="tok-k">None</span>, <span class="tok-n">0.0</span>
        <span class="tok-k">for</span> j <span class="tok-k">in</span> <span class="tok-b">list</span>(unmatched):
            iou = iou_xyxy(tr[<span class="tok-s">'bbox'</span>], boxes[j])
            <span class="tok-k">if</span> iou > best_iou:
                best_iou, best_j = iou, j
        <span class="tok-k">if</span> best_j <span class="tok-k">is</span> <span class="tok-k">not</span> <span class="tok-k">None</span> <span class="tok-k">and</span> best_iou >= state[<span class="tok-s">'iou_thr'</span>]:
            assigns[best_j] = tid
            unmatched.remove(best_j)
            state[<span class="tok-s">'tracks'</span>][tid][<span class="tok-s">'bbox'</span>] = boxes[best_j]

    <span class="tok-c"># Удаляем старые треки (не использованные)</span>
    <span class="tok-k">for</span> j <span class="tok-k">in</span> unmatched:
        tid = state[<span class="tok-s">'next_id'</span>]
        state[<span class="tok-s">'next_id'</span>] += <span class="tok-n">1</span>
        assigns[j] = tid
        state[<span class="tok-s">'tracks'</span>][tid] = {
            <span class="tok-s">'bbox'</span>: boxes[j],
            <span class="tok-s">'smoother'</span>: smoother_new(),
        }

    <span class="tok-c"># Prune unmatched old tracks (keep only currently assigned)</span>
    keep_ids = <span class="tok-b">set</span>(assigns.values())
    state[<span class="tok-s">'tracks'</span>] = {tid: tr <span class="tok-k">for</span> tid, tr <span class="tok-k">in</span> state[<span class="tok-s">'tracks'</span>].items() <span class="tok-k">if</span> tid <span class="tok-k">in</span> keep_ids}

    <span class="tok-k">return</span> assigns

<span class="tok-k">def</span> draw_poses(img, result, tracker_state):
    """
    Отрисовывает позы на изображении и обновляет трекер

    Args:
        img (numpy.ndarray): Изображение
        result (<span class="tok-b">dict</span>): Результат детекции
        tracker_state (<span class="tok-b">dict</span>): Состояние трекера
    """
    poses = result.get(<span class="tok-s">'poses'</span>, [])
    total_dets = result.get(<span class="tok-s">'total_dets'</span>, <span class="tok-n">0</span>)

    <span class="tok-k">if</span> poses:
        boxes = [p[<span class="tok-s">'bbox'</span>] <span class="tok-k">for</span> p <span class="tok-k">in</span> poses]
        assigns = tracker_match_and_update(tracker_state, boxes)

        <span class="tok-k">for</span> j, tid <span class="tok-k">in</span> assigns.items():
            karr = poses[j][<span class="tok-s">'kpts'</span>]

            gesture = classify_gesture(karr)
            current, stable = smoother_update(
                tracker_state[<span class="tok-s">'tracks'</span>][tid][<span class="tok-s">'smoother'</span>], gesture
            )

            label_color = (<span class="tok-n">0</span>, <span class="tok-n">255</span>, <span class="tok-n">0</span>) <span class="tok-k">if</span> stable <span class="tok-k">and</span> current != <span class="tok-s">'none'</span> <span class="tok-k">else</span> (<span class="tok-n">0</span>, <span class="tok-n">200</span>, <span class="tok-n">255</span>)
            draw_pose(img, karr, thickness=<span class="tok-n">3</span>, bbox=boxes[j], label=current, label_color=label_color)

            <span class="tok-k">if</span> stable <span class="tok-k">and</span> current != <span class="tok-s">'none'</span>:
                <span class="tok-c">#print(f"EXECUTE -> id={tid} gesture={current}")</span>
                <span class="tok-k">pass</span>
    <span class="tok-k">else</span>:
        <span class="tok-c"># Если нет поз — всё равно очищаем трекер</span>
        <span class="tok-k">if</span> total_dets > <span class="tok-n">0</span>:
            <span class="tok-b">print</span>(f"No drawable poses parsed; raw detections: {total_dets}")
        tracker_state[<span class="tok-s">'tracks'</span>].clear()

<span class="tok-k">def</span> classify_gesture(kp):
    """
    Определяет жест по ключевым точкам

    Args:
        kp (numpy.ndarray): Массив ключевых точек (17x3)

    Returns:
        <span class="tok-b">str</span>: Название жеста
    """
    <span class="tok-c"># Используем нужные индексы</span>
    needed = [LS, RS, LW, RW, LH, RH]

    <span class="tok-c"># Если уверенность меньше порога — возвращаем "none"</span>
    <span class="tok-k">if</span> (kp[needed, <span class="tok-n">2</span>] < MIN_KPT_CONF).any():
        <span class="tok-k">return</span> <span class="tok-s">'none'</span>

    lx, ly = kp[LS][:<span class="tok-n">2</span>]
    rx, ry = kp[RS][:<span class="tok-n">2</span>]
    lwx, lwy = kp[LW][:<span class="tok-n">2</span>]
    rwx, rwy = kp[RW][:<span class="tok-n">2</span>]
    lhy, rhy = kp[LH][<span class="tok-n">1</span>], kp[RH][<span class="tok-n">1</span>]

    shoulder_span = <span class="tok-b">max</span>(<span class="tok-n">1.0</span>, <span class="tok-b">abs</span>(rx - lx))
    torso_len = <span class="tok-b">max</span>(<span class="tok-n">1.0</span>, <span class="tok-b">max</span>(<span class="tok-b">abs</span>(ly - lhy), <span class="tok-b">abs</span>(ry - rhy)))

    <span class="tok-c"># Относительное смещение запястий к плечам (вверх — положительное)</span>
    dx_l, dy_l_up = lwx - lx, ly - lwy
    dx_r, dy_r_up = rwx - rx, ry - rwy

    len_l = math.hypot(dx_l, dy_l_up)
    len_r = math.hypot(dx_r, dy_r_up)

    ang_l = _angle_deg(dx_l, dy_l_up)
    ang_r = _angle_deg(dx_r, dy_r_up)

    ANG_UP_THR = <span class="tok-n">25</span>
    ANG_SIDE_THR = <span class="tok-n">25</span>
    LEN_UP_K = <span class="tok-n">0.32</span>
    LEN_SIDE_K = <span class="tok-n">0.48</span>
    OFF_UP_K = <span class="tok-n">0.28</span>
    OFF_SIDE_K = <span class="tok-n">0.55</span>
    VERT_TOL_K = <span class="tok-n">0.32</span>

    wrist_centre_thr_px = <span class="tok-b">max</span>(<span class="tok-n">40.0</span>, <span class="tok-n">0.18</span> * shoulder_span)

    l_up = (ang_l < ANG_UP_THR <span class="tok-k">and</span> len_l > LEN_UP_K * torso_len) <span class="tok-k">or</span> (lwy < ly - OFF_UP_K * torso_len)
    r_up = (ang_r < ANG_UP_THR <span class="tok-k">and</span> len_r > LEN_UP_K * torso_len) <span class="tok-k">or</span> (rwy < ry - OFF_UP_K * torso_len)

    l_side = (
        <span class="tok-b">abs</span>(ang_l - <span class="tok-n">90</span>) < ANG_SIDE_THR <span class="tok-k">and</span> len_l > LEN_SIDE_K * shoulder_span
    ) <span class="tok-k">or</span> (
        lwx < lx - OFF_SIDE_K * shoulder_span <span class="tok-k">and</span> <span class="tok-b">abs</span>(lwy - ly) < VERT_TOL_K * torso_len
    )

    r_side = (
        <span class="tok-b">abs</span>(ang_r - <span class="tok-n">90</span>) < ANG_SIDE_THR <span class="tok-k">and</span> len_r > LEN_SIDE_K * shoulder_span
    ) <span class="tok-k">or</span> (
        rwx > rx + OFF_SIDE_K * shoulder_span <span class="tok-k">and</span> <span class="tok-b">abs</span>(rwy - ry) < VERT_TOL_K * torso_len
    )

    <span class="tok-k">if</span> math.hypot(lwx - rwx, lwy - rwy) < wrist_centre_thr_px:
        <span class="tok-k">return</span> <span class="tok-s">'wrist_centre'</span>
    <span class="tok-k">if</span> l_up <span class="tok-k">and</span> r_up:
        <span class="tok-k">return</span> <span class="tok-s">'two_hand_up'</span>
    <span class="tok-k">if</span> l_side <span class="tok-k">and</span> r_side:
        <span class="tok-k">return</span> <span class="tok-s">'two_hand_side'</span>
    <span class="tok-k">if</span> l_up:
        <span class="tok-k">return</span> <span class="tok-s">'left_up'</span>
    <span class="tok-k">if</span> r_up:
        <span class="tok-k">return</span> <span class="tok-s">'right_up'</span>
    <span class="tok-k">if</span> l_side:
        <span class="tok-k">return</span> <span class="tok-s">'left_side'</span>
    <span class="tok-k">if</span> r_side:
        <span class="tok-k">return</span> <span class="tok-s">'right_side'</span>

    <span class="tok-k">return</span> <span class="tok-s">'none'</span>

<span class="tok-k">def</span> should_execute(cmd, last_cmds_deque, target_pose, threshold=THRESHOLD):
    """
    Проверяет, нужно ли выполнить команду (жест) после стабильного повторения

    Args:
        cmd (<span class="tok-b">str</span>): Текущий жест
        last_cmds_deque (deque): История последних жестов
        target_pose (<span class="tok-b">str</span>): Целевой жест
        threshold (<span class="tok-b">int</span>): Порог количества кадров для стабильности

    Returns:
        bool: <span class="tok-k">True</span> если нужно выполнить команду, иначе <span class="tok-k">False</span>
    """
    <span class="tok-c"># Если текущий жест не совпадает с целевым — очищаем историю</span>
    <span class="tok-k">if</span> cmd != target_pose:
        last_cmds_deque.clear()
        <span class="tok-k">return</span> <span class="tok-k">False</span>

    <span class="tok-c"># Добавляем новый жест в историю</span>
    last_cmds_deque.append(cmd)

    <span class="tok-c"># Если истории меньше порога — не выполняем</span>
    <span class="tok-k">if</span> <span class="tok-b">len</span>(last_cmds_deque) < threshold:
        <span class="tok-k">return</span> <span class="tok-k">False</span>

    <span class="tok-c"># Если все элементы совпадают с целевым — очищаем историю и возвращаем True</span>
    <span class="tok-k">if</span> all(c == target_pose <span class="tok-k">for</span> c <span class="tok-k">in</span> last_cmds_deque):
        last_cmds_deque.clear()
        <span class="tok-k">return</span> <span class="tok-k">True</span>

    <span class="tok-k">return</span> <span class="tok-k">False</span>

<span class="tok-k">def</span> _select_primary_pose(poses):
    """
    Выбирает основную позу (с наибольшей площадью bbox)

    Args:
        poses (<span class="tok-b">list</span>): Список найденных поз

    Returns:
        <span class="tok-b">dict</span> <span class="tok-k">or</span> <span class="tok-k">None</span>: Поза с наибольшей площадью или <span class="tok-k">None</span> если нет поз
    """
    <span class="tok-c"># Если нет поз — возвращаем None</span>
    <span class="tok-k">if</span> <span class="tok-k">not</span> poses:
        <span class="tok-k">return</span> <span class="tok-k">None</span>

    <span class="tok-c"># Вспомогательная функция для вычисления площади bbox</span>
    <span class="tok-k">def</span> _area(p):
        x1, y1, x2, y2 = p[<span class="tok-s">'bbox'</span>]
        <span class="tok-k">return</span> <span class="tok-b">max</span>(<span class="tok-n">0.0</span>, x2 - x1) * <span class="tok-b">max</span>(<span class="tok-n">0.0</span>, y2 - y1)

    <span class="tok-c"># Возвращаем позу с наибольшей площадью</span>
    <span class="tok-k">return</span> <span class="tok-b">max</span>(poses, key=_area)

<span class="tok-k">def</span> pose_compare(result, target_pose, last_cmds, threshold=THRESHOLD, selector=<span class="tok-s">'largest'</span>):
    """
    Сравнивает результат детекции с целевым жестом и проверяет, нужно ли выполнить его

    Args:
        result (<span class="tok-b">dict</span>): Результат детекции
        target_pose (<span class="tok-b">str</span>): Целевой жест
        last_cmds (deque <span class="tok-k">or</span> <span class="tok-b">dict</span>): История команд или словарь с историей по жестам
        threshold (<span class="tok-b">int</span>): Порог количества кадров для стабильности
        selector (<span class="tok-b">str</span>): Метод выбора позы (<span class="tok-s">'largest'</span> или <span class="tok-s">'first'</span>)

    Returns:
        bool: <span class="tok-k">True</span> если нужно выполнить команду, иначе <span class="tok-k">False</span>
    """
    poses = result.get(<span class="tok-s">'poses'</span>, [])

    pose_entry = _select_primary_pose(poses) <span class="tok-k">if</span> selector == <span class="tok-s">'largest'</span> <span class="tok-k">else</span> (poses[<span class="tok-n">0</span>] <span class="tok-k">if</span> poses <span class="tok-k">else</span> <span class="tok-k">None</span>)
    <span class="tok-k">if</span> pose_entry <span class="tok-k">is</span> <span class="tok-k">None</span>:
        <span class="tok-k">return</span> <span class="tok-k">False</span>

    <span class="tok-c"># Определяем жест текущей позы</span>
    pose_name = classify_gesture(pose_entry[<span class="tok-s">'kpts'</span>])

    <span class="tok-c"># Получаем deque для целевого жеста (если last_cmds — словарь)</span>
    dq = last_cmds.get(target_pose) <span class="tok-k">if</span> <span class="tok-b">isinstance</span>(last_cmds, <span class="tok-b">dict</span>) <span class="tok-k">else</span> last_cmds
    <span class="tok-k">if</span> dq <span class="tok-k">is</span> <span class="tok-k">None</span>:
        <span class="tok-c"># Если не найдено — создаём новый deque</span>
        dq = deque(maxlen=threshold)
        <span class="tok-k">if</span> <span class="tok-b">isinstance</span>(last_cmds, <span class="tok-b">dict</span>):
            last_cmds[target_pose] = dq
    <span class="tok-c"># Проверяем, нужно ли выполнить команду</span>
    <span class="tok-k">if</span> should_execute(pose_name, dq, target_pose, threshold):
        <span class="tok-c">#print(f"***************** EXECUTE → {pose_name}")</span>
        <span class="tok-k">return</span> <span class="tok-k">True</span>
    <span class="tok-k">return</span> <span class="tok-k">False</span>

<span class="tok-c"># Инициализация истории команд для всех жестов</span>
last_cmds = {pose_name: deque(maxlen=<span class="tok-n">8</span>) <span class="tok-k">for</span> pose_name <span class="tok-k">in</span> [
    <span class="tok-s">'left_up'</span>, <span class="tok-s">'right_up'</span>,
    <span class="tok-s">'left_side'</span>, <span class="tok-s">'right_side'</span>,
    <span class="tok-s">'two_hand_up'</span>, <span class="tok-s">'two_hand_side'</span>,
    <span class="tok-s">'wrist_centre'</span>
]}

<span class="tok-k">def</span> main_demonstration():
    <span class="tok-c"># Инициализация трекера</span>
    tracker_state = tracker_new(iou_thr=<span class="tok-n">0.35</span>)
    <span class="tok-b">print</span>("Выбрана модель: YoloPose")

    <span class="tok-c"># Загрузка модели YoloPose</span>
    model = YoloPose(model_name="yolov8n-pose")
    <span class="tok-k">while</span> <span class="tok-k">True</span>:
        <span class="tok-c"># Получаем кадр с камеры</span>
        image_1 = cam_main.get_cv_frame()

        <span class="tok-c"># Выполняем детекцию</span>
        object_1 = find_poses(image_1, model.run([resize_img(image_1)]))

        <span class="tok-c"># Отрисовываем позы и обновляем трекер</span>
        draw_poses(image_1, object_1, tracker_state)

        <span class="tok-c"># Отображаем изображение</span>
        iv.imshow(name=<span class="tok-s">'first'</span>, frame=image_1)

<span class="tok-k">def</span> main_compare():
    <span class="tok-c"># Инициализация трекера</span>
    tracker_state = tracker_new(iou_thr=<span class="tok-n">0.35</span>)
    <span class="tok-b">print</span>("Выбрана модель: YoloPose")

    <span class="tok-c"># Загрузка модели YoloPose</span>
    model = YoloPose(model_name="yolov8n-pose")
    <span class="tok-k">while</span> <span class="tok-k">True</span>:
        <span class="tok-c"># Получаем кадр с камеры</span>
        image_1 = cam_main.get_cv_frame()

        <span class="tok-c"># Выполняем детекцию</span>
        object_1 = find_poses(image_1, model.run([resize_img(image_1)]))

        <span class="tok-c"># Выполняем сравнение</span>
        <span class="tok-k">if</span> pose_compare(object_1, "left_side", last_cmds):
            <span class="tok-b">print</span>(<span class="tok-s">'left'</span>)
        <span class="tok-k">elif</span> pose_compare(object_1, "right_side", last_cmds):
            <span class="tok-b">print</span>(<span class="tok-s">'right'</span>)

        <span class="tok-c"># Отрисовываем позы и обновляем трекер</span>
        draw_poses(image_1, object_1, tracker_state)

        <span class="tok-c"># Отображаем изображение</span>
        iv.imshow(name=<span class="tok-s">'first'</span>, frame=image_1)

<span class="tok-k">if</span> __name__ == "__main__":
    <span class="tok-k">if</span> <span class="tok-b">len</span>(sys.argv) < <span class="tok-n">2</span>:
        <span class="tok-b">print</span>("Использование: python3 demonstration_pose.py [demonstration|compare]")
        sys.exit(<span class="tok-n">1</span>)

    arg = sys.argv[<span class="tok-n">1</span>].lower()

    <span class="tok-k">if</span> arg == "demonstration":
        main_demonstration()
    <span class="tok-k">elif</span> arg == "compare":
        main_compare()
    <span class="tok-k">else</span>:
        <span class="tok-b">print</span>(f"Неизвестный аргумент: {arg}")</code></pre></div>
<h4 id="s-yoloseg-детекция-всех-классов"><a class="anchor" href="#s-yoloseg-детекция-всех-классов" aria-hidden="true">§</a>YoloSeg - детекция всех классов</h4>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">import</span> cv2
<span class="tok-k">import</span> numpy <span class="tok-k">as</span> np
<span class="tok-k">from</span> pioneer_rknn <span class="tok-k">import</span> YoloSeg
<span class="tok-k">from</span> pioneer_sdk2 <span class="tok-k">import</span> Camera, ImageViewer, CameraType

<span class="tok-c"># Глобальные переменные — изображения и результаты детекции</span>
image_1 = <span class="tok-k">None</span>
object_1 = <span class="tok-k">None</span>

classNames = ["person", "bicycle", "car", "motorbike", "aeroplane", "bus", "train", "truck", "boat",
    "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat",
    "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella",
    "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball", "kite", "baseball bat",
    "baseball glove", "skateboard", "surfboard", "tennis racket", "bottle", "wine glass", "cup",
    "fork", "knife", "spoon", "bowl", "banana", "apple", "sandwich", "orange", "broccoli",
    "carrot", "hot dog", "pizza", "donut", "cake", "chair", "sofa", "pottedplant", "bed",
    "diningtable", "toilet", "tvmonitor", "laptop", "mouse", "remote", "keyboard", "cell phone",
    "microwave", "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase", "scissors",
    "teddy bear", "hair drier", "toothbrush"]

<span class="tok-k">def</span> resize_img(img):
    """
    Изменяет размер изображения до IMG_SIZE и добавляет ось batch

    Args:
        img (numpy.ndarray): Исходное изображение

    Returns:
        numpy.ndarray: Изображение с размером IMG_SIZE и добавленной осью batch
    """
    <span class="tok-c"># Изменяем размер изображения до IMG_SIZE</span>
    img_copy = cv2.resize(img, IMG_SIZE)

    <span class="tok-c"># Добавляем ось batch (для RKNN)</span>
    img_copy = np.expand_dims(img_copy, <span class="tok-n">0</span>)
    <span class="tok-k">return</span> img_copy

<span class="tok-k">def</span> yolo_find_on_image(img, results, classNames, class_filter=<span class="tok-k">None</span>, score_thr=<span class="tok-k">None</span>):
    """
    Фильтрует результаты детекции YOLO по классам и уверенности

    Args:
        img (numpy.ndarray): Исходное изображение
        results (<span class="tok-b">tuple</span>): Результаты детекции (boxes, classes, scores)
        classNames (<span class="tok-b">list</span>): Список названий классов
        class_filter (<span class="tok-b">list</span> <span class="tok-k">or</span> <span class="tok-k">None</span>): Список классов для фильтрации
        score_thr (<span class="tok-b">float</span> <span class="tok-k">or</span> <span class="tok-k">None</span>): Порог уверенности

    Returns:
        <span class="tok-b">dict</span>: Фильтрованные результаты детекции
    """
    boxes, classes, scores, masks = results <span class="tok-c"># Распаковываем результаты</span>

    <span class="tok-c"># Если нет данных — возвращаем пустой словарь</span>
    <span class="tok-k">if</span> boxes <span class="tok-k">is</span> <span class="tok-k">None</span> <span class="tok-k">or</span> classes <span class="tok-k">is</span> <span class="tok-k">None</span> <span class="tok-k">or</span> scores <span class="tok-k">is</span> <span class="tok-k">None</span> <span class="tok-k">or</span> masks <span class="tok-k">is</span> <span class="tok-k">None</span> <span class="tok-k">or</span> <span class="tok-b">len</span>(boxes) == <span class="tok-n">0</span>:
        <span class="tok-k">return</span> {
            "boxes": np.zeros((<span class="tok-n">0</span>, <span class="tok-n">4</span>), dtype=np.float32),
            "classes": np.zeros((<span class="tok-n">0</span>,), dtype=np.int32),
            "scores": np.zeros((<span class="tok-n">0</span>,), dtype=np.float32),
            "masks": np.zeros((<span class="tok-n">0</span>,), dtype=np.float32),
            "orig_shape": img.shape[:<span class="tok-n">2</span>],
            "classNames": classNames
        }

    <span class="tok-c"># Преобразуем данные в массивы NumPy</span>
    boxes = np.array(boxes)
    classes = np.array(classes)
    scores = np.array(scores)
    masks = np.array(masks)

    indices = np.arange(<span class="tok-b">len</span>(boxes))  <span class="tok-c"># Индексы всех детекций</span>

    <span class="tok-c"># Фильтрация по классам (если указано)</span>
    <span class="tok-k">if</span> class_filter <span class="tok-k">is</span> <span class="tok-k">not</span> <span class="tok-k">None</span>:
        allowed = [classNames.index(cls_name) <span class="tok-k">for</span> cls_name <span class="tok-k">in</span> class_filter <span class="tok-k">if</span> cls_name <span class="tok-k">in</span> classNames]
        indices = [i <span class="tok-k">for</span> i <span class="tok-k">in</span> indices <span class="tok-k">if</span> classes[i] <span class="tok-k">in</span> allowed]

    <span class="tok-c"># Фильтрация по уверенности (если указано)</span>
    <span class="tok-k">if</span> score_thr <span class="tok-k">is</span> <span class="tok-k">not</span> <span class="tok-k">None</span>:
        indices = [i <span class="tok-k">for</span> i <span class="tok-k">in</span> indices <span class="tok-k">if</span> scores[i] >= score_thr]

    <span class="tok-c"># Возвращаем фильтрованные данные</span>
    <span class="tok-k">return</span> {
        "boxes": boxes[indices],
        "classes": classes[indices],
        "scores": scores[indices],
        "masks": masks[indices],
        "orig_shape": img.shape[:<span class="tok-n">2</span>],
        "classNames": classNames
    }

<span class="tok-k">def</span> _class_color(class_id: <span class="tok-b">int</span>) -> <span class="tok-b">tuple</span>:
    """Генерирует цвет для класса на основе его id

    Args:
        class_id (<span class="tok-b">int</span>): ID класса в списке классов

    Returns:
        <span class="tok-b">tuple</span>: B,G и R каналы для всех каналов
    """
    rng = np.random.default_rng(class_id)
    b, g, r = rng.integers(<span class="tok-n">50</span>, <span class="tok-n">255</span>, size=<span class="tok-n">3</span>)
    <span class="tok-k">return</span> (<span class="tok-b">int</span>(b), <span class="tok-b">int</span>(g), <span class="tok-b">int</span>(r))

<span class="tok-k">def</span> draw_yolo_on_image(img, yolo_obj, color=(<span class="tok-n">0</span>,<span class="tok-n">255</span>,<span class="tok-n">0</span>), thickness=<span class="tok-n">2</span>, mask_alpha=<span class="tok-n">0.7</span>):
    """
    Отрисовывает детекции YOLO на изображении.
    Маски раскрашиваются разными цветами по классам, рамки/подписи - цветом `color`

    Args:
        img (numpy.ndarray): Изображение для отрисовки
        yolo_obj (<span class="tok-b">dict</span>): Результаты детекции
        color (<span class="tok-b">tuple</span>): Цвет рамки/подписи (единый, например чтобы отличать камеры)
        thickness (<span class="tok-b">int</span>): Толщина линии
        mask_alpha (<span class="tok-b">float</span>): Прозрачность наложения масок (<span class="tok-n">0</span>..<span class="tok-n">1</span>)
    """
    boxes = yolo_obj["boxes"]
    classes = yolo_obj["classes"]
    classNames = yolo_obj["classNames"]
    masks = yolo_obj["masks"]
    orig_h, orig_w = yolo_obj["orig_shape"]

    scale_x = orig_w / IMG_SIZE[<span class="tok-n">0</span>]
    scale_y = orig_h / IMG_SIZE[<span class="tok-n">1</span>]

    <span class="tok-c"># Наложение масок — разными цветами по классам</span>
    <span class="tok-k">if</span> <span class="tok-b">len</span>(masks) > <span class="tok-n">0</span>:
        overlay = img.copy()
        <span class="tok-k">for</span> mask, cl <span class="tok-k">in</span> <span class="tok-b">zip</span>(masks, classes):
            mask_color = _class_color(<span class="tok-b">int</span>(cl))
            mask_resized = cv2.resize(
                mask.astype(np.uint8), (orig_w, orig_h),
                interpolation=cv2.INTER_NEAREST
            )
            overlay[mask_resized == <span class="tok-n">1</span>] = mask_color <span class="tok-c"># Задаём пикселям, принадлежащим маске, сгенерированный цвет</span>

        img[:] = cv2.addWeighted(overlay, mask_alpha, img, <span class="tok-n">1</span> - mask_alpha, <span class="tok-n">0</span>) <span class="tok-c"># Складываем раскрашенные маски с исходным изображением</span>

    <span class="tok-c"># Подписываем детекции</span>
    <span class="tok-k">for</span> box, cl <span class="tok-k">in</span> <span class="tok-b">zip</span>(boxes, classes):
        left, top, _, _ = [<span class="tok-b">int</span>(coord) <span class="tok-k">for</span> coord <span class="tok-k">in</span> box]

        left   = <span class="tok-b">int</span>(left * scale_x)
        top    = <span class="tok-b">int</span>(top * scale_y)

        label = f"{classNames[cl]}"
        cv2.putText(img, label, (left, top-<span class="tok-n">10</span>), cv2.FONT_HERSHEY_SIMPLEX, <span class="tok-n">0.9</span>, color, <span class="tok-n">2</span>)

<span class="tok-c"># Инициализация камер</span>
cam_main = Camera(camera_type=CameraType.MAIN)
iv = ImageViewer() <span class="tok-c"># Инициализация отображения изображений</span>

<span class="tok-k">def</span> hex_to_bgr(hex_color: <span class="tok-b">str</span>) -> <span class="tok-b">tuple</span>[<span class="tok-b">int</span>, <span class="tok-b">int</span>, <span class="tok-b">int</span>]:
    """
    Преобразует HEX-цвет в BGR (OpenCV формат)

    Args:
        hex_color (<span class="tok-b">str</span>): HEX цвет в формате <span class="tok-c">#RRGGBB</span>

    Returns:
        <span class="tok-b">tuple</span>[<span class="tok-b">int</span>, <span class="tok-b">int</span>, <span class="tok-b">int</span>]: Цвет в формате BGR
    """
    <span class="tok-c"># Убираем символ #</span>
    <span class="tok-k">if</span> hex_color.startswith("<span class="tok-c">#"):</span>
        hex_color = hex_color[<span class="tok-n">1</span>:]

    <span class="tok-c"># Проверяем длину</span>
    <span class="tok-k">if</span> <span class="tok-b">len</span>(hex_color) != <span class="tok-n">6</span>:
        <span class="tok-k">raise</span> ValueError("Hex color must be <span class="tok-k">in</span> format <span class="tok-c">#RRGGBB")</span>

    <span class="tok-c"># Преобразуем HEX в BGR</span>
    r = <span class="tok-b">int</span>(hex_color[<span class="tok-n">0</span>:<span class="tok-n">2</span>], <span class="tok-n">16</span>)
    g = <span class="tok-b">int</span>(hex_color[<span class="tok-n">2</span>:<span class="tok-n">4</span>], <span class="tok-n">16</span>)
    b = <span class="tok-b">int</span>(hex_color[<span class="tok-n">4</span>:<span class="tok-n">6</span>], <span class="tok-n">16</span>)

    <span class="tok-k">return</span> (b, g, r)

<span class="tok-k">if</span> __name__ == "__main__":
    <span class="tok-b">print</span>("Выбрана модель:Yolo")
    IMG_SIZE = (<span class="tok-n">640</span>, <span class="tok-n">640</span>)

    <span class="tok-c"># Загрузка модели Yolo</span>
    model = YoloSeg(model_name="yolov8n-seg")
    <span class="tok-k">while</span> <span class="tok-k">True</span>:

        <span class="tok-c"># Получаем кадры с камер</span>
        image_1 = cam_main.get_cv_frame()

        <span class="tok-c"># Выполняем детекцию</span>
        object_1 = yolo_find_on_image(image_1, results_image_1 := model.run([resize_img(image_1)]), classNames, class_filter=<span class="tok-k">None</span>)

        <span class="tok-c"># Отрисовываем детекции</span>
        draw_yolo_on_image(image_1, object_1, hex_to_bgr("<span class="tok-c">#ff4040"))</span>

        <span class="tok-c"># Отображаем изображения</span>
        iv.imshow(name=<span class="tok-s">'first'</span>, frame=image_1)</code></pre></div>
<h4 id="s-paddleocr-детекция-текстовых-регионов"><a class="anchor" href="#s-paddleocr-детекция-текстовых-регионов" aria-hidden="true">§</a>PaddleOCR - детекция текстовых регионов</h4>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">import</span> cv2
<span class="tok-k">import</span> numpy <span class="tok-k">as</span> np
<span class="tok-k">from</span> pioneer_rknn <span class="tok-k">import</span> PaddleOCR
<span class="tok-k">from</span> pioneer_sdk2 <span class="tok-k">import</span> Camera, ImageViewer, CameraType
<span class="tok-k">from</span> PIL <span class="tok-k">import</span> ImageFont, ImageDraw, Image

<span class="tok-c"># Глобальные переменные — изображение, результаты и текст</span>
image_1 = <span class="tok-k">None</span>
object_1 = <span class="tok-k">None</span>
text = <span class="tok-k">None</span>

<span class="tok-c"># Инициализация камер</span>
cam_main, cam_opt = Camera(camera_type=CameraType.MAIN), Camera(camera_type=CameraType.OPT)

<span class="tok-c"># Инициализация Image Viewer'a</span>
iv = ImageViewer()

<span class="tok-k">def</span> draw_text_in_corner(text, frame, color):
    """
    Выводит текст в левом верхнем углу изображения

    Args:
        text (<span class="tok-b">str</span>): Текст для отрисовки
        frame (numpy.ndarray): Изображение
        color (<span class="tok-b">tuple</span>): Цвет текста (BGR)

    Returns:
        numpy.ndarray: Изображение с добавленным текстом
    """
    <span class="tok-c"># Преобразуем OpenCV-изображение в PIL-формат (RGB)</span>
    frame_pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

    <span class="tok-c"># Создаем объект для рисования</span>
    draw = ImageDraw.Draw(frame_pil)

    <span class="tok-c"># Загружаем шрифт (DejaVuSans)</span>
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", <span class="tok-n">28</span>)

    lines = text.split("\n") <span class="tok-c"># Разбиваем текст на строки</span>
    x, y = <span class="tok-n">10</span>, <span class="tok-n">30</span> <span class="tok-c"># Начальные координаты</span>

    <span class="tok-c"># Рисуем каждую строку</span>
    <span class="tok-k">for</span> line <span class="tok-k">in</span> lines:
        draw.text((x, y), line, font=font, fill=(*color[::-<span class="tok-n">1</span>], <span class="tok-n">255</span>))  <span class="tok-c"># RGB!</span>
        y += <span class="tok-n">34</span>

    <span class="tok-c"># Обратно в BGR</span>
    frame_out = cv2.cvtColor(np.array(frame_pil), cv2.COLOR_RGB2BGR)
    <span class="tok-k">return</span> frame_out

<span class="tok-k">def</span> hex_to_bgr(hex_color: <span class="tok-b">str</span>) -> <span class="tok-b">tuple</span>[<span class="tok-b">int</span>, <span class="tok-b">int</span>, <span class="tok-b">int</span>]:
    """
    Преобразует HEX-цвет в BGR (OpenCV формат)

    Args:
        hex_color (<span class="tok-b">str</span>): HEX цвет в формате <span class="tok-c">#RRGGBB</span>

    Returns:
        <span class="tok-b">tuple</span>[<span class="tok-b">int</span>, <span class="tok-b">int</span>, <span class="tok-b">int</span>]: Цвет в формате BGR
    """
    <span class="tok-c"># Убираем символ #</span>
    <span class="tok-k">if</span> hex_color.startswith("<span class="tok-c">#"):</span>
        hex_color = hex_color[<span class="tok-n">1</span>:]

    <span class="tok-c"># Проверяем длину</span>
    <span class="tok-k">if</span> <span class="tok-b">len</span>(hex_color) != <span class="tok-n">6</span>:
        <span class="tok-k">raise</span> ValueError("Hex color must be <span class="tok-k">in</span> format <span class="tok-c">#RRGGBB")</span>

    <span class="tok-c"># Преобразуем HEX в BGR</span>
    r = <span class="tok-b">int</span>(hex_color[<span class="tok-n">0</span>:<span class="tok-n">2</span>], <span class="tok-n">16</span>)
    g = <span class="tok-b">int</span>(hex_color[<span class="tok-n">2</span>:<span class="tok-n">4</span>], <span class="tok-n">16</span>)
    b = <span class="tok-b">int</span>(hex_color[<span class="tok-n">4</span>:<span class="tok-n">6</span>], <span class="tok-n">16</span>)

    <span class="tok-k">return</span> (b, g, r)

<span class="tok-k">if</span> __name__ == "__main__":
    <span class="tok-b">print</span>("Выбрана модель: PaddleOCR")
    <span class="tok-c"># Загрузка модели PaddleOCR с детекцией и распознаванием</span>
    model = PaddleOCR(det_model_name="PP-OCRv5_mobile_det",
                    rec_model_name="eslav_PP-OCRv5_mobile_rec")

    <span class="tok-k">while</span> <span class="tok-k">True</span>:
        <span class="tok-c"># Получаем кадр с камеры</span>
        image_1 = cam_main.get_cv_frame()

        <span class="tok-c"># Выполняем OCR-детекцию и распознавание</span>
        object_1 = [model.run(image_1)]

        <span class="tok-c"># Извлекаем текст из результатов</span>
        text = "\n".join([text <span class="tok-k">for</span> group <span class="tok-k">in</span> object_1[<span class="tok-n">0</span>][<span class="tok-n">1</span>] <span class="tok-k">for</span> (text, _) <span class="tok-k">in</span> group])

        <span class="tok-c"># Выводим текст в левом верхнем углу</span>
        image_1 = draw_text_in_corner(text=text, frame=image_1, color=hex_to_bgr("<span class="tok-c">#ff4040"))</span>

        <span class="tok-c"># Отображаем изображение</span>
        iv.imshow(name=<span class="tok-s">'first'</span>, frame=image_1)</code></pre></div>
<h4 id="s-paddleocr-детекция-текстовых-регионов-и-вывод-слов-в-консоль"><a class="anchor" href="#s-paddleocr-детекция-текстовых-регионов-и-вывод-слов-в-консоль" aria-hidden="true">§</a>PaddleOCR - детекция текстовых регионов и вывод слов в консоль</h4>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">import</span> cv2
<span class="tok-k">import</span> numpy <span class="tok-k">as</span> np
<span class="tok-k">from</span> pioneer_rknn <span class="tok-k">import</span> PaddleOCR
<span class="tok-k">from</span> pioneer_sdk2 <span class="tok-k">import</span> Camera, ImageViewer, CameraType

<span class="tok-c"># Глобальные переменные — изображение, результаты и текст</span>
image_1 = <span class="tok-k">None</span>
object_1 = <span class="tok-k">None</span>
text = <span class="tok-k">None</span>

<span class="tok-c"># Инициализация камер</span>
cam_main, cam_opt = Camera(camera_type=CameraType.MAIN), Camera(camera_type=CameraType.OPT)

<span class="tok-c"># Инициализация Image Viewer'a</span>
iv = ImageViewer()

<span class="tok-k">def</span> draw_bboxes_on_image(img, output):
    """
    Отрисовывает bounding boxes на изображении

    Args:
        img (numpy.ndarray): Изображение для отрисовки
        output (object): Результаты детекции OCR

    Returns:
        numpy.ndarray: Изображение с отрисованными боксами
    """
    <span class="tok-c"># Функция проверяет, является ли объект bbox-подобным</span>
    <span class="tok-k">def</span> is_bbox_like(x):
        <span class="tok-c"># Если ndarray и 2D с 2 колонками и минимум 4 строками — валидно</span>
        <span class="tok-k">if</span> <span class="tok-b">isinstance</span>(x, np.ndarray) <span class="tok-k">and</span> x.ndim == <span class="tok-n">2</span> <span class="tok-k">and</span> x.shape[<span class="tok-n">1</span>] == <span class="tok-n">2</span> <span class="tok-k">and</span> x.shape[<span class="tok-n">0</span>] >= <span class="tok-n">4</span>:
            <span class="tok-k">return</span> <span class="tok-k">True</span>

        <span class="tok-c"># Если list/tuple и минимум 4 элемента — проверяем преобразование</span>
        <span class="tok-k">if</span> <span class="tok-b">isinstance</span>(x, (<span class="tok-b">list</span>, <span class="tok-b">tuple</span>)) <span class="tok-k">and</span> <span class="tok-b">len</span>(x) >= <span class="tok-n">4</span>:
            <span class="tok-k">try</span>:
                arr = np.array(x, dtype=<span class="tok-b">float</span>)
                <span class="tok-k">return</span> arr.ndim == <span class="tok-n">2</span> <span class="tok-k">and</span> arr.shape[<span class="tok-n">1</span>] == <span class="tok-n">2</span> <span class="tok-k">and</span> arr.shape[<span class="tok-n">0</span>] >= <span class="tok-n">4</span>
            <span class="tok-k">except</span> Exception:
                <span class="tok-k">return</span> <span class="tok-k">False</span>
        <span class="tok-k">return</span> <span class="tok-k">False</span>

    <span class="tok-c"># Рекурсивная функция для отрисовки любого объекта</span>
    <span class="tok-k">def</span> _draw_any(obj, level=<span class="tok-n">0</span>):
        <span class="tok-c"># Пытается нарисовать, если валидный bbox</span>
        <span class="tok-k">if</span> is_bbox_like(obj):
            pts = np.array(obj, dtype=np.int32).reshape((-<span class="tok-n">1</span>, <span class="tok-n">1</span>, <span class="tok-n">2</span>))
            cv2.polylines(img, [pts], isClosed=<span class="tok-k">True</span>, color=(<span class="tok-n">155</span>,<span class="tok-n">155</span>,<span class="tok-n">0</span>), thickness=<span class="tok-n">2</span>)
            <span class="tok-k">return</span>
        <span class="tok-c"># Если это лист/tuple — проходимся рекурсивно</span>
        <span class="tok-k">if</span> <span class="tok-b">isinstance</span>(obj, (<span class="tok-b">list</span>, <span class="tok-b">tuple</span>)):
            <span class="tok-k">for</span> elem <span class="tok-k">in</span> obj:
                _draw_any(elem, level+<span class="tok-n">1</span>)

    <span class="tok-c"># Запускаем отрисовку</span>
    _draw_any(output)
    <span class="tok-k">return</span> img

<span class="tok-k">if</span> __name__ == "__main__":
    <span class="tok-b">print</span>("Выбрана модель: PaddleOCR")
    <span class="tok-c"># Загрузка модели PaddleOCR с детекцией и распознаванием</span>
    model = PaddleOCR(det_model_name="PP-OCRv5_mobile_det",
                    rec_model_name="eslav_PP-OCRv5_mobile_rec")

    <span class="tok-k">while</span> <span class="tok-k">True</span>:
        <span class="tok-c"># Получаем кадр с камеры</span>
        image_1 = cam_main.get_cv_frame()

        <span class="tok-c"># Выполняем OCR-детекцию и распознавание</span>
        object_1 = [model.run(image_1)]

        <span class="tok-c"># Извлекаем текст из результатов</span>
        text = "\n".join([text <span class="tok-k">for</span> group <span class="tok-k">in</span> object_1[<span class="tok-n">0</span>][<span class="tok-n">1</span>] <span class="tok-k">for</span> (text, _) <span class="tok-k">in</span> group])

        <span class="tok-c"># Отрисовываем боксы на изображении</span>
        draw_bboxes_on_image(image_1, object_1[<span class="tok-n">0</span>])

        <span class="tok-c"># Отображаем изображение</span>
        iv.imshow(name=<span class="tok-s">'first'</span>, frame=image_1)

        <span class="tok-c"># Пишем результат в консоль</span>
        <span class="tok-b">print</span>(<span class="tok-s">'\n'</span>, "-" * <span class="tok-n">30</span>, <span class="tok-s">'\n\n'</span>, text)</code></pre></div>
<p>Более подробное описание примеров для работы с библиотекой Pioneer-RKNN в GitFlic.</p>
<p>Представляет собой набор классов и функций для работы с моделями машинного обучения</p>
<p>Более подробное описание примеров для работы с библиотекой Pioneer-RKNN в GitFlic.</p></section>
<section class="docblock"><h2 id="s-класс-yolo"><a class="anchor" href="#s-класс-yolo" aria-hidden="true">§</a>Класс Yolo</h2>
<p>Инкапсулирует логику работы с моделью YOLO - загружает модель, выполняет инференс по входному изображению и проводит постобработку для получения координат объектов, классов и уверенности детекции</p>
<h3 id="s-инициализация-класса"><a class="anchor" href="#s-инициализация-класса" aria-hidden="true">§</a>Инициализация класса</h3>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_rknn <span class="tok-k">import</span> Yolo <span class="tok-c"># импортируем класс Yolo из библиотеки pioneer_rknn</span>

yolo = Yolo(                           <span class="tok-c"># создаём экземпляр класса Yolo</span>
            model_path    = <span class="tok-k">None</span>,      <span class="tok-c"># путь к модели в формате .rknn (указывать при отсутствии model_name)</span>
            model_name    = "yolov8n", <span class="tok-c"># имя модели в регистре моделей (указывать при отсутствии model_path)</span>
            npu_core      = [<span class="tok-n">0</span>],       <span class="tok-c"># номер NPU-ядра для вычислений (если None, будет выбрано автоматически)</span>
            object_thresh = <span class="tok-n">0.25</span>,      <span class="tok-c"># порог 25%, если выше, то объект в кадре считается искомым классом, например: human</span>
                                        <span class="tok-c"># формула: Уверенность модели в идентификации > object_thresh = human</span>
            nms_thresh    = <span class="tok-n">0.45</span>,      <span class="tok-c"># порог 45%, если выше, то объект в кадре считается обнаруженным повторно, удаляет дубликат рамки</span>
                                        <span class="tok-c"># формула: IoU > nms_thresh = delete</span>
            img_width     = <span class="tok-n">640</span>,       <span class="tok-c"># ширина изображения подаваемого для работы с моделью</span>
            img_height    = <span class="tok-n">640</span>)       <span class="tok-c"># высота изображения подаваемого для работы с моделью</span></code></pre></div>
<h3 id="s-методы-класса"><a class="anchor" href="#s-методы-класса" aria-hidden="true">§</a>Методы класса</h3>
<h4 id="s-выполнить-инференс-данных-на-yolo"><a class="anchor" href="#s-выполнить-инференс-данных-на-yolo" aria-hidden="true">§</a>Выполнить инференс данных на Yolo</h4>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_rknn <span class="tok-k">import</span> Yolo <span class="tok-c"># импортируем класс Yolo из библиотеки pioneer_rknn</span>

yolo = Yolo(                           <span class="tok-c"># создаём экземпляр класса Yolo</span>
            model_path    = <span class="tok-k">None</span>,      <span class="tok-c"># путь к модели в формате .rknn (указывать при отсутствии model_name)</span>
            model_name    = "yolov8n", <span class="tok-c"># имя модели в регистре моделей (указывать при отсутствии model_path)</span>
            npu_core      = [<span class="tok-n">0</span>],       <span class="tok-c"># номер NPU-ядра для вычислений (если None, будет выбрано автоматически)</span>
            object_thresh = <span class="tok-n">0.25</span>,      <span class="tok-c"># порог 25%, если выше, то объект в кадре считается искомым классом, например: human</span>
                                       <span class="tok-c"># формула: Уверенность модели в идентификации > object_thresh = human</span>
            nms_thresh    = <span class="tok-n">0.45</span>,      <span class="tok-c"># порог 45%, если выше, то объект в кадре считается обнаруженным повторно, удаляет дубликат рамки</span>
                                       <span class="tok-c"># формула: IoU > nms_thresh = delete</span>
            img_width     = <span class="tok-n">640</span>,       <span class="tok-c"># ширина изображения подаваемого для работы с моделью</span>
            img_height    = <span class="tok-n">640</span>)       <span class="tok-c"># высота изображения подаваемого для работы с моделью</span>

<span class="tok-b">print</span>(yolo.run(inputs = [])) <span class="tok-c"># выполняем инференс и обработку списка тензоров модели</span>
                             <span class="tok-c"># возвращает кортеж (boxes, classes, scores) или None, если нет результата</span></code></pre></div></section>
<section class="docblock"><h2 id="s-класс-yoloseg"><a class="anchor" href="#s-класс-yoloseg" aria-hidden="true">§</a>Класс YoloSeg</h2>
<p>Расширяет функциональность Yolo для решения задачи сегментации экземпляров (instance segmentation). Помимо детекции объектов, извлекает маски пикселей для каждого обнаруженного объекта и выполняет постобработку для получения контуров и итоговых бинарных масок с привязкой к соответствующим боксам и классам</p>
<h3 id="s-инициализация-класса"><a class="anchor" href="#s-инициализация-класса" aria-hidden="true">§</a>Инициализация класса</h3>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_rknn <span class="tok-k">import</span> YoloSeg <span class="tok-c"># импортируем класс YoloSeg из библиотеки pioneer_rknn</span>

yoloseg = YoloSeg(                         <span class="tok-c"># создаём экземпляр класса YoloSeg</span>
            model_path    = <span class="tok-k">None</span>,          <span class="tok-c"># путь к модели в формате .rknn (указывать при отсутствии model_name)</span>
            model_name    = "yolov8n-seg", <span class="tok-c"># имя модели в регистре моделей (указывать при отсутствии model_path)</span>
            npu_core      = [<span class="tok-n">0</span>],           <span class="tok-c"># номер NPU-ядра для вычислений (если None, будет выбрано автоматически)</span>
            object_thresh = <span class="tok-n">0.25</span>,          <span class="tok-c"># порог 25%, если выше, то объект в кадре считается искомым классом, например: human</span>
                                            <span class="tok-c"># формула: Уверенность модели в идентификации > object_thresh = human</span>
            nms_thresh    = <span class="tok-n">0.45</span>,          <span class="tok-c"># порог 45%, если выше, то объект в кадре считается обнаруженным повторно, удаляет дубликат рамки</span>
                                            <span class="tok-c"># формула: IoW > nms_thresh = delete</span>
            img_width     = <span class="tok-n">640</span>,           <span class="tok-c"># ширина изображения подаваемого для работы с моделью</span>
            img_height    = <span class="tok-n">640</span>)           <span class="tok-c"># высота изображения подаваемого для работы с моделью</span></code></pre></div>
<h3 id="s-методы-класса"><a class="anchor" href="#s-методы-класса" aria-hidden="true">§</a>Методы класса</h3>
<h4 id="s-выполнить-инференс-данных-на-yoloseg"><a class="anchor" href="#s-выполнить-инференс-данных-на-yoloseg" aria-hidden="true">§</a>Выполнить инференс данных на YoloSeg</h4>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_rknn <span class="tok-k">import</span> YoloSeg <span class="tok-c"># импортируем класс YoloSeg из библиотеки pioneer_rknn</span>

yoloseg = YoloSeg(                         <span class="tok-c"># создаем экземпляра класса YoloSeg</span>
            model_path    = <span class="tok-k">None</span>,          <span class="tok-c"># путь к модели в формате .rknn (указывать при отсутствии model_name)</span>
            model_name    = "yolov8n-seg", <span class="tok-c"># имя модели в регистре моделей (указывать при отсутствии model_path)</span>
            npu_core      = [<span class="tok-n">0</span>],           <span class="tok-c"># номер NPU-ядра для вычислений (если None, будет выбрано автоматически)</span>
            object_thresh = <span class="tok-n">0.25</span>,          <span class="tok-c"># порог 25%, если выше, то объект в кадре считается искомым классом, например: human</span>
                                           <span class="tok-c"># формула: Уверенность модели в идентификации > object_thresh = human</span>
            nms_thresh    = <span class="tok-n">0.45</span>,          <span class="tok-c"># порог 45%, если выше, то объект в кадре считается обнаруженным повторно, удаляет дубликат рамки</span>
                                           <span class="tok-c"># формула: IoW > nms_thresh = delete</span>
            img_width     = <span class="tok-n">640</span>,           <span class="tok-c"># ширина изображения подаваемого для работы с моделью</span>
            img_height    = <span class="tok-n">640</span>)           <span class="tok-c"># высота изображения подаваемого для работы с моделью</span>

<span class="tok-b">print</span>(yoloseg.run(inputs = [])) <span class="tok-c"># выполняем инференс и обработку списка тензоров модели</span>
                                <span class="tok-c"># возвращает кортеж (boxes, classes, scores, masks) или None, если нет результа</span></code></pre></div></section>
<section class="docblock"><h2 id="s-класс-yolopose"><a class="anchor" href="#s-класс-yolopose" aria-hidden="true">§</a>Класс YoloPose</h2>
<p>Расширяет функциональность Yolo для решения задачи оценки позиции (pose estimation). Помимо детекции объектов, извлекает ключевые точки скелета для каждого обнаруженного объекта и выполняет постобработку для получения координат и достоверности ключевых точек</p>
<h3 id="s-инициализация-класса"><a class="anchor" href="#s-инициализация-класса" aria-hidden="true">§</a>Инициализация класса</h3>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_rknn <span class="tok-k">import</span> YoloPose <span class="tok-c"># импортируем класс YoloPose из библиотеки pioneer_rknn</span>

yolopose = YoloPose(                        <span class="tok-c"># создаём экземпляр класса YoloPose</span>
            model_path    = <span class="tok-k">None</span>,           <span class="tok-c"># путь к модели в формате .rknn (указывать при отсутствии model_name)</span>
            model_name    = "yolov8n-pose", <span class="tok-c"># имя модели в регистре моделей (указывать при отсутствии model_path)</span>
            npu_core      = [<span class="tok-n">0</span>],            <span class="tok-c"># номер NPU-ядра для вычислений (если None, будет выбрано автоматически)</span>
            object_thresh = <span class="tok-n">0.4</span>,            <span class="tok-c"># порог 40%, если выше, то объект в кадре считается искомым классом, например: human</span>
                                            <span class="tok-c"># формула: Уверенность модели в идентификации > object_thresh = human</span>
            nms_thresh    = <span class="tok-n">0.5</span>,            <span class="tok-c"># порог 50%, если выше, то объект в кадре считается обнаруженным повторно, удаляет дубликат рамки</span>
                                            <span class="tok-c"># формула: IoU > nms_thresh = delete</span>
            img_width     = <span class="tok-n">640</span>,            <span class="tok-c"># ширина изображения подаваемого для работы с моделью</span>
            img_height    = <span class="tok-n">640</span>)            <span class="tok-c"># высота изображения подаваемого для работы с моделью</span></code></pre></div>
<h3 id="s-методы-класса"><a class="anchor" href="#s-методы-класса" aria-hidden="true">§</a>Методы класса</h3>
<h4 id="s-выполнить-инференс-данных-на-yolopose"><a class="anchor" href="#s-выполнить-инференс-данных-на-yolopose" aria-hidden="true">§</a>Выполнить инференс данных на YoloPose</h4>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_rknn <span class="tok-k">import</span> YoloPose <span class="tok-c"># импортируем класс YoloPose из библиотеки pioneer_rknn</span>

yolopose = YoloPose(                        <span class="tok-c"># создаём экземпляр класса YoloPose</span>
            model_path    = <span class="tok-k">None</span>,           <span class="tok-c"># путь к модели в формате .rknn (указывать при отсутствии model_name)</span>
            model_name    = "yolov8n-pose", <span class="tok-c"># имя модели в регистре моделей (указывать при отсутствии model_path)</span>
            npu_core      = [<span class="tok-n">0</span>],            <span class="tok-c"># номер NPU-ядра для вычислений (если None, будет выбрано автоматически)</span>
            object_thresh = <span class="tok-n">0.4</span>,            <span class="tok-c"># порог 40%, если выше, то объект в кадре считается искомым классом, например: human</span>
                                            <span class="tok-c"># формула: Уверенность модели в идентификации > object_thresh = human</span>
            nms_thresh    = <span class="tok-n">0.5</span>,            <span class="tok-c"># порог 50%, если выше, то объект в кадре считается обнаруженным повторно, удаляет дубликат рамки</span>
                                            <span class="tok-c"># формула: IoU > nms_thresh = delete</span>
            img_width     = <span class="tok-n">640</span>,            <span class="tok-c"># ширина изображения подаваемого для работы с моделью</span>
            img_height    = <span class="tok-n">640</span>)            <span class="tok-c"># высота изображения подаваемого для работы с моделью</span>

<span class="tok-b">print</span>(yolopose.run(inputs = <span class="tok-b">list</span>[np.ndarray])) <span class="tok-c"># выполняем инференс входных тензоров и последующую обработку выходов</span>
                                               <span class="tok-c"># возвращает список обнаруженных боксов с ключевыми точками</span></code></pre></div></section>
<section class="docblock"><h2 id="s-класс-paddleocr"><a class="anchor" href="#s-класс-paddleocr" aria-hidden="true">§</a>Класс PaddleOCR</h2>
<p>Инкапсулирует пайплайн OCR - выделение текстовых областей, чем занимается модель детекции, а далее на выделенных областях распознаётся символьный текст, за это отвечает модель распознавания текстовых символов</p>
<h3 id="s-описание-класса"><a class="anchor" href="#s-описание-класса" aria-hidden="true">§</a>Описание класса</h3>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_rknn <span class="tok-k">import</span> PaddleOCR <span class="tok-c"># импортируем класс PaddleOCR из библиотеки pioneer_rknn</span>

paddle = PaddleOCR(                               <span class="tok-c"># создаём экземпляр класса PaddleOCR</span>
    det_model_path = <span class="tok-k">None</span>,                        <span class="tok-c"># путь к detector   модели в формате .rknn (указывать при отсутствии det_model_name)</span>
    rec_model_path = <span class="tok-k">None</span>,                        <span class="tok-c"># путь к recognizer модели в формате .rknn (указывать при отсутствии rec_model_name)</span>
    det_model_name = "PP-OCRv5_mobile_det",       <span class="tok-c"># имя detector   модели в регистре моделей (указывать при отсутствии det_model_path)</span>
    rec_model_name = "eslav_PP-OCRv5_mobile_rec", <span class="tok-c"># имя recognizer модели в регистре моделей (указывать при отсутствии rec_model_path)</span>
    npu_core       = [<span class="tok-n">0</span>])                         <span class="tok-c"># номер NPU-ядра для вычислений (если None, будет выбрано автоматически)</span></code></pre></div>
<h3 id="s-методы-класса"><a class="anchor" href="#s-методы-класса" aria-hidden="true">§</a>Методы класса</h3>
<h4 id="s-выполнить-инференс-данных-на-paddleocr"><a class="anchor" href="#s-выполнить-инференс-данных-на-paddleocr" aria-hidden="true">§</a>Выполнить инференс данных на PaddleOCR</h4>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_rknn <span class="tok-k">import</span> PaddleOCR <span class="tok-c"># импортируем класс PaddleOCR из библиотеки pioneer_rknn</span>

paddle = PaddleOCR(                               <span class="tok-c"># создаём экземпляр класса PaddleOCR</span>
    det_model_path = <span class="tok-k">None</span>,                        <span class="tok-c"># путь к detector   модели в формате .rknn (указывать при отсутствии det_model_name)</span>
    rec_model_path = <span class="tok-k">None</span>,                        <span class="tok-c"># путь к recognizer модели в формате .rknn (указывать при отсутствии rec_model_name)</span>
    det_model_name = "PP-OCRv5_mobile_det",       <span class="tok-c"># имя detector   модели в регистре моделей (указывать при отсутствии det_model_path)</span>
    rec_model_name = "eslav_PP-OCRv5_mobile_rec", <span class="tok-c"># имя recognizer модели в регистре моделей (указывать при отсутствии rec_model_path)</span>
    npu_core       = [<span class="tok-n">0</span>])                         <span class="tok-c"># номер NPU-ядра для вычислений (если None, будет выбрано автоматически)</span>

<span class="tok-b">print</span>(paddle.run(img = <span class="tok-b">list</span>[np.ndarray])) <span class="tok-c"># выполняем инференс изображения и последующую обработку выходов</span>
                                          <span class="tok-c"># возвращает: список найденных четырехугольников</span>
                                          <span class="tok-c">#             список результатов распознавания текста</span>
                                          <span class="tok-c">#             (None, None), если текстовые области не обнаружены</span></code></pre></div>
<p>None</p></section>
<section class="docblock"><h2 id="s-класс-modelcontainer"><a class="anchor" href="#s-класс-modelcontainer" aria-hidden="true">§</a>Класс ModelContainer</h2>
<p>Обеспечивает базовые функции для загрузки и выполнения инференса</p>
<h3 id="s-инициализация-класса"><a class="anchor" href="#s-инициализация-класса" aria-hidden="true">§</a>Инициализация класса</h3>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_rknn <span class="tok-k">import</span> ModelContainer       <span class="tok-c"># импортируем класс ModelContainer из библиотеки pioneer_rknn</span>

ai_1 = ModelContainer(                        <span class="tok-c"># создаём экземпляр класса ModelContainer</span>
                        model_path = <span class="tok-k">None</span>,      <span class="tok-c"># путь к модели в формате .rknn (указывать при отсутствии model_name)</span>
                        model_name = "yolov8n", <span class="tok-c"># имя модели в регистре моделей (указывать при отсутствии model_path)</span>
                        npu_core   = [<span class="tok-n">0</span>])       <span class="tok-c"># номер NPU-ядра для вычислений (если None, будет выбрано автоматически)</span></code></pre></div>
<h3 id="s-методы-класса"><a class="anchor" href="#s-методы-класса" aria-hidden="true">§</a>Методы класса</h3>
<h4 id="s-выполнить-инференс-данных"><a class="anchor" href="#s-выполнить-инференс-данных" aria-hidden="true">§</a>Выполнить инференс данных</h4>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_rknn <span class="tok-k">import</span> ModelContainer     <span class="tok-c"># импортируем класс ModelContainer из библиотеки pioneer_rknn</span>

ai_1 = ModelContainer(                        <span class="tok-c"># создаём экземпляр класса ModelContainer</span>
                      model_path = <span class="tok-k">None</span>,      <span class="tok-c"># путь к модели в формате .rknn (указывать при отсутствии model_name)</span>
                      model_name = "yolov8n", <span class="tok-c"># имя модели в регистре моделей (указывать при отсутствии model_path)</span>
                      npu_core   = [<span class="tok-n">0</span>])       <span class="tok-c"># номер NPU-ядра для вычислений (если None, будет выбрано автоматически)</span>

result = ai_1.run(inputs) <span class="tok-c"># метод run выполняет инференс входных данных (inputs) и возвращает результат</span>
                          <span class="tok-c"># inputs принимает список[list], кортеж(tuple) или переменную</span>
                          <span class="tok-c"># метод возвращает результат инференса или пустой список, если ресурсы RKNN уже освобождены</span></code></pre></div>
<h4 id="s-освободить-ресурсы-rknn"><a class="anchor" href="#s-освободить-ресурсы-rknn" aria-hidden="true">§</a>Освободить ресурсы RKNN</h4>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_rknn <span class="tok-k">import</span> ModelContainer     <span class="tok-c"># импортируем класс ModelContainer из библиотеки pioneer_rknn</span>

ai_1 = ModelContainer(                        <span class="tok-c"># создаём экземпляр класса ModelContainer</span>
                      model_path = <span class="tok-k">None</span>,      <span class="tok-c"># путь к модели в формате .rknn (указывать при отсутствии model_name)</span>
                      model_name = "yolov8n", <span class="tok-c"># имя модели в регистре моделей (указывать при отсутствии model_path)</span>
                      npu_core   = [<span class="tok-n">0</span>])       <span class="tok-c"># номер NPU-ядра для вычислений (если None, будет выбрано автоматически)</span>

ai_1.release() <span class="tok-c"># метод release освобождает ресурсы NPU</span>
               <span class="tok-c"># применять следует после выполнения необходимых вычислений на NPU</span>
               <span class="tok-c"># выполняется автоматически после завершения исполнения программы</span></code></pre></div>
<p>&quot;yolov8n&quot;,</p>
<p>Обеспечивает базовые функции для загрузки и выполнения инференса</p></section>
<section class="docblock"><h2 id="s-класс-modelregistry"><a class="anchor" href="#s-класс-modelregistry" aria-hidden="true">§</a>Класс ModelRegistry</h2>
<p>Предоставляет интерфейс для взаимодействия с регистром моделей, позволяя получать список моделей, информацию о конкретной модели, удалять и загружать модели</p>
<h3 id="s-инициализация-класса"><a class="anchor" href="#s-инициализация-класса" aria-hidden="true">§</a>Инициализация класса</h3>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_rknn <span class="tok-k">import</span> ModelRegistry <span class="tok-c"># импортируем класс ModelRegistry из библиотеки pioneer_rknn</span>

ai_reg = ModelRegistry(                                      <span class="tok-c"># создаём экземпляр класса ModelRegistry</span>
                        url = "http://<span class="tok-n">127.0</span>.<span class="tok-n">0.1</span>:<span class="tok-n">7777</span>/model") <span class="tok-c"># адрес регистра моделей по умолчанию</span></code></pre></div>
<h3 id="s-методы-класса"><a class="anchor" href="#s-методы-класса" aria-hidden="true">§</a>Методы класса</h3>
<h4 id="s-получить-список-моделей"><a class="anchor" href="#s-получить-список-моделей" aria-hidden="true">§</a>Получить список моделей</h4>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_rknn <span class="tok-k">import</span> ModelRegistry <span class="tok-c"># импортируем класс ModelRegistry из библиотеки pioneer_rknn</span>

ai_reg = ModelRegistry(                                     <span class="tok-c"># создаём экземпляр класса ModelRegistry</span>
                       url = "http://<span class="tok-n">127.0</span>.<span class="tok-n">0.1</span>:<span class="tok-n">7777</span>/model") <span class="tok-c"># адрес регистра моделей по умолчанию</span>

<span class="tok-b">print</span>(ai_reg.list_model()) <span class="tok-c"># печатаем словарь с информацией о моделях или None, если ошибка</span></code></pre></div>
<h4 id="s-получить-информацию-о-модели-по-ее-имени"><a class="anchor" href="#s-получить-информацию-о-модели-по-ее-имени" aria-hidden="true">§</a>Получить информацию о модели по ее имени</h4>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_rknn <span class="tok-k">import</span> ModelRegistry <span class="tok-c"># импортируем класс ModelRegistry из библиотеки pioneer_rknn</span>

ai_reg = ModelRegistry(                                     <span class="tok-c"># создаём экземпляр класса ModelRegistry</span>
                       url = "http://<span class="tok-n">127.0</span>.<span class="tok-n">0.1</span>:<span class="tok-n">7777</span>/model") <span class="tok-c"># адрес регистра моделей по умолчанию</span>

<span class="tok-b">print</span>(ai_reg.get_model_info(name = "yolov8n")) <span class="tok-c"># печатаем словарь с информацией о указанной модели или None, если ошибка</span></code></pre></div>
<h4 id="s-удалить-модель-по-ее-имени"><a class="anchor" href="#s-удалить-модель-по-ее-имени" aria-hidden="true">§</a>Удалить модель по ее имени</h4>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_rknn <span class="tok-k">import</span> ModelRegistry <span class="tok-c"># импортируем класс ModelRegistry из библиотеки pioneer_rknn</span>

ai_reg = ModelRegistry(                                     <span class="tok-c"># создаём экземпляр класса ModelRegistry</span>
                       url = "http://<span class="tok-n">127.0</span>.<span class="tok-n">0.1</span>:<span class="tok-n">7777</span>/model") <span class="tok-c"># адрес регистра моделей по умолчанию</span>

<span class="tok-b">print</span>(ai_reg.delete_model(name = "your_model")) <span class="tok-c"># печатаем словарь с результатом удаления или None, если ошибка</span></code></pre></div>
<h4 id="s-загрузить-модель-в-регистр"><a class="anchor" href="#s-загрузить-модель-в-регистр" aria-hidden="true">§</a>Загрузить модель в регистр</h4>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-k">from</span> pioneer_rknn <span class="tok-k">import</span> ModelRegistry <span class="tok-c"># импортируем класс ModelRegistry из библиотеки pioneer_rknn</span>

ai_reg = ModelRegistry(                                     <span class="tok-c"># создаём экземпляр класса ModelRegistry</span>
                       url = "http://<span class="tok-n">127.0</span>.<span class="tok-n">0.1</span>:<span class="tok-n">7777</span>/model") <span class="tok-c"># адрес регистра моделей по умолчанию</span>

ai_reg.upload_model(                           <span class="tok-c"># загружаем модель, содержит аргументы:</span>
                    name     = "your_model",   <span class="tok-c"># имя модели (будет отображаться в регистре после загрузки)</span>
                    version  = "your_version", <span class="tok-c"># версия модели (если пустая строка, будет указано автоматически)</span>
                    filepath = "your_path",    <span class="tok-c"># путь к файлу модели (модель должна быть в формате onnx (аргумент opset=19)).</span>
                    arch     = "custom")       <span class="tok-c"># архитектура модели (если архитектура не поддерживается, следует указать custom)</span></code></pre></div></section>
