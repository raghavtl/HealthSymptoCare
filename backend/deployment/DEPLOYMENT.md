# Deploying Smart Health Buddy

This guide provides instructions for deploying the Smart Health Buddy application to make it accessible from anywhere.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Git

## Deployment Options

### Option 1: Local Deployment

To run the application locally for testing:

1. Clone the repository
   ```
   git clone <repository-url>
   cd health-buddy
   ```

2. Install dependencies
   ```
   npm run install-all
   ```

3. Create environment files
   - Copy `.env.example` to `.env` in the client directory
   - Add your Google Maps API key to the `.env` file

4. Initialize the database
   ```
   npm run init-db
   ```

5. Start the development server
   ```
   npm run dev
   ```

6. Access the application at `http://localhost:3000`

### Option 2: Production Deployment with Netlify (Frontend)

1. Build the client
   ```
   npm run build
   ```

2. Deploy to Netlify using our automated script
   ```
   npm run deploy
   ```

   Or manually:
   ```
   cd src/client
   npx netlify deploy --prod
   ```

3. Set environment variables in Netlify:
   - `VITE_GOOGLE_MAPS_API_KEY`: Your Google Maps API key
   - `VITE_API_URL`: Your backend API URL (if deploying backend separately)

### Option 3: Backend Deployment (Optional)

If you want to deploy the backend separately:

1. Deploy to a service like Heroku, Railway, or Render
2. Set environment variables on your hosting platform
3. Update the `VITE_API_URL` in your frontend deployment to point to your backend URL

## Sharing Your Application

After deployment, you'll receive a URL where your application is hosted (e.g., `https://smart-health-buddy.netlify.app`). You can share this URL with others to access your application.

## Cross-Browser Compatibility

Smart Health Buddy is designed to work on all modern browsers including:
- Chrome
- Firefox
- Safari
- Edge
- Opera

It's also responsive and works on mobile devices.

## Progressive Web App (PWA) Features

The application includes PWA features that allow users to:
- Install the app on their device
- Use the app offline
- Receive updates automatically

To install the app on a mobile device, visit the URL in a browser and select "Add to Home Screen" or similar option.

## Troubleshooting

- **API Key Issues**: Ensure your Google Maps API key has the correct restrictions and enabled APIs
- **CORS Errors**: If experiencing CORS issues, ensure your backend has proper CORS configuration
- **Database Errors**: Check that SQLite is properly initialized

## Need Help?

If you encounter any issues during deployment, please open an issue in the repository or contact the development team.