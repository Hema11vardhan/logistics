import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ShippingSearchProps {
  onSearch: (searchData: SearchData) => void;
}

export interface SearchData {
  source: string;
  destination: string;
  goodsType: string;
  weight: number;
  departureDate: string;
}

export default function ShippingSearch({ onSearch }: ShippingSearchProps) {
  const { toast } = useToast();
  const [source, setSource] = useState("New York, NY");
  const [destination, setDestination] = useState("Chicago, IL");
  const [goodsType, setGoodsType] = useState("general");
  const [weight, setWeight] = useState(5000);
  const [departureDate, setDepartureDate] = useState("");
  
  const handleSearch = () => {
    if (!source || !destination) {
      toast({
        title: "Missing Information",
        description: "Please provide both source and destination locations.",
        variant: "destructive"
      });
      return;
    }
    
    if (weight <= 0) {
      toast({
        title: "Invalid Weight",
        description: "Weight must be greater than 0 kg.",
        variant: "destructive"
      });
      return;
    }
    
    onSearch({
      source,
      destination,
      goodsType,
      weight,
      departureDate
    });
  };
  
  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden mb-8">
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Search Available Logistics Space</h2>
        <p className="text-gray-600 mb-6">
          Find available blockchain-verified shipping options for your goods.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
              Source Location
            </Label>
            <Input
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Enter pickup location"
            />
          </div>
          <div>
            <Label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
              Destination
            </Label>
            <Input
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter delivery location"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <Label htmlFor="goods-type" className="block text-sm font-medium text-gray-700 mb-1">
              Type of Goods
            </Label>
            <Select value={goodsType} onValueChange={setGoodsType}>
              <SelectTrigger id="goods-type">
                <SelectValue placeholder="Select goods type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Cargo</SelectItem>
                <SelectItem value="fragile">Fragile Items</SelectItem>
                <SelectItem value="perishable">Perishable Goods</SelectItem>
                <SelectItem value="hazardous">Hazardous Materials</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              placeholder="Enter weight in kg"
            />
          </div>
          <div>
            <Label htmlFor="departure-date" className="block text-sm font-medium text-gray-700 mb-1">
              Departure Date
            </Label>
            <Input
              id="departure-date"
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            className="bg-[#8B5CF6] hover:bg-[#7c4df1]"
            onClick={handleSearch}
          >
            Search Availability
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
