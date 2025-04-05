// This file handles blockchain integration with Web3.js
import { useCallback, useEffect, useState } from 'react';

// Add type declaration for ethereum in window
declare global {
  interface Window {
    ethereum?: {
      request: (args: any) => Promise<any>;
      on: (event: string, callback: any) => void;
      removeListener: (event: string, callback: any) => void;
      selectedAddress?: string;
      isConnected?: boolean;
    };
  }
}

// Mock Web3 for now, to be replaced with actual web3 implementation
const mockWeb3 = {
  isConnected: false,
  accounts: [] as string[],
  networkId: null as number | null,
  async connectWallet(): Promise<{ accounts: string[], networkId: number } | null> {
    // Check if window.ethereum is available
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        // Request accounts from the user
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const networkId = await window.ethereum.request({ method: 'net_version' });
        
        this.isConnected = true;
        this.accounts = accounts;
        this.networkId = parseInt(networkId);
        
        return { accounts, networkId: parseInt(networkId) };
      } catch (error) {
        console.error('Error connecting to wallet:', error);
        return null;
      }
    } else {
      console.log('Please install MetaMask!');
      return null;
    }
  },
  async sendTransaction(params: any): Promise<string | null> {
    if (!this.isConnected) {
      await this.connectWallet();
    }
    
    if (typeof window !== 'undefined' && window.ethereum && this.accounts.length > 0) {
      try {
        // Mock transaction for now
        return "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b";
      } catch (error) {
        console.error('Error sending transaction:', error);
        return null;
      }
    }
    
    return null;
  },
  // Function to convert ETH to Wei
  toWei(eth: number): string {
    return (eth * 1e18).toString();
  },
  // Function to convert Wei to ETH
  fromWei(wei: string): number {
    return parseInt(wei) / 1e18;
  },
  // Function to create a space token
  async createSpaceToken(spaceData: any): Promise<string | null> {
    try {
      console.log('Creating space token with data:', spaceData);
      
      // Create a more deterministic token ID based on the space data
      // This helps with consistency in token generation
      const stringifiedData = JSON.stringify({
        ...spaceData,
        timestamp: new Date().toISOString().split('T')[0] // Use just the date part for consistency
      });
      
      // Create a hash-like token ID based on the stringified data
      let hash = 0;
      for (let i = 0; i < stringifiedData.length; i++) {
        const char = stringifiedData.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      
      // Use absolute value and convert to hex, make sure it's at least 8 chars
      const hexHash = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
      const tokenId = `T-0x${hexHash}`;
      
      console.log('Space tokenized successfully with ID:', tokenId);
      return tokenId;
    } catch (error) {
      console.error('Error creating token:', error);
      return null;
    }
  }
};

// React hook for Web3 interaction
export function useWeb3() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [networkId, setNetworkId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to connect wallet
  const connectWallet = useCallback(async (): Promise<{ accounts: string[], networkId: number } | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await mockWeb3.connectWallet();
      
      if (result) {
        setIsConnected(true);
        setAccount(result.accounts[0]);
        setNetworkId(result.networkId);
        return result;
      } else {
        setError('Failed to connect wallet');
        return null;
      }
    } catch (err) {
      setError('Error connecting to wallet');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to send a transaction
  const sendTransaction = useCallback(async (params: any) => {
    if (!isConnected) {
      await connectWallet();
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const txHash = await mockWeb3.sendTransaction(params);
      return txHash;
    } catch (err) {
      setError('Error sending transaction');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConnected, connectWallet]);

  // Function to create a space token
  const createSpaceToken = useCallback(async (spaceData: any) => {
    if (!isConnected) {
      await connectWallet();
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const tokenId = await mockWeb3.createSpaceToken(spaceData);
      return tokenId;
    } catch (err) {
      setError('Error creating space token');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConnected, connectWallet]);

  // Check if already connected on mount
  useEffect(() => {
    if (mockWeb3.isConnected && mockWeb3.accounts.length > 0) {
      setIsConnected(true);
      setAccount(mockWeb3.accounts[0]);
      setNetworkId(mockWeb3.networkId);
    }
    
    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        } else {
          setAccount(null);
          setIsConnected(false);
        }
      };
      
      const handleChainChanged = (chainId: string) => {
        setNetworkId(parseInt(chainId));
      };
      
      const ethereum = window.ethereum;
      if (ethereum) {
        ethereum.on('accountsChanged', handleAccountsChanged);
        ethereum.on('chainChanged', handleChainChanged);
        
        return () => {
          if (ethereum) {
            ethereum.removeListener('accountsChanged', handleAccountsChanged);
            ethereum.removeListener('chainChanged', handleChainChanged);
          }
        };
      }
    }
    
    return () => {};
  }, []);

  return {
    isConnected,
    account,
    networkId,
    loading,
    error,
    connectWallet,
    sendTransaction,
    createSpaceToken,
    toWei: mockWeb3.toWei,
    fromWei: mockWeb3.fromWei
  };
}

// For direct usage without the hook
export default mockWeb3;
