# Uso de Tags en Anytype MCP

Este documento explica cómo crear objetos y asignar tags correctamente usando el MCP de Anytype.

## Flujo de Trabajo para Usar Tags

### 1. Crear Tags para una Propiedad

Antes de poder asignar tags a un objeto, necesitas crear los tags para una propiedad específica de tipo `multi_select` o `select`.

```json
{
  "space_id": "tu_space_id",
  "name": "Urgente",
  "color": "red",
  "property_id": "property_id_de_la_propiedad_multi_select"
}
```

### 2. Crear un Objeto con Tags

Una vez que tienes los tags creados, puedes crear un objeto y asignar esos tags:

```json
{
  "space_id": "tu_space_id",
  "name": "Mi Tarea",
  "type_key": "task",
  "body": "Esta es una tarea importante",
  "properties": [
    {
      "key": "status",
      "select": "tag_id_del_estado_completado"
    },
    {
      "key": "labels",
      "multi_select": ["tag_id_urgente", "tag_id_importante"]
    }
  ]
}
```

### 3. Actualizar un Objeto con Nuevos Tags

Para actualizar tags en un objeto existente:

```json
{
  "space_id": "tu_space_id",
  "object_id": "object_id_existente",
  "properties": [
    {
      "key": "labels",
      "multi_select": ["tag_id_urgente", "tag_id_nuevo_tag"]
    }
  ]
}
```

## Pasos Detallados

### Paso 1: Obtener el ID de la Propiedad

Primero necesitas obtener el `property_id` de la propiedad donde quieres crear tags:

```bash
# Listar propiedades del espacio
anytype_list_properties --space_id="tu_space_id"
```

### Paso 2: Crear Tags

```bash
# Crear tag "Urgente"
anytype_create_tag --space_id="tu_space_id" --name="Urgente" --color="red" --property_id="property_id"

# Crear tag "Importante"
anytype_create_tag --space_id="tu_space_id" --name="Importante" --color="orange" --property_id="property_id"
```

### Paso 3: Crear Objeto con Tags

```bash
anytype_create_object --space_id="tu_space_id" --name="Mi Tarea" --properties='[{"key":"labels","multi_select":["tag_id_1","tag_id_2"]}]'
```

## Colores Disponibles para Tags

- `grey`
- `yellow` (por defecto)
- `orange`
- `red`
- `pink`
- `purple`
- `blue`
- `ice`
- `teal`
- `lime`

## Tipos de Propiedades con Tags

### Select (Selección Única)
- Solo permite un tag seleccionado
- Usar el campo `select` con el ID del tag

### Multi-Select (Selección Múltiple)
- Permite múltiples tags seleccionados
- Usar el campo `multi_select` con un array de IDs de tags

## Errores Comunes

1. **Tag no existe**: Asegúrate de crear los tags antes de asignarlos a objetos
2. **Property_id incorrecto**: Verifica que el `property_id` corresponda a una propiedad de tipo `select` o `multi_select`
3. **Space_id incorrecto**: Confirma que estás usando el ID correcto del espacio

## Validación Automática

El MCP ahora incluye validación automática que:
- Procesa las propiedades con tags al crear/actualizar objetos
- Registra información sobre tags asignados en los logs
- Mantiene la estructura de datos correcta para la API de Anytype

## Ejemplo Completo

```bash
# 1. Crear tags
anytype_create_tag --space_id="space123" --name="Urgente" --color="red" --property_id="prop456"
anytype_create_tag --space_id="space123" --name="En Progreso" --color="blue" --property_id="prop789"

# 2. Crear objeto con tags
anytype_create_object \
  --space_id="space123" \
  --name="Proyecto Importante" \
  --type_key="project" \
  --body="Descripción del proyecto" \
  --properties='[
    {
      "key": "priority",
      "select": "tag_urgente_id"
    },
    {
      "key": "status",
      "select": "tag_en_progreso_id"
    }
  ]'
```

## Notas Importantes

- Los IDs de tags deben existir antes de la asignación
- La clave (`key`) de la propiedad debe coincidir con propiedades existentes del tipo de objeto
- El sistema ahora valida y procesa automáticamente las asignaciones de tags
- Se incluye información detallada en las respuestas sobre tags procesados
