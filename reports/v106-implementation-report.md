# Отчёт: anytype-mcp-plus v1.0.6
Дата: 2026-03-23

## Резервная копия
- Путь: C:\ClaudeCode\anytype-mcp-plus.v105
- Статус: успех

## Диагностика create_property

### Найденная проблема в коде
Ситуация Б — блок автодозапроса тегов присутствовал (добавлен в v1.0.4, исправлен в v1.0.5),
но содержал проблемы:
1. Поле `type` отправлялось в requestBody наряду с `format` — API использует `format`, не `type`
2. Inline tags передавались без обязательного поля `color` — CreateTagRequest по OpenAPI
   требует `color` как обязательное поле
3. Условие propertyId уже было исправлено в v1.0.5 (response?.property?.id || response?.id)

### Причина
- requestBody содержал `type` (не API поле) + `format` — двойная передача
- Tags без `color` могли отклоняться API

### Дополнительная находка из OpenAPI
CreateTagRequest.color — обязательное поле по API spec.
Наша схема делала его опциональным — добавлен default "grey".

## Изменения кода

### 1. handleCreateProperty — исправление
- Файл: src/handlers/properties.ts
- Статус: применено
- Что изменено: полная замена функции — убрано поле `type` из requestBody,
  добавлен `resolvedFormat`, tags нормализуются с default color "grey",
  валидация принимает `type` или `format`

### 2. handleGlobalSearch — добавлена функция
- Файл: src/handlers/objects.ts
- Статус: применено

### 3. anytype_global_search — добавлена схема
- Файл: src/tools/objects.ts
- Статус: применено

### 4. Регистрация anytype_global_search
- Файл: src/index.ts
- Статус: применено

### 5. Описание search_objects обновлено
- Файл: src/tools/objects.ts
- Статус: применено

## Документация
- CHANGELOG.md [1.0.6]: добавлен
- README.md: обновлён (global_search добавлен, tool count 34)

## Сборка
- Статус: успех
- Версия: 1.0.6
- Ошибки TypeScript: нет

## Итог
- Исправлено ошибок: 1 из 1
- Новых инструментов: 1 из 1
- Инструментов итого: 34
- Готово к тестированию: да
