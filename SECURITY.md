# 🔐 Guía de Seguridad para GitHub

## Archivos SENSIBLES que NUNCA deben subirse a GitHub

### ⚠️ CRÍTICO - Nunca commitear estos archivos:

1. **Backend `.env`** (`backend/.env`)
   - Contiene: `DJANGO_SECRET_KEY` (clave secreta de Django)
   - Contiene: Credenciales de base de datos en producción
   - Contiene: Configuración CORS/CSRF

2. **Frontend `.env`** (`frontend/.env`)
   - Aunque menos sensible que backend, aún debe ser local

3. **Archivos SQLite** (`*.sqlite3`, `db_dev.sqlite3`)
   - Bases de datos de desarrollo/producción
   - Pueden contener datos sensitivos

4. **Virtual environments**
   - `/venv`, `/.venv`, `/backend/venv`
   - Ya están en .gitignore

## ✅ Cómo configurar antes de subir a GitHub

### Paso 1: Asegurar que los archivos sensibles NUNCA se han commiteado

```bash
# Ver el historial de archivos
git log --all -- backend/.env
git log --all -- frontend/.env

# Si aparecen, eliminarlos del historial (PELIGROSO):
# Consultar documentación de git-filter-branch o BFG repo cleaner
```

### Paso 2: Crear archivos `.env.example` (ya existen ✅)

- `backend/.env.example` ✅ - Ya existe, contiene estructura
- `frontend/.env.example` ✅ - Ya existe, contiene estructura

### Paso 3: Verificar el .gitignore

Los siguientes archivos ya están protegidos por `.gitignore`:

- ✅ `backend/.env`
- ✅ `frontend/.env`
- ✅ `*.sqlite3`
- ✅ `/venv`, `/.venv`
- ✅ `/node_modules`

## 📝 Para Colaboradores

Cuando clonan el repo, deben:

```bash
# Backend
cd backend
cp .env.example .env
# EDITAR .env con valores locales/de desarrollo

# Frontend
cd frontend
cp .env.example .env
# EDITAR .env con URL API local
```

## 🚀 Para Producción en GitHub Pages

### Frontend (Static Site)

- GitHub Pages sirve automáticamente desde `/dist`
- Built files son públicos (OK)
- `.env.example` muestra qué variables se necesitan
- En CI/CD, generar `.env` con secrets desde GitHub Actions

### Backend (No se puede hostear en GitHub Pages)

- Necesita un backend separado (Heroku, Railway, AWS, etc.)
- En ese servidor, crear `.env` con variables de entorno
- Usar secrets management del servidor

## 🔍 Verificación pre-push

Antes de hacer `git push`:

```bash
# Ver archivos que se van a subir
git status

# Verificar que NO hay:
# - backend/.env
# - frontend/.env
# - *.sqlite3
# - venv/
# - node_modules/
```

## 🛑 Si accidentalmente subiste secretos

1. **Cambiar inmediatamente todas las claves comprometidas**
   - `DJANGO_SECRET_KEY` nueva
   - Contraseñas de BD
   - API keys (si las hay)

2. **Eliminar del historial (opcional, requiere force-push)**

   ```bash
   # Usar herramienta como git-filter-branch o BFG
   # ADVERTENCIA: Afecta a todo el equipo
   ```

3. **Invalidar tokens/keys**
   - Regenerar JWT secrets
   - Resetear DB passwords

## Estado Actual ✅

- `.gitignore` creados en raíz, backend y frontend
- `backend/.env.example` existente
- `frontend/.env.example` existente
- Ready para GitHub!
