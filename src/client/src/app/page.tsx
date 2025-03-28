"use client";

import React, { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader, Sparkles, Image as ImageIcon, AlertCircle, Share2, RefreshCw, Bookmark, Copy, Download } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from '@/context/AuthContext';
import { triggerConfetti, celebrateImageGeneration } from '@/lib/confetti';

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
  const [style, setStyle] = useState('photorealistic, high resolution, 8K, hyperdetailed, professional photography, sharp focus, DSLR, natural lighting, cinematic, HDR');
  const [activeTab, setActiveTab] = useState('create');
  const [usedPrompts, setUsedPrompts] = useState<string[]>([]);
  const [favoritePrompts, setFavoritePrompts] = useState<string[]>([]); // Keep for other functionality
  const [showUsedPrompts, setShowUsedPrompts] = useState(false);
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
      
      // Celebrate with confetti when image is successfully generated
      celebrateImageGeneration();
      
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
    
    // Add prompt to used prompts if not already there
    if (!usedPrompts.includes(prompt)) {
      setUsedPrompts(prev => [prompt, ...prev.slice(0, 9)]); // Keep only the 10 most recent prompts
    }

    setIsLoading(true);
    setGeneratedImage(null);

    // Trigger confetti animation when Generate button is clicked
    triggerConfetti();

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
    // Keep the prompts visible
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

  // Handle reusing a prompt from gallery
  const handleReuseFromGallery = (promptToReuse: string, styleToReuse?: string) => {
    setPrompt(promptToReuse);
    if (styleToReuse) setStyle(styleToReuse);
    setActiveTab('create');
  };

  // Handle downloading an image
  const handleDownloadImage = (imageUrl: string, promptText: string = 'flux-image') => {
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${promptText.substring(0, 20).replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-3 sm:p-6 md:p-12 lg:p-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-sm lg:text-base">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-10 gap-3 w-full">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-center sm:text-left font-heading bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent animate-fade-in w-full sm:w-auto overflow-visible py-2">Flux Image Generator</h1>
          <AuthModal />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-slide-up">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create">
            <Card className="border border-border/40 shadow-card hover:shadow-card-hover transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-heading">Generate an Image</CardTitle>
                <CardDescription className="text-base">
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
                        className="min-h-[120px] text-base resize-none focus:ring-2 focus:ring-primary/50 transition-all"
                        required
                      />
                      
                      {/* Used Prompts Section */}
                      {isLoggedIn && usedPrompts.length > 0 && (
                        <div className="mt-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowUsedPrompts(!showUsedPrompts)}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {showUsedPrompts ? 'Hide Recent Prompts' : 'Show Recent Prompts'}
                          </Button>
                          
                          {showUsedPrompts && (
                            <div className="mt-2 p-2 border rounded-md max-h-40 overflow-y-auto">
                              <p className="text-sm font-medium mb-2">Your Recent Prompts:</p>
                              <ul className="space-y-1">
                                {usedPrompts.map((usedPrompt, index) => (
                                  <li key={`used-${index}`} className="flex items-center justify-between text-sm p-1 hover:bg-gray-100 rounded">
                                    <span className="truncate flex-1">{usedPrompt}</span>
                                    <div className="flex space-x-1">
                                      <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleUsePrompt(usedPrompt)}
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                      <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleSavePrompt()}
                                      >
                                        <Bookmark className="h-3 w-3" />
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
                        placeholder="Style (e.g., photorealistic, high resolution, sharp focus)"
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isLoading || !prompt} 
                      className="w-full text-base py-6 font-medium hover:scale-[1.01] transition-transform"
                    >
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
                  <div className="mt-4 relative w-full aspect-square max-w-md animate-fade-in rounded-lg overflow-hidden shadow-lg">
                    <Image
                      width={600}
                      height={600}
                      src={generatedImage}
                      alt="Generated image"
                      className="rounded-lg object-contain w-full h-full transition-all duration-500"
                    />
                    {isLoggedIn && (
                      <div className="absolute bottom-4 right-4 flex flex-wrap justify-end gap-2">
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
                        <Button 
                          type="button" 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleDownloadImage(generatedImage, prompt)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                {!generatedImage && !isLoading && (
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-20 w-20 mb-3 opacity-70 animate-pulse-gentle" />
                    <p className="text-base">Your generated image will appear here</p>
                  </div>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="gallery">
            <Card className="border border-border/40 shadow-card hover:shadow-card-hover transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-heading">Your Gallery</CardTitle>
                <CardDescription className="text-base">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {imagesData.userImages.map((image: ImageType) => (
                      <div key={image._id} className="relative aspect-square animate-fade-in">
                        <div className="group relative w-full h-full overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
                          <Image
                            src={image.imageUrl}
                            alt={image.prompt}
                            fill
                            className="object-cover rounded-lg"
                          />
                          {/* Dark overlay with prompt info */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div></div> {/* Empty div for flex justify-between */}
                            <div className="text-white pb-20"> {/* Added padding at bottom instead of margin to ensure text doesn't get cut off */}
                              <p className="font-medium text-base line-clamp-3 mb-1">{image.prompt}</p>
                              <p className="text-sm opacity-80">
                                {image.createdAt 
                                  ? new Date(parseInt(image.createdAt)).toLocaleDateString() 
                                  : 'Unknown date'}
                              </p>
                            </div>
                          </div>
                          
                          {/* Action buttons */}
                          <div className="absolute bottom-4 left-0 right-0 flex flex-wrap justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 transform translate-y-2 group-hover:translate-y-0 bg-transparent"> {/* Added z-10 to ensure buttons are above text */}
                            <Button 
                              type="button" 
                              variant="secondary" 
                              size="sm"
                              onClick={() => handleReuseFromGallery(image.prompt, image.style)}
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
                            <Button 
                              type="button" 
                              variant="secondary" 
                              size="sm"
                              onClick={() => handleDownloadImage(image.imageUrl, image.prompt)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
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