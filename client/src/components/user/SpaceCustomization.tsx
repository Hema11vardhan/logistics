import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LogisticsSpace } from "@shared/schema";
import ThreeJsContainer from "../dashboard/ThreeJsContainer";
import { useAuth } from "@/hooks/useAuth";

interface SpaceCustomizationProps {
  space: LogisticsSpace | null;
  onProceedToPayment: (customizationData: CustomizationData) => void;
}

export interface CustomizationData {
  spaceId: number;
  tokenId: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  contentType: string;
  additionalServices: string[];
  totalCost: number;
}

export default function SpaceCustomization({ space, onProceedToPayment }: SpaceCustomizationProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [length, setLength] = useState(8);
  const [width, setWidth] = useState(2.5);
  const [height, setHeight] = useState(2.8);
  const [weight, setWeight] = useState(5000);
  const [contentType, setContentType] = useState("General Cargo");
  const [additionalServices, setAdditionalServices] = useState<string[]>([]);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    if (space) {
      // Set initial values based on selected space but limit by max dimensions
      setLength(Math.min(8, space.length));
      setWidth(Math.min(space.width, 2.5));
      setHeight(Math.min(space.height, 2.8));
      setWeight(Math.min(space.maxWeight, 5000));
      
      // Initialize the total cost with space's base price
      calculateTotalCost(space.price, additionalServices);
    }
  }, [space]);

  const handleServiceToggle = (service: string) => {
    setAdditionalServices(prev => {
      if (prev.includes(service)) {
        const newServices = prev.filter(s => s !== service);
        calculateTotalCost(space?.price || 0, newServices);
        return newServices;
      } else {
        const newServices = [...prev, service];
        calculateTotalCost(space?.price || 0, newServices);
        return newServices;
      }
    });
  };

  const calculateTotalCost = (basePrice: number, services: string[]) => {
    let cost = basePrice;
    
    // Add costs for additional services
    if (services.includes("temperature-controlled")) cost += 150;
    if (services.includes("express-delivery")) cost += 200;
    if (services.includes("insurance")) cost += 100;
    
    setTotalCost(cost);
  };

  const handleProceedToPayment = () => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to proceed to payment.",
        variant: "destructive"
      });
      return;
    }

    if (!space) {
      toast({
        title: "Missing Space Information",
        description: "Please select a shipping space first.",
        variant: "destructive"
      });
      return;
    }

    if (weight > space.maxWeight) {
      toast({
        title: "Weight Limit Exceeded",
        description: `Maximum weight for this space is ${space.maxWeight} kg.`,
        variant: "destructive"
      });
      return;
    }

    const customizationData: CustomizationData = {
      spaceId: space.id,
      tokenId: space.tokenId,
      length,
      width,
      height,
      weight,
      contentType,
      additionalServices,
      totalCost
    };

    onProceedToPayment(customizationData);
  };

  if (!space) {
    return (
      <Card className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <CardContent className="p-6 text-center text-gray-500 py-10">
          Please select a shipping space to customize.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden mb-8">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Customize Shipping Space</h2>
          <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
            Token {space.tokenId}
          </Badge>
        </div>
        <p className="text-gray-600 mb-6">Adjust the cargo space according to your shipping requirements.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Visual Space Selector */}
          <div className="bg-gray-100 rounded-lg p-4 h-80 flex items-center justify-center">
            <ThreeJsContainer
              length={length}
              width={width}
              height={height}
              className="w-full h-full"
            />
          </div>
          
          {/* Space Configuration */}
          <div className="space-y-6">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Space Allocation</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="block text-xs text-gray-500 mb-1">Length (m)</Label>
                  <Input 
                    type="number" 
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    min={1}
                    max={space.length}
                    step={0.1}
                  />
                </div>
                <div>
                  <Label className="block text-xs text-gray-500 mb-1">Width (m)</Label>
                  <Input 
                    type="number" 
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    min={1}
                    max={space.width}
                    step={0.1}
                  />
                </div>
                <div>
                  <Label className="block text-xs text-gray-500 mb-1">Height (m)</Label>
                  <Input 
                    type="number" 
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    min={1}
                    max={space.height}
                    step={0.1}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Cargo Details</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-xs text-gray-500 mb-1">Weight (kg)</Label>
                  <Input 
                    type="number" 
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    min={1}
                    max={space.maxWeight}
                  />
                </div>
                <div>
                  <Label className="block text-xs text-gray-500 mb-1">Content Type</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General Cargo">General Cargo</SelectItem>
                      <SelectItem value="Fragile Items">Fragile Items</SelectItem>
                      <SelectItem value="Perishable Goods">Perishable Goods</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Hazardous Materials">Hazardous Materials</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Additional Services</Label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Checkbox 
                    id="temperature-controlled"
                    checked={additionalServices.includes("temperature-controlled")}
                    onCheckedChange={() => handleServiceToggle("temperature-controlled")}
                  />
                  <Label htmlFor="temperature-controlled" className="ml-2 block text-sm text-gray-700">
                    Temperature-Controlled (+$150)
                  </Label>
                </div>
                <div className="flex items-center">
                  <Checkbox 
                    id="express-delivery"
                    checked={additionalServices.includes("express-delivery")}
                    onCheckedChange={() => handleServiceToggle("express-delivery")}
                  />
                  <Label htmlFor="express-delivery" className="ml-2 block text-sm text-gray-700">
                    Express Delivery (+$200)
                  </Label>
                </div>
                <div className="flex items-center">
                  <Checkbox 
                    id="insurance"
                    checked={additionalServices.includes("insurance")}
                    onCheckedChange={() => handleServiceToggle("insurance")}
                  />
                  <Label htmlFor="insurance" className="ml-2 block text-sm text-gray-700">
                    Insurance Coverage (+$100)
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between text-lg font-medium text-gray-900 mb-4">
                <span>Total Cost:</span>
                <span>${totalCost.toFixed(2)}</span>
              </div>
              <Button 
                className="w-full bg-[#8B5CF6] hover:bg-[#7c4df1]"
                onClick={handleProceedToPayment}
              >
                Proceed to Payment
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
