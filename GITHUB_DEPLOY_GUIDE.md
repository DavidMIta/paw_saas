# 📚 Guía Completa: GitHub + GitHub Pages

## 🎯 Requisitos Previos

1. ✅ Cuenta GitHub (https://github.com)
2. ✅ Git instalado
3. ✅ SSH key configurada (recomendado) u HTTPS token

## PARTE 1: Preparar para GitHub (Ya Completado ✅)

```bash
# Crear .gitignore (ya hecho)
# - .gitignore en raíz
# - backend/.gitignore
# - frontend/.gitignore actualizado

# Verificar estado
cd /d/SAAS_paw
git status
```

## PARTE 2: Inicializar Git del Proyecto

```bash
cd /d/SAAS_paw

# Si NO es un repo git aún:
git init

# Si YA es un repo, verificar:
git status
```

## PARTE 3: Crear Repositorio en GitHub

### Opción A: Frontend + Backend juntos (Monorepo)

1. **En GitHub.com:**
   - Click "New repository"
   - Nombre: `saas-paw` (o tu preferencia)
   - Descripción: "Pet Grooming Booking System - React + Django"
   - Público o Privado (recomendado: Público para GitHub Pages gratis)
   - NO iniciar con README (lo haremos desde local)

2. **Copiar URL HTTPS o SSH:**
   ```
   https://github.com/TU_USUARIO/saas-paw.git
   git@github.com:TU_USUARIO/saas-paw.git
   ```

### Opción B: Frontend solo (Recomendado para GitHub Pages)

- Crear repo: `saas-paw-frontend` o `saas-paw`
- Será más fácil de deployar a GitHub Pages

## PARTE 4: Agregar Remoto y Hacer Push Inicial

```bash
cd /d/SAAS_paw

# Agregar repositorio remoto
git remote add origin https://github.com/TU_USUARIO/saas-paw.git

# Verificar
git remote -v

# Hacer commit inicial
git add .
git commit -m "Initial commit: Pet grooming booking system with React + Django"

# Pushear a GitHub
git branch -M main
git push -u origin main
```

## PARTE 5: Publicar Frontend en GitHub Pages

### ⚡ IMPORTANTE: GitHub Pages SOLO sirve contenido ESTÁTICO

Como tienes React (SPA estática), puedes publicar el frontend.

### Opción 1: Usar GitHub Pages automático

**1. Configurar el repo:**

- GitHub → Settings → Pages
- Source: Deploy from a branch
- Branch: `main`
- Folder: `/frontend/dist` (después de build)

**2. Crear GitHub Actions workflow para autobuild:**

```bash
# Crear archivo
mkdir -p .github/workflows
touch .github/workflows/deploy.yml
```

**Contenido del archivo `.github/workflows/deploy.yml`:**

```yaml
name: Build and Deploy Frontend to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "pnpm"
          cache-dependency-path: frontend/pnpm-lock.yaml

      - name: Install dependencies
        run: cd frontend && pnpm install

      - name: Build
        run: cd frontend && pnpm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend/dist
          cname: tu-dominio.com # Opcional: si tienes dominio personalizado
```

### Opción 2: Deploy manual

```bash
# Build el frontend
cd frontend
pnpm run build

# Pushear /dist a rama 'gh-pages'
cd ..
git subtree push --prefix=frontend/dist origin gh-pages
```

Luego en GitHub Settings → Pages → Source: `gh-pages` branch

## PARTE 6: Backend (NO en GitHub Pages)

GitHub Pages NO puede ejecutar código backend (Django).

### Opciones para deploy del backend:

1. **Railway** (Recomendado - Gratis primer mes)

   ```
   https://railway.app
   - Conectar repo GitHub
   - Deploy automático
   ```

2. **Heroku** (Nuevo: pago)

   ```
   https://heroku.com
   - Classic apps descontinuadas
   - Usar: heroku-20 / heroku-22
   ```

3. **Render.com** (Gratis con límites)

   ```
   https://render.com
   ```

4. **PythonAnywhere** (Python hosting)
   ```
   https://pythonanywhere.com
   - Especializado en Django
   ```

## PASO A PASO FINAL: GitHub + GitHub Pages

### En tu Terminal:

```bash
# 1. Ir al proyecto
cd /d/SAAS_paw

# 2. Verificar que git está inicializado
git status

# 3. Verificar .gitignore está correcto
cat .gitignore

# 4. Agregar todos los archivos (menos lo de .gitignore)
git add .

# 5. Primer commit
git commit -m "Initial commit: Pet grooming booking system

- React 19 + Vite frontend
- Django REST backend
- Authentication with JWT
- Client, Staff, Admin dashboards"

# 6. Conectar a GitHub (reemplaza con tu URL)
git remote add origin https://github.com/TU_USUARIO/saas-paw.git

# 7. Pushear a main
git branch -M main
git push -u origin main

# 8. Esperar a que GitHub Pages construya (1-2 minutos)
# Ir a: https://github.com/TU_USUARIO/saas-paw/settings/pages
```

### Configurar GitHub Pages:

1. **GitHub → Settings → Pages**
2. **Source:**
   - Branch: `main` (o rama que uses)
   - Folder: `/frontend` o `/frontend/dist` según setup
3. **Esperar deployment**
4. **URL pública:**
   ```
   https://TU_USUARIO.github.io/saas-paw/
   ```

## 🚀 FLUJO DE TRABAJO CONTINUO

Después del setup inicial:

```bash
# Hacer cambios...

# Agregar cambios
git add .

# Guardar cambios
git commit -m "Feature: descripción de cambios"

# Subir a GitHub (auto-deployea a Pages)
git push
```

## 🔧 Troubleshooting

### "fatal: not a git repository"

```bash
cd /d/SAAS_paw
git init
```

### "please make sure you have the correct access rights"

- Verificar SSH keys o HTTPS token
- https://github.com/settings/keys (SSH) o
- https://github.com/settings/tokens (Personal access token)

### GitHub Pages no actualiza

1. Ir a Actions en GitHub
2. Verificar que el workflow pasó ✅
3. Settings → Pages → Esperar 1-2 minutos

### API backend no funciona desde Pages

- Frontend en: `https://tu-usuario.github.io/saas-paw/`
- Backend debe estar en dominio diferente
- Actualizar `VITE_API_BASE_URL` en `.env`
- Agregar CORS en Django backend

```python
# backend/config/settings.py
CORS_ALLOWED_ORIGINS = [
    "https://tu-usuario.github.io",
]
```

## 📋 Checklist Final

- [ ] `.gitignore` creado en raíz y backend
- [ ] `backend/.env` NO está en git (solo `.env.example`)
- [ ] `frontend/.env` NO está en git (solo `.env.example`)
- [ ] `git init` hecho
- [ ] Repositorio creado en GitHub
- [ ] `git remote add origin ...` ejecutado
- [ ] Primer commit hecho
- [ ] `git push` ejecutado
- [ ] GitHub Pages configurado
- [ ] Backend deployment configurado (Railway/Render/etc)
- [ ] `VITE_API_BASE_URL` apunta a backend correcto

## 🎉 ¡Listo!

Después de esto:

- Repo en GitHub: `github.com/TU_USUARIO/saas-paw` ✅
- Frontend Live: `tu-usuario.github.io/saas-paw/` ✅
- Backend: Depende de donde lo hostees
