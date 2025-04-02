import { useNavigate } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchData } from "./ShippingSearch";
import { LogisticsSpace } from "@shared/schema";
import { MapPin, Truck, Clock } from "lucide-react";

interface ShippingResultsProps {
  results: LogisticsSpace[];
  loading: boolean;
  searchData?: SearchData;
  onSelectSpace: (space: LogisticsSpace) => void;
}

export default function ShippingResults({ 
  results, 
  loading, 
  searchData,
  onSelectSpace 
}: ShippingResultsProps) {
  // Format date for display
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "Flexible";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };
  
  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden mb-8">
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Available Shipping Options</h2>
        <p className="text-gray-600 mb-6">
          Blockchain-verified shipping spaces matching your search criteria.
        </p>
        
        {loading ? (
          <div className="py-10 text-center text-gray-500">
            Searching for available shipping options...
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            {results.map((space) => (
              <div 
                key={space.id} 
                className="rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200"
                style={{ background: "linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)" }}
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center mb-2">
                      <MapPin className="h-5 w-5 text-[#8B5CF6] mr-2" />
                      <span className="text-gray-900 font-medium">
                        {space.source} → {space.destination}
                      </span>
                    </div>
                    <div className="flex items-center mb-2">
                      <Truck className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-600">{space.vehicleType}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-600">
                        Departs: {formatDate(space.departureDate)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 items-start md:items-end">
                    <div className="flex items-center">
                      <Badge className="mr-2 bg-green-100 text-green-800 hover:bg-green-100">
                        Verified
                      </Badge>
                      <span className="font-mono text-xs text-gray-500">{space.tokenId}</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">${space.price.toFixed(0)}</div>
                    <div className="text-sm text-gray-500">Max Capacity: {space.maxWeight.toLocaleString()} kg</div>
                    <Button 
                      className="mt-2 bg-[#8B5CF6] hover:bg-[#7c4df1] text-white text-sm"
                      onClick={() => onSelectSpace(space)}
                    >
                      Select & Customize
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : searchData ? (
          <div className="py-10 text-center text-gray-500">
            No shipping options found for the selected criteria. Please try different parameters.
          </div>
        ) : (
          <div className="py-10 text-center text-gray-500">
            Use the search form above to find available shipping options.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
