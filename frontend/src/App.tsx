import { ApolloProvider } from '@apollo/client';
import { Toaster } from 'react-hot-toast';
import { apolloClient } from './lib/apollo';
import { ApplicationsPage } from './pages/ApplicationsPage';

export function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <ApplicationsPage />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontSize: '14px',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
          },
        }}
      />
    </ApolloProvider>
  );
}
