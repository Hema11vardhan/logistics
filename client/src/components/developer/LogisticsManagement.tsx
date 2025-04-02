import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Truck, Search, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LogisticsManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Query for logistics spaces
  const { data: spaces, isLoading, error } = useQuery({
    queryKey: ['/api/spaces'],
  });
  
  const handleViewDetails = (spaceId: number) => {
    toast({
      title: "View Space Details",
      description: `Details for space ID: ${spaceId} would be displayed in a modal here.`,
      variant: "default"
    });
  };
  
  // Filter spaces based on search term and status filter
  const filteredSpaces = spaces 
    ? spaces.filter((space: any) => {
        const matchesSearch = 
          searchTerm === "" || 
          space.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
          space.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
          space.tokenId.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === "all" || space.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
    : [];
  
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
    <Card>
      <CardHeader>
        <CardTitle>Logistics Space Management</CardTitle>
        <CardDescription>
          View and manage all tokenized logistics spaces
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search spaces by source, destination, or token ID..."
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
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {isLoading ? (
          <div className="text-center py-10">
            <div className="spinner mb-4"></div>
            <p className="text-gray-500">Loading logistics spaces...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">
            Error loading spaces: {(error as Error).message}
          </div>
        ) : filteredSpaces.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No logistics spaces found matching your criteria.</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token ID</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead>Max Weight</TableHead>
                  <TableHead>Vehicle Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSpaces.map((space: any) => (
                  <TableRow key={space.id}>
                    <TableCell className="font-mono text-xs">{space.tokenId}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-red-500" />
                        <span className="text-sm">{space.source} → {space.destination}</span>
                      </div>
                    </TableCell>
                    <TableCell>{space.length}m × {space.width}m × {space.height}m</TableCell>
                    <TableCell>{space.maxWeight.toLocaleString()} kg</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Truck className="h-4 w-4 mr-1" />
                        {space.vehicleType}
                      </div>
                    </TableCell>
                    <TableCell>${space.price.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(space.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleViewDetails(space.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
