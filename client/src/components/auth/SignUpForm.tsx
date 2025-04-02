import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useWeb3 } from "@/lib/web3";

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  companyName: z.string().optional(),
  registrationNumber: z.string().optional(),
  connectWallet: z.boolean().optional(),
})
.refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof signupSchema>;

type RoleType = "user" | "logistics" | "developer";

interface SignUpFormProps {
  onRoleChange: (role: RoleType) => void;
  currentRole: RoleType;
  onTabChange: (tab: "login" | "signup") => void;
}

export default function SignUpForm({ onRoleChange, currentRole, onTabChange }: SignUpFormProps) {
  const { register, loading } = useAuth();
  const { connectWallet, account, loading: walletLoading } = useWeb3();
  const [formError, setFormError] = useState("");

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      registrationNumber: "",
      connectWallet: false,
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    setFormError("");

    // If logistics company, ensure company fields are filled
    if (currentRole === "logistics" && (!data.companyName || !data.registrationNumber)) {
      setFormError("Company name and registration number are required for logistics companies");
      return;
    }

    try {
      // If user wants to connect wallet, ensure it's connected
      let walletAddress = undefined;
      if (data.connectWallet) {
        if (!account) {
          await connectWallet();
        }
        walletAddress = account || undefined;
      }

      const success = await register({
        username: data.username,
        password: data.password,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: currentRole,
        walletAddress,
      });

      if (!success) {
        setFormError("Registration failed. Please try again.");
      }
    } catch (error) {
      setFormError("An error occurred during registration.");
    }
  };

  const handleConnectWallet = async () => {
    await connectWallet();
    form.setValue("connectWallet", true);
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Role Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">I am a:</label>
        <div className="flex space-x-4">
          <Button
            type="button"
            variant={currentRole === "user" ? "default" : "outline"}
            className={currentRole === "user" ? "flex-1 bg-[#8B5CF6] hover:bg-[#7c4df1]" : "flex-1"}
            onClick={() => onRoleChange("user")}
          >
            User
          </Button>
          <Button
            type="button"
            variant={currentRole === "logistics" ? "default" : "outline"}
            className={currentRole === "logistics" ? "flex-1 bg-[#8B5CF6] hover:bg-[#7c4df1]" : "flex-1"}
            onClick={() => onRoleChange("logistics")}
          >
            Logistics Company
          </Button>
          <Button
            type="button"
            variant={currentRole === "developer" ? "default" : "outline"}
            className={currentRole === "developer" ? "flex-1 bg-[#8B5CF6] hover:bg-[#7c4df1]" : "flex-1"}
            onClick={() => onRoleChange("developer")}
          >
            Developer
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="First name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Create a password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Confirm your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {currentRole === "logistics" && (
            <div className="space-y-4" id="company-fields">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter registration number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-700">Connect Blockchain Wallet</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleConnectWallet}
                disabled={walletLoading || !!account}
              >
                {account ? "Wallet Connected" : walletLoading ? "Connecting..." : "Connect MetaMask"}
              </Button>
            </div>
            {account && (
              <p className="text-xs text-gray-500 overflow-hidden text-ellipsis">
                Wallet address: {account}
              </p>
            )}
          </div>

          {formError && (
            <div className="text-sm text-red-500 mt-2">{formError}</div>
          )}

          <Button
            type="submit"
            className="w-full bg-[#8B5CF6] hover:bg-[#7c4df1]"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </Form>
      
      <div className="text-center text-sm">
        <span className="text-gray-600">Already have an account?</span>{" "}
        <button 
          type="button" 
          className="text-[#8B5CF6] hover:text-[#7c4df1] font-medium"
          onClick={() => onTabChange("login")}
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
