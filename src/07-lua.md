---
layout: layout.njk
title: "Lua"
description: "Программирование Пионер Мини 2 на Lua: скрипты автопилота, классы AP, Sensors, Camera, Ledbar, GPIO, UART, SPI, Timer, Mailbox"
pageNumber: 7
pageSlug: "lua"
---

<h1>Lua — скрипты на автопилоте</h1>
<p>Lua-скрипты загружаются и выполняются непосредственно на плате автопилота. Это самый «низкоуровневый» способ программирования Пионера: прямой доступ к датчикам, полетным режимам, периферии (UART, SPI, GPIO), светодиодам и камере. Ниже — справочник по классам Lua API: <strong>AP</strong> (запуск/посадка/полетные режимы), <strong>Sensors</strong> (датчики), <strong>Camera</strong>, <strong>Ledbar</strong>, <strong>GPIO</strong>, <strong>UART</strong>, <strong>SPI</strong>, <strong>Timer</strong>, <strong>Mailbox</strong>.</p>

<section class="docblock"><h2 id="s-введение-в-lua"><a class="anchor" href="#s-введение-в-lua" aria-hidden="true">§</a>Введение в Lua</h2>
<h3 id="s-поддержка-lua-квадрокоптерами-пионер"><a class="anchor" href="#s-поддержка-lua-квадрокоптерами-пионер" aria-hidden="true">§</a>Поддержка Lua квадрокоптерами Пионер</h3>
<div class="tablewrap"><table><thead><tr><th>Квадрокоптеры</th><th>Поддержка Lua</th></tr></thead><tbody><tr><td>Мини 2</td><td>❌</td></tr><tr><td>Мини</td><td>✅</td></tr><tr><td>Базовый</td><td>✅</td></tr><tr><td>FPV</td><td>❌</td></tr><tr><td>Макс</td><td>✅</td></tr></tbody></table></div>
<h3 id="s-загрузка-lua-скрипта-в-автопилот"><a class="anchor" href="#s-загрузка-lua-скрипта-в-автопилот" aria-hidden="true">§</a>Загрузка Lua скрипта в автопилот</h3>
<p>Загрузка Lua скрипта происходит через конфигуратор Pioneer Station, выполните подключение квадрокоптера, перейдите во вкладку <code>Редактор кода</code>, выберите один из предзагруженных примеров, напишите свой или скопируйте скрипт из документации, после чего нажмите кнопку <code>Загрузить</code>.</p>
<h3 id="s-запуск-lua-скрипта"><a class="anchor" href="#s-запуск-lua-скрипта" aria-hidden="true">§</a>Запуск Lua скрипта</h3>
<p>В целях безопасности, при выполнении полётного задания, автопилот проверяет &quot;наличие пилота&quot; и при его отсутствии откажется выполнять полёт. Подключите пульт управления и переведите тумблер <code>SWB</code> в нижнее положение, при необходимости, проверку можно отключить отредактировав параметр <code>Copter_flyWithoutRc = 1</code> в конфигураторе Pioneer Station.</p>
<ul><li>Нажмите кнопку <code>Старт</code> на плате автопилота, раздастся звуковой сигнал, после чего у вас будет 5 секунд, чтобы покинуть зону выполнения полетного задания.</li><li>Возможно настроить автозапуск скрипта, для этого отредактируйте параметр <code>Lua_scriptDelayMs</code> в конфигураторе Pioneer Station, значение указывается в миллисекундах, например, <code>10000 = 10 секунд с начала подачи питания</code>. Будьте осторожныЗабыв о наличии автозапуска - велик шанс быть застигнутым врасплох и получить травмы.</li></ul>
<h3 id="s-примеры-скриптов"><a class="anchor" href="#s-примеры-скриптов" aria-hidden="true">§</a>Примеры скриптов</h3>
<h4 id="s-исполнение-lua-через-пульт"><a class="anchor" href="#s-исполнение-lua-через-пульт" aria-hidden="true">§</a>Исполнение Lua через пульт</h4>
<p>Важно понимать, что запуск скрипта происходит все также через кнопку <code>Старт</code> на плате автопилота или автозапуск, через параметр <code>Lua_scriptDelayMs</code>. Однако непосредственно исполнение программы можно контроллировать, для этого следует добавить условие на проверку желаемого канала пульта, в данном примере считывается канал SWA, при его изменении начинается исполнение программы.</p>
<div class="codewrap"><pre><code data-lang="python">local unpack = table.unpack
local rc = Sensors.rc -- считывание положения тумблеров
local points = {
        {<span class="tok-n">0</span>, <span class="tok-n">2</span>, <span class="tok-n">1</span>},
        {<span class="tok-n">0</span>, <span class="tok-n">1</span>, <span class="tok-n">1</span>},
        {
        {<span class="tok-n">0</span>, <span class="tok-n">1</span>, <span class="tok-n">1</span>}
}

-- Счетчик точек
local curr_point = <span class="tok-n">1</span>

-- Функция, изменяющая цвет светодиодов и выполняющая полет к следующей точке
local function nextPoint()

    -- Полет к текущей точке, если её номер не больше количества заданных точек
    <span class="tok-k">if</span>(curr_point <= <span class="tok-c">#points) then</span>
        Timer.callLater(<span class="tok-n">1</span>, function()
            ap.goToLocalPoint(unpack(points[curr_point]))
            curr_point = curr_point + <span class="tok-n">1</span>
        end)

    -- Посадка, если номер текущей точки больше количества заданных точек
    <span class="tok-k">else</span>
        Timer.callLater(<span class="tok-n">1</span>, function()
            ap.push(Ev.MCE_LANDING)
        end)
    end
end

-- Функция обработки событий, автоматически вызывается автопилотом
function callback(event)

    -- Когда коптер поднялся на высоту взлета Flight_com_takeoffAlt, переходим к полету по точкам
    <span class="tok-k">if</span>(event == Ev.TAKEOFF_COMPLETE) then
        Timer.callLater(<span class="tok-n">5</span>, nextPoint)
    end

    -- Когда коптер достиг текущей точки, переходим к следующей
    <span class="tok-k">if</span>(event == Ev.POINT_REACHED) then
        Timer.callLater(<span class="tok-n">5</span>, nextPoint)
    end
end

-- Предстартовая подготовка
startTimer = Timer.new(<span class="tok-n">1</span>, function()
    rc_chans = table.pack(rc())

    -- проверка положения тумблера SwA
    <span class="tok-k">if</span> rc_chans[<span class="tok-n">8</span>] > <span class="tok-n">0</span> then
        curr_point = <span class="tok-n">1</span>
        ap.push(Ev.MCE_PREFLIGHT)
        Timer.callLater(<span class="tok-n">6</span>, function() ap.push(Ev.MCE_TAKEOFF) end)
    end
end)

-- Таймер, через <span class="tok-n">2</span> секунды вызывающий функцию взлета
startTimer:start()</code></pre></div>
<h4 id="s-случайная-смена-цвета-светодиодов"><a class="anchor" href="#s-случайная-смена-цвета-светодиодов" aria-hidden="true">§</a>Случайная смена цвета светодиодов</h4>
<div class="codewrap"><pre><code data-lang="python">local unpack = table.unpack        -- Упрощение вызова функции распаковки таблиц из модуля table
local ledNumber = <span class="tok-n">29</span>               -- Количество светодиодов на базовой плате
local leds = Ledbar.new(ledNumber) -- Создание порта управления светодиодами

-- Функция, изменяющая цвет <span class="tok-n">4</span>-х RGB светодиодов на базовой плате
local function changeColor(col)
    <span class="tok-k">for</span> i=<span class="tok-n">0</span>, ledNumber - <span class="tok-n">1</span>, <span class="tok-n">1</span> do
        leds:<span class="tok-b">set</span>(i, unpack(col))
    end
end

-- Функция, реализующая выключение таймера и изменение цвета светодиодов на красный
local function emergency()
    timerRandomLED:stop()                                      -- Остановка таймера
    Timer.callLater(<span class="tok-n">1</span>, function () changeColor({<span class="tok-n">1</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>}) end) -- Изменение цвета светодиодов
end

-- Функция обработки событий, автоматически вызывается автопилотом
function callback(event)
    <span class="tok-k">if</span> (event == Ev.LOW_VOLTAGE2) then -- Вызов функции emergency() при низком напряжении на аккумуляторе
        emergency()
    end
end

-- Создание таймера, каждую секунду меняющего цвета каждого из <span class="tok-n">4</span>-х светодиодов на случайные
timerRandomLED = Timer.new(<span class="tok-n">1</span>, function ()
    color = {math.random(), math.random(), math.random()} -- Установка случайных значений по каждой компоненте RGB
    changeColor(color)                                    -- Вызов функции смены цвета светодиодов
end)

-- Запуск созданного таймера
timerRandomLED:start()</code></pre></div>
<h4 id="s-вывод-цифр-на-led-модуль"><a class="anchor" href="#s-вывод-цифр-на-led-модуль" aria-hidden="true">§</a>Вывод цифр на Led модуль</h4>
<div class="codewrap"><pre><code data-lang="python">local led_count = <span class="tok-n">29</span>					   -- Общее количество светодиодов (<span class="tok-n">4</span> на плате + <span class="tok-n">25</span> на модуле)
local led_offset = <span class="tok-n">4</span>					   -- Количество светодиодов на плате
local matrix_count = <span class="tok-n">25</span>					   -- Количество светодиодов на матрице
local leds = Ledbar.new(led_count)		   -- Создание порта управления светодиодами
local unpack = table.unpack				   -- Ассоциируем функцию распаковки таблиц из модуля table для упрощения

local colors = {	red = 		{<span class="tok-n">1</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>}, -- Таблица цветов в RGB. Яркость цвета задается диапазоном от <span class="tok-n">0</span> до <span class="tok-n">1</span>
                    green = 	{<span class="tok-n">0</span>, <span class="tok-n">1</span>, <span class="tok-n">0</span>},
                    blue = 		{<span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">1</span>},
                    purple = 	{<span class="tok-n">1</span>, <span class="tok-n">0</span>, <span class="tok-n">1</span>},
                    cyan = 		{<span class="tok-n">0</span>, <span class="tok-n">1</span>, <span class="tok-n">1</span>},
                    yellow = 	{<span class="tok-n">1</span>, <span class="tok-n">1</span>, <span class="tok-n">0</span>},
                    white = 	{<span class="tok-n">1</span>, <span class="tok-n">1</span>, <span class="tok-n">1</span>},
                    black = 	{<span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>}}

local dig = {	{<span class="tok-n">3</span>, <span class="tok-n">7</span>, <span class="tok-n">8</span>, <span class="tok-n">13</span>, <span class="tok-n">18</span>, <span class="tok-n">22</span>, <span class="tok-n">23</span>, <span class="tok-n">24</span>},							        -- <span class="tok-n">1</span> Таблица символов цифр
                {<span class="tok-n">2</span>, <span class="tok-n">3</span>, <span class="tok-n">4</span>, <span class="tok-n">9</span>, <span class="tok-n">12</span>, <span class="tok-n">13</span>, <span class="tok-n">14</span>, <span class="tok-n">17</span>, <span class="tok-n">22</span>, <span class="tok-n">23</span>, <span class="tok-n">24</span>},				        -- <span class="tok-n">2</span>
                {<span class="tok-n">2</span>, <span class="tok-n">3</span>, <span class="tok-n">4</span>, <span class="tok-n">9</span>, <span class="tok-n">12</span>, <span class="tok-n">13</span>, <span class="tok-n">14</span>, <span class="tok-n">19</span>, <span class="tok-n">22</span>, <span class="tok-n">23</span>, <span class="tok-n">24</span>},				        -- <span class="tok-n">3</span>
                {<span class="tok-n">2</span>, <span class="tok-n">4</span>, <span class="tok-n">7</span>, <span class="tok-n">9</span>, <span class="tok-n">12</span>, <span class="tok-n">13</span>, <span class="tok-n">14</span>, <span class="tok-n">19</span>, <span class="tok-n">24</span>},						        -- <span class="tok-n">4</span>
                {<span class="tok-n">2</span>, <span class="tok-n">3</span>, <span class="tok-n">4</span>, <span class="tok-n">7</span>, <span class="tok-n">12</span>, <span class="tok-n">13</span>, <span class="tok-n">14</span>, <span class="tok-n">19</span>, <span class="tok-n">22</span>, <span class="tok-n">23</span>, <span class="tok-n">24</span>},				        -- <span class="tok-n">5</span>
                {<span class="tok-n">3</span>, <span class="tok-n">4</span>, <span class="tok-n">7</span>, <span class="tok-n">12</span>, <span class="tok-n">13</span>, <span class="tok-n">14</span>, <span class="tok-n">17</span>, <span class="tok-n">19</span>, <span class="tok-n">22</span>, <span class="tok-n">23</span>, <span class="tok-n">24</span>},				        -- <span class="tok-n">6</span>
                {<span class="tok-n">2</span>, <span class="tok-n">3</span>, <span class="tok-n">4</span>, <span class="tok-n">9</span>, <span class="tok-n">13</span>, <span class="tok-n">18</span>, <span class="tok-n">23</span>},								        -- <span class="tok-n">7</span>
                {<span class="tok-n">2</span>, <span class="tok-n">3</span>, <span class="tok-n">4</span>, <span class="tok-n">7</span>, <span class="tok-n">9</span>, <span class="tok-n">13</span>, <span class="tok-n">17</span>, <span class="tok-n">19</span>, <span class="tok-n">22</span>, <span class="tok-n">23</span>, <span class="tok-n">24</span>},				        -- <span class="tok-n">8</span>
                {<span class="tok-n">2</span>, <span class="tok-n">3</span>, <span class="tok-n">4</span>, <span class="tok-n">7</span>, <span class="tok-n">9</span>, <span class="tok-n">12</span>, <span class="tok-n">13</span>, <span class="tok-n">14</span>, <span class="tok-n">19</span>, <span class="tok-n">22</span>, <span class="tok-n">23</span>},				        -- <span class="tok-n">9</span>
                {<span class="tok-n">1</span>, <span class="tok-n">3</span>, <span class="tok-n">4</span>, <span class="tok-n">5</span>, <span class="tok-n">6</span>, <span class="tok-n">8</span>, <span class="tok-n">10</span>, <span class="tok-n">11</span>, <span class="tok-n">13</span>, <span class="tok-n">15</span>, <span class="tok-n">16</span>, <span class="tok-n">18</span>, <span class="tok-n">20</span>, <span class="tok-n">21</span>, <span class="tok-n">23</span>, <span class="tok-n">24</span>, <span class="tok-n">25</span>}, -- <span class="tok-n">10</span>
                [<span class="tok-n">0</span>] = {<span class="tok-n">2</span>, <span class="tok-n">3</span>, <span class="tok-n">4</span>, <span class="tok-n">7</span>, <span class="tok-n">9</span>, <span class="tok-n">12</span>, <span class="tok-n">14</span>, <span class="tok-n">17</span>, <span class="tok-n">19</span>, <span class="tok-n">22</span>, <span class="tok-n">23</span>, <span class="tok-n">24</span>} } -- Индексация Lua начинается с <span class="tok-n">1</span>, поэтому <span class="tok-n">0</span> указан в явном виде

local ledMatrix = {}	          -- Массив для хранения выводимой информации на матрицу

<span class="tok-k">for</span> i = <span class="tok-n">1</span>, matrix_count + <span class="tok-n">1</span>, <span class="tok-n">1</span> do
    ledMatrix[i] = colors.black   -- Инициализация массива
end

-- Вывод массива на матрицу
local function updateMatrix()
    <span class="tok-k">for</span> i = led_offset, led_count - <span class="tok-n">1</span>, <span class="tok-n">1</span> do
        leds:<span class="tok-b">set</span>(i, unpack(ledMatrix[i-led_offset + <span class="tok-n">1</span>]))
    end
end

-- Установка цвета на заданный пиксель массива матрицы. x - столбец; y - строка; colors - цвет в RGB
local function setPixelMatrix( x, y, colors )
    i = (y - <span class="tok-n">1</span>) * <span class="tok-n">5</span> + x
    <span class="tok-k">if</span> ledMatrix [i] then
        ledMatrix [i] = colors
    end
end

-- Заполнение массива матрицы цветом. colors - цвет в RGB
local function fillMatrix( colors )
    <span class="tok-k">for</span> i = <span class="tok-n">1</span>, matrix_count + <span class="tok-n">1</span>, <span class="tok-n">1</span> do
        ledMatrix [i] = colors
    end
end

-- Запись символа цифры в массив матрицы. x - цифра; colors - цвет в RGB
local function setDig( x, colors )
    <span class="tok-k">for</span> _, v <span class="tok-k">in</span> ipairs(dig[x]) do
        ledMatrix[v] = colors
    end
end

-- Здесь заканчивается описание работы с матрицей
--------------------------------------------------------------------------------------------------------------------

function callback( event )
end

-- Пример. Программа выводит цифры от <span class="tok-n">0</span> до <span class="tok-n">9</span>, изменяя цвет от красного к фиолетовому
function digitOutput()
    colors_any[<span class="tok-n">1</span>],  colors_any[<span class="tok-n">2</span>], colors_any[<span class="tok-n">3</span>] = fromHSV(col, <span class="tok-n">100</span>, <span class="tok-n">10</span>) -- Генерация цвета
    setDig (i, colors_any)												 -- Запись цифры в массив заданного цвета
    updateMatrix()														 -- Вывод массива на матрицу
    <span class="tok-k">if</span> col < <span class="tok-n">360</span> then
        col = col + <span class="tok-n">1</span>                                                    -- Изменение значения цвета
    elseif i < <span class="tok-c">#dig-1 then</span>
        fillMatrix(colors.black)                                         -- Очистка массива матрицы перед записью новой цифры
        col = <span class="tok-n">0</span>                                                          -- Обнуление значения цвета
        i = i + <span class="tok-n">1</span>                                                        -- Увеличение переменной цифры
    <span class="tok-k">else</span>
        fillMatrix(colors.black)
        col = <span class="tok-n">0</span>                                                          -- Обнуление значения цвета
        i = <span class="tok-n">0</span>                                                            -- Обнуление значения цифры
    end
    Timer.callLater(<span class="tok-n">0.003</span>, function () digitOutput() end)                -- Период, через который обновляется цвет
end

colors_any = {<span class="tok-n">0</span>,<span class="tok-n">0</span>,<span class="tok-n">0</span>} -- Переменная цвета в формате RGB
i = <span class="tok-n">0</span>                -- Переменная выводимой цифры
col = <span class="tok-n">0</span>              -- Переменная цвета в формате HSV
digitOutput()        -- Запуск программы</code></pre></div>
<h4 id="s-управление-магнитом-через-пульт-для-платы-v-1-1"><a class="anchor" href="#s-управление-магнитом-через-пульт-для-платы-v-1-1" aria-hidden="true">§</a>Управление магнитом через пульт для платы v.1.1</h4>
<div class="codewrap"><pre><code data-lang="python">local magnet = Gpio.new(Gpio.A, <span class="tok-n">1</span>, Gpio.OUTPUT) -- инициализируем управление модулем груза порт A1 на плате версии v.<span class="tok-n">1.1</span>
local led_number = <span class="tok-n">8</span>                             -- задаем количество светодиодов (<span class="tok-n">4</span> на базовой плате и еще <span class="tok-n">4</span> на модуле груза)
local leds = Ledbar.new(led_number)              -- инициализируем светодиоды
local rc = Sensors.rc
local blink = <span class="tok-n">0</span>

function callback(event)                     -- глобальная функция, вызывается автопилотом
end

local function changeColor(red, green, blue) -- локальная функция смены цвета светодиодов
    <span class="tok-k">for</span> i=<span class="tok-n">0</span>, led_number - <span class="tok-n">1</span>, <span class="tok-n">1</span> do
        leds:<span class="tok-b">set</span>(i, red, green, blue)
    end
end

cargoTimer = Timer.new(<span class="tok-n">0.1</span>, function () -- создаем таймер, который будет вызывать нашу функцию <span class="tok-n">10</span> раз в секунуду
    _, _, _, _, _, _, _, ch8 = rc()     -- считываем сигнал с <span class="tok-n">8</span> канала на пульте, значение от -<span class="tok-n">1</span> до <span class="tok-n">1</span>
    <span class="tok-k">if</span>(ch8 < <span class="tok-n">0</span>) then                    -- если сигнал с пульта -<span class="tok-n">1</span> (SWA вверх), включаем магнит и сигнализируем зеленым светом
        magnet:<span class="tok-b">set</span>()
        changeColor(<span class="tok-n">0</span>, <span class="tok-n">1</span>, <span class="tok-n">0</span>)
    <span class="tok-k">else</span> <span class="tok-k">if</span>(ch8 > <span class="tok-n">0</span>) then               -- если сигнал с пульта <span class="tok-n">1</span> (SWA вниз), выключаем магнит и сигнализируем красным светом
        magnet:reset()
        changeColor(<span class="tok-n">1</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>)
    <span class="tok-k">else</span>                                -- в противном случае мигаем синим (отсутсвие сигнала с <span class="tok-n">8</span> канала)
        <span class="tok-k">if</span>(blink < <span class="tok-n">5</span>) then
            changeColor(<span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">1</span>)
        blink = blink + <span class="tok-n">1</span>
        <span class="tok-k">else</span>
            changeColor(<span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>)
            blink = <span class="tok-n">0</span>
        end
    end
    end
end)

cargoTimer:start() -- запускаем таймер</code></pre></div>
<h4 id="s-управление-магнитом-через-пульт-для-платы-v-1-2-v-1-4"><a class="anchor" href="#s-управление-магнитом-через-пульт-для-платы-v-1-2-v-1-4" aria-hidden="true">§</a>Управление магнитом через пульт для платы v.1.2 - v.1.4</h4>
<div class="codewrap"><pre><code data-lang="python">local magnet = Gpio.new(Gpio.C, <span class="tok-n">3</span>, Gpio.OUTPUT) -- инициализируем управление модулем груза порт C3 на плате версии v.<span class="tok-n">1.2</span> - v.<span class="tok-n">1.4</span>
local led_number = <span class="tok-n">8</span>                            -- задаем количество светодиодов (<span class="tok-n">4</span> на базовой плате и еще <span class="tok-n">4</span> на модуле груза)
local leds = Ledbar.new(led_number)             -- инициализируем светодиоды
local rc = Sensors.rc
local blink = <span class="tok-n">0</span>

function callback(event)                     -- глобальная функция, вызывается автопилотом
end

local function changeColor(red, green, blue) -- локальная функция смены цвета светодиодов
    <span class="tok-k">for</span> i=<span class="tok-n">0</span>, led_number - <span class="tok-n">1</span>, <span class="tok-n">1</span> do
        leds:<span class="tok-b">set</span>(i, red, green, blue)
    end
end

cargoTimer = Timer.new(<span class="tok-n">0.1</span>, function () -- создаем таймер, который будет вызывать нашу функцию <span class="tok-n">10</span> раз в секунуду
    _, _, _, _, _, _, _, ch8 = rc()     -- считываем сигнал с <span class="tok-n">8</span> канала на пульте, значение от -<span class="tok-n">1</span> до <span class="tok-n">1</span>
    <span class="tok-k">if</span>(ch8 < <span class="tok-n">0</span>) then                    -- если сигнал с пульта -<span class="tok-n">1</span> (SWA вверх), включаем магнит и сигнализируем зеленым светом
        magnet:<span class="tok-b">set</span>()
        changeColor(<span class="tok-n">0</span>, <span class="tok-n">1</span>, <span class="tok-n">0</span>)
    <span class="tok-k">else</span> <span class="tok-k">if</span>(ch8 > <span class="tok-n">0</span>) then               -- если сигнал с пульта <span class="tok-n">1</span> (SWA вниз), выключаем магнит и сигнализируем красным светом
        magnet:reset()
        changeColor(<span class="tok-n">1</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>)
    <span class="tok-k">else</span>                                -- в противном случае мигаем синим (отсутсвие сигнала с <span class="tok-n">8</span> канала)
        <span class="tok-k">if</span>(blink < <span class="tok-n">5</span>) then
            changeColor(<span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">1</span>)
        blink = blink + <span class="tok-n">1</span>
        <span class="tok-k">else</span>
            changeColor(<span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>)
            blink = <span class="tok-n">0</span>
        end
    end
    end
end)

cargoTimer:start() -- запускаем таймер</code></pre></div>
<h4 id="s-управление-магнитом-через-пульт-для-платы-v-1-6-3-v-1-7-2"><a class="anchor" href="#s-управление-магнитом-через-пульт-для-платы-v-1-6-3-v-1-7-2" aria-hidden="true">§</a>Управление магнитом через пульт для платы v.1.6.3 - v.1.7.2</h4>
<div class="codewrap"><pre><code data-lang="python">local magnet = Gpio.new(Gpio.C, <span class="tok-n">15</span>, Gpio.OUTPUT) -- инициализируем управление модулем груза порт C15 на плате версии v.<span class="tok-n">1.6</span>.<span class="tok-n">3</span> - v.<span class="tok-n">1.7</span>.<span class="tok-n">2</span>
local led_number = <span class="tok-n">8</span>                             -- задаем количество светодиодов (<span class="tok-n">4</span> на базовой плате и еще <span class="tok-n">4</span> на модуле груза)
local leds = Ledbar.new(led_number)              -- инициализируем светодиоды
local rc = Sensors.rc
local blink = <span class="tok-n">0</span>

function callback(event)                     -- глобальная функция, вызывается автопилотом
end

local function changeColor(red, green, blue) -- локальная функция смены цвета светодиодов
    <span class="tok-k">for</span> i=<span class="tok-n">0</span>, led_number - <span class="tok-n">1</span>, <span class="tok-n">1</span> do
        leds:<span class="tok-b">set</span>(i, red, green, blue)
    end
end

cargoTimer = Timer.new(<span class="tok-n">0.1</span>, function () -- создаем таймер, который будет вызывать нашу функцию <span class="tok-n">10</span> раз в секунуду
    _, _, _, _, _, _, _, ch8 = rc()     -- считываем сигнал с <span class="tok-n">8</span> канала на пульте, значение от -<span class="tok-n">1</span> до <span class="tok-n">1</span>
    <span class="tok-k">if</span>(ch8 < <span class="tok-n">0</span>) then                    -- если сигнал с пульта -<span class="tok-n">1</span> (SWA вверх), включаем магнит и сигнализируем зеленым светом
        magnet:<span class="tok-b">set</span>()
        changeColor(<span class="tok-n">0</span>, <span class="tok-n">1</span>, <span class="tok-n">0</span>)
    <span class="tok-k">else</span> <span class="tok-k">if</span>(ch8 > <span class="tok-n">0</span>) then               -- если сигнал с пульта <span class="tok-n">1</span> (SWA вниз), выключаем магнит и сигнализируем красным светом
        magnet:reset()
        changeColor(<span class="tok-n">1</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>)
    <span class="tok-k">else</span>                                -- в противном случае мигаем синим (отсутсвие сигнала с <span class="tok-n">8</span> канала)
        <span class="tok-k">if</span>(blink < <span class="tok-n">5</span>) then
            changeColor(<span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">1</span>)
        blink = blink + <span class="tok-n">1</span>
        <span class="tok-k">else</span>
            changeColor(<span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>)
            blink = <span class="tok-n">0</span>
        end
    end
    end
end)

cargoTimer:start() -- запускаем таймер</code></pre></div>
<h4 id="s-управление-магнитом-через-python-для-платы-v-1-1"><a class="anchor" href="#s-управление-магнитом-через-python-для-платы-v-1-1" aria-hidden="true">§</a>Управление магнитом через Python для платы v.1.1</h4>
<p>Cкрипт считывает значение 5 канала пульта (тумблер SWC), загрузите скрипт на плату автопилота и переходите к продолжению примера на Python.</p>
<div class="codewrap"><pre><code data-lang="python">local magnet = Gpio.new(Gpio.A, <span class="tok-n">1</span>, Gpio.OUTPUT)
local rc = Sensors.rc

function callback(event)
end

cargoTimer = Timer.new(<span class="tok-n">0.1</span>, function ()
    _, _, _, _, ch5, _, _, _ = rc()
    <span class="tok-k">if</span>(ch5 == <span class="tok-n">0</span>) then
        magnet:<span class="tok-b">set</span>()
    <span class="tok-k">else</span> <span class="tok-k">if</span>(ch5 == <span class="tok-n">1</span>) then
        magnet:reset()
    end
    end
end)

cargoTimer:start()</code></pre></div>
<h4 id="s-управление-магнитом-через-python-для-платы-v-1-2-v-1-4"><a class="anchor" href="#s-управление-магнитом-через-python-для-платы-v-1-2-v-1-4" aria-hidden="true">§</a>Управление магнитом через Python для платы v.1.2 - v.1.4</h4>
<div class="codewrap"><pre><code data-lang="python">local magnet = Gpio.new(Gpio.C, <span class="tok-n">3</span>, Gpio.OUTPUT)
local rc = Sensors.rc

function callback(event)
end

cargoTimer = Timer.new(<span class="tok-n">0.1</span>, function ()
    _, _, _, _, ch5, _, _, _ = rc()
    <span class="tok-k">if</span>(ch5 == <span class="tok-n">0</span>) then
        magnet:<span class="tok-b">set</span>()
    <span class="tok-k">else</span> <span class="tok-k">if</span>(ch5 == <span class="tok-n">1</span>) then
        magnet:reset()
    end
    end
end)

cargoTimer:start()</code></pre></div>
<h4 id="s-управление-магнитом-через-python-для-платы-v-1-6-3-v-1-7-2"><a class="anchor" href="#s-управление-магнитом-через-python-для-платы-v-1-6-3-v-1-7-2" aria-hidden="true">§</a>Управление магнитом через Python для платы v.1.6.3 - v.1.7.2</h4>
<div class="codewrap"><pre><code data-lang="python">local magnet = Gpio.new(Gpio.C, <span class="tok-n">15</span>, Gpio.OUTPUT)
local rc = Sensors.rc

function callback(event)
end

cargoTimer = Timer.new(<span class="tok-n">0.1</span>, function ()
    _, _, _, _, ch5, _, _, _ = rc()
    <span class="tok-k">if</span>(ch5 == <span class="tok-n">0</span>) then
        magnet:<span class="tok-b">set</span>()
    <span class="tok-k">else</span> <span class="tok-k">if</span>(ch5 == <span class="tok-n">1</span>) then
        magnet:reset()
    end
    end
end)

cargoTimer:start()</code></pre></div>
<div class="tablewrap"><table><thead><tr><th>Квадрокоптеры</th><th>Поддержка Lua</th></tr></thead><tbody><tr><td>Мини 2</td><td>❌</td></tr><tr><td>Мини</td><td>✅</td></tr><tr><td>Базовый</td><td>✅</td></tr><tr><td>FPV</td><td>❌</td></tr><tr><td>Макс</td><td>✅</td></tr></tbody></table></div></section>
<section class="docblock"><h2 id="s-класс-ap"><a class="anchor" href="#s-класс-ap" aria-hidden="true">§</a>Класс ap</h2>
<h3 id="s-класс-ap-управление-полетом"><a class="anchor" href="#s-класс-ap-управление-полетом" aria-hidden="true">§</a>Класс ap (управление полетом)</h3>
<p><code>ap.push(Event)</code> - отправляет событие автопилоту из доступного списка:</p>
<h4 id="s-включить-и-выключить-двигатели"><a class="anchor" href="#s-включить-и-выключить-двигатели" aria-hidden="true">§</a>Включить и выключить двигатели</h4>
<p><code>ap.push(Ev.MCE_PREFLIGHT)</code> - включает двигатели.</p>
<p><code>ap.push(Ev.MCE_LANDING)</code> - выполняет посадку и выключает двигатели.</p>
<h4 id="s-взлет-и-посадка"><a class="anchor" href="#s-взлет-и-посадка" aria-hidden="true">§</a>Взлет и посадка</h4>
<p><code>ap.push(Ev.MCE_TAKEOFF)</code> - выполняет взлет до высоты указанной в параметре Copter_com_takeoffAlt.</p>
<p><code>ap.push(Ev.MCE_LANDING)</code> - выполняет посадку и выключает двигатели.</p>
<h4 id="s-полет-в-координаты-локальные"><a class="anchor" href="#s-полет-в-координаты-локальные" aria-hidden="true">§</a>Полет в координаты (локальные)</h4>
<p><code>ap.goToLocalPoint(x, y, z, time)</code> - полет в заданную координату, на основе локальной системы координат. Метод не является блокирующим, это значит, что после вызова метода, следует поставить паузу или использовать флаг достижения координаты <code>point_reached</code>, чтобы квадрокоптер успел выполнить команду.</p>
<h4 id="s-полет-в-координаты-gps"><a class="anchor" href="#s-полет-в-координаты-gps" aria-hidden="true">§</a>Полет в координаты (GPS)</h4>
<p><code>ap.goToPoint(latitude, longitude, altitude)</code> - полет в заданную координату, на основе GPS координат. Метод не является блокирующим, это значит, что после вызова метода, следует поставить паузу или использовать флаг достижения координаты <code>point_reached</code>, чтобы квадрокоптер успел выполнить команду.</p>
<h4 id="s-задать-курсовой-угол"><a class="anchor" href="#s-задать-курсовой-угол" aria-hidden="true">§</a>Задать курсовой угол</h4>
<p><code>ap.updateYaw(angle)</code> - задать курсовой угол (рысканье) в радианах.</p>
<p><code>ap.push(Event)</code> - отправляет событие автопилоту из доступного списка:</p>
<p><code>ap.push(Ev.MCE_PREFLIGHT)</code> - включает двигатели.</p>
<p><code>ap.push(Ev.MCE_LANDING)</code> - выполняет посадку и выключает двигатели.</p>
<p><code>ap.push(Ev.MCE_TAKEOFF)</code> - выполняет взлет до высоты указанной в параметре Copter_com_takeoffAlt.</p>
<p><code>ap.push(Ev.MCE_LANDING)</code> - выполняет посадку и выключает двигатели.</p>
<p><code>ap.updateYaw(angle)</code> - задать курсовой угол (рысканье) в радианах.</p></section>
<section class="docblock"><h2 id="s-класс-sensors"><a class="anchor" href="#s-класс-sensors" aria-hidden="true">§</a>Класс Sensors</h2>
<h3 id="s-класс-sensors-получение-данных"><a class="anchor" href="#s-класс-sensors-получение-данных" aria-hidden="true">§</a>Класс Sensors (получение данных)</h3>
<h4 id="s-узнать-координаты-lps"><a class="anchor" href="#s-узнать-координаты-lps" aria-hidden="true">§</a>Узнать координаты (LPS)</h4>
<p><code>Sensors.lpsPosition()</code> - возвращает локальные координаты X, Y, Z.</p>
<div class="codewrap"><pre><code data-lang="python">x, y, z = Sensors.lpsPosition() -- создаем переменные x, y, z, присваиваем текущие координаты</code></pre></div>
<h4 id="s-узнать-скорость-по-осям"><a class="anchor" href="#s-узнать-скорость-по-осям" aria-hidden="true">§</a>Узнать скорость по осям</h4>
<p><code>Sensors.lpsVelocity()</code> - возвращает текущую скорость по осям X, Y, Z.</p>
<div class="codewrap"><pre><code data-lang="python">vx, vy, vz = Sensors.lpsVelocity() -- создаем переменные vx, vy, vz, присваиваем текущую скорость по осям</code></pre></div>
<h4 id="s-узнать-курсовой-угол"><a class="anchor" href="#s-узнать-курсовой-угол" aria-hidden="true">§</a>Узнать курсовой угол</h4>
<p><code>Sensors.lpsYaw()</code> - возвращает текущий курсовой угол.</p>
<div class="codewrap"><pre><code data-lang="python">yaw = Sensors.lpsYaw() -- создаем переменную yaw, присваиваем текущий курсовой угол</code></pre></div>
<h4 id="s-узнать-углы-наклона-по-осям"><a class="anchor" href="#s-узнать-углы-наклона-по-осям" aria-hidden="true">§</a>Узнать углы наклона по осям</h4>
<p><code>Sensors.orientation()</code> - возвращает ориентацию дрона по углам крена(roll), тангажа(pitch), рыскания(yaw).</p>
<div class="codewrap"><pre><code data-lang="python">roll, pitch, yaw = Sensors.orientation() -- создаем переменные roll, pitch, yaw, присваиваем текущую ориентацию по осям</code></pre></div>
<h4 id="s-узнать-высоту-барометр"><a class="anchor" href="#s-узнать-высоту-барометр" aria-hidden="true">§</a>Узнать высоту (барометр)</h4>
<p><code>Sensors.altitude()</code> - возвращает высоту с барометра.</p>
<div class="codewrap"><pre><code data-lang="python">barometer = Sensors.altitude() -- создаем переменную barometer, присваиваем текущую высоту</code></pre></div>
<h4 id="s-узнать-высоту-дальномер"><a class="anchor" href="#s-узнать-высоту-дальномер" aria-hidden="true">§</a>Узнать высоту (дальномер)</h4>
<p><code>Sensors.range()</code> - возвращает высоту с дальномера.</p>
<div class="codewrap"><pre><code data-lang="python"><span class="tok-b">range</span> = Sensors.<span class="tok-b">range</span>() -- создаем переменную <span class="tok-b">range</span>, присваиваем текущую высоту</code></pre></div>
<h4 id="s-узнать-ускорение"><a class="anchor" href="#s-узнать-ускорение" aria-hidden="true">§</a>Узнать ускорение</h4>
<p><code>Sensors.accel()</code> - возвращает ускорение квадрокоптера по осям X, Y, Z.</p>
<div class="codewrap"><pre><code data-lang="python">ax, ay, az = Sensors.accel() -- создаем переменные ax, ay, az, присваиваем текущее ускорение по осям</code></pre></div>
<h4 id="s-узнать-угловую-скорость"><a class="anchor" href="#s-узнать-угловую-скорость" aria-hidden="true">§</a>Узнать угловую скорость</h4>
<p><code>Sensors.gyro()</code> - возвращает скорость по углам крена(roll), тангажа(pitch), рыскания(yaw).</p>
<div class="codewrap"><pre><code data-lang="python">gRoll, gPitch, gYaw = Sensors.gyro() -- создаем переменные gRoll, gPitch, gYaw, присваиваем текущую скорость по осям</code></pre></div>
<h4 id="s-узнать-значение-каналов-пульта-управления"><a class="anchor" href="#s-узнать-значение-каналов-пульта-управления" aria-hidden="true">§</a>Узнать значение каналов пульта управления</h4>
<p><code>Sensors.rc()</code> - возвращает значения c каналов пульта радиоуправления.</p>
<div class="codewrap"><pre><code data-lang="python">ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8 = Sensors.rc() -- создаем переменные, присваиваем текущую значения с пульта</code></pre></div>
<p><code>Sensors.lpsYaw()</code> - возвращает текущий курсовой угол.</p>
<p><code>Sensors.orientation()</code> - возвращает ориентацию дрона по углам крена(roll), тангажа(pitch), рыскания(yaw).</p>
<p><code>Sensors.altitude()</code> - возвращает высоту с барометра.</p>
<p><code>Sensors.range()</code> - возвращает высоту с дальномера.</p>
<p><code>Sensors.accel()</code> - возвращает ускорение квадрокоптера по осям X, Y, Z.</p>
<p><code>Sensors.gyro()</code> - возвращает скорость по углам крена(roll), тангажа(pitch), рыскания(yaw).</p>
<p><code>Sensors.rc()</code> - возвращает значения c каналов пульта радиоуправления.</p>
<p><code>Sensors.lpsPosition()</code> - возвращает локальные координаты X, Y, Z.</p>
<p><code>Sensors.lpsVelocity()</code> - возвращает текущую скорость по осям X, Y, Z.</p>
<p><code>Sensors.lpsYaw()</code> - возвращает текущий курсовой угол.</p>
<p><code>Sensors.orientation()</code> - возвращает ориентацию дрона по углам крена(roll), тангажа(pitch), рыскания(yaw).</p>
<p><code>Sensors.altitude()</code> - возвращает высоту с барометра.</p>
<p><code>Sensors.range()</code> - возвращает высоту с дальномера.</p>
<p><code>Sensors.accel()</code> - возвращает ускорение квадрокоптера по осям X, Y, Z.</p>
<p><code>Sensors.gyro()</code> - возвращает скорость по углам крена(roll), тангажа(pitch), рыскания(yaw).</p>
<p><code>Sensors.rc()</code> - возвращает значения c каналов пульта радиоуправления.</p></section>
<section class="docblock"><h2 id="s-класс-camera"><a class="anchor" href="#s-класс-camera" aria-hidden="true">§</a>Класс camera</h2>
<h3 id="s-класс-camera-запись-фото-и-видео"><a class="anchor" href="#s-класс-camera-запись-фото-и-видео" aria-hidden="true">§</a>Класс Camera (запись фото и видео)</h3>
<p>Запись фото и видео происходит на MicroSD карту памяти, убедитесь, что карта памяти установлена, максимальный объем памяти 16 гб в формате FAT32.</p>
<h4 id="s-сделать-фотографию"><a class="anchor" href="#s-сделать-фотографию" aria-hidden="true">§</a>Сделать фотографию</h4>
<p><code>camera.requestMakeShot()</code> - отправляет запрос на фотографию.</p>
<p><code>camera.checkRequestShot()</code> - возвращает ответ на запрос сделать фотографию.</p>
<h4 id="s-записать-видео"><a class="anchor" href="#s-записать-видео" aria-hidden="true">§</a>Записать видео</h4>
<p><code>camera.requestRecordStart()</code> - отправляет запрос на старт видеозаписи.</p>
<p><code>camera.checkRequestRecord()</code> - возвращает ответ на запрос видеозаписи.</p>
<p><code>camera.requestRecordStop()</code> - отправляет запрос на остановку видеозаписи.</p>
<p><code>camera.requestMakeShot()</code> - отправляет запрос на фотографию.</p>
<p><code>camera.checkRequestShot()</code> - возвращает ответ на запрос сделать фотографию.</p>
<p><code>camera.requestRecordStart()</code> - отправляет запрос на старт видеозаписи.</p>
<p><code>camera.checkRequestRecord()</code> - возвращает ответ на запрос видеозаписи.</p>
<p><code>camera.requestRecordStop()</code> - отправляет запрос на остановку видеозаписи.</p></section>
<section class="docblock"><h2 id="s-класс-ledbar"><a class="anchor" href="#s-класс-ledbar" aria-hidden="true">§</a>Класс Ledbar</h2>
<h3 id="s-класс-ledbar-управление-светодиодами"><a class="anchor" href="#s-класс-ledbar-управление-светодиодами" aria-hidden="true">§</a>Класс Ledbar (управление светодиодами)</h3>
<p><code>Ledbar.new(Count)</code> - создает объект для работы со светодиодами, в качестве аргумента передается количество доступных светодиодов, в настоящее время это 29 штук.</p>
<h4 id="s-управление-светодиодами"><a class="anchor" href="#s-управление-светодиодами" aria-hidden="true">§</a>Управление светодиодами</h4>
<p><code>led:set(num, r, g, b)</code> - метод задает указанному светодиоду цвет в палитре RGB.</p>
<div class="codewrap"><pre><code data-lang="python">local led = Ledbar.new(<span class="tok-n">29</span>) -- создаем объект "led", указываем <span class="tok-n">29</span> светодиодов

led:<span class="tok-b">set</span>(<span class="tok-n">0</span>, <span class="tok-n">1</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>)   -- включаем светодиод №<span class="tok-n">0</span> (яркий красный)
                      -- led_id(<span class="tok-n">0</span>) - номер светодиода, нумерация начинается с <span class="tok-n">0</span>
                      -- r(<span class="tok-n">1</span>) - управление яркостью красного субпикселя, где <span class="tok-n">0</span> = <span class="tok-n">0</span>%, а <span class="tok-n">1</span> = <span class="tok-n">100</span>%
                      -- g(<span class="tok-n">0</span>) - управление яркостью зеленого субпикселя, где <span class="tok-n">0</span> = <span class="tok-n">0</span>%, а <span class="tok-n">1</span> = <span class="tok-n">100</span>%
                      -- b(<span class="tok-n">0</span>) - управление яркостью синего субпикселя, где <span class="tok-n">0</span> = <span class="tok-n">0</span>%, а <span class="tok-n">1</span> = <span class="tok-n">100</span>%

sleep(<span class="tok-n">2</span>)              -- ставим паузу на <span class="tok-n">2</span> секунды
led:<span class="tok-b">set</span>(<span class="tok-n">1</span>, <span class="tok-n">0</span>, <span class="tok-n">0.5</span>, <span class="tok-n">0</span>) -- включаем светодиод №<span class="tok-n">1</span> (средней яркости зеленый)
sleep(<span class="tok-n">2</span>)
led:<span class="tok-b">set</span>(<span class="tok-n">2</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">0.1</span>) -- включаем светодиод №<span class="tok-n">2</span> (тусклый синий)
sleep(<span class="tok-n">2</span>)
led:<span class="tok-b">set</span>(<span class="tok-n">3</span>, <span class="tok-n">1</span>, <span class="tok-n">0.4</span>, <span class="tok-n">0</span>) -- включаем светодиод №<span class="tok-n">3</span> (желтый)
sleep(<span class="tok-n">2</span>)
led:<span class="tok-b">set</span>(<span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>)   -- выключаем светодиод №<span class="tok-n">0</span>
led:<span class="tok-b">set</span>(<span class="tok-n">1</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>)   -- выключаем светодиод №<span class="tok-n">1</span>
led:<span class="tok-b">set</span>(<span class="tok-n">2</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>)   -- выключаем светодиод №<span class="tok-n">2</span>
led:<span class="tok-b">set</span>(<span class="tok-n">3</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>)   -- выключаем светодиод №<span class="tok-n">3</span></code></pre></div>
<div class="codewrap"><pre><code data-lang="python">local function led_control(r, g, b) -- создаем функцию "led_control", позволит удобно сменить цвет всем светодиодам

<span class="tok-k">for</span> i = <span class="tok-n">0</span>, <span class="tok-n">28</span> do        -- создаем цикл <span class="tok-k">for</span> с переменной i = <span class="tok-n">0</span>, цикл будет повторяться от <span class="tok-n">0</span> до <span class="tok-n">28</span> (<span class="tok-n">29</span> раз)
    led:<span class="tok-b">set</span>(i, r, g, b) -- перебираем светодиоды и меняем цвет тот который укажем при вызове функции
    end                 -- завершаем блок кода с циклом
end                     -- завершаем блок кода с функцией

led_control(<span class="tok-n">1</span>, <span class="tok-n">0</span>, <span class="tok-n">0</span>)    -- меняем цвет светодиодов на красный
sleep(<span class="tok-n">2</span>)                -- ставим паузу на <span class="tok-n">2</span> секунды
led_control(<span class="tok-n">0</span>, <span class="tok-n">1</span>, <span class="tok-n">0</span>)    -- меняем цвет светодиодов на зеленый</code></pre></div>
<h4 id="s-конвертировать-hsv-в-rgb"><a class="anchor" href="#s-конвертировать-hsv-в-rgb" aria-hidden="true">§</a>Конвертировать HSV в RGB</h4>
<p><code>fromHSV(hue, saturation, value)</code> - конвертирует цветовую модель HSV в RGB.</p>
<div class="codewrap"><pre><code data-lang="python">local led = Ledbar.new(<span class="tok-n">29</span>) -- создаем объект "led", указываем <span class="tok-n">29</span> светодиодов

r, g, b = fromHSV(<span class="tok-n">180</span>, <span class="tok-n">100</span>, <span class="tok-n">100</span>) -- создаем переменные r, g, b, присваиваем значения палитры HSV

led:<span class="tok-b">set</span>(<span class="tok-n">0</span>, r, g, b)              -- включаем светодиод №<span class="tok-n">0</span>
led:<span class="tok-b">set</span>(<span class="tok-n">1</span>, r, g, b)              -- включаем светодиод №<span class="tok-n">1</span>
led:<span class="tok-b">set</span>(<span class="tok-n">2</span>, r, g, b)              -- включаем светодиод №<span class="tok-n">2</span>
led:<span class="tok-b">set</span>(<span class="tok-n">3</span>, r, g, b)              -- включаем светодиод №<span class="tok-n">3</span></code></pre></div>
<p><code>fromHSV(hue, saturation, value)</code> - конвертирует цветовую модель HSV в RGB.</p>
<p>led:set(2, r, g, b)              -- включаем светодиод №2led:set(3, r, g, b)              -- включаем светодиод №3</p>
<p><code>led:set(num, r, g, b)</code> - метод задает указанному светодиоду цвет в палитре RGB.</p>
<p><code>fromHSV(hue, saturation, value)</code> - конвертирует цветовую модель HSV в RGB.</p>
<p>sleep(2)                -- ставим паузу на 2 секундыled_control(0, 1, 0)    -- меняем цвет светодиодов на зеленый, r, g, b)              -- включаем светодиод №1</p></section>
<section class="docblock"><h2 id="s-класс-gpio"><a class="anchor" href="#s-класс-gpio" aria-hidden="true">§</a>Класс Gpio</h2>
<h3 id="s-класс-gpio-управление-портом"><a class="anchor" href="#s-класс-gpio-управление-портом" aria-hidden="true">§</a>Класс GPIO (управление портом)</h3>
<p><code>Gpio.new(Port, Pin, Mode)</code> - создает объект управляющий указанным портом на плате автопилота.</p>
<h3 id="s-распиновка-базовый-v-1-0-v-1-1"><a class="anchor" href="#s-распиновка-базовый-v-1-0-v-1-1" aria-hidden="true">§</a>Распиновка Базовый v.1.0 - v.1.1</h3>
<h3 id="s-распиновка-базовый-v-1-2"><a class="anchor" href="#s-распиновка-базовый-v-1-2" aria-hidden="true">§</a>Распиновка Базовый v.1.2</h3>
<h4 id="s-узнать-значение-gpio"><a class="anchor" href="#s-узнать-значение-gpio" aria-hidden="true">§</a>Узнать значение Gpio</h4>
<p><code>Gpio.read()</code> - считывает текущее значение Gpio.</p>
<h4 id="s-установить-значение-gpio"><a class="anchor" href="#s-установить-значение-gpio" aria-hidden="true">§</a>Установить значение Gpio</h4>
<p><code>Gpio.set()</code> - устанавливает <code>true</code> на выбранный пин.</p>
<p><code>Gpio.reset()</code> - устанавливает <code>что?</code> на выбранный пин.</p>
<p><code>Gpio.write(value)</code> - устанавливает значение переданное в аргументе <code>value</code> на выбранный пин.</p>
<h4 id="s-альтернативная-функция-gpio"><a class="anchor" href="#s-альтернативная-функция-gpio" aria-hidden="true">§</a>Альтернативная функция Gpio</h4>
<p><code>Gpio.setFunction(num)</code> - устанавливает номер альтернативной функции на выбранный пин.</p>
<h4 id="s-пример-с-магнитом"><a class="anchor" href="#s-пример-с-магнитом" aria-hidden="true">§</a>Пример с магнитом</h4>
<p><code>Gpio.setFunction(num)</code> - устанавливает номер альтернативной функции на выбранный пин.</p>
<p><code>Gpio.new(Port, Pin, Mode)</code> - создает объект управляющий указанным портом на плате автопилота.</p>
<p><code>Gpio.read()</code> - считывает текущее значение Gpio.</p>
<p><code>Gpio.set()</code> - устанавливает <code>true</code> на выбранный пин.</p>
<p><code>Gpio.reset()</code> - устанавливает <code>что?</code> на выбранный пин.</p>
<p><code>Gpio.write(value)</code> - устанавливает значение переданное в аргументе <code>value</code> на выбранный пин.</p>
<p><code>Gpio.setFunction(num)</code> - устанавливает номер альтернативной функции на выбранный пин.</p>
<p><code>Gpio.setFunction(num)</code> - устанавливает номер альтернативной функции на выбранный пин.</p></section>
<section class="docblock"><h2 id="s-класс-uart"><a class="anchor" href="#s-класс-uart" aria-hidden="true">§</a>Класс Uart</h2>
<h3 id="s-класс-uart-управление-портом"><a class="anchor" href="#s-класс-uart-управление-портом" aria-hidden="true">§</a>Класс UART (управление портом)</h3>
<p>С помощью UART интерфейса можно наладить обмен данными между двумя разными устройствами.</p>
<p><code>Uart.new(num, rate, parity, stopBits)</code> - создает объект резервирующий выбранный UART-порт и позволяющий в дальнейшем использовать его в своих целях.</p>
<div class="codewrap"><pre><code data-lang="python">local myUart = Uart.new(<span class="tok-n">4</span>, <span class="tok-n">115200</span>, parity, stopBits) -- создаем объект "myUart", содержит аргументы:
                                                     -- num(<span class="tok-n">4</span>) - номер uart порта которым будем управлять
                                                     -- <span class="tok-n">115200</span>(rate) - скорость передачи данных
                                                     -- parity - необязательный аргумент, по умолчанию Uart.PARITY_NONE, но также принимает Uart.PARITY_EVEN и Uart.PARITY_ODD
                                                     -- stopBits - необязательный аргумент, по умолчанию Uart.ONE_STOP, но также принимает Uart.TWO_STOP</code></pre></div>
<h4 id="s-прочитать-байт"><a class="anchor" href="#s-прочитать-байт" aria-hidden="true">§</a>Прочитать байт</h4>
<p><code>Uart.read(size)</code> - возвращает указанное в аргументе <code>size</code> количество байт.</p>
<h4 id="s-записать-данные"><a class="anchor" href="#s-записать-данные" aria-hidden="true">§</a>Записать данные</h4>
<p><code>Uart.write(data, size)</code> - записывает <code>data</code> длиной <code>size</code>.</p>
<h4 id="s-узнать-доступные-для-чтения-данные"><a class="anchor" href="#s-узнать-доступные-для-чтения-данные" aria-hidden="true">§</a>Узнать доступные для чтения данные</h4>
<p><code>Uart.bytesToRead()</code> - возвращает количество байт доступных для чтения.</p>
<h4 id="s-задать-скорость-обмена-данными"><a class="anchor" href="#s-задать-скорость-обмена-данными" aria-hidden="true">§</a>Задать скорость обмена данными</h4>
<p><code>Uart.setBaudRate(rate)</code> - устанавливает скорость обмена данными по шине UART.</p>
<p><code>Uart.read(size)</code> - возвращает указанное в аргументе <code>size</code> количество байт.</p>
<p><code>Uart.write(data, size)</code> - записывает <code>data</code> длиной <code>size</code>.</p>
<p><code>Uart.bytesToRead()</code> - возвращает количество байт доступных для чтения.</p>
<p><code>Uart.setBaudRate(rate)</code> - устанавливает скорость обмена данными по шине UART.</p>
<p>С помощью UART интерфейса можно наладить обмен данными между двумя разными устройствами.</p>
<p><code>Uart.read(size)</code> - возвращает указанное в аргументе <code>size</code> количество байт.</p>
<p><code>Uart.write(data, size)</code> - записывает <code>data</code> длиной <code>size</code>.</p>
<p><code>Uart.bytesToRead()</code> - возвращает количество байт доступных для чтения.</p>
<p><code>Uart.setBaudRate(rate)</code> - устанавливает скорость обмена данными по шине UART.</p></section>
<section class="docblock"><h2 id="s-класс-spi"><a class="anchor" href="#s-класс-spi" aria-hidden="true">§</a>Класс Spi</h2>
<h3 id="s-класс-spi-управление-портом"><a class="anchor" href="#s-класс-spi-управление-портом" aria-hidden="true">§</a>Класс SPI (управление портом)</h3>
<p>С помощью SPI интерфейса можно наладить обмен данными между двумя разными устройствами. <code>Spi.new(num, rate, seq, mode)</code> - создает объект резервирующий выбранный SPI-порт и позволяющий в дальнейшем использовать его в своих целях.</p>
<div class="codewrap"><pre><code data-lang="python">local mySpi = Spi.new(<span class="tok-n">4</span>, <span class="tok-n">115200</span>, seq, mode) -- создаем объект "mySpi", содержит аргументы:
                                            -- num(<span class="tok-n">4</span>) - номер spi порта которым будем управлять
                                            -- <span class="tok-n">115200</span>(rate) - скорость передачи данных
                                            -- seq - необязательный аргумент, по умолчанию Spi.MSB, но также принимает Spi.MSB, Spi.LSB, Spi.MSB_16, Spi.LSB_16
                                            -- mode - необязательный аргумент, по умолчанию Spi.MODE0, но также принимает Spi.MODE0, Spi.MODE1, Spi.MODE2, Spi.MODE3</code></pre></div>
<h4 id="s-прочитать-байт"><a class="anchor" href="#s-прочитать-байт" aria-hidden="true">§</a>Прочитать байт</h4>
<p><code>Spi.read(size)</code> - возвращает указанное в аргументе <code>size</code> количество байт.</p>
<h4 id="s-записать-данные"><a class="anchor" href="#s-записать-данные" aria-hidden="true">§</a>Записать данные</h4>
<p><code>Spi.write(data, size)</code> - записывает <code>data</code> длиной <code>size</code>.</p>
<h4 id="s-узнать-доступные-для-чтения-данные"><a class="anchor" href="#s-узнать-доступные-для-чтения-данные" aria-hidden="true">§</a>Узнать доступные для чтения данные</h4>
<p><code>Spi.exchange(data, size)</code> - записывает <code>data</code> длиной <code>size</code> и возвращает <code>size</code>.</p>
<div class="codewrap"><pre><code data-lang="python">local mySpi = Spi.new(<span class="tok-n">4</span>, <span class="tok-n">115200</span>, seq, mode) -- создаем объект "myUart"
spi:exchange("hello", <span class="tok-n">5</span>)                    -- записываем hello, длиной <span class="tok-n">5</span> и возвращаем количество байт</code></pre></div>
<p><code>Spi.read(size)</code> - возвращает указанное в аргументе <code>size</code> количество байт.</p>
<p><code>Spi.write(data, size)</code> - записывает <code>data</code> длиной <code>size</code>.</p>
<p><code>Spi.exchange(data, size)</code> - записывает <code>data</code> длиной <code>size</code> и возвращает <code>size</code>.</p>
<p><code>Spi.read(size)</code> - возвращает указанное в аргументе <code>size</code> количество байт.</p>
<p><code>Spi.write(data, size)</code> - записывает <code>data</code> длиной <code>size</code>.</p>
<p><code>Spi.exchange(data, size)</code> - записывает <code>data</code> длиной <code>size</code> и возвращает <code>size</code>.</p></section>
<section class="docblock"><h2 id="s-класс-timer"><a class="anchor" href="#s-класс-timer" aria-hidden="true">§</a>Класс Timer</h2>
<h4 id="s-запуск-и-остановка-таймера"><a class="anchor" href="#s-запуск-и-остановка-таймера" aria-hidden="true">§</a>Запуск и остановка таймера</h4>
<p><code>Timer.start</code> -</p>
<p><code>Timer.stop</code> -</p>
<div class="codewrap"><pre><code data-lang="python">local led = Ledbar.new(<span class="tok-n">29</span>)

function callback(event)
end

timerRandomLED = Timer.new(<span class="tok-n">0.1</span>, function ()
    led:<span class="tok-b">set</span>(math.random(<span class="tok-n">0</span>, <span class="tok-n">3</span>), math.random(), math.random(),math.random())
end)

timerRandomLED:start()

sleep(<span class="tok-n">3</span>)
ap.push(Ev.MCE_PREFLIGHT)
sleep(<span class="tok-n">3</span>)
ap.push(Ev.MCE_LANDING)</code></pre></div>
<p><code>Timer.start</code> -</p>
<p><code>Timer.stop</code> -</p></section>
<section class="docblock"><h2 id="s-класс-mailbox"><a class="anchor" href="#s-класс-mailbox" aria-hidden="true">§</a>Класс mailbox</h2>
<h3 id="s-класс-mailbox-2"><a class="anchor" href="#s-класс-mailbox-2" aria-hidden="true">§</a>Класс mailbox ()</h3>
<p><code>mailbox.connect(ip, port)</code> - инициализация подключения к устройству с заданным адресом и портом.</p>
<div class="codewrap"><pre><code data-lang="python">hull, message = mailbox.connect("<span class="tok-n">192.168</span>.<span class="tok-n">0.100</span>", <span class="tok-n">8889</span>) -- аргументы:
                                                       -- ip - адрес устройства назначения
                                                       -- port - порт устройства назначения</code></pre></div>
<h4 id="s-проверить-сообщения"><a class="anchor" href="#s-проверить-сообщения" aria-hidden="true">§</a>Проверить сообщения</h4>
<p><code>mailbox.hasMessages()</code> - возвращает <code>true</code>, если пришло сообщение, иначе <code>false</code>.</p>
<div class="codewrap"><pre><code data-lang="python">has_mes = mailbox.hasMessages()</code></pre></div>
<h4 id="s-узнать-бортовой-номер-устройства"><a class="anchor" href="#s-узнать-бортовой-номер-устройства" aria-hidden="true">§</a>Узнать бортовой номер устройства</h4>
<p><code>mailbox.myHullNumber()</code> - возвращает текущий бортовой номер устройства.</p>
<div class="codewrap"><pre><code data-lang="python">my_hull = mailbox.myHullNumber()</code></pre></div>
<h4 id="s-считать-байт-сообщения"><a class="anchor" href="#s-считать-байт-сообщения" aria-hidden="true">§</a>Считать байт сообщения</h4>
<p><code>mailbox.receive(blocking)</code> - ожидает получение нового сообщения и возвращает его, если <code>blocking=true</code>. Возвращает сообщение из буфера или -1 (при отсутствии сообщений), если <code>blocking=false</code>.</p>
<div class="codewrap"><pre><code data-lang="python">hull, message = mailbox.receive(true)</code></pre></div>
<h4 id="s-отправить-сообщение"><a class="anchor" href="#s-отправить-сообщение" aria-hidden="true">§</a>Отправить сообщение</h4>
<p><code>mailbox.send(hull, message)</code> - отправляет сообщение адресату. Если <code>hull</code> &lt; 0, отправляет сообщение всем известным устройствам.</p>
<div class="codewrap"><pre><code data-lang="python">mailbox.send(<span class="tok-n">42</span>, "Hello Username") -- аргументы:
                                   -- <span class="tok-n">42</span>(hull) - бортовой номер устройства которому будет отправлено сообщение
                                   -- Hello Username(message) - сообщение для отправки</code></pre></div>
<p><code>mailbox.setHullNumber(hull)</code> - устанавливает новый бортовой номер, перезаписывается параметр &quot;Trik_hullNum&quot;.</p>
<div class="codewrap"><pre><code data-lang="python">mailbox.setHullNumber(<span class="tok-n">12</span>) -- <span class="tok-n">12</span>(hull) - новый бортовой номер</code></pre></div>
<p><code>mailbox.myHullNumber()</code> - возвращает текущий бортовой номер устройства.</p>
<p><code>mailbox.send(hull, message)</code> - отправляет сообщение адресату. Если <code>hull</code> &lt; 0, отправляет сообщение всем известным устройствам.</p>
<p><code>mailbox.setHullNumber(hull)</code> - устанавливает новый бортовой номер, перезаписывается параметр &quot;Trik_hullNum&quot;.</p>
<p><code>mailbox.connect(ip, port)</code> - инициализация подключения к устройству с заданным адресом и портом.</p>
<p><code>mailbox.hasMessages()</code> - возвращает <code>true</code>, если пришло сообщение, иначе <code>false</code>.</p>
<p><code>mailbox.myHullNumber()</code> - возвращает текущий бортовой номер устройства.</p>
<p><code>mailbox.send(hull, message)</code> - отправляет сообщение адресату. Если <code>hull</code> &lt; 0, отправляет сообщение всем известным устройствам.</p>
<p><code>mailbox.setHullNumber(hull)</code> - устанавливает новый бортовой номер, перезаписывается параметр &quot;Trik_hullNum&quot;.</p></section>
