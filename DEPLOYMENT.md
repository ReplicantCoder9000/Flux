# Deployment Guide for Flux Image Generator

This guide provides step-by-step instructions for deploying the Flux Image Generator application to Render with MongoDB Atlas.

## Prerequisites

- A [Render](https://render.com/) account
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- A [Replicate](https://replicate.com/) account with API access

## Step 1: Set Up MongoDB Atlas

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new project (if needed)
3. Create a new cluster (the free tier is sufficient for starting)
4. Under "Security" > "Database Access", create a new database user with read/write permissions
5. Under "Security" > "Network Access", add your IP address or allow access from anywhere (0.0.0.0/0)
6. Once your cluster is created, click "Connect" > "Connect your application" and copy the connection string
7. Replace `<username>`, `<password>`, and `<dbname>` in the connection string with your actual values

## Step 2: Deploy the Server to Render

1. Log in to [Render](https://dashboard.render.com/)
2. Click "New" > "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: flux-image-generator-server
   - **Root Directory**: server
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free (or choose a paid plan for production)
5. Add the following environment variables:
   - `PORT`: Leave this unset. Render will automatically assign a port and set this environment variable.
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string (generate one with `openssl rand -base64 32`)
   - `JWT_EXPIRATION`: 2h
   - `REPLICATE_API_TOKEN`: Your Replicate API token
   - `CLIENT_URL`: The URL of your client application (will be set after client deployment)
   - `NODE_ENV`: production
6. Click "Create Web Service"
7. Note: The server is configured to run in API-only mode and will not serve static files

## Step 3: Deploy the Client to Render

1. In Render, click "New" > "Static Site"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: flux-image-generator-client
   - **Root Directory**: .
   - **Build Command**: `cd src/client && npm install && npm run build`
   - **Publish Directory**: `src/client/out`
   - **Publish Directory Format**: Static Site
   - **Advanced** > **Add Environment Variable**:
     - `NEXT_PUBLIC_API_URL`: The URL of your server + `/graphql` (e.g., https://flux-image-generator-server.onrender.com/graphql)
4. Click "Create Static Site"

### Important Static Site Configuration Notes

- The Next.js application is configured for static export with `output: 'export'` in next.config.js
- We've added `trailingSlash: true` to ensure proper routing with static files
- Fallback HTML files are provided in the public directory for better error handling
- Make sure the static site is properly built before deployment by checking the build logs

## Triggering Deployments

You can trigger a new deployment of the client application using the Render deploy hook:

```bash
curl -X POST https://api.render.com/deploy/srv-cviqkfa4d50c73aa4e80?key=FDOoCKfApZo
```

This is useful for automating deployments or triggering a new deployment after making changes to the repository.

## Important Note About Deployment Architecture

This deployment setup uses a decoupled architecture:

- The server is deployed as an API-only service that handles GraphQL requests
- The client is deployed as a separate static site
- The client communicates with the server via the GraphQL API endpoint
- The server does NOT serve the client's static files

## Step 4: Update CORS Settings

1. Go back to your server service in Render
2. Add/update the `CLIENT_URL` environment variable with the URL of your deployed client
3. Restart the server service

## Step 5: Test the Deployment

1. Visit your deployed client application
2. Try signing up for a new account
3. Log in and test the image generation functionality

## Troubleshooting

### Server Issues

- Check the server logs in Render for any errors
- Verify that all environment variables are set correctly
- Ensure MongoDB Atlas connection is working

### Client Issues

- Check the client logs in Render for any errors
- Verify that the `NEXT_PUBLIC_API_URL` is set correctly
- Clear browser cache and try again

### API Issues

- Verify that your Replicate API token is valid
- Check if you have exceeded your API quota

## Scaling Considerations

- Upgrade your Render plans for better performance
- Set up a CDN for serving images
- Implement caching for frequently accessed data
- Consider using a queue system for image generation tasks