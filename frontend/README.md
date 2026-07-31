# EnterpriseSync AI - Frontend

React 19 + Vite + Tailwind CSS frontend application.

## Quick Start

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

## Access

- App: http://localhost:5173
- Default Login: admin@enterprisesync.ai / admin123

## Project Structure

```
src/
├── pages/          # Page components
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Projects.jsx
│   └── Tasks.jsx
├── layouts/        # Layout components
│   └── MainLayout.jsx
├── api.js          # Axios configuration
├── App.jsx         # Root component
├── main.jsx        # Entry point
└── index.css       # Global styles
```

## Features

- ✅ Authentication with JWT
- ✅ Dashboard with charts (Recharts)
- ✅ Project management
- ✅ Task tracking
- ✅ AI Risk Prediction
- ✅ Responsive sidebar
- ✅ Beautiful UI with Tailwind CSS

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- React Router v6
- Axios
- Recharts
- Lucide Icons
