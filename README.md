# AI-Driven System for [Your System's High-Level Purpose]

Este documento proporciona instrucciones para configurar y usar el sistema impulsado por IA.

## Instrucciones de Configuración

Para ejecutar el sistema, asegúrese de tener Docker y Docker Compose instalados en su máquina. Una vez instalados, navegue al directorio raíz de este proyecto , dentro de la carpeta `frontend` asegurése de tener un archivo env.js con la variable N8N_HOST, si va ejecutar todo de forma local use como valor :

```bash
N8N_HOST="http://localhost:5678/webhook/ask"
```

si no use la direccion url de produccion.

Despues ejecute el siguiente comando en la raíz del proyecto:

```bash
docker-compose up -d --build
```

## Este comando hará lo siguiente:

- Construirá las imágenes Docker para su backend (ai-system-backend) y frontend (ai-system-frontend) basándose en sus respectivos Dockerfiles.

- Descargará las imágenes Docker necesarias para Redis (redis:latest), Selenium (selenium/standalone-chrome:latest) y n8n (n8nio/n8n:latest).

- Creará e iniciará contenedores para cada servicio definido en el archivo docker-compose.yml en modo detached (-d).

- Una vez que todos los contenedores estén en funcionamiento, el sistema será accesible en las siguientes direcciones:

  - API del Backend: http://localhost:18000 (mapeado al puerto 7013 dentro del contenedor backend)
  - Frontend: http://localhost:80 (mapeado al puerto 80 dentro del contenedor frontend)
  - n8n: http://localhost:5678 (mapeado al puerto 5678 dentro del contenedor n8n)

- El servicio init-caller intentará automáticamente enviar una solicitud POST a http://backend:7013/init poco después de que se inicie el servicio backend, lo que puede realizar tareas de configuración inicial.

Si quieres ejecutar pruebas al backend utiliza el comando `pytest` desde el contenedor backend. 

## Consultas de Ejemplo

Aquí hay algunos ejemplos de cómo podría interactuar con el sistema:

### Consulta de Ejemplo 1: Buscar libros de misterio por menos de £10

Entrada: "Encuéntrame un libro de misterio por menos de £10"

Salida Esperada: Una lista de libros de misterio disponibles que cuestan menos de £10.

### Consulta de Ejemplo 2: Resumen de noticias sobre inteligencia artificial

Entrada: "Resume las últimas noticias sobre inteligencia artificial"

Salida Esperada: Un resumen conciso de artículos de noticias recientes relacionados con la inteligencia artificial.

### Consulta de Ejemplo 3: Interacción con el Webhook de n8n

Entrada: Envío de una solicitud POST con una carga útil JSON al endpoint del webhook de n8n que contiene una consulta del usuario.

#### Ejemplo de entrada:

```
{
  "query": "¿Cuál es la capital de Francia?"
}
```

#### Salida Esperada:

El formato de la respuesta dependerá de su flujo de trabajo de n8n, pero podría ser un objeto JSON que contenga la respuesta.

```
{
  "answer": "La capital de Francia es París."
}
```

## Esquema de Redis

El sistema utiliza Redis para el almacenamiento en caché rápido y potencialmente para otro almacenamiento de datos. Aquí hay algunas estructuras clave-valor utilizadas:

book: Almacena información sobre un libro específico.
Tipo: Objeto JSON
Ejemplo:

```
{
  "title": "El Paciente Silencioso",
  "img_url": "https://example.com/paciente-silencioso.jpg",
  "price": 9.99,
  "category": "Misterio",
  "url": "https://example.com/el-paciente-silencioso"
}
```

hn:headlines Almacena una matriz de resúmenes de titulares recientes.
Tipo: Matriz JSON
Ejemplo:

```
[
  {"title": "Nuevo Modelo de IA Logra un Rendimiento Innovador", "url": "...", "score": "..."},
  {"title": "Compañía Tecnológica Anuncia Despidos", "url": "...", "score": "..."}
]
```

## Webhook de n8n

El servicio n8n proporciona un endpoint de webhook que se puede utilizar para interactuar con sus flujos de trabajo.

Endpoint: /webhook/ask (Esto se basa en la posible variable de entorno REACT_APP_N8N_WEBHOOK_URL que podría haber considerado para el frontend).

Interacción: Para interactuar con el webhook de n8n, puede enviar una solicitud HTTP POST al endpoint especificado. El cuerpo de la solicitud generalmente debe ser un objeto JSON que contenga los datos que desea enviar al flujo de trabajo de n8n.

Ejemplo usando curl:
curl -X POST -H "Content-Type: application/json" -d '{"query": "Traduce \"Hola\" al español"}' http://localhost:5678/webhook/ask

## Decisiones Técnicas

Aquí hay una justificación para algunas de las decisiones tecnológicas clave tomadas en este sistema:

#### Docker y Docker Compose:

Se utilizan para la contenedorización para garantizar un entorno consistente y reproducible en diferentes configuraciones de desarrollo, staging y producción.

#### Redis:

Elegido por sus capacidades de almacenamiento de datos en memoria, proporcionando operaciones de lectura y escritura extremadamente rápidas.

#### FastAPI:

Seleccionado como el framework de backend debido a su alto rendimiento, soporte asíncrono y validación y serialización automática de datos.

#### React con Vite:

Utilizado para el frontend debido a la arquitectura basada en componentes de React, su gran comunidad y su rico ecosistema.

#### Selenium:

Incluido para pruebas automatizadas del navegador y potencialmente para tareas de web scraping si lo requiere la funcionalidad del sistema.

#### n8n:

Integrado como una herramienta de automatización de flujos de trabajo.

#### Python:

Utilizado como el lenguaje principal para el backend debido a sus extensas bibliotecas para el procesamiento del lenguaje natural, el aprendizaje automático y el desarrollo web.
Node.js: Utilizado para el frontend (React) debido a su modelo de E/S no bloqueante y basado en eventos.
