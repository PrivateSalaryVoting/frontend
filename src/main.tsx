//@ts-nocheck
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { createConfig, http } from 'wagmi';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';
import { sepolia } from 'wagmi/chains';
import { BrowserRouter } from 'react-router-dom';

const config = createConfig({
  chains: [
    sepolia,
],
transports: {
    [sepolia.id]: http(),
},
});

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(

  <QueryClientProvider client={queryClient}>
    <WagmiProvider config={config}>
      <RainbowKitProvider
        theme={lightTheme({
          accentColor: '#000000',
          accentColorForeground: '#ffffff',
          borderRadius: 'medium',
        })}
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </RainbowKitProvider>
    </WagmiProvider>
  </QueryClientProvider>

);
