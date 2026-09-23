---
layout: layout.njk
title: "Пионер Базовый"
description: "Геоскан Пионер Базовый: характеристики, модули, распиновка, комплект поставки, программирование на Python (SDK/SDK2), Lua и Trik Studio"
pageNumber: 4
pageSlug: "base"
---

<h1>Пионер Базовый</h1>
<p><strong>Геоскан Пионер Базовый</strong> — открытая учебная платформа на базе полетного контроллера с автопилотом. В отличие от Пионера Мини 2, «Базовый» поставляется в виде конструктора (собирается из комплекта поставки), не имеет бортового вычислительного модуля и камеры с ИИ по умолчанию — вместо этого расширяется <a href="#base-modules">модулями</a>: навигации, полезной нагрузки и вычислительными (Radxa Zero, Pi Zero). Программируется на Python (Pioneer-SDK / Pioneer-SDK2), Lua и в блочных средах.</p>

<h2 id="base-compare">Сравнение с Пионером Мини 2</h2>
<div class="tablewrap"><table>
<thead><tr><th>Возможность</th><th>Пионер Мини 2</th><th>Пионер Базовый</th></tr></thead>
<tbody>
<tr><td>Вычисления на борту (Pioneer OS)</td><td>Предустановлены</td><td>Через модуль Radxa Zero 3W / Pi Zero 2W</td></tr>
<tr><td>Pioneer-SDK2 (Python)</td><td>✅ из коробки</td><td>✅ с модулем Radxa Zero 3W или Pi Zero 2W</td></tr>
<tr><td>Pioneer-SDK (первое поколение)</td><td>❌</td><td>✅ (кроме Pi Zero 2W — для него SDK2)</td></tr>
<tr><td>Нейросети (Pioneer-RKNN)</td><td>✅ из коробки</td><td>✅ с модулем Radxa Zero</td></tr>
<tr><td>Блочное программирование</td><td>Bricks, Jump 2</td><td>Jump* (Android), Trik Studio (Lua)</td></tr>
<tr><td>Камера с нейросетями на борту</td><td>13 Мпикс, подвес</td><td>Опциональные модули (оптический поток, FPV)</td></tr>
<tr><td>Сборка</td><td>Готовый коптер</td><td>Конструктор (сборка — часть обучения)</td></tr>
</tbody></table></div>
<p>*Требуется модуль <strong>esp32</strong>.</p>

<h2 id="base-programming">Программирование Базового</h2>
<h3 id="base-python">Python</h3>
<p>Для работы с «Базовым» используются те же библиотеки, что и для всей серии «Пионер»:</p>
<div class="codewrap"><pre><code data-lang="bash">pip install pioneer_sdk   # первая версия SDK — для Базового с платой-адаптером (кроме модуля Pi Zero 2W)
pip install pioneer_sdk2  # вторая версия SDK — для вычислительных модулей Radxa Zero 3W и Pi Zero 2W</code></pre></div>
<p>Требуется Python 3.12. Среда разработки — Visual Studio Code или любая другая IDE; запуск скриптов — по иконке ▶ в правом верхнем углу. Коптер подключается к компьютеру по Wi-Fi через используемый модуль (Radxa Zero / Pi Zero).</p>
<ul>
<li>Справочник по второй версии библиотеки: <a href="/05-sdk2/">Pioneer SDK 2</a>.</li>
<li>Нейросети на борту (с модулем Radxa Zero): <a href="/06-rknn/">Pioneer-RKNN</a>.</li>
</ul>
<h3 id="base-lua">Lua и Trik Studio</h3>
<p>«Базовый» программируется Lua-скриптами на автопилоте (см. <a href="/07-lua/">справочник Lua</a>) и в визуальной среде Trik Studio (<a href="/08-blocks/">блочное программирование</a>).</p>

<h2 id="base-modules">Модули</h2>
<p>Функциональность «Базового» расширяется сменными модулями. Официальная документация по каждому: <a href="https://docs.geoscan.ru/pioneer/uavs/base/standard/" target="_blank" rel="noopener">docs.geoscan.ru</a>:</p>
<div class="tablewrap"><table>
<thead><tr><th>Модуль</th><th>Назначение</th></tr></thead>
<tbody>
<tr><td>OPT (оптический)</td><td>Оптическая система навигации — удержание позиции над поверхностью</td></tr>
<tr><td>US (ультразвуковой)</td><td>Ультразвуковая навигация и удержание высоты в помещении</td></tr>
<tr><td>ИК (инфракрасный)</td><td>Навигация по ИК-маякам в помещении</td></tr>
<tr><td>GNSS</td><td>Спутниковая навигация (GPS/ГЛОНАСС) для полетов на улице</td></tr>
<tr><td>Cargo (груз)</td><td>Модуль доставки грузов с магнитным/захватным механизмом</td></tr>
<tr><td>esp32</td><td>Управление по Bluetooth/сети, поддержка Jump и своих устройств</td></tr>
<tr><td>FPV</td><td>Аналоговая видеотрансляция в реальном времени</td></tr>
<tr><td>LED</td><td>Управляемая светодиодная подсветка</td></tr>
<tr><td>Pi Zero 2W</td><td>Вычислительный модуль для программирования через pioneer_sdk2</td></tr>
<tr><td>Radxa Zero 3W</td><td>Вычислительный модуль с Pioneer OS: SDK2, RKNN-нейросети</td></tr>
</tbody></table></div>

<h2 id="base-downloads">Загрузки</h2>
<p>Для «Базового» доступны: прошивка автопилота и параметры (пульт/Jump/Python), конфигураторы <strong>Pioneer Station 1 и 2</strong>, утилита Njet_GUI, прошивки платы-адаптера и ультразвуковых модулей, прошивка esp32 (bootloader, partition-table, firmware), а также 3D-модели (STL, DXF, Thingiverse) для печати собственных деталей. Все файлы — в разделе <a href="https://docs.geoscan.ru/pioneer/uavs/base/standard/downloads/" target="_blank" rel="noopener">«Загрузки»</a> официальной документации.</p>

<h2 id="base-specs">Характеристики и распиновка</h2>
<p>Ниже — данные из официального раздела «Технические характеристики и комплект поставки».</p>

<h3 id="s-основные-характеристики">Основные характеристики</h3>
<div class="tablewrap"><table><thead><tr><th>Параметр</th><th>Значение</th></tr></thead><tbody><tr><td>Тип БПЛА</td><td>мультироторный</td></tr><tr><td>Воздушная скорость</td><td>до 65 км/ч</td></tr><tr><td>Продолжительность полета</td><td>до 17 мин</td></tr><tr><td>Масса полезной нагрузки</td><td>150 грамм</td></tr><tr><td>Максимальный взлетный вес</td><td>420 грамм</td></tr><tr><td>Рабочий диапазон температур</td><td>от −10 до +40 °С</td></tr><tr><td>Диаметр воздушных винтов</td><td>127 мм gemfan 5030</td></tr><tr><td>Расстояние между двигателями</td><td>190 мм по диагонали</td></tr><tr><td>Размеры в сборе</td><td>290 × 290 × 120 мм</td></tr></tbody></table></div>

<h3 id="s-возможности">Возможности</h3>
<div class="tablewrap"><table><thead><tr><th>Параметр</th><th>Значение</th></tr></thead><tbody><tr><td>Управление через мобильное приложение</td><td>Jump* (Android)</td></tr><tr><td>Управление через пульт РУ</td><td>да</td></tr><tr><td>Поддержка систем навигации</td><td>оптическая (OPT), инфракрасная (ИК), ультразвуковая (УЗ), спутниковая (GPS)</td></tr><tr><td>Поддержка языков программирования</td><td>Python, Lua</td></tr><tr><td>Поддержка блочного программирования</td><td>Jump*, Trik Studio (Lua)</td></tr></tbody></table></div>
<p>*Требуется модуль esp32.</p>

<h3 id="s-двигатели">Двигатели</h3>
<div class="tablewrap"><table><thead><tr><th>Параметр</th><th>Значение</th></tr></thead><tbody><tr><td>Тип двигателей</td><td>электрические бесколлекторные, Flash Hobby BX1306-3100KV</td></tr><tr><td>Диаметр двигателя</td><td>18 мм</td></tr><tr><td>Высота двигателя</td><td>29.1 мм</td></tr><tr><td>Диаметр вала</td><td>2 мм</td></tr></tbody></table></div>

<h3 id="s-модуль-расширения">Модуль расширения</h3>
<div class="tablewrap"><table><thead><tr><th>Параметр</th><th>Значение</th></tr></thead><tbody><tr><td>Дальномер</td><td>лазерный</td></tr><tr><td>Камера</td><td>оптический поток</td></tr></tbody></table></div>

<h3 id="s-аккумуляторная-батарея">Аккумуляторная батарея</h3>
<div class="tablewrap"><table><thead><tr><th>Параметр</th><th>Значение</th></tr></thead><tbody><tr><td>Тип АКБ</td><td>Li-Po</td></tr><tr><td>Количество ячеек АКБ</td><td>2S</td></tr><tr><td>Номинальное напряжение на ячейку</td><td>3.7 Вольт</td></tr><tr><td>Суммарное напряжение</td><td>6.4–8.4 Вольт</td></tr><tr><td>Токоотдача</td><td>40–45 C</td></tr><tr><td>Емкость</td><td>1800 мА/ч</td></tr><tr><td>Масса</td><td>≈130 грамм</td></tr><tr><td>Размеры</td><td>90 × 34 × 14 мм</td></tr><tr><td>Рекомендуемая сила тока зарядки</td><td>не более 1C (1.8 А)</td></tr></tbody></table></div>

<h3 id="s-распиновка">Распиновка</h3>
<div class="tablewrap"><table><thead><tr><th>Коннектор X1, X4, X8</th><th>Назначение</th></tr></thead><tbody><tr><td>1</td><td>+5V</td></tr><tr><td>2</td><td>+3.3V</td></tr><tr><td>3</td><td>GPIO2</td></tr><tr><td>4</td><td>GPIO1</td></tr><tr><td>5</td><td>UART_RX</td></tr><tr><td>6</td><td>UART_TX</td></tr><tr><td>7</td><td>SPI_CS</td></tr><tr><td>8</td><td>SPI_SCK</td></tr><tr><td>9</td><td>SPI_MISO</td></tr><tr><td>10</td><td>SPI_MOSI</td></tr><tr><td>11</td><td>GND</td></tr><tr><td>12</td><td>GND</td></tr></tbody></table></div>
<div class="tablewrap"><table><thead><tr><th>Коннектор X2, X5, X9</th><th>Назначение</th></tr></thead><tbody><tr><td>1</td><td>+5V</td></tr><tr><td>2</td><td>+3.3V</td></tr><tr><td>3</td><td>GPIO3 (RX)</td></tr><tr><td>4</td><td>GPIO4 (TX)</td></tr><tr><td>5</td><td>GPIO5</td></tr><tr><td>6</td><td>I2C_SDA</td></tr><tr><td>7</td><td>I2C_SCL</td></tr><tr><td>8</td><td>LED_D</td></tr><tr><td>9</td><td>GND</td></tr><tr><td>10</td><td>GND</td></tr></tbody></table></div>
<div class="tablewrap"><table><thead><tr><th>Коннектор X3</th><th>Назначение</th></tr></thead><tbody><tr><td>1</td><td>P0 (SPI_MOSI)</td></tr><tr><td>2</td><td>P1 (SPI_MISO)</td></tr><tr><td>3</td><td>P2 (SPI_SCK)</td></tr><tr><td>4</td><td>P3 (SPI_CS)</td></tr><tr><td>5</td><td>P4 (TX)</td></tr><tr><td>6</td><td>P5 (RX)</td></tr><tr><td>7</td><td>P6 (GPIO1)</td></tr><tr><td>8</td><td>+3.3V</td></tr></tbody></table></div>
<div class="tablewrap"><table><thead><tr><th>Коннектор X6</th><th>Назначение</th></tr></thead><tbody><tr><td>1</td><td>RST</td></tr><tr><td>2</td><td>BOOT0</td></tr><tr><td>3</td><td>SYNC</td></tr><tr><td>4</td><td>P9</td></tr><tr><td>5</td><td>P8 (I2C_SDA)</td></tr><tr><td>6</td><td>P7 (I2C_SCL)</td></tr><tr><td>7</td><td>VIN</td></tr><tr><td>8</td><td>GND</td></tr></tbody></table></div>
<div class="tablewrap"><table><thead><tr><th>Коннектор X7</th><th>Назначение</th></tr></thead><tbody><tr><td>1</td><td>+5V</td></tr><tr><td>2</td><td>GND</td></tr><tr><td>3</td><td>—</td></tr></tbody></table></div>

<h3 id="s-комплект-поставки">Комплект поставки</h3>
<div class="tablewrap"><table><thead><tr><th>Позиция</th><th>Количество</th></tr></thead><tbody>
<tr><td>Плата автопилота</td><td>1 шт</td></tr>
<tr><td>Плата-адаптер</td><td>1 шт</td></tr>
<tr><td>Шлейф</td><td>2 шт (10 pin + 12 pin)</td></tr>
<tr><td>Радиоприемник</td><td>1 шт (FS-A8S)</td></tr>
<tr><td>Кабельная сборка радиоприемника</td><td>1 шт (PicoBlade 1.25 мм, 3 pin и 4 pin)</td></tr>
<tr><td>Основание рамы</td><td>1 шт</td></tr>
<tr><td>Посадочные ножки</td><td>2 шт (1 верхняя + 1 нижняя)</td></tr>
<tr><td>Торец отсека АКБ</td><td>1 шт</td></tr>
<tr><td>Основание защиты винтов</td><td>4 шт</td></tr>
<tr><td>Прямая защиты винтов</td><td>8 шт</td></tr>
<tr><td>Дуга защиты винтов</td><td>8 шт</td></tr>
<tr><td>Двигатель</td><td>4 шт (2 с черной шайбой + 2 с белой)</td></tr>
<tr><td>Пропеллер</td><td>4 шт (2 правого + 2 левого вращения)</td></tr>
<tr><td>Винт М2х4</td><td>8 шт (DIN 912)</td></tr>
<tr><td>Винт М2х6</td><td>8 шт (DIN 912)</td></tr>
<tr><td>Винт М3х4</td><td>4 шт</td></tr>
<tr><td>Винт М3х5</td><td>4 шт</td></tr>
<tr><td>Винт М3х10</td><td>24 шт</td></tr>
<tr><td>Стойка демпферная</td><td>4 шт</td></tr>
<tr><td>Стойка М3х8</td><td>8 шт</td></tr>
<tr><td>Стойка М3х25</td><td>16 шт</td></tr>
<tr><td>Аккумуляторная батарея</td><td>1 шт</td></tr>
<tr><td>Кабель USB</td><td>1 шт</td></tr>
<tr><td>Отвертка</td><td>1 шт</td></tr>
<tr><td>Руководство по эксплуатации</td><td>1 шт</td></tr>
<tr><td>Технический паспорт</td><td>1 шт</td></tr>
</tbody></table></div>
<p>*Комплект поставки может отличаться в зависимости от года поставки и особых договоренностей в контракте.</p>
