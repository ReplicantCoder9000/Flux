"use client";

import { ApolloClient, ApolloProvider, InMemoryCache, HttpLink, from, ApolloLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { ReactNode, useEffect, useState } from 'react';
import { AuthProvider } from '@/context/AuthContext';

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }: { graphQLErrors?: readonly any[]; networkError?: any }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }: { message: string; locations?: any; path?: any }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  if (networkError) console.error(`[Network error]: ${networkError}`);
});

export function ApolloWrapper({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ApolloClient<any> | null>(null);

  useEffect(() => {
    // Auth link to add token to headers
    const authLink = new ApolloLink((operation, forward) => {
      // Get the token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      // Add the token to the headers
      operation.setContext(({ headers = {} }) => ({
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : '',
        }
      }));
      
      return forward(operation);
    });
    
    // HTTP link
    const httpLink = new HttpLink({
      uri: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/graphql',
      credentials: process.env.NODE_ENV === 'production' ? 'same-origin' : 'include',
    });
    
    // Create Apollo Client instance
    const client = new ApolloClient({
      link: from([errorLink, authLink, httpLink]),
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'network-only',
          errorPolicy: 'all',
        },
        query: {
          fetchPolicy: 'network-only',
          errorPolicy: 'all',
        },
        mutate: {
          errorPolicy: 'all',
        },
      },
    });
    
    setClient(client);
  }, []);

  if (!client) {
    return null;
  }
  
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ApolloProvider>
  );
}