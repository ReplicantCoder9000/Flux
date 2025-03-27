# Flux Image Generator

![Flux Image Generator](https://images.unsplash.com/photo-1675426513824-6bba223d3d8d?q=80&w=1000)

A MERN-stack application for generating AI images using the black-forest-labs/flux-schnell model via Replicate API. Users can create, save, and share stunning AI-generated images with a clean and intuitive interface.

## Features

- **AI Image Generation**: Create beautiful images from text prompts using the powerful Flux Schnell AI model
- **User Authentication**: Secure JWT-based authentication system
- **Image Management**: Save, organize, and favorite your generated images
- **GraphQL API**: Efficient data fetching and mutations with Apollo Client
- **Responsive Design**: Works seamlessly on mobile and desktop devices
- **Dark Mode Support**: Choose between light and dark themes

## Tech Stack

### Frontend
- React with Next.js
- TypeScript
- Apollo Client for GraphQL
- Tailwind CSS with Shadcn/UI components
- Lucide React for icons

### Backend
- Node.js with Express
- GraphQL with Apollo Server
- MongoDB with Mongoose ODM
- JWT Authentication
- Replicate API integration

### DevOps
- GitHub Actions for CI/CD
- Render for deployment
- MongoDB Atlas for database hosting

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Replicate API key (get one at [replicate.com](https://replicate.com))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ReplicantCoder9000/Flux.git
   cd Flux
   ```

2. Install dependencies for both client and server:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables:
   
   **Server (.env file in server directory)**
   ```
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/flux-image-generator
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRATION=2h
   REPLICATE_API_TOKEN=your_replicate_api_token_here
   CLIENT_URL=http://localhost:3000
   ```

   **Client (.env.local file in client directory)**
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001/graphql
   ```

4. Start the development servers:

   **Server**
   ```bash
   cd server
   npm run dev
   ```

   **Client**
   ```bash
   cd client
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

### Deployment

The application is configured for deployment on Render with MongoDB Atlas:

1. Create a MongoDB Atlas cluster and get your connection string
2. Deploy the server as a Web Service on Render
3. Deploy the client as a Static Site on Render
4. Set the client's build command to `cd src/client && npm install && npm run build`
5. Set the client's publish directory to `src/client/out`
6. For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

### CI/CD Workflow

The project uses GitHub Actions for CI/CD with manual Render deployments triggered by deploy hooks:

#### How It Works

1. When code is pushed to the main branch, GitHub Actions runs the CI/CD workflow
2. The workflow tests both server and client code
3. If all tests pass, it triggers Render deploy hooks to start the deployment
4. Render deploys the application only after passing all tests

#### Setting Up Render Deploy Hooks

1. Log in to your Render dashboard
2. Navigate to your server service
3. Go to "Settings" > "Deploy Hooks"
4. Create a new deploy hook and copy the URL
5. Repeat for your client service

#### Adding Deploy Hooks to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to "Settings" > "Secrets and variables" > "Actions"
3. Add new repository secrets:
   - `RENDER_DEPLOY_HOOK_SERVER` with the server deploy hook URL
   - `RENDER_DEPLOY_HOOK_CLIENT` with the client deploy hook URL

#### Local Testing

Run the same tests locally before pushing:

**Server:**
```bash
cd server
npm run test:ci
```

**Client:**
```bash
cd src/client
npm run test:ci
```

#### Manual Workflow Trigger
You can manually trigger the workflow from the "Actions" tab in your GitHub repository.

## API Usage

The application uses GraphQL for all API interactions. Here's an example of how to generate an image using the Replicate API:

```graphql
mutation GenerateImage($input: GenerateImageInput!) {
  generateImage(input: $input) {
    predictionId
    status
    imageUrl
  }
}
```

With variables:
```json
{
  "input": {
    "prompt": "A beautiful sunset over mountains, photorealistic",
    "style": "detailed, vibrant colors"
  }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [black-forest-labs/flux-schnell](https://replicate.com/black-forest-labs/flux-schnell) for the amazing AI model
- [Replicate](https://replicate.com) for providing the API
- [Shadcn/UI](https://ui.shadcn.com/) for the beautiful UI components
- [Next.js](https://nextjs.org/) for the React framework
- [Apollo GraphQL](https://www.apollographql.com/) for the GraphQL implementation