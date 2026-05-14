import React from 'react';
import { AppRegistry, I18nManager } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppNavigator } from './src/navigation';
import { name as appName } from './app.json';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppNavigator />
    </QueryClientProvider>
  );
}

AppRegistry.registerComponent(appName, () => App);
