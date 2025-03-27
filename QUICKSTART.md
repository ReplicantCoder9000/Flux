# Quick Start Guide for Flux Image Generator

This guide will help you get the Flux Image Generator application up and running locally in just a few minutes.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Replicate API key (get one at [replicate.com](https://replicate.com))

## Step 1: Clone the Repository

```bash
git clone https://github.com/ReplicantCoder9000/Flux.git
cd Flux
```

## Step 2: Set Up Environment Variables

### Server (.env)

Create or update the `.env` file in the server directory:

```bash
cd server
cp .env.example .env  # If .env doesn't exist yet
```

Edit the `.env` file with your values:

```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/flux-image-generator
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=2h
REPLICATE_API_TOKEN=your_replicate_api_token_here
CLIENT_URL=http://localhost:3000
```

### Client (.env.local)

Create or update the `.env.local` file in the client directory:

```bash
cd ../client
cp .env.local.example .env.local  # If .env.local doesn't exist yet
```

Edit the `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/graphql
```

## Step 3: Install Dependencies

Install dependencies for both server and client:

```bash
# Server dependencies
cd ../server
npm install

# Client dependencies
cd ../client
npm install
```

## Step 4: Start MongoDB (if using local MongoDB)

If you're using a local MongoDB installation, make sure it's running:

```bash
# On macOS/Linux
mongod --dbpath=/path/to/data/db

# On Windows
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath="C:\data\db"
```

## Step 5: Seed the Database (Optional)

To populate the database with sample data:

```bash
cd ../server
npm run seed
```

## Step 6: Generate a JWT Token for Testing (Optional)

To generate a JWT token for testing the authentication:

```bash
cd ../server
npm run generate-jwt
```

Follow the instructions in the output to use the token.

## Step 7: Start the Application

Start both the server and client:

### Terminal 1 (Server)
```bash
cd server
npm run dev
```

### Terminal 2 (Client)
```bash
cd client
npm run dev
```

## Step 8: Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

## Troubleshooting

### MongoDB Connection Issues

If you see MongoDB connection errors:

1. Make sure MongoDB is running
2. Check your connection string in the `.env` file
3. If using MongoDB Atlas, ensure your IP is whitelisted

### API Key Issues

If image generation fails:

1. Verify your Replicate API key is correct
2. Check if you have exceeded your API quota
3. Ensure your account has access to the black-forest-labs/flux-schnell model

### Client-Server Communication Issues

If the client can't connect to the server:

1. Ensure both client and server are running
2. Check that the `NEXT_PUBLIC_API_URL` in `.env.local` is correct
3. Verify that CORS is properly configured in the server

## Next Steps

- Check out the [README.md](./README.md) for more information about the project
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions
- Explore the codebase to understand how everything works