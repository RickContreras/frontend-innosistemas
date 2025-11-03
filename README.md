# 🎓 InnoSistemas - Plataforma de Gestión Académica

Sistema web moderno para la gestión de proyectos académicos, retroalimentación y generación de reportes.

## 🏗️ Arquitectura

Este proyecto implementa una **arquitectura de microservicios**, consumiendo múltiples servicios backend independientes:

- **Servicio de Autenticación**: Gestión de usuarios, roles y permisos
- **Servicio de Proyectos**: Gestión de proyectos académicos y asignaciones

📖 Ver documentación completa: [MICROSERVICES_ARCHITECTURE.md](./MICROSERVICES_ARCHITECTURE.md)

## ✨ Características

- 🔐 **Autenticación JWT** con roles y permisos
- 📊 **Dashboard dinámico** que carga proyectos desde microservicio
- 👥 **Gestión de usuarios** (solo administradores)
- 📁 **Sistema de proyectos** con filtrado por rol
- 🎨 **UI moderna** con tema claro/oscuro
- 📱 **Diseño responsive** adaptado a móviles
- 🔄 **Actualización en tiempo real** de datos
- 📝 **Sistema de logging** configurable
- ⚡ **Fallback automático** ante errores de servicios
- 🛡️ **Control de acceso** basado en roles (RBAC)

## Project info

**URL**: https://lovable.dev/projects/a4285c5e-58bf-401c-88bf-1d5a4bb4e273

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a4285c5e-58bf-401c-88bf-1d5a4bb4e273) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## 🔧 Configuración Inicial

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto (puedes copiar `.env.example`):

```bash
# Microservicios
VITE_AUTH_SERVICE_URL=https://obscure-guacamole-6x7r4w6gv6v39rr-8080.app.github.dev
VITE_PROJECTS_SERVICE_URL=https://didactic-space-zebra-q5g9p6rqvgv29q4r-8080.app.github.dev

# Configuración
VITE_LOG_LEVEL=debug
VITE_ENABLE_DEVTOOLS=true
```

📖 Ver todas las variables: [ENV_DOCS.md](./ENV_DOCS.md)

## What technologies are used for this project?

This project is built with:

- **Vite** - Build tool y dev server
- **TypeScript** - Type safety
- **React 18** - UI framework
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Microservices Architecture** - Backend integration

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a4285c5e-58bf-401c-88bf-1d5a4bb4e273) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
