import { Card, CardContent } from "@/components/ui/card";
import { Shield, FileText, Clock } from "lucide-react";
import { useWeb3 } from "@/lib/web3";

export default function BlockchainStatus() {
  const { isConnected, account, networkId } = useWeb3();
  
  // Get network name based on network ID
  const getNetworkName = (id: number | null) => {
    switch (id) {
      case 1:
        return "Ethereum Mainnet";
      case 3:
        return "Ropsten Testnet";
      case 4:
        return "Rinkeby Testnet";
      case 5:
        return "Goerli Testnet";
      case 42:
        return "Kovan Testnet";
      case 56:
        return "Binance Smart Chain";
      case 137:
        return "Polygon Mainnet";
      default:
        return "Unknown Network";
    }
  };
  
  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden">
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Blockchain Status</h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-[#8B5CF6]" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Network Status</h3>
              <p className="text-sm text-gray-500">
                {isConnected 
                  ? `Connected to ${getNetworkName(networkId)}` 
                  : "Not connected to blockchain"}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-[#8B5CF6]" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Smart Contract</h3>
              <p className="text-sm text-gray-500 font-mono">
                {isConnected 
                  ? "0x7F3A9E2D5Ef6B63A3c65d6fE7fAfB34B9E5F1b3C" 
                  : "Not connected"}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-[#8B5CF6]" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Wallet Address</h3>
              <p className="text-sm text-gray-500 font-mono truncate max-w-[200px]">
                {account || "Not connected"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
