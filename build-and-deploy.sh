#!/bin/bash

# Exit on error
set -e

echo "Building client application..."

# Navigate to client directory
cd src/client

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

# Check if the build was successful
if [ -d "out" ]; then
  echo "Build successful! Files are in the 'out' directory."
  
  # Create a simple index.html in the root of the out directory if it doesn't exist
  if [ ! -f "out/index.html" ]; then
    echo "Creating fallback index.html..."
    cat > out/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flux Image Generator</title>
  <meta http-equiv="refresh" content="0;url=/" />
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background-color: #111827;
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      text-align: center;
    }
    .container {
      max-width: 600px;
      padding: 2rem;
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    p {
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Flux Image Generator</h1>
    <p>Redirecting to the application...</p>
    <p>If you are not redirected automatically, <a href="/" style="color: #3b82f6;">click here</a>.</p>
  </div>
</body>
</html>
EOL
  fi

  # Create a 404.html file
  echo "Creating 404.html..."
  cat > out/404.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found - Flux Image Generator</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background-color: #111827;
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      text-align: center;
    }
    .container {
      max-width: 600px;
      padding: 2rem;
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    p {
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }
    a {
      color: #3b82f6;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
    <p><a href="/">Return to Home</a></p>
  </div>
</body>
</html>
EOL

  echo "Deployment files are ready. You can now manually upload these files to Render."
  echo "Instructions:"
  echo "1. Go to your Render dashboard"
  echo "2. Select your static site"
  echo "3. Click on 'Manual Deploy'"
  echo "4. Select 'Upload Files'"
  echo "5. Upload the contents of the 'out' directory"
else
  echo "Build failed. Check for errors above."
  exit 1
fi