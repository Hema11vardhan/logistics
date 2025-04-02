import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { CreditCard, ExternalLink, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TransactionListProps {
  limit?: number;
}

export default function TransactionList({ limit }: TransactionListProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Query for transactions
  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ['/api/transactions'],
  });
  
  const handleViewOnBlockchain = (txHash: string) => {
    // In a real app, this would open the blockchain explorer
    toast({
      title: "View on Blockchain",
      description: `Would open blockchain explorer for transaction: ${txHash}`,
      variant: "default"
    });
  };
  
  // Filter and limit transactions
  const filteredTransactions = transactions 
    ? transactions
        .filter((tx: any) => {
          const matchesSearch = 
            searchTerm === "" || 
            (tx.blockchainTxHash && tx.blockchainTxHash.toLowerCase().includes(searchTerm.toLowerCase())) ||
            tx.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());
          
          const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
          
          return matchesSearch && matchesStatus;
        })
        .slice(0, limit || transactions.length)
    : [];
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "metamask":
        return <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>;
      case "upi":
        return <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>;
      default:
        return <CreditCard className="h-4 w-4 mr-1" />;
    }
  };
  
  // Only show filters if not limited
  const showFilters = limit === undefined;
  
  return (
    <div>
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      {isLoading ? (
        <div className="text-center py-10">
          <div className="spinner mb-4"></div>
          <p className="text-gray-500">Loading transactions...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">
          Error loading transactions: {(error as Error).message}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No transactions found matching your criteria.</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Shipment ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Blockchain Hash</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((tx: any) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.id}</TableCell>
                  <TableCell>{tx.shipmentId}</TableCell>
                  <TableCell>${tx.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getPaymentMethodIcon(tx.paymentMethod)}
                      <span className="capitalize">{tx.paymentMethod}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(tx.status)}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {tx.blockchainTxHash 
                      ? `${tx.blockchainTxHash.substring(0, 8)}...${tx.blockchainTxHash.substring(tx.blockchainTxHash.length - 6)}`
                      : '-'}
                  </TableCell>
                  <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    {tx.blockchainTxHash && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleViewOnBlockchain(tx.blockchainTxHash)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
