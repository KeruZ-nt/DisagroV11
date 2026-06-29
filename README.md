# Disagro ERP

Disagro ERP es el sistema de planificación de recursos (ERP) para Disagro, refactorizado a una arquitectura moderna en formato **Monorepo**.

## Stack Tecnológico

### Frontend (`apps/web`)
- **Framework**: React 19 + TypeScript (Tipado Estricto)
- **Build Tool**: Vite 6
- **Routing**: TanStack Router (Enrutamiento 100% tipado, basado en archivos en `src/routes`)
- **Data Fetching**: TanStack Query
- **Estilos**: Tailwind CSS v4

### Backend y Base de Datos (Actual)
- **Proveedor**: Supabase
- **Base de Datos**: PostgreSQL
- **Autenticación**: Supabase Auth
- **Almacenamiento**: Supabase Storage

*(Nota: La estructura del proyecto está preparada en monorepo para una futura migración del backend a Bun + Hono + Drizzle).*

### Tooling
- **Package Manager / Runtime**: Bun
- **Linter & Formatter**: Biome (Reemplaza a ESLint y Prettier)
- **Testing**: Vitest (Próximamente)
- **CI/CD**: GitHub Actions

## Estructura del Proyecto

```text
/
├── apps/
│   └── web/           # Frontend (Vite + React)
├── biome.json         # Configuración unificada de lint/format
├── bunfig.toml        # Configuración de Bun workspace
└── package.json       # Workspace root
```

## Guía de Desarrollo

### Requisitos previos
- Instalar [Bun](https://bun.sh/)

### Instalación

1. Clona el repositorio e instala las dependencias en la raíz del proyecto:
   ```bash
   bun install
   ```

2. Configura las variables de entorno:
   - Ve a `apps/web` y crea un archivo `.env` basado en `.env.example` con tus credenciales de Supabase.

### Comandos Principales

Ejecuta estos comandos desde la raíz del proyecto:

- **Desarrollo**: 
  ```bash
  bun run dev
  ```
- **Construcción**:
  ```bash
  bun run build
  ```
- **Linting y Formateo**:
  ```bash
  bun run lint
  bun run format
  ```
