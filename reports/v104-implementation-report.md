# Отчёт: anytype-mcp-plus v1.0.4
Дата: 2026-03-23

## Резервная копия
- Путь: C:\ClaudeCode\anytype-mcp-plus.v103
- Статус: успех

## Источники исследования
- developers.anytype.io/docs/reference/2025-11-08/list-objects — формат query params с [op]
- developers.anytype.io/docs/reference/2025-11-08/search-space — схема FilterExpression
- openapi-2025-11-08.yaml: FilterExpression, FilterItem, FilterCondition, CheckboxFilterItem

## Причины ошибок (из документации)

### list_objects filters
Причина: `encodeURIComponent` на скобки `[op]` → `%5Beq%5D` → API 400/500
Доказательство: документация явно указывает `?done=false`, `?created_date[gte]=2024-01-01`
Исправление: убрать encodeURIComponent с key и operator, добавить опмап псевдонимов

### search_objects filters
Причина: передавался `{"done": {"equals": false}}` — не схема FilterExpression
Правильная схема: `{"operator": "and", "conditions": [{"property_key": "done", "condition": "eq", "checkbox": true}]}`
Исправление: функция convertToFilterExpression конвертирует shorthand в FilterExpression

## Изменения кода

### 1. list_objects — исправление URL кодирования
- Файл: src/handlers/objects.ts
- Статус: применено

### 2. search_objects — исправление FilterExpression
- Файл: src/handlers/objects.ts
- Статус: применено
- Добавлена функция: convertToFilterExpression

### 3. create_property — inline tags в ответе
- Файл: src/handlers/properties.ts
- Статус: применено

### 4. update_object type_key — описание
- Файл: src/tools/objects.ts
- Статус: применено

### 5. Описания filters
- Файл: src/tools/objects.ts
- Статус: применено

## Документация
- CHANGELOG.md раздел [1.0.4]: добавлен
- README.md обновлён: да

## Сборка
- Команда: npm run build (npx tsc)
- Статус: успех
- Версия: 1.0.4
- Ошибки TypeScript: нет

## Итог
- Исправлено ошибок: 2 из 2
- Улучшений: 3 из 3
- Готово к тестированию: да
