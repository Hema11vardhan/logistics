import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

// Sample vehicle types that can be used for logistics spaces
const VEHICLE_TYPES = [
  {
    id: "18wheeler",
    name: "18-Wheeler Truck",
    maxLength: 16,
    maxWidth: 2.6,
    maxHeight: 4.1,
    maxWeight: 36000
  },
  {
    id: "box_truck",
    name: "Box Truck",
    maxLength: 7.5,
    maxWidth: 2.4,
    maxHeight: 3.0,
    maxWeight: 14000
  },
  {
    id: "cargo_van",
    name: "Cargo Van",
    maxLength: 3.7,
    maxWidth: 2.0,
    maxHeight: 2.8,
    maxWeight: 4000
  },
  {
    id: "refrigerated_truck",
    name: "Refrigerated Truck",
    maxLength: 10.4,
    maxWidth: 2.5,
    maxHeight: 3.2,
    maxWeight: 22000
  },
  {
    id: "flatbed_truck",
    name: "Flatbed Truck",
    maxLength: 12.2,
    maxWidth: 2.6,
    maxHeight: 0,
    maxWeight: 24000
  }
];

interface Vehicle {
  id: string;
  type: string;
  registrationNumber: string;
  capacity: number;
  status: 'available' | 'in_transit' | 'maintenance';
  lastMaintenance: string;
}

// Mocked vehicles for demonstration
const DEMO_VEHICLES: Vehicle[] = [
  {
    id: "v1",
    type: "18-Wheeler Truck",
    registrationNumber: "MH-01-AB-1234",
    capacity: 34000,
    status: 'available',
    lastMaintenance: "2023-06-12"
  },
  {
    id: "v2",
    type: "Box Truck",
    registrationNumber: "MH-02-CD-5678",
    capacity: 13500,
    status: 'in_transit',
    lastMaintenance: "2023-07-22"
  },
  {
    id: "v3",
    type: "Cargo Van",
    registrationNumber: "MH-03-EF-9012",
    capacity: 3800,
    status: 'maintenance',
    lastMaintenance: "2023-08-15"
  },
  {
    id: "v4",
    type: "Refrigerated Truck",
    registrationNumber: "MH-04-GH-3456",
    capacity: 20000,
    status: 'available',
    lastMaintenance: "2023-05-30"
  }
];

export default function VehicleManagement() {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>(DEMO_VEHICLES);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    type: "",
    registrationNumber: "",
    capacity: 0,
    status: "available" as 'available',
    lastMaintenance: new Date().toISOString().split('T')[0]
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return "bg-green-100 text-green-800";
      case 'in_transit':
        return "bg-blue-100 text-blue-800";
      case 'maintenance':
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const handleAddVehicle = () => {
    if (!newVehicle.type || !newVehicle.registrationNumber || newVehicle.capacity <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please fill all required fields with valid values.",
        variant: "destructive"
      });
      return;
    }
    
    const vehicle: Vehicle = {
      id: `v${vehicles.length + 1}`,
      ...newVehicle
    };
    
    setVehicles([...vehicles, vehicle]);
    setNewVehicle({
      type: "",
      registrationNumber: "",
      capacity: 0,
      status: "available" as 'available',
      lastMaintenance: new Date().toISOString().split('T')[0]
    });
    setShowAddForm(false);
    
    toast({
      title: "Vehicle Added",
      description: `The vehicle ${vehicle.type} (${vehicle.registrationNumber}) has been added.`,
      variant: "default"
    });
  };
  
  const handleToggleVehicleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'maintenance' : 'available';
    
    const updatedVehicles = vehicles.map(vehicle => 
      vehicle.id === id ? {...vehicle, status: newStatus as any} : vehicle
    );
    
    setVehicles(updatedVehicles);
    
    toast({
      title: "Vehicle Status Updated",
      description: `The vehicle status has been updated to: ${newStatus.replace('_', ' ')}`,
      variant: "default"
    });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Vehicle Fleet</h2>
            <Button 
              className="bg-[#8B5CF6] hover:bg-[#7c4df1]"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? "Cancel" : "Add Vehicle"}
            </Button>
          </div>
          
          {showAddForm && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-gray-900 mb-4">Add New Vehicle</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Select
                    value={newVehicle.type}
                    onValueChange={(value) => setNewVehicle({...newVehicle, type: value})}
                  >
                    <SelectTrigger id="vehicleType">
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_TYPES.map(type => (
                        <SelectItem key={type.id} value={type.name}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    value={newVehicle.registrationNumber}
                    onChange={(e) => setNewVehicle({...newVehicle, registrationNumber: e.target.value})}
                    placeholder="e.g., MH-01-AB-1234"
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity (kg)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={newVehicle.capacity || ""}
                    onChange={(e) => setNewVehicle({...newVehicle, capacity: parseInt(e.target.value) || 0})}
                    placeholder="Enter maximum weight capacity"
                  />
                </div>
                <div>
                  <Label htmlFor="lastMaintenance">Last Maintenance Date</Label>
                  <Input
                    id="lastMaintenance"
                    type="date"
                    value={newVehicle.lastMaintenance}
                    onChange={(e) => setNewVehicle({...newVehicle, lastMaintenance: e.target.value})}
                  />
                </div>
              </div>
              <Button 
                className="bg-[#8B5CF6] hover:bg-[#7c4df1]"
                onClick={handleAddVehicle}
              >
                Add Vehicle
              </Button>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Maintenance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.type}</TableCell>
                    <TableCell>{vehicle.registrationNumber}</TableCell>
                    <TableCell>{vehicle.capacity.toLocaleString()} kg</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(vehicle.status)}`}>
                        {vehicle.status.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(vehicle.lastMaintenance).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleVehicleStatus(vehicle.id, vehicle.status)}
                          disabled={vehicle.status === 'in_transit'}
                        >
                          {vehicle.status === 'available' ? 'Set to Maintenance' : 'Set Available'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Vehicle Types Reference</h2>
          <p className="text-gray-600 mb-6">
            Reference information for different types of vehicles that can be used for logistics spaces.
          </p>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle Type</TableHead>
                  <TableHead>Max Length (m)</TableHead>
                  <TableHead>Max Width (m)</TableHead>
                  <TableHead>Max Height (m)</TableHead>
                  <TableHead>Max Weight (kg)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {VEHICLE_TYPES.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell>{type.maxLength}</TableCell>
                    <TableCell>{type.maxWidth}</TableCell>
                    <TableCell>{type.maxHeight || "N/A"}</TableCell>
                    <TableCell>{type.maxWeight.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}