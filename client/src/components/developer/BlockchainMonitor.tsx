import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useWeb3 } from "@/lib/web3";
import { BlockchainTransaction, SystemStatus } from "@/lib/types";
import { getSystemStatusData } from "@/lib/chartData";

interface BlockchainMonitorProps {
  className?: string;
}

export default function BlockchainMonitor({ className }: BlockchainMonitorProps) {
  const { isConnected, account, networkId } = useWeb3();
  const [activeTab, setActiveTab] = useState("transactions");
  
  // Mock blockchain transactions for demo
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [systemStatuses, setSystemStatuses] = useState<SystemStatus[]>([]);
  
  // Initialize with mock data
  useEffect(() => {
    // Generate mock blockchain transactions
    const mockTransactions: BlockchainTransaction[] = [];
    const now = new Date();
    
    for (let i = 0; i < 5; i++) {
      const timestamp = new Date(now);
      timestamp.setMinutes(timestamp.getMinutes() - i * 15);
      
      mockTransactions.push({
        hash: `0x${Math.random().toString(16).substring(2, 14)}${Math.random().toString(16).substring(2, 14)}`,
        timestamp,
        from: `0x${Math.random().toString(16).substring(2, 42)}`,
        to: "0x7F3A9E2D5Ef6B63A3c65d6fE7fAfB34B9E5F1b3C", // Contract address
        value: `${(Math.random() * 2).toFixed(4)} ETH`,
        gas: `${Math.floor(Math.random() * 50000 + 30000)} gwei`,
        status: i === 0 ? "pending" : "confirmed"
      });
    }
    
    setTransactions(mockTransactions);
    
    // Generate system statuses
    const systemStatusData = getSystemStatusData();
    const statuses: SystemStatus[] = [
      { name: "API Server", status: "operational", uptime: systemStatusData.api, latency: 120 },
      { name: "Blockchain Connection", status: "operational", uptime: systemStatusData.blockchain, latency: 450 },
      { name: "Database", status: "operational", uptime: systemStatusData.database, latency: 85 },
      { name: "Frontend", status: "operational", uptime: systemStatusData.frontend, latency: 105 },
      { name: "Tracking Service", status: systemStatusData.tracking < 98 ? "degraded" : "operational", uptime: systemStatusData.tracking, latency: 320 }
    ];
    
    setSystemStatuses(statuses);
  }, []);
  
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
  
  // Generate status badge based on status
  const getStatusBadge = (status: "operational" | "degraded" | "outage") => {
    switch (status) {
      case "operational":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Operational</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Degraded</Badge>;
      case "outage":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Outage</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Blockchain Network Monitor</CardTitle>
        <CardDescription>
          Monitor blockchain transactions and system status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-500 mb-1">Connection Status</div>
            <div className="flex items-center">
              <div className={`h-2 w-2 rounded-full mr-2 ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
              <span className="font-medium">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-500 mb-1">Network</div>
            <div className="font-medium">{getNetworkName(networkId)}</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-500 mb-1">Smart Contract</div>
            <div className="font-mono text-xs">0x7F3A9E2D5Ef6B63A3c65d6fE7fAfB34B9E5F1b3C</div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
            <TabsTrigger value="status">System Status</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions" className="mt-6">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction Hash</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Gas</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.hash}>
                      <TableCell className="font-mono text-xs">
                        {`${tx.hash.substring(0, 10)}...${tx.hash.substring(tx.hash.length - 8)}`}
                      </TableCell>
                      <TableCell>{tx.timestamp.toLocaleTimeString()}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {`${tx.from.substring(0, 6)}...${tx.from.substring(tx.from.length - 4)}`}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {`${tx.to.substring(0, 6)}...${tx.to.substring(tx.to.length - 4)}`}
                      </TableCell>
                      <TableCell>{tx.value}</TableCell>
                      <TableCell>{tx.gas}</TableCell>
                      <TableCell>
                        {tx.status === "confirmed" ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="status" className="mt-6">
            <div className="space-y-6">
              {systemStatuses.map((status) => (
                <div key={status.name} className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{status.name}</span>
                    {getStatusBadge(status.status)}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Uptime</span>
                        <span>{status.uptime.toFixed(1)}%</span>
                      </div>
                      <Progress value={status.uptime} className="h-2" />
                    </div>
                    {status.latency && (
                      <div className="flex justify-between text-sm">
                        <span>Latency</span>
                        <span>{status.latency} ms</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline">Refresh Data</Button>
      </CardFooter>
    </Card>
  );
}
