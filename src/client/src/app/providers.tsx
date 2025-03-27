"use client";

import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from '@/components/theme-provider';
import { ApolloWrapper } from '@/components/apollo-wrapper';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ApolloWrapper>
        {children}
      </ApolloWrapper>
    </ThemeProvider>
  );
}