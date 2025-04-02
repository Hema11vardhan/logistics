import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FcGoogle } from "react-icons/fc";
// Using FaEthereum instead of SiMetamask as it's more widely available
import { FaEthereum } from "react-icons/fa";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type RoleType = "user" | "logistics" | "developer";

interface LoginFormProps {
  onRoleChange: (role: RoleType) => void;
  currentRole: RoleType;
  onTabChange: (tab: "login" | "signup") => void;
}

export default function LoginForm({ onRoleChange, currentRole, onTabChange }: LoginFormProps) {
  const { login, loginWithGoogle, loginWithMetaMask, loading } = useAuth();
  const [formError, setFormError] = useState("");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setFormError("");
    const success = await login(data.username, data.password);
    if (!success) {
      setFormError("Invalid username or password. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  const handleMetaMaskLogin = async () => {
    await loginWithMetaMask();
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
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
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
                  <Input type="password" placeholder="Enter your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">Remember me</FormLabel>
                </FormItem>
              )}
            />
            <a href="#" className="text-sm font-medium text-[#8B5CF6] hover:text-[#7c4df1]">
              Forgot password?
            </a>
          </div>

          {formError && (
            <div className="text-sm text-red-500 mt-2">{formError}</div>
          )}

          <Button
            type="submit"
            className="w-full bg-[#8B5CF6] hover:bg-[#7c4df1]"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Form>

      <div className="relative mt-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex items-center justify-center"
        >
          <FcGoogle className="h-5 w-5 mr-2" />
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleMetaMaskLogin}
          disabled={loading}
          className="flex items-center justify-center"
        >
          <FaEthereum className="h-5 w-5 mr-2 text-orange-500" />
          MetaMask
        </Button>
      </div>
      
      <div className="text-center text-sm">
        <span className="text-gray-600">Don't have an account?</span>{" "}
        <button 
          type="button" 
          className="text-[#8B5CF6] hover:text-[#7c4df1] font-medium"
          onClick={() => onTabChange("signup")}
        >
          Sign up
        </button>
      </div>
    </div>
  );
}
