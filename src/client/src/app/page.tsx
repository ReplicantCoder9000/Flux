"use client";

import React, { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader, Sparkles, Image as ImageIcon, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from '@/context/AuthContext';

// Import types
import type { GenerateImageData, Image as ImageType } from '../types';

// GraphQL mutation for generating an image
const GENERATE_IMAGE = gql`
  mutation GenerateImage($input: GenerateImageInput!) {
    generateImage(input: $input) {
      predictionId
      status
      imageUrl
    }
  }
`;

// GraphQL query for user images
const GET_USER_IMAGES = gql`
  query GetUserImages {
    userImages {
      _id
      prompt
      style
      imageUrl
      predictionId
      createdAt
      isFavorite
    }
  }
`;

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('detailed, vibrant colors');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isLoggedIn } = useAuth();
  
  // Query for user images when logged in
  const { data: imagesData, loading: imagesLoading, error: imagesError, refetch: refetchImages } = useQuery(GET_USER_IMAGES, {
    skip: !isLoggedIn,
    fetchPolicy: 'network-only'
  });

  const [generateImage] = useMutation(GENERATE_IMAGE, {
    onCompleted: (data: GenerateImageData) => {
      setGeneratedImage(data.generateImage.imageUrl);
      // Refetch images after generating a new one
      if (isLoggedIn) {
        refetchImages();
      }
      setIsLoading(false);
    },
    onError: (error: any) => {
      console.error('Error generating image:', error);
      setIsLoading(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    setIsLoading(true);
    setGeneratedImage(null);

    try {
      await generateImage({
        variables: {
          input: {
            prompt,
            style
          }
        }
      });
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Flux Image Generator</h1>
          <AuthModal />
        </div>
        
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Generate an Image</CardTitle>
                <CardDescription>
                  Enter a prompt to generate an AI image using the Flux Schnell model.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isLoggedIn ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
                    <p className="text-muted-foreground mb-4">
                      You need to sign in to generate images.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Describe the image you want to generate..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="min-h-[100px]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Style (e.g., detailed, vibrant colors)"
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                      />
                    </div>
                    <Button type="submit" disabled={isLoading || !prompt} className="w-full">
                      {isLoading ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Image
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
              <CardFooter className="flex justify-center">
                {generatedImage && (
                  <div className="mt-4 relative w-full aspect-square max-w-md">
                    <Image
                      width={500}
                      height={500}
                      src={generatedImage}
                      alt="Generated image"
                      className="rounded-lg object-cover w-full h-full"
                    />
                  </div>
                )}
                {!generatedImage && !isLoading && (
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-16 w-16 mb-2" />
                    <p>Your generated image will appear here</p>
                  </div>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="gallery">
            <Card>
              <CardHeader>
                <CardTitle>Your Gallery</CardTitle>
                <CardDescription>
                  View and manage your generated images.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isLoggedIn ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
                    <p className="text-muted-foreground mb-4">
                      You need to sign in to view your saved images.
                    </p>
                  </div>
                ) : imagesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : imagesError ? (
                  <div className="text-center text-red-500 py-8">
                    Error loading images. Please try again.
                  </div>
                ) : imagesData?.userImages?.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {imagesData.userImages.map((image: ImageType) => (
                      <div key={image._id} className="relative aspect-square">
                        <Image
                          src={image.imageUrl}
                          alt={image.prompt}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    You haven't generated any images yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}