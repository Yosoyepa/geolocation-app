PLAN DE EJECUCIÓN DETALLADO PARA AGENTE DE CÓDIGO
PROYECTO: SISTEMA DE TRACKING GEOGRÁFICO (MVP)

======================================================================
FASE 0: ANÁLISIS Y ORIENTACIÓN DEL PROYECTO
======================================================================
OBJETIVO: Comprender la estructura actual del proyecto para asegurar que todas las acciones posteriores estén alineadas con la arquitectura definida. No escribirás código en esta fase, solo analizarás.

---
TAREA 0.1: ANÁLISIS DE LA ESTRUCTURA DE DIRECTORIOS
* ACCIÓN: Ejecuta un comando para listar de forma recursiva todos los archivos y directorios desde la raíz del proyecto.
* RESULTADO ESPERADO: Un árbol de directorios que represente el estado actual del proyecto.

---
TAREA 0.2: ANÁLISIS DE LA CONFIGURACIÓN DEL ENTORNO
* ACCIÓN:
    1.  Lee el contenido del archivo `docker-compose.yml` si existe. Extrae los nombres de los servicios, las imágenes base, los puertos mapeados y los volúmenes definidos.
    2.  Lee el contenido del archivo `package.json` en el directorio `/backend` si existe. Extrae los scripts y las dependencias (`dependencies` y `devDependencies`).
* RESULTADO ESPERADO: Una confirmación de la comprensión de los componentes del entorno (base de datos, backend) y las herramientas de desarrollo.

---
TAREA 0.3: CONFIRMACIÓN DE ARQUITECTURA
* ACCIÓN: Basado en el análisis anterior, confirma verbalmente que la arquitectura a seguir es un monolito de Node.js en `/backend`, una base de datos PostgreSQL gestionada por Docker, y una aplicación móvil en `/mobile-app`, con directorios de soporte como `/database` y `/docs`.
* RESULTADO ESPERADO: "Confirmada la comprensión de la arquitectura monolítica simplificada. Procederé con la creación de archivos y directorios únicamente dentro de esta estructura."

======================================================================
FASE 1: CONFIGURACIÓN DEL ENTORNO Y ANDAMIAJE (SCAFFOLDING)
======================================================================
OBJETIVO: Establecer la estructura de directorios y los archivos de configuración base para todo el proyecto.

---
TAREA 1.1: CREACIÓN DE LA ESTRUCTURA DE DIRECTORIOS
* ACCIÓN: Para cada una de las siguientes rutas, verifica si existe. Si no existe, créala:
    * `/backend/src/api`
    * `/backend/src/config`
    * `/backend/src/middlewares`
    * `/backend/src/models`
    * `/backend/src/services`
    * `/database/migrations`
    * `/database/seeders`
    * `/docs`
    * `/mobile-app`

---
TAREA 1.2: CREACIÓN DEL ORQUESTADOR DE CONTENEDORES
* ACCIÓN: Crea un archivo llamado `docker-compose.yml` en la raíz del proyecto con el siguiente contenido exacto:
    ```yaml
    version: '3.8'
    services:
      postgres:
        image: postgres:15-alpine
        container_name: tracking_db
        restart: always
        environment:
          - POSTGRES_USER=${POSTGRES_USER}
          - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
          - POSTGRES_DB=${POSTGRES_DB}
        ports:
          - "5432:5432"
        volumes:
          - postgres_data:/var/lib/postgresql/data
    
      backend:
        container_name: tracking_backend
        build: ./backend
        ports:
          - "3000:3000"
        volumes:
          - ./backend:/usr/src/app
          - /usr/src/app/node_modules
        depends_on:
          - postgres
        env_file:
          - .env

    volumes:
      postgres_data:
    ```

---
TAREA 1.3: CREACIÓN DEL ENTORNO DE BACKEND
* ACCIÓN:
    1.  Crea un archivo `.env.example` en la raíz con las claves: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `JWT_SECRET`.
    2.  En el directorio `/backend`, crea un archivo `package.json` si no existe (`npm init -y`).
    3.  En el directorio `/backend`, instala las dependencias base: `npm install express pg sequelize sequelize-cli dotenv`.
    4.  En el directorio `/backend`, crea un archivo `.sequelizerc` y configura las rutas para que Sequelize CLI use los directorios correctos:
        ```javascript
        const path = require('path');
        module.exports = {
          'config': path.resolve('src/config', 'database.js'),
          'models-path': path.resolve('src/models'),
          'seeders-path': path.resolve('../database', 'seeders'),
          'migrations-path': path.resolve('../database', 'migrations'),
        };
        ```
    5.  Crea el archivo de configuración de la base de datos en `/backend/src/config/database.js`. Debe leer las credenciales del archivo `.env`.

======================================================================
FASE 2: DESARROLLO DEL NÚCLEO DEL BACKEND - MODELOS Y AUTENTICACIÓN
======================================================================
OBJETIVO: Implementar el sistema de usuarios, la base de datos y la autenticación por JWT.

---
TAREA 2.1: CREACIÓN DE MODELOS Y MIGRACIONES
* ACCIÓN:
    1.  Desde el directorio `/backend`, ejecuta `sequelize-cli model:generate` para crear los modelos `User`, `Device`, `Location`, y `Geofence` con sus atributos correspondientes definidos en el plan de arquitectura.
    2.  Abre los archivos de modelo generados en `/backend/src/models` y añade las asociaciones (`User.hasMany(Device)`, `Device.hasMany(Location)`, etc.).
    3.  Ejecuta `docker-compose up -d postgres` para iniciar la base de datos.
    4.  Ejecuta `sequelize-cli db:migrate` dentro del contenedor del backend (o localmente si tienes Node.js) para aplicar las migraciones y crear las tablas.

---
TAREA 2.2: IMPLEMENTACIÓN DEL SERVICIO DE AUTENTICACIÓN
* ACCIÓN:
    1.  En `/backend`, instala las dependencias: `npm install bcryptjs jsonwebtoken joi`.
    2.  Crea el archivo `/backend/src/middlewares/authMiddleware.js`. Implementa una función que verifique el token JWT del encabezado `Authorization`. Si es válido, añade el `payload` del token al objeto `req`. Si no, devuelve un error 401.
    3.  Crea el archivo `/backend/src/api/auth.js`. Define las rutas `POST /register` y `POST /login`.
    4.  En la ruta de registro, valida la entrada con `joi`, hashea la contraseña con `bcryptjs`, guarda el usuario usando el modelo `User`, y genera un JWT.
    5.  En la ruta de login, busca al usuario, compara la contraseña con `bcryptjs.compare`, y si es correcta, genera un nuevo JWT.
    6.  En el archivo principal `/backend/src/app.js`, importa y utiliza las rutas de autenticación.

======================================================================
FASE 3: DESARROLLO DEL NÚCLEO DEL BACKEND - GEOLOCALIZACIÓN
======================================================================
OBJETIVO: Implementar la recepción, almacenamiento y transmisión en tiempo real de datos de ubicación.

---
TAREA 3.1: IMPLEMENTACIÓN DE ENDPOINTS DE UBICACIÓN
* ACCIÓN:
    1.  Crea el archivo `/backend/src/api/location.js`.
    2.  Implementa el endpoint `POST /api/locations`. Esta ruta debe estar protegida por el `authMiddleware`. Debe recibir `{ device_id, latitude, longitude }`, validar que el dispositivo pertenezca al usuario autenticado y guardar la nueva ubicación en la base de datos usando el modelo `Location`.
    3.  Implementa el endpoint `GET /api/locations/history/:deviceId` para devolver un historial paginado de ubicaciones.

---
TAREA 3.2: INTEGRACIÓN DE TIEMPO REAL CON SOCKET.IO
* ACCIÓN:
    1.  En `/backend`, instala `npm install socket.io`.
    2.  En `/backend/src/app.js`, inicializa un servidor de Socket.IO adjunto al servidor de Express.
    3.  Modifica la lógica del endpoint `POST /api/locations`. Después de guardar exitosamente una nueva ubicación en la base de datos, emite un evento `new-location` a una sala específica del usuario (ej., `user:${userId}`). El payload del evento debe ser la nueva ubicación.

======================================================================
FASE 4: DESARROLLO DE LA APLICACIÓN MÓVIL
======================================================================
OBJETIVO: Crear el cliente móvil que captura y envía la ubicación del GPS y la visualiza en un mapa.

---
TAREA 4.1: CONFIGURACIÓN E INTERFAZ DE AUTENTICACIÓN
* ACCIÓN:
    1.  En el directorio `/mobile-app`, inicializa un proyecto de React Native.
    2.  Instala las dependencias: `axios`, `@react-navigation/native`, `react-native-maps`, `@react-native-community/geolocation`, `@react-native-async-storage/async-storage`, `socket.io-client`.
    3.  Crea las pantallas `LoginScreen` y `RegisterScreen`. Implementa los formularios y las llamadas a la API del backend usando `axios`. Al obtener un token JWT, guárdalo de forma segura con `@react-native-async-storage/async-storage`.

---
TAREA 4.2: IMPLEMENTACIÓN DE TRACKING Y VISUALIZACIÓN EN MAPA
* ACCIÓN:
    1.  Crea la pantalla `MapDashboardScreen`. Al cargar, solicita los permisos de geolocalización al usuario.
    2.  Usa `Geolocation.watchPosition()` para obtener actualizaciones de la ubicación del dispositivo.
    3.  Por cada actualización de ubicación, envía las coordenadas al endpoint `POST /api/locations` del backend, adjuntando el token JWT guardado en los encabezados.
    4.  Integra el componente `<MapView>` de `react-native-maps`. Muestra la ubicación actual con un `<Marker>`.
    5.  Conéctate al servidor de Socket.IO del backend y escucha el evento `new-location` para actualizar la posición del marcador en tiempo real.

======================================================================
FASE 5: DOCUMENTACIÓN Y CIERRE
======================================================================
OBJETIVO: Finalizar el proyecto con la documentación adecuada.

---
TAREA 5.1: CREACIÓN DE DOCUMENTACIÓN TÉCNICA Y DE USUARIO
* ACCIÓN:
    1.  Crea el archivo `/docs/README.md`. Detalla qué es el proyecto, la arquitectura utilizada y proporciona instrucciones paso a paso sobre cómo clonar el repositorio, crear el archivo `.env` a partir del `.env.example`, y levantar todo el entorno con `docker-compose up --build`.
    2.  Crea el archivo `/docs/API.md`. Documenta cada uno de los endpoints de la API, especificando el método HTTP, la URL, si requiere autenticación, los parámetros del body y un ejemplo de la respuesta JSON.