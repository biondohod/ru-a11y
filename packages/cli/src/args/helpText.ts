export const HELP_TEXT = `ru-a11y-cli - проверка доступности сайтов по ГОСТ и Постановлению №102

Использование:
  ru-a11y-cli <url...> [опции]

Опции:
  --urls-file <путь>      Файл со списком URL (по одному на строку)
  --standard <уровень>    Целевой уровень: gost-a | gost-aa | gost-aaa (по умолчанию: gost-aa)
  --wcag-tags <теги>      Дополнительный фильтр правил axe по тегам (через запятую)
  --format <формат>       Формат отчета: console | json | html | junit | all (по умолчанию: console)
  --output <директория>   Путь к директории для json/html/junit отчетов
  --max-issues <число>    Порог нарушений для кода выхода 1
  --timeout <мс>          Таймаут проверки одной страницы в миллисекундах
  --concurrency <число>   Количество одновременных проверок
  --include <фильтр>      Включить только указанные группы (через запятую)
  --exclude <фильтр>      Исключить указанные группы (через запятую)
  --disable-rules <ids>   Отключить отдельные правила axe (через запятую)
  --with-eslint           Дополнительно запустить статический аудит ESLint
  --eslint-targets <glob> Файлы/паттерны для ESLint (через запятую)
  --eslint-config <путь>  Явный путь до eslint.config.js/.eslintrc
  --project-root <путь>   Корень проекта для ESLint (по умолчанию: текущая директория)
  --help                  Показать эту справку
  --version               Показать версию CLI

Примеры:
  ru-a11y-cli https://example.com
  ru-a11y-cli https://example.com https://example.com/catalog --format json --output ./reports
  ru-a11y-cli --urls-file ./urls.txt --standard gost-aaa --max-issues 0
`;
