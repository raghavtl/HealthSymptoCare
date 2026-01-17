# Google Maps API Setup Guide

This guide will help you set up Google Maps API for the Nearby Hospitals feature.

## Prerequisites

1. A Google Cloud Platform account
2. A billing account (Google Maps API requires billing to be enabled)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for your project

## Step 2: Enable Required APIs

Enable the following APIs in your Google Cloud Console:

1. **Maps JavaScript API** - For displaying the interactive map
2. **Places API** - For finding nearby hospitals
3. **Geocoding API** - For converting addresses to coordinates

### To enable APIs:
1. Go to "APIs & Services" > "Library"
2. Search for each API name
3. Click on the API and press "Enable"

## Step 3: Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key

## Step 4: Configure the API Key

1. Open `src/client/src/config/maps.js`
2. Replace `'YOUR_GOOGLE_MAPS_API_KEY'` with your actual API key:

```javascript
export const GOOGLE_MAPS_CONFIG = {
  API_KEY: 'your-actual-api-key-here',
  // ... rest of config
};
```

## Step 5: Restrict API Key (Recommended)

For security, restrict your API key:

1. Go to "APIs & Services" > "Credentials"
2. Click on your API key
3. Under "Application restrictions", select "HTTP referrers"
4. Add your domain (e.g., `localhost:3000/*` for development)
5. Under "API restrictions", select "Restrict key"
6. Select the APIs you enabled (Maps JavaScript API, Places API, Geocoding API)

## Step 6: Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to the Nearby Hospitals page
3. The map should load with real hospital data

## Troubleshooting

### "Google Maps API error: REQUEST_DENIED"
- Check that your API key is correct
- Ensure billing is enabled
- Verify that the required APIs are enabled

### "No hospitals found"
- This is normal if there are no hospitals in the search radius
- Try increasing the search radius
- Check if you're in a remote area

### Map doesn't load
- Check browser console for errors
- Verify API key is properly configured
- Ensure you have an internet connection

## API Usage and Costs

- **Maps JavaScript API**: ~$7 per 1,000 map loads
- **Places API**: ~$17 per 1,000 requests
- **Geocoding API**: ~$5 per 1,000 requests

For development, you'll likely stay within the free tier limits.

## Security Notes

- Never commit your API key to version control
- Use environment variables in production
- Restrict your API key to specific domains
- Monitor your API usage in Google Cloud Console

## Environment Variables (Production)

For production, use environment variables:

1. Create a `.env` file in your client directory:
```
VITE_GOOGLE_MAPS_API_KEY=your-api-key-here
```

2. Update `src/config/maps.js`:
```javascript
export const GOOGLE_MAPS_CONFIG = {
  API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
  // ... rest of config
};
```

This setup will provide a fully functional Google Maps integration for finding nearby hospitals with real data from Google Places API.
