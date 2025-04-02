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
import { Edit, Trash2, Search, User, Truck, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UserManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  
  // Query for users
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['/api/users'],
  });
  
  const handleEditUser = (userId: number) => {
    toast({
      title: "Edit User",
      description: `Edit functionality for user ID: ${userId} would be implemented here.`,
      variant: "default"
    });
  };
  
  const handleDeleteUser = (userId: number) => {
    toast({
      title: "Delete User",
      description: `Delete functionality for user ID: ${userId} would be implemented here.`,
      variant: "destructive"
    });
  };
  
  // Filter users based on search term and role filter
  const filteredUsers = users 
    ? users.filter((user: any) => {
        const matchesSearch = 
          searchTerm === "" || 
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        
        return matchesSearch && matchesRole;
      })
    : [];
  
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "user":
        return <User className="h-4 w-4 mr-2" />;
      case "logistics":
        return <Truck className="h-4 w-4 mr-2" />;
      case "developer":
        return <Code className="h-4 w-4 mr-2" />;
      default:
        return <User className="h-4 w-4 mr-2" />;
    }
  };
  
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "user":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center">
                {getRoleIcon(role)} User
               </Badge>;
      case "logistics":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 flex items-center">
                {getRoleIcon(role)} Logistics
               </Badge>;
      case "developer":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 flex items-center">
                {getRoleIcon(role)} Developer
               </Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          View and manage all users on the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">Users</SelectItem>
              <SelectItem value="logistics">Logistics</SelectItem>
              <SelectItem value="developer">Developers</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-[#8B5CF6] hover:bg-[#7c4df1]">
            Add User
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-10">
            <div className="spinner mb-4"></div>
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">
            Error loading users: {(error as Error).message}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No users found matching your criteria.</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Wallet Address</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {user.walletAddress 
                        ? `${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(user.walletAddress.length - 4)}`
                        : '-'}
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditUser(user.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
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
