import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { LogisticsSpace } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";

export default function TokenizedSpaces() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { 
    data: spaces, 
    isLoading, 
    error,
    refetch
  } = useQuery<LogisticsSpace[]>({
    queryKey: ["/api/spaces", user?.id],
    queryFn: async ({ queryKey }) => {
      if (!user?.id) throw new Error("User ID is required");
      console.log("Fetching spaces for user:", user.id);
      const res = await fetch(`/api/spaces?userId=${user.id}`);
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error fetching spaces: ${text}`);
      }
      
      const data = await res.json();
      console.log("Received spaces data:", data);
      return data || [];
    },
    enabled: !!user?.id,
    refetchInterval: 5000, // Refetch every 5 seconds to ensure new tokenized spaces appear
  });
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading spaces",
        description: "Failed to load tokenized spaces. Please try again.",
        variant: "destructive"
      });
    }
  }, [error, toast]);
  
  // Function to handle manual refresh
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing spaces",
      description: "Fetching the latest tokenized spaces from the blockchain.",
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Available</Badge>;
      case "partial":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Partial</Badge>;
      case "booked":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Booked</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden mb-8">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Tokenized Spaces</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isLoading}
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <p className="text-gray-600 mb-6">
          Your logistics spaces that have been converted to blockchain tokens.
        </p>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-10 text-center text-gray-500">Loading tokenized spaces...</div>
          ) : spaces && spaces.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token ID</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead>Max Weight</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {spaces.map((space) => (
                  <TableRow key={space.id}>
                    <TableCell className="font-mono text-sm">{space.tokenId}</TableCell>
                    <TableCell>{space.source} → {space.destination}</TableCell>
                    <TableCell>{space.length}m × {space.width}m × {space.height}m</TableCell>
                    <TableCell>{space.maxWeight.toLocaleString()} kg</TableCell>
                    <TableCell>{getStatusBadge(space.status)}</TableCell>
                    <TableCell>
                      <Button variant="link" className="text-[#8B5CF6] p-0 h-auto">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-10 text-center text-gray-500">
              No tokenized spaces found. Create your first one by using the Space Visualizer.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
