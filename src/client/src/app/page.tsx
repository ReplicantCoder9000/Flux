"use client";

import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader, Sparkles, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

// Import types
import type { GenerateImageData } from '../types';

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

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('detailed, vibrant colors');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [generateImage] = useMutation(GENERATE_IMAGE, {
    onCompleted: (data: GenerateImageData) => {
      setGeneratedImage(data.generateImage.imageUrl);
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
        <h1 className="text-4xl font-bold text-center mb-8">Flux Image Generator</h1>
        
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
                <p className="text-center text-muted-foreground py-8">
                  Sign in to view your saved images.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}