# Admin Panel Template

React + TypeScript + Vite admin panel template.

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + Ant Design (UI)
- Zustand (state management)
- React Query (server state)
- React Hook Form + Zod (forms)
- React Router v6 (routing)
- i18next (uz, ru, kr)

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

```
src/
  @types/          - TypeScript type definitions
  assets/          - Styles, SVG components
  auth/            - Authentication (AuthProvider, useAuth)
  components/
    layouts/       - Page layouts (Auth, Dashboard)
    route/         - Route guards, protected routes
    shared/        - Reusable components (DataTable, Loading, etc.)
    template/      - Template components (Theme, Menu, SidePanel)
    ui/            - UI component library (40+ components)
  configs/         - App, navigation, routes, theme config
  constants/       - App constants
  locales/         - i18n translations
  provider/        - React context providers
  service/         - API service layer (GET, POST, PUT, DELETE)
  store/           - Zustand stores (auth, theme, locale)
  utils/           - Utility functions and hooks
  views/           - Page components
```
