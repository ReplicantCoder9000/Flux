"use client";

import React, { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader, Sparkles, Image as ImageIcon, AlertCircle, Heart, Share2, RefreshCw, Bookmark, Copy } from 'lucide-react';
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

// GraphQL mutation for saving an image
const SAVE_IMAGE = gql`
  mutation SaveImage(
    $prompt: String!
    $style: String
    $imageUrl: String!
    $predictionId: String!
  ) {
    saveImage(
      prompt: $prompt
      style: $style
      imageUrl: $imageUrl
      predictionId: $predictionId
    ) {
      _id
      prompt
      style
      imageUrl
      predictionId
      createdAt
    }
  }
`;

// GraphQL mutation for adding a favorite prompt
const ADD_FAVORITE_PROMPT = gql`
  mutation AddFavoritePrompt($prompt: String!) {
    addFavoritePrompt(prompt: $prompt) {
      _id
      favoritePrompts
    }
  }
`;

// GraphQL mutation for removing a favorite prompt
const REMOVE_FAVORITE_PROMPT = gql`
  mutation RemoveFavoritePrompt($prompt: String!) {
    removeFavoritePrompt(prompt: $prompt) {
      _id
      favoritePrompts
    }
  }
`;

// GraphQL query for getting the current user
const GET_ME = gql`
  query GetMe {
    me {
      _id
      username
      email
      favoritePrompts
      preferences {
        defaultStyle
        theme
      }
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
  const [favoritePrompts, setFavoritePrompts] = useState<string[]>([]);
  const [showFavoritePrompts, setShowFavoritePrompts] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isLoggedIn, user } = useAuth();
  
  // Query for user images when logged in
  const { data: imagesData, loading: imagesLoading, error: imagesError, refetch: refetchImages } = useQuery(GET_USER_IMAGES, {
    skip: !isLoggedIn,
    fetchPolicy: 'network-only'
  });
  
  // Query for user data including favorite prompts
  const { data: userData, loading: userLoading, refetch: refetchUser } = useQuery(GET_ME, {
    skip: !isLoggedIn,
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.me?.favoritePrompts) {
        setFavoritePrompts(data.me.favoritePrompts);
      }
    }
  });

  // Mutation for adding a favorite prompt
  const [addFavoritePrompt] = useMutation(ADD_FAVORITE_PROMPT, {
    onCompleted: () => {
      refetchUser();
    },
    onError: (error) => {
      console.error('Error adding favorite prompt:', error);
    }
  });

  // Mutation for removing a favorite prompt
  const [removeFavoritePrompt] = useMutation(REMOVE_FAVORITE_PROMPT, {
    onCompleted: () => {
      refetchUser();
    },
    onError: (error) => {
      console.error('Error removing favorite prompt:', error);
    }
  });

  const [saveImage] = useMutation(SAVE_IMAGE, {
    onCompleted: () => {
      // Refetch images after saving a new one
      if (isLoggedIn) {
        refetchImages();
      }
    },
    onError: (error: any) => {
      console.error('Error saving image:', error);
    }
  });

  const [generateImage] = useMutation(GENERATE_IMAGE, {
    onCompleted: (data: GenerateImageData) => {
      setGeneratedImage(data.generateImage.imageUrl);
      
      // Save the generated image to the database
      if (isLoggedIn && data.generateImage.imageUrl && data.generateImage.predictionId) {
        saveImage({
          variables: {
            prompt,
            style,
            imageUrl: data.generateImage.imageUrl,
            predictionId: data.generateImage.predictionId
          }
        });
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

  // Handle saving a prompt as favorite
  const handleSavePrompt = () => {
    if (!prompt || !isLoggedIn) return;
    
    addFavoritePrompt({
      variables: {
        prompt
      }
    });
  };

  // Handle removing a prompt from favorites
  const handleRemovePrompt = (promptToRemove: string) => {
    if (!isLoggedIn) return;
    
    removeFavoritePrompt({
      variables: {
        prompt: promptToRemove
      }
    });
  };

  // Handle using a favorite prompt
  const handleUsePrompt = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
    setShowFavoritePrompts(false);
  };

  // Handle revising an image (regenerate with the same prompt)
  const handleReviseImage = () => {
    if (!prompt || !isLoggedIn) return;
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  // Handle sharing an image
  const handleShareImage = () => {
    if (!generatedImage) return;
    
    // Create a temporary input element
    const input = document.createElement('input');
    input.value = generatedImage;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    
    alert('Image URL copied to clipboard!');
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
                      {isLoggedIn && favoritePrompts.length > 0 && (
                        <div className="mt-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowFavoritePrompts(!showFavoritePrompts)}
                          >
                            <Bookmark className="h-4 w-4 mr-2" />
                            {showFavoritePrompts ? 'Hide Saved Prompts' : 'Show Saved Prompts'}
                          </Button>
                          
                          {showFavoritePrompts && (
                            <div className="mt-2 p-2 border rounded-md max-h-40 overflow-y-auto">
                              <p className="text-sm font-medium mb-2">Your Saved Prompts:</p>
                              <ul className="space-y-1">
                                {favoritePrompts.map((savedPrompt, index) => (
                                  <li key={index} className="flex items-center justify-between text-sm p-1 hover:bg-gray-100 rounded">
                                    <span className="truncate flex-1">{savedPrompt}</span>
                                    <div className="flex space-x-1">
                                      <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleUsePrompt(savedPrompt)}
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                      <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleRemovePrompt(savedPrompt)}
                                      >
                                        <Heart className="h-3 w-3 fill-current" />
                                      </Button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
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
                      width={512}
                      height={512}
                      src={generatedImage}
                      alt="Generated image"
                      className="rounded-lg object-cover w-full h-full"
                    />
                    {isLoggedIn && (
                      <div className="absolute bottom-2 right-2 flex space-x-2">
                        <Button 
                          type="button" 
                          variant="secondary" 
                          size="sm"
                          onClick={handleSavePrompt}
                        >
                          <Bookmark className="h-4 w-4 mr-1" />
                          Save Prompt
                        </Button>
                        <Button 
                          type="button" 
                          variant="secondary" 
                          size="sm"
                          onClick={handleReviseImage}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Regenerate
                        </Button>
                        <Button 
                          type="button" 
                          variant="secondary" 
                          size="sm"
                          onClick={handleShareImage}
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    )}
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
                        <div className="group relative w-full h-full">
                          <Image
                            src={image.imageUrl}
                            alt={image.prompt}
                            fill
                            className="object-cover rounded-md"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-end justify-center p-4 opacity-0 group-hover:opacity-100">
                            <div className="text-white text-sm">
                              <p className="font-medium truncate">{image.prompt}</p>
                              <p className="text-xs opacity-80">{image.createdAt ? new Date(image.createdAt).toLocaleDateString() : 'Unknown date'}</p>
                              <div className="flex space-x-2 mt-2">
                                <Button 
                                  type="button" 
                                  variant="secondary" 
                                  size="sm"
                                  onClick={() => {
                                    setPrompt(image.prompt);
                                    if (image.style) setStyle(image.style);
                                    document.querySelector('[value="create"]')?.dispatchEvent(new Event('click'));
                                  }}
                                >
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  Reuse
                                </Button>
                                <Button 
                                  type="button" 
                                  variant="secondary" 
                                  size="sm"
                                  onClick={() => {
                                    // Create a temporary input element
                                    const input = document.createElement('input');
                                    input.value = image.imageUrl;
                                    document.body.appendChild(input);
                                    input.select();
                                    document.execCommand('copy');
                                    document.body.removeChild(input);
                                    
                                    alert('Image URL copied to clipboard!');
                                  }}
                                >
                                  <Share2 className="h-3 w-3 mr-1" />
                                  Share
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
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