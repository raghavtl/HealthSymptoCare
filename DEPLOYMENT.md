# Deployment Guide for Nithya Health App

## Project Structure

The application consists of three main components:

1. **Backend API Server** - Node.js Express server
2. **Admin Panel** - React application for administration
3. **Frontend Client** - React application for end users

## Prerequisites

- Node.js 16+ and npm
- MySQL or SQLite database
- Environment variables properly configured

## Deployment Steps

### 1. Backend Deployment

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install production dependencies:
   ```
   npm install --production
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Configure database connection, JWT secrets, and other required variables
   - Set `NODE_ENV=production`

4. Build and start the server:
   ```
   npm start
   ```

### 2. Admin Panel Deployment

1. Navigate to the admin directory:
   ```
   cd admin
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build for production:
   ```
   npm run build
   ```

4. The build output will be in the `dist` directory, which can be served using any static file server.

### 3. Frontend Deployment

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build for production:
   ```
   npm run build
   ```

4. The build output will be in the `dist` directory, which can be served using any static file server.

## Configuration for Production

### Backend Configuration

Update the following in your production environment:

1. Set `NODE_ENV=production` in the `.env` file
2. Configure proper CORS settings in `server.js` to allow only your frontend and admin domains
3. Set up proper rate limiting and security middleware
4. Configure a production-ready database (MySQL recommended for production)

### Frontend and Admin Configuration

1. Update the API base URL in the API service files to point to your production backend URL
2. Configure proper build settings in `vite.config.js` files

## Cleaning Up for Deployment

The following directories and files should be removed before deployment as they are not needed in production:

- `temp_backup/`
- `backend/legacy/`
- `smart-health-buddy/`
- Any test files and directories not needed in production
- Development-only configuration files

## Deployment Options

### Option 1: Traditional Hosting

1. Deploy the backend on a Node.js-capable server (e.g., DigitalOcean, AWS EC2)
2. Deploy the frontend and admin panel on static file hosting (e.g., Netlify, Vercel, or the same server as the backend)

### Option 2: Containerized Deployment

1. Create Docker containers for each component
2. Deploy using Docker Compose or Kubernetes

### Option 3: Serverless Deployment

1. Adapt the backend for serverless functions (e.g., AWS Lambda, Vercel Functions)
2. Deploy frontend and admin to static hosting

## Post-Deployment Checklist

- Verify all API endpoints are working correctly
- Test admin panel functionality
- Test frontend user flows
- Set up monitoring and logging
- Configure backups for the database
- Set up SSL certificates for secure connections