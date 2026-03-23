# Отчёт: anytype-mcp-plus v1.0.5
Дата: 2026-03-23

## Резервная копия
- Путь: C:\ClaudeCode\anytype-mcp-plus.v104
- Статус: успех

## Источники исследования
- anyproto/anytype-mcp commit 542d477 (Jan 7, 2026):
  "Clarify filter support" — официальное подтверждение что FilterExpression
  намеренно исключён из MCP tool specs с пометкой TODO
- cryptonahue/mcp-anytype handlers/objects.ts: handleSearchObjects использует sort
- openapi-2025-11-08.yaml: SortOptions schema (created_date, last_modified_date,
  last_opened_date, name; asc|desc)
- Тестирование v1.0.4: bracket-syntax фильтры вызывают Tool execution failed

## Причины ошибок (окончательные)

### search_objects filters
Причина: FilterExpression (POST /search) — официально не реализован в Anytype API.
Источник: anyproto/anytype-mcp parser.ts строки 59-62 и 462-464 (TODO комментарии).
Решение: убрать filters из handleSearchObjects, добавить sort.

### list_objects с [op] filters
Причина: bracket-syntax query params не поддерживается текущей версией API.
Источник: OpenAPI не объявляет эти параметры в schema. Тестирование подтверждает ошибки.
Решение: оставить только простой key=value, задокументировать ограничение.

### create_property inline tags
Причина: условие response?.property?.id неверное — API возвращает id в response.id напрямую.
Решение: проверять оба варианта.

## Изменения кода

### 1. search_objects — убраны filters, добавлен sort
- Файл: src/handlers/objects.ts
- Статус: применено
- Удалена: функция convertToFilterExpression
- Добавлен: параметр sort с валидацией

### 2. list_objects — исправлена реализация filters
- Файл: src/handlers/objects.ts
- Статус: применено
- Убран: bracket-syntax [op] код
- Оставлен: только простой key=value

### 3. create_property — исправлено условие propertyId
- Файл: src/handlers/properties.ts
- Статус: применено
- Исправлено: response?.property?.id || response?.id

### 4. Схемы инструментов
- Файл: src/tools/objects.ts
- Статус: применено
- sort добавлен в anytype_search_objects
- filters обновлён в обоих инструментах

## Документация
- CHANGELOG.md раздел [1.0.5]: добавлен
- README.md Known API Limitations: обновлён

## Сборка
- Статус: успех
- Версия: 1.0.5
- Ошибки TypeScript: нет

## Итог
- Исправлено ошибок: 3 из 3
- Добавлено новых функций: 1 из 1
- Готово к тестированию: да
