# Disagro ERP - Documentación del Proyecto

Disagro ERP es una aplicación de gestión empresarial (ERP) construida con **React, TypeScript y Vite**. Utiliza **Supabase** como backend como servicio (BaaS) para autenticación, base de datos y almacenamiento.

## 🚀 Tecnologías Principales

- **Frontend**: React, TypeScript, Vite
- **Estilos**: Tailwind CSS, Lucide React (Iconos)
- **Estado y Fetching**: TanStack Query (React Query)
- **Enrutamiento**: TanStack Router
- **Backend & BD**: Supabase (PostgreSQL)

---

## 📊 Diagrama de Arquitectura del Proyecto

El siguiente diagrama muestra cómo interactúan las piezas clave del sistema:

```mermaid
graph TD
    A[Usuario / Cliente] -->|Navegador Web| B[React SPA]
    
    subgraph Frontend [Aplicación React]
        B --> C[TanStack Router]
        C --> D[Páginas & Componentes]
        D --> E[TanStack Query]
    end
    
    subgraph Backend [Supabase]
        E -->|Llamadas a API / Supabase Client| F[Supabase Auth]
        E -->|Llamadas a API / Supabase Client| G[Supabase Postgres DB]
        E -->|Llamadas a API / Supabase Client| H[Supabase Storage]
    end
```

---

## 🗄️ Esquema de Base de Datos (Entity-Relationship)

La base de datos relacional en Supabase está compuesta por las siguientes entidades principales. (Esquema simplificado basado en el código del cliente):

```mermaid
erDiagram
    CLIENTS {
        uuid id PK
        string name
        string email
        string location
        string notes
    }
    PROJECTS {
        uuid id PK
        uuid client_id FK
        string name
        string status
    }
    PROFORMAS {
        uuid id PK
        uuid project_id FK
        uuid user_id FK
        float total
        string status
    }
    PRODUCTS {
        uuid id PK
        string name
        string description
        float unit_price
        int stock
    }
    CALENDAR_EVENTS {
        uuid id PK
        string title
        datetime start_time
        datetime end_time
        string type
    }
    USERS {
        uuid id PK
        string email
        uuid role_id FK
    }
    ROLES {
        uuid id PK
        string name
        uuid area_id FK
    }
    AREAS {
        uuid id PK
        string name
    }
    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string message
        boolean read
    }

    CLIENTS ||--o{ PROJECTS : "tiene"
    PROJECTS ||--o{ PROFORMAS : "contiene"
    PROFORMAS ||--o{ CALENDAR_EVENTS : "agenda"
    USERS ||--o{ PROFORMAS : "crea"
    USERS ||--o{ NOTIFICATIONS : "recibe"
    AREAS ||--o{ ROLES : "define"
    ROLES ||--o{ USERS : "asignado a"
```

## 🛠️ Comandos Disponibles

- `npm run dev` o `bun run dev`: Inicia el servidor de desarrollo en local.
- `npm run build` o `bun run build`: Compila la aplicación para producción.
- `npm run lint` o `bun run lint`: Ejecuta el linter (Biome) en el proyecto para revisar problemas de sintaxis.
- `npm run format` o `bun run format`: Formatea el código automáticamente usando Biome.

## ⚙️ Configuración del Entorno

Asegúrate de configurar tus variables de entorno en un archivo `.env` o `.env.local` en el directorio `apps/web`:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```
