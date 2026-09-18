// Дублирует lessons.json на клиенте — синхронизировать вручную
// (или через npm run build:config-meta для src/_data/courseConfig.json)
export const PAGES = [
  { number: 1, url: '/01-overview/', title: 'Обзор платформы', section: 'mini2', description: 'Образовательный квадрокоптер Геоскан Пионер Мини 2: характеристики, архитектура ПО, способы программирования; краткий обзор линейки и Пионера Базового', duration: 10, complexity: 'beginner' },
  { number: 2, url: '/02-start/', title: 'Быстрый старт', section: 'mini2', description: 'Подготовка Пионер Мини 2 к полетам, подключение по Wi-Fi, Pioneer Code, SSH, установка Pioneer OS', duration: 20, complexity: 'beginner' },
  { number: 3, url: '/03-launch/', title: 'Способы запуска программы', section: 'mini2', description: 'Как запустить программу: Pioneer Code (CodeOss) на борту, SSH-терминал, запуск с ноутбука через pioneer_sdk2', duration: 15, complexity: 'beginner' },
  { number: 4, url: '/04-base/', title: 'Пионер Базовый', section: 'base', description: 'Характеристики, модули, распиновка, комплект поставки, сравнение с Мини 2', duration: 10, complexity: 'beginner' },
  { number: 5, url: '/05-sdk2/', title: 'Pioneer SDK 2', section: 'python', description: 'Полное справочное руководство по классам Python API с примерами', duration: 60, complexity: 'intermediate' },
  { number: 6, url: '/06-rknn/', title: 'Нейросети (RKNN)', section: 'neural', description: 'Детекция, сегментация, позы, OCR, жесты и собственные модели на NPU', duration: 45, complexity: 'advanced' },
  { number: 7, url: '/07-lua/', title: 'Lua', section: 'autopilot', description: 'Программирование автопилота на Lua', duration: 30, complexity: 'advanced' },
  { number: 8, url: '/08-blocks/', title: 'Блочное ПО', section: 'visual', description: 'Bricks, Jump, Jump 2, Trik Studio — визуальное программирование для начинающих', duration: 15, complexity: 'beginner' },
  { number: 9, url: '/09-examples/', title: 'Примеры', section: 'resources', description: 'Разбор репозитория pioneer-sdk2-example', duration: 25, complexity: 'intermediate' },
  { number: 10, url: '/10-links/', title: 'Ссылки', section: 'resources', description: 'Все официальные ресурсы по Пионеру', duration: 5, complexity: 'beginner' }
];

export const SECTIONS = [
  { id: 'mini2', name: 'Пионер Мини 2', icon: '🚁' },
  { id: 'base', name: 'Пионер Базовый', icon: '🛠️' },
  { id: 'python', name: 'Python: SDK и примеры', icon: '🐍' },
  { id: 'neural', name: 'Нейросети на борту', icon: '🧠' },
  { id: 'autopilot', name: 'Lua и автопилот', icon: '⚙️' },
  { id: 'visual', name: 'Блочное программирование', icon: '🧩' },
  { id: 'resources', name: 'Материалы', icon: '📚' }
];
