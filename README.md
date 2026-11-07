# Gestor de estudiantes · Grupo 7

Actividad práctica 7.2 del Taller de Construcción de Software Web. El gestor registra, edita y elimina estudiantes. Su interfaz toma como referencia el índice, la cabecera y las pestañas del Aula Virtual FISI.

- [Aplicación en GitHub Pages](https://andrey3210.github.io/gestor-estudiantes-grupo-7/)
- [Informe de la práctica](informe/Informe-grupo-7.pdf)

## Ejecutar con la API

Necesitas Java 17 o superior, Maven y Node.js 24. Abre dos terminales desde la raíz del repositorio.

```sh
cd backend
mvn spring-boot:run
```

```sh
cd frontend
npm ci
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173). El frontend en desarrollo consulta Spring Boot en `http://localhost:8080`. La API inicia con cinco estudiantes ficticios y mantiene los cambios en memoria mientras el servidor está activo.

| Método | Ruta | Respuesta exitosa |
| --- | --- | --- |
| GET | `/api/estudiantes` | `200 OK` con la lista |
| POST | `/api/estudiantes` | `201 Created` con el registro |
| PUT | `/api/estudiantes/{codigo}` | `200 OK` con el registro actualizado |
| DELETE | `/api/estudiantes/{codigo}` | `204 No Content` |

Ejemplo de cuerpo para el POST.

```json
{
  "codigo": "E-006",
  "nombre": "Ana Pérez",
  "carrera": "Ingeniería de Software"
}
```

La API responde con `400` ante datos inválidos o un intento de cambiar el código, `409` si se intenta registrar un código duplicado y `404` si el registro a editar o eliminar no existe.

## Estado en React

- `useState` guarda la lista, los campos del formulario, la búsqueda y el registro pendiente de eliminar.
- `useReducer` administra las transiciones de carga, éxito y error para listar, agregar, editar y eliminar.
- El componente `App` comparte datos y funciones con el formulario y el directorio mediante props. El filtro se calcula sobre la lista al escribir.

El directorio combina búsqueda sin tildes, filtro por carrera y orden por código o nombre. La tabla muestra seis filas por página. La exportación CSV incluye todos los resultados filtrados y el resumen agrupa el directorio completo por carrera.

## Despliegue

GitHub Actions publica el frontend en Pages a partir de la rama `main`. La versión publicada usa el modo demostración con datos ficticios guardados en el navegador.

Para conectar la versión de Pages a Spring Boot, despliega el `Dockerfile` de `backend/` en un servicio con HTTPS. Agrega su URL base, sin `/api/estudiantes`, a la variable de repositorio `VITE_API_URL` en **Settings → Secrets and variables → Actions → Variables**. Vuelve a ejecutar el flujo **Publicar en GitHub Pages**. La API admite el origen `https://andrey3210.github.io` de forma predeterminada. Para otras instalaciones, configura `ORIGENES_FRONTEND` con los orígenes permitidos separados por comas.

## Integrantes

- Zafra Venegas, Andrey Hegel
- Quispe Alvarado, Luis Guillermo
- Ramirez Garcia, Estefano Alexis
- Ramirez Alvarez, Maleck Adriano
- Gutierrez Mamani, Joselin Victoria
