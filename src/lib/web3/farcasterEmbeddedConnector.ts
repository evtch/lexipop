/**
 * Custom Wagmi Connector for Farcaster's Embedded Wallet
 *
 * This connector directly interfaces with Farcaster's Embedded1193Provider
 * which is available in the Farcaster web client on desktop
 */

import { createConnector } from 'wagmi';
import { base } from 'wagmi/chains';
import type { Chain } from 'viem';

// Type definition for the embedded provider
interface EmbeddedProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
}

function farcasterEmbedded() {
  let provider: EmbeddedProvider | undefined;

  return createConnector((config) => ({
    id: 'farcaster-embedded',
    name: 'Farcaster Embedded Wallet',
    type: 'farcaster-embedded',

    async connect(parameters?: any): Promise<any> {
      const { chainId, withCapabilities } = parameters ?? {};

      try {
        // Check if we're in Farcaster desktop environment
        // The embedded provider is injected by Farcaster's web client
        const win = window as any;

        // Try different possible provider locations
        provider = win.ethereum || win.parent?.ethereum || win.top?.ethereum;

        if (!provider) {
          throw new Error('Farcaster embedded wallet not found. Are you using Farcaster web client?');
        }

        console.log('🔗 Found embedded provider:', provider);

        // Get accounts
        const accounts = await provider.request({
          method: 'eth_requestAccounts',
        }) as string[];

        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found');
        }

        // Get chain ID
        const currentChainId = await provider.request({
          method: 'eth_chainId',
        }) as string;

        const chainIdNumber = parseInt(currentChainId, 16);
        console.log('📊 Current chain ID:', chainIdNumber);

        // Switch to Base if needed
        if (chainIdNumber !== base.id) {
          try {
            await provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${base.id.toString(16)}` }],
            });
          } catch (switchError: any) {
            // Chain not added, try adding it
            if (switchError.code === 4902) {
              await provider.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: `0x${base.id.toString(16)}`,
                  chainName: 'Base',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: ['https://mainnet.base.org'],
                  blockExplorerUrls: ['https://basescan.org'],
                }],
              });
            } else {
              throw switchError;
            }
          }
        }

        // Return correct type based on withCapabilities parameter
        if (withCapabilities) {
          // Return with capabilities format
          return {
            accounts: accounts.map((address: string) => ({
              address: address as `0x${string}`,
              capabilities: {} as Record<string, unknown>,
            })) as readonly { address: `0x${string}`; capabilities: Record<string, unknown> }[],
            chainId: base.id as number,
          };
        }

        // Return simple format
        return {
          accounts: accounts as readonly `0x${string}`[],
          chainId: base.id as number,
        };
      } catch (error) {
        console.error('Failed to connect to Farcaster embedded wallet:', error);
        throw error;
      }
    },

    async disconnect() {
      provider = undefined;
    },

    async getAccounts() {
      if (!provider) {
        return [];
      }

      try {
        const accounts = await provider.request({
          method: 'eth_accounts',
        }) as string[];
        return accounts as `0x${string}`[];
      } catch {
        return [];
      }
    },

    async getChainId() {
      if (!provider) {
        return base.id;
      }

      try {
        const chainId = await provider.request({
          method: 'eth_chainId',
        }) as string;
        return parseInt(chainId, 16);
      } catch {
        return base.id;
      }
    },

    async getProvider() {
      return provider;
    },

    async isAuthorized() {
      try {
        if (!provider) {
          return false;
        }

        const accounts = await provider.request({
          method: 'eth_accounts',
        }) as string[];

        return accounts && accounts.length > 0;
      } catch {
        return false;
      }
    },

    onAccountsChanged(accounts) {
      if (provider?.on) {
        provider.on('accountsChanged', accounts);
      }
    },

    onChainChanged(chainChanged) {
      if (provider?.on) {
        provider.on('chainChanged', (chainId: string) => {
          chainChanged({ chainId: parseInt(chainId, 16) });
        });
      }
    },

    onDisconnect(disconnect) {
      if (provider?.on) {
        provider.on('disconnect', disconnect);
      }
    },
  }));
}

export { farcasterEmbedded };