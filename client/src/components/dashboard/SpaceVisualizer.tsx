import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";
import ThreeJsContainer from "./ThreeJsContainer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export default function SpaceVisualizer() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { createSpaceToken, loading } = useWeb3();
  
  const [length, setLength] = useState(12);
  const [width, setWidth] = useState(2.5);
  const [height, setHeight] = useState(2.8);
  const [source, setSource] = useState("New York, NY");
  const [destination, setDestination] = useState("Chicago, IL");
  const [tokenizing, setTokenizing] = useState(false);
  
  const totalVolume = (length * width * height).toFixed(2);
  const maxWeight = (length * width * height * 285).toFixed(0); // Rough calculation based on dimensions
  
  const handleLengthChange = (value: number[]) => setLength(value[0]);
  const handleWidthChange = (value: number[]) => setWidth(value[0]);
  const handleHeightChange = (value: number[]) => setHeight(value[0]);
  
  const handleTokenizeSpace = async () => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to tokenize space.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setTokenizing(true);
      
      // Create a space token on the blockchain
      const tokenId = await createSpaceToken({
        source,
        destination,
        length,
        width,
        height,
        maxWeight
      });
      
      if (!tokenId) {
        throw new Error("Failed to create blockchain token");
      }
      
      // Convert maxWeight to a number before sending to the backend
      const numericMaxWeight = parseInt(maxWeight);
      
      // Calculate price based on weight
      const calculatedPrice = numericMaxWeight * 0.05;
      
      // Save the space to our backend
      const requestData = {
        tokenId,
        userId: user.id,
        source,
        destination,
        length: Number(length),
        width: Number(width),
        height: Number(height),
        maxWeight: numericMaxWeight,
        vehicleType: "18-Wheeler Truck",
        status: "available",
        departureDate: new Date(Date.now() + 86400000).toISOString(), // tomorrow as ISO string
        price: calculatedPrice
      };
      
      console.log("Sending space data to backend:", requestData);
      
      await apiRequest("/api/spaces", { 
        method: "POST", 
        data: requestData 
      });
      
      // Invalidate spaces query to refresh the TokenizedSpaces component
      queryClient.invalidateQueries({ queryKey: ["/api/spaces", user.id] });
      
      toast({
        title: "Space Tokenized",
        description: `Successfully tokenized space with token ID: ${tokenId}`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error tokenizing space:", error);
      
      // More detailed error logging
      if (error instanceof Response) {
        try {
          error.text().then(text => {
            console.error("Server response:", text);
          });
        } catch (e) {
          console.error("Could not extract response text:", e);
        }
      }
      
      toast({
        title: "Tokenization Failed",
        description: error instanceof Error ? error.message : "Failed to tokenize space. Please try again.",
        variant: "destructive"
      });
    } finally {
      setTokenizing(false);
    }
  };
  
  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden mb-8">
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Cargo Space Tokenization</h2>
        <p className="text-gray-600 mb-6">
          Visualize and manage your available logistics space, then tokenize it on the blockchain.
        </p>
        
        <div className="flex flex-col lg:flex-row">
          {/* 3D Visualization Area */}
          <div className="w-full lg:w-2/3 h-96 bg-gray-800 rounded-lg overflow-hidden mb-4 lg:mb-0 lg:mr-6">
            <ThreeJsContainer 
              length={length} 
              width={width} 
              height={height} 
              className="w-full h-full"
            />
          </div>
          
          {/* Controls and Information */}
          <div className="w-full lg:w-1/3">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-gray-900 mb-2">Space Dimensions</h3>
              <div className="space-y-4">
                <div>
                  <Label className="block text-sm text-gray-700 mb-1">
                    Length (meters): {length}m
                  </Label>
                  <Slider 
                    value={[length]} 
                    min={1} 
                    max={20} 
                    step={0.1}
                    onValueChange={handleLengthChange} 
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1m</span>
                    <span>10m</span>
                    <span>20m</span>
                  </div>
                </div>
                <div>
                  <Label className="block text-sm text-gray-700 mb-1">
                    Width (meters): {width}m
                  </Label>
                  <Slider 
                    value={[width]} 
                    min={1} 
                    max={5} 
                    step={0.1}
                    onValueChange={handleWidthChange} 
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1m</span>
                    <span>3m</span>
                    <span>5m</span>
                  </div>
                </div>
                <div>
                  <Label className="block text-sm text-gray-700 mb-1">
                    Height (meters): {height}m
                  </Label>
                  <Slider 
                    value={[height]} 
                    min={1} 
                    max={5} 
                    step={0.1}
                    onValueChange={handleHeightChange} 
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1m</span>
                    <span>3m</span>
                    <span>5m</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-gray-900 mb-2">Route Information</h3>
              <div className="space-y-4">
                <div>
                  <Label className="block text-sm text-gray-700 mb-1">Source Location</Label>
                  <Input 
                    type="text" 
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="Enter city or address" 
                  />
                </div>
                <div>
                  <Label className="block text-sm text-gray-700 mb-1">Destination</Label>
                  <Input 
                    type="text" 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Enter city or address" 
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-gray-900 mb-2">Capacity Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Volume:</span>
                  <span className="text-sm font-medium">{totalVolume} m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Max Weight:</span>
                  <span className="text-sm font-medium">{maxWeight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Available Space:</span>
                  <span className="text-sm font-medium">100%</span>
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full bg-[#8B5CF6] hover:bg-[#7c4df1]"
              onClick={handleTokenizeSpace}
              disabled={loading || tokenizing}
            >
              {tokenizing ? "Tokenizing..." : "Tokenize Space"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
