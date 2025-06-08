# PLAN DE ARQUITECTURA SIMPLIFICADO - PROYECTO UNIVERSITARIO DE TRACKING (V2)

## 1. ARQUITECTURA GENERAL (MVP)

- **Backend:** Monolito con Node.js y Express.js.
- **Base de Datos:** PostgreSQL.
- **Cliente Principal:** Aplicación Móvil con React Native.
- **Mapas:** `react-native-maps` (utiliza OpenStreetMap o Google Maps en Android de forma gratuita).
- **IA/ML:** Librería de JavaScript (ej. `dbscan`) dentro del backend de Node.js para análisis simple.
- **Autenticación:** Basada en Tokens (JWT) con contraseñas hasheadas usando `bcryptjs`.
- **Despliegue Local:** Docker con Docker Compose para el backend y la base de datos.

## 2. TECNOLOGÍAS (Prioridad Cero Costo)

- **Backend:** `express`, `sequelize`, `sequelize-cli`, `pg`, `jsonwebtoken`, `bcryptjs`, `cors`, `socket.io`, `joi`.
- **Base de Datos:** `postgres` (imagen de Docker).
- **Aplicación Móvil:** `react-native`, `axios`, `@react-navigation/native`, `react-native-maps`, `@react-native-community/geolocation`, `@react-native-async-storage/async-storage`, `socket.io-client`.
- **Desarrollo:** `docker-compose`, `nodemon`.

## 3. ESTRUCTURA DE DIRECTORIOS RECOMENDADA

Esta estructura organiza el código de manera lógica sin introducir la complejidad de los microservicios.

/tracking-system/
├── /backend/
│   ├── /src/
│   │   ├── /api/         # Controladores y rutas (ej. auth.routes.js)
│   │   ├── /config/      # Configuración de BD, variables de entorno
│   │   ├── /middlewares/ # Middleware de autenticación JWT
│   │   ├── /models/      # Modelos de Sequelize (User, Location, etc.)
│   │   ├── /services/    # Lógica de negocio (cálculo de geofencing, etc.)
│   │   └── app.js        # Punto de entrada del servidor Express
│   ├── .sequelizerc      # Archivo de configuración de Sequelize CLI
│   └── package.json
├── /database/
│   ├── /migrations/    # Archivos de migración de la base de datos
│   └── /seeders/       # Archivos para poblar la BD con datos iniciales
├── /docs/
│   ├── README.md         # Documentación principal del proyecto
│   └── API.md            # Documentación de los endpoints de la API
├── /mobile-app/
│   └── # Estructura estándar de un proyecto React Native
├── .env.example          # Plantilla para las variables de entorno
└── docker-compose.yml    # Orquestación de los contenedores

## 4. DISEÑO DE LA APLICACIÓN MONOLÍTICA Y API

- **Servicio Unificado:** La aplicación en `/backend` manejará toda la lógica.
- **API Endpoints (Unificados):**
    - `POST /api/auth/register`
    - `POST /api/auth/login`
    - `POST /api/locations` (Protegida)
    - `GET /api/locations/history` (Protegida)
    - `POST /api/geofences` (Protegida)
    - `GET /api/geofences` (Protegida)
    - `POST /api/ai/frequent-places` (Protegida)