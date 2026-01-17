# Smart Health Buddy Application

A comprehensive health and wellness tracking application with symptom checking, health tips, diet and fitness plans, and more.

## Project Structure

The project is organized into three main folders:

- **frontend**: User-facing application for patients/users
- **admin**: Admin dashboard for managing the application
- **backend**: API server and database management

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

```bash
# Install all dependencies (root, frontend, admin, and backend)
npm run install-all
```

### Development

```bash
# Run backend and frontend concurrently
npm run dev

# Run backend, frontend, and admin concurrently
npm run dev:all

# Run only backend
npm run backend

# Run only frontend
npm run frontend

# Run only admin
npm run admin
```

### Building for Production

```bash
# Build frontend
npm run build

# Build admin
npm run build:admin

# Build both frontend and admin
npm run build:all
```

### Database Initialization

```bash
npm run init-db
```

## Features

- Symptom checker
- Health tips and recommendations
- Diet and fitness plans
- Wellness logging
- Nearby hospitals finder
- De-stress zone
- Admin dashboard for management

## Technologies Used

- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: SQLite
- **Maps**: Leaflet/Google Maps API