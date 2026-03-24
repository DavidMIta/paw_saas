SAAS_PAW - Estructura del proyecto

Este README reúne un resumen de contenido y propósito de los archivos y directorios principales del proyecto, separado en Backend y Frontend. Se excluyen node_modules/, venv/ y dist/.

---

Backend (d:\\SAAS_paw\\backend)

- .env: Archivo de configuración de entorno que contiene variables sensibles (BD, claves, ajustes) usado en desarrollo/producción; no debe versionarse.
- .env.example: Plantilla con las variables de entorno esperadas y valores de ejemplo para configurar el proyecto.
- manage.py: Script de entrada de Django para ejecutar comandos (runserver, migrate, shell, etc.).
- requirements.txt: Lista de dependencias Python (pip) necesarias para el backend.
- db.sqlite3 / db_dev.sqlite3: Bases de datos SQLite usadas por Django (producción/dev). Contienen datos persistentes del proyecto.
- nul: Archivo con nombre inusual; probablemente un placeholder o accidental — revisar contenido si es relevante.

Directorio appointments/

- admin.py: Registro de modelos de la app en el admin de Django.
- apps.py: Configuración de la app (clase AppConfig).
- migrations/: Carpeta con los archivos de migración de la app (esquema de BD versionado).
- models.py: Definición de modelos (tablas) relacionados con citas/appointments.
- serializers.py: Serializadores (probablemente DRF) para convertir modelos a JSON y validar entrada.
- tests.py: Pruebas unitarias/integración para la lógica de appointments.
- urls.py: Rutas específicas de la app que se incluyen en el router/urls global.
- views.py: Vistas/endpoint handlers (posiblemente API views) que implementan la lógica HTTP.
- **init**.py: Indica que es un paquete Python.

Directorio business/

- admin.py: Registro de modelos de negocio en el admin.
- apps.py: Configuración de la app business.
- migrations/: Migraciones de BD para la app business.
- models.py: Modelos relacionados con la entidad "business" (empresas, perfiles, etc.).
- permissions.py: Reglas de permiso personalizadas para controlar acceso a recursos.
- serializers.py: Serializadores para los modelos de business.
- tests.py: Casos de prueba para funcionalidades del módulo business.
- urls.py: Rutas/URLs de la app business.
- views.py: Lógica de vistas/endpoints de negocio.
- **init**.py: Inicializador del paquete.

Directorio users/

- admin.py: Registro de modelos de usuarios en el admin.
- apps.py: Configuración de la app users.
- migrations/: Migraciones relacionadas con usuarios.
- models.py: Modelos de usuario extendidos o perfiles (posible UserProfile).
- serializers.py: Serializadores para usuarios (registro, login, perfil).
- tests.py: Pruebas para la lógica de usuarios (auth, permisos).
- urls.py: Rutas relacionadas con autenticación/usuarios.
- views.py: Endpoints para registro, login, gestión de usuarios.
- **init**.py: Inicializador del paquete.

Directorio config/ (configuración del proyecto Django)

- asgi.py: Entrada ASGI para despliegues/asíncrono (websockets, ASGI servers).
- settings.py: Configuración principal de Django (INSTALLED_APPS, BD, middleware, CORS, etc.).
- urls.py: Enrutador global que incluye las urls de las apps.
- wsgi.py: Entrada WSGI para despliegues tradicionales (Gunicorn, uWSGI).
- **init**.py: Inicializador del paquete config.

---

Frontend (d:\\SAAS_paw\\frontend)

- .env: Variables de entorno para la build/ejecución del frontend (API_URL, claves públicas).
- .env.example: Plantilla con las variables de entorno esperadas para el frontend.
- .gitignore: Reglas para ignorar archivos en Git (node_modules, build, .env, etc.).
- eslint.config.js: Configuración de ESLint para linter TypeScript/JS del proyecto.
- index.html: HTML raíz que monta la aplicación (entrada para Vite).
- package.json: Metadatos del proyecto frontend, scripts de npm, dependencias y configuración.
- package-lock.json: Lockfile que fija versiones exactas de las dependencias instaladas.
- README.md: Documentación general del frontend (local). Revisa frontend/README.md para detalles específicos si existe.

Directorio public/

- index.html / favicon.svg / icons.svg / assets: Archivos estáticos públicos que se sirven tal cual (favicon, iconos y otros recursos accesibles sin bundling).

Directorio src/ (código fuente principal)

- main.tsx: Punto de entrada de la app React/TSX; monta el árbol de componentes en el DOM.
- App.tsx: Componente raíz que organiza rutas y layout global de la aplicación.
- App.css / index.css: Estilos globales y del componente raíz.
- assets/: Recursos usados por el código (imágenes, fuentes importadas desde el bundle).
- components/: Componentes reutilizables de UI (botones, formularios, controles).
- contexts/: Providers y contextos de React para estado compartido (auth, theme, etc.).
- pages/: Vistas/páginas principales mapeadas a rutas (dashboards, login, etc.).
- services/: Módulos que realizan llamadas a APIs, wrappers de fetch/axios y lógica de comunicación con el backend.
- types/: Definiciones TypeScript (interfaces/tipos) usadas en toda la app.

Archivos de configuración TypeScript y Vite

- tsconfig.app.json, tsconfig.json, tsconfig.node.json: Configuraciones TypeScript para la app, compilación y entorno Node respectivamente.
- vite.config.ts: Configuración de Vite (dev server, alias, proxies a backend).

---

Notas finales

- Se omitieron node_modules/, venv/ y dist/ por petición del usuario.
- Este README resume la estructura y el propósito principal de archivos y directorios; si se requiere un documento más detallado por archivo (ej. funciones/clases principales), indicar qué carpetas o archivos profundizar.
