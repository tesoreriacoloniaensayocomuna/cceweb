# 🏛️ Plataforma Web - Comuna de Colonia Ensayo

Bienvenido al repositorio oficial de la plataforma digital de la **Comuna de Colonia Ensayo**. Este proyecto ha sido desarrollado para modernizar la gestión municipal, facilitando el acceso a la información pública, trámites y servicios para todos los vecinos.

---

## 🚀 Tecnologías Utilizadas

La plataforma utiliza un stack tecnológico de vanguardia enfocado en la velocidad y la eficiencia (Resumability):

- **Framework:** [Qwik](https://qwik.builder.io/) (Navegación instantánea y carga diferida extrema).
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/) (Diseño responsivo y moderno).
- **Base de Datos:** [Turso / LibSQL](https://turso.tech/) (SQLite distribuido para baja latencia).
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/) (Type-safe database management).
- **Autenticación:** [Better Auth](https://www.better-auth.com/) (Gestión de sesiones y roles).
- **Almacenamiento Multimedia:** [Cloudinary](https://cloudinary.com/) (Gestión de imágenes y documentos PDF).
- **Despliegue:** [Vercel](https://vercel.com/) (Edge Runtime para máximo rendimiento).

---

## ✨ Características Principales

### 🌐 Portal Público
- **Landing Page Institucional:** Sección hero, accesos rápidos y mapa de contacto.
- **Módulo de Noticias:** Feed dinámico con categorías y detalles optimizados.
- **Boletín Oficial:** Listado y descarga de normativas (Ordenanzas y Decretos).
- **Guía de Trámites:** Requisitos y formularios descargables.
- **Directorio de Servicios:** Información detallada con iconos y cuadros tarifarios.
- **Identidad:** Sección histórica con línea de tiempo interactiva.

### 🔐 Panel Administrativo (CMS)
- **Gestión de Contenidos:** CRUD completo para todas las secciones del sitio.
- **Configuración del Sitio:** Control dinámico de logos, menús y textos principales.
- **Control de Usuarios:** Sistema de roles (Admin/Editor) con gestión de perfiles.
- **Seguridad:** Sesiones robustas con protección de rutas y lógica de reintento.
- **Indicadores:** Dashboard con estadísticas de visitas y popularidad de contenidos.

---

## 🛠️ Configuración para Desarrolladores

### Requisitos Previos
- Node.js (v18.17.0 o superior)
- Una instancia de Turso DB
- Cuenta de Cloudinary para multimedia

### Instalación
1. Clonar el repositorio.
2. Instalar dependencias: `npm install`
3. Configurar variables de entorno en `.env`:
   ```env
   TURSO_DATABASE_URL=...
   TURSO_AUTH_TOKEN=...
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   BETTER_AUTH_SECRET=...
   BETTER_AUTH_URL=http://localhost:5173
   ```
4. Iniciar servidor de desarrollo: `npm run dev`

---

## 📄 Licencia

Este proyecto es propiedad exclusiva de la **Comuna de Colonia Ensayo, Entre Ríos**. Todos los derechos reservados.
