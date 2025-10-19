# Development Setup Guide

This guide will walk you through setting up the development environment for the Client Management System.

## 📖 Choose Your Setup Path

### 🔰 Simplified Setup (For Beginners)
If you're new to Node.js and React, consider starting with the [Simplified Learning Guide](SIMPLIFIED_LEARNING_GUIDE.md) which has a much simpler setup process.

### 🚀 Full Setup (Advanced)
Continue below for the complete development environment setup with all advanced features.

---

## Prerequisites

Before starting, make sure you have the following installed:

### Required Software
- **Node.js** (v18.0.0 or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`
- **npm** (comes with Node.js)
  - Verify installation: `npm --version`
- **Git**
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify installation: `git --version`

### Recommended Tools
- **VS Code** - Text editor with excellent extensions
- **Postman** or **Insomnia** - API testing
- **DB Browser for SQLite** - Database management

## Project Setup

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd client-management-system
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm init -y
npm install express sqlite3 cors dotenv helmet morgan
npm install -D nodemon concurrently
```

#### Package.json Scripts
Add these scripts to `backend/package.json`:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "db:migrate": "node src/database/migrate.js",
    "db:seed": "node src/database/seed.js"
  }
}
```

#### Environment Variables
Create `backend/.env`:
```env
NODE_ENV=development
PORT=3001
DB_PATH=./database/clients.db
CORS_ORIGIN=http://localhost:3000
```

### 3. Frontend Setup

#### Create Next.js App
```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

#### Install Additional Dependencies
```bash
npm install axios react-hook-form @hookform/resolvers yup
npm install -D @types/node
```

#### Configure Tailwind (tailwind.config.js)
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
}
```

#### Next.js Configuration (next.config.js)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
```

## Development Workflow

### 1. Start Backend Server
```bash
cd backend
npm run dev
```
Server will run on `http://localhost:3001`

### 2. Start Frontend Server
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:3000`

### 3. Database Setup
```bash
cd backend
npm run db:migrate
npm run db:seed  # Optional: add sample data
```

## Project Structure Setup

### Backend Structure
```
backend/
├── src/
│   ├── controllers/
│   │   └── clientController.js
│   ├── models/
│   │   └── clientModel.js
│   ├── routes/
│   │   └── clientRoutes.js
│   ├── middleware/
│   │   ├── validation.js
│   │   ├── errorHandler.js
│   │   └── cors.js
│   ├── database/
│   │   ├── connection.js
│   │   ├── migrate.js
│   │   └── seed.js
│   ├── utils/
│   │   └── helpers.js
│   └── app.js
├── database/
│   └── clients.db
├── .env
├── .gitignore
├── package.json
└── server.js
```

### Frontend Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── clients/
│   │       ├── page.tsx
│   │       ├── [id]/
│   │       └── new/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── ClientForm.tsx
│   │   ├── ClientList.tsx
│   │   ├── ClientCard.tsx
│   │   └── Layout.tsx
│   ├── hooks/
│   │   ├── useClients.ts
│   │   └── useApi.ts
│   ├── lib/
│   │   ├── api.ts
│   │   ├── validation.ts
│   │   └── utils.ts
│   └── types/
│       └── client.ts
├── public/
├── .env.local
├── next.config.js
├── tailwind.config.js
└── package.json
```

## Environment Configuration

### Backend Environment Variables (.env)
```env
NODE_ENV=development
PORT=3001
DB_PATH=./database/clients.db
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

### Frontend Environment Variables (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=Client Management System
```

## VS Code Setup

### Recommended Extensions
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "alexcvzz.vscode-sqlite"
  ]
}
```

### VS Code Settings (.vscode/settings.json)
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### Prettier Configuration (.prettierrc)
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## Development Scripts

### Root Package.json
Create a root `package.json` for convenience:
```json
{
  "name": "client-management-system",
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm run dev",
    "install:all": "npm install && cd backend && npm install && cd ../frontend && npm install",
    "build": "cd frontend && npm run build"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

Install root dependencies:
```bash
npm install
```

## Testing Setup

### Backend Testing
```bash
cd backend
npm install -D jest supertest
```

Add to `backend/package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "jest": {
    "testEnvironment": "node"
  }
}
```

### Frontend Testing
```bash
cd frontend
npm install -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

## Common Issues and Solutions

### Port Conflicts
- Backend: Change PORT in `.env`
- Frontend: Use `npm run dev -- -p 3001`

### CORS Issues
- Ensure backend CORS is configured for frontend URL
- Check Next.js proxy configuration

### SQLite Permission Issues
- Ensure database directory has write permissions
- Check database file path in environment variables

### Node Version Issues
- Use Node.js v18+ for best compatibility
- Consider using nvm for version management

## Development Commands Cheat Sheet

```bash
# Start everything
npm run dev

# Start individually
npm run dev:backend
npm run dev:frontend

# Install all dependencies
npm run install:all

# Database operations
cd backend
npm run db:migrate
npm run db:seed

# Build for production
cd frontend
npm run build

# Run tests
cd backend && npm test
cd frontend && npm test
```

## Next Steps

After setup:

1. ✅ Verify both servers are running
2. ✅ Test API endpoints with Postman
3. ✅ Check database connection
4. ✅ Verify frontend can reach backend
5. ✅ Start building features!

## Troubleshooting

### Common Error Messages

**"EADDRINUSE: address already in use"**
- Solution: Kill process on port or change port number

**"Cannot resolve module"**
- Solution: Check import paths and run `npm install`

**"CORS error"**
- Solution: Verify CORS configuration in backend

**"Database locked"**
- Solution: Close other database connections

For more help, check the project's GitHub issues or create a new one.