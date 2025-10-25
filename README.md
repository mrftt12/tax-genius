# TaxGenius

AI-powered tax preparation application built with React, Vite, and Tailwind CSS.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

- Copy the example file to start local config:

```bash
cp .env.example .env.local
```

- Edit `.env.local` and add your configuration values:
	- `VITE_API_URL`: Your backend API URL (default: http://localhost:8000/api)
	- `VITE_AI_API_KEY`: Your AI service API key (if using AI features)
	- `VITE_SUPABASE_URL`: Your Supabase project URL
	- `VITE_SUPABASE_ANON_KEY`: Supabase anon (public) key
	- `VITE_SUPABASE_BUCKET`: Document storage bucket (default: `storage`)

Important:
- Do NOT commit secrets. This repo ignores `.env`, `.env.local`, and other env variants via `.gitignore`.
- Never place Supabase `service_role` or storage access keys in client env files. Those belong on a trusted server or Edge Function.

### 3. Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3333` (or the next available port).

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Project Structure

```
TaxGenius/
├── Components/         # Reusable UI components
│   ├── dashboard/     # Dashboard-specific components
│   └── interview/     # Interview-specific components
├── Pages/             # Page components
│   ├── AIAssistant    # AI Assistant page
│   ├── Dashboard      # Dashboard page
│   ├── Documents      # Documents management
│   ├── Forms          # Tax forms
│   ├── Interview      # Tax interview
│   └── Review         # Review & Calculate
├── Entities/          # Data entities/models
│   ├── ChatMessage    # Chat message entity
│   ├── TaxDocument    # Tax document entity
│   └── TaxReturn      # Tax return entity
├── src/               # Application entry point
│   ├── main.jsx       # Main entry file
│   ├── App.jsx        # Root component with routing
│   └── index.css      # Global styles
├── Layout.js          # Main layout component
├── utils.js           # Utility functions
└── ...config files    # Configuration files

```

## Features

- Tax Interview workflow
- AI-powered tax assistant
- Document upload and management
- Tax form generation
- Review and calculation
- Responsive design with Tailwind CSS
- Path aliases for clean imports

## Path Aliases

The project is configured with the following path aliases:

- `@/` - Project root
- `@components/` - Components directory
- `@pages/` - Pages directory
- `@entities/` - Entities directory
- `@utils/` - Utils directory

Example usage:
```javascript
import Dashboard from '@pages/Dashboard';
import { createPageUrl } from '@utils';
```

## Technology Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Radix UI** - Headless UI components

## Browser Support

Modern browsers (Chrome, Firefox, Safari, Edge) with ES2020 support.

## License

Private - All rights reserved
