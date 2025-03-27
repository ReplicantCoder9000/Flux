#!/bin/bash

# Flux Image Generator Deployment Script
echo "Starting Flux Image Generator deployment..."

# Build the client
echo "Building client..."
cd src/client
npm run build

# Build the server
echo "Building server..."
cd ../../server
npm run build

# Push changes to GitHub
echo "Pushing changes to GitHub..."
git add .
git commit -m "Add authentication UI components"
git push origin main

echo "Changes pushed to GitHub. If you have Render set up with automatic deployments from GitHub,"
echo "your application should rebuild and deploy automatically."
echo "Otherwise, you can manually deploy from the Render dashboard at https://dashboard.render.com"