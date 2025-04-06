import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/lib/web3";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { CustomizationData } from "./SpaceCustomization";
import { useAuth } from "@/hooks/useAuth";
import { LogisticsSpace } from "@shared/schema";

interface PaymentGatewayProps {
  customizationData: CustomizationData | null;
  space: LogisticsSpace | null;
  onPaymentComplete: (transactionId: string, receipt: any) => void;
}

export default function PaymentGateway({ customizationData, space, onPaymentComplete }: PaymentGatewayProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { connectWallet, account, sendTransaction, loading: web3Loading } = useWeb3();
  const [paymentMethod, setPaymentMethod] = useState("metamask");
  const [token, setToken] = useState("ETH");
  const [upiId, setUpiId] = useState("");
  const [processing, setProcessing] = useState(false);

  if (!customizationData || !space) {
    return (
      <Card className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <CardContent className="p-6 text-center text-gray-500 py-10">
          Please customize your shipping space before proceeding to payment.
        </CardContent>
      </Card>
    );
  }

  const handleConnectWallet = async () => {
    await connectWallet();
  };

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to make a payment.",
        variant: "destructive"
      });
      return;
    }

    try {
      setProcessing(true);

      if (paymentMethod === "metamask" && !account) {
        await connectWallet();
        if (!account) {
          throw new Error("Failed to connect to MetaMask wallet");
        }
      }

      // Create shipment in the backend
      const shipmentData = await apiRequest("/api/shipments", {
        method: "POST",
        data: {
          logisticsSpaceId: customizationData.spaceId,
          userId: user.id,
          goodsType: customizationData.contentType,
          weight: customizationData.weight,
          length: customizationData.length,
          width: customizationData.width,
          height: customizationData.height,
          additionalServices: customizationData.additionalServices
        }
      });

      // Process payment
      let txHash = null;
      if (paymentMethod === "metamask") {
        // Simulate sending a blockchain transaction
        txHash = await sendTransaction({
          to: "0x7F3A9E2D5Ef6B63A3c65d6fE7fAfB34B9E5F1b3C", // Smart contract address
          value: customizationData.totalCost,
          // Don't stringify, pass as an object
          data: {
            tokenId: customizationData.tokenId,
            shipmentId: shipmentData.id
          }
        });

        if (!txHash) {
          throw new Error("Blockchain transaction failed");
        }
      }

      // Create transaction record in the backend
      const transactionData = await apiRequest("/api/transactions", {
        method: "POST",
        data: {
          shipmentId: shipmentData.id,
          amount: customizationData.totalCost,
          currency: paymentMethod === "metamask" ? token : "USD",
          paymentMethod: paymentMethod,
          paymentDetails: paymentMethod === "metamask" 
            ? { walletAddress: account } 
            : { upiId: upiId }
        }
      });

      // If blockchain transaction was successful, confirm it in our backend
      if (txHash) {
        await apiRequest(`/api/transactions/${transactionData.id}/confirm`, {
          method: "PATCH",
          data: {
            blockchainTxHash: txHash
          }
        });
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/spaces"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });

      // Create a receipt object
      const receipt = {
        transactionId: transactionData.id,
        blockchainTxHash: txHash,
        date: new Date(),
        paymentMethod: paymentMethod,
        amount: customizationData.totalCost,
        currency: paymentMethod === "metamask" ? token : "USD",
        tokenId: customizationData.tokenId,
        space: space,
        shipment: shipmentData,
        customizationData: customizationData
      };

      // Notify success
      toast({
        title: "Payment Successful",
        description: "Your shipment has been booked successfully.",
        variant: "default"
      });

      // Move to receipt view
      onPaymentComplete(transactionData.id, receipt);
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "An error occurred during payment processing.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  // Format departure date for display
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "Flexible";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden mb-8">
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Options</h2>
        <p className="text-gray-600 mb-6">Complete your blockchain-secured logistics transaction.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Methods */}
          <div>
            <div className="mb-6">
              <h3 className="text-base font-medium text-gray-900 mb-2">Select Payment Method</h3>
              
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  <div className={`relative border rounded-md px-3 py-2 flex cursor-pointer ${paymentMethod === "metamask" ? "bg-gray-50 border-[#8B5CF6]" : "hover:bg-gray-50"}`}>
                    <RadioGroupItem value="metamask" id="metamask" />
                    <Label htmlFor="metamask" className="ml-3 flex flex-col">
                      <span className="block text-sm font-medium text-gray-900">MetaMask</span>
                      <span className="block text-sm text-gray-500">Pay with Ethereum or other tokens</span>
                    </Label>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                    </svg>
                  </div>
                  
                  <div className={`relative border rounded-md px-3 py-2 flex cursor-pointer ${paymentMethod === "upi" ? "bg-gray-50 border-[#8B5CF6]" : "hover:bg-gray-50"}`}>
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="ml-3 flex flex-col">
                      <span className="block text-sm font-medium text-gray-900">UPI Payment</span>
                      <span className="block text-sm text-gray-500">Pay using UPI ID</span>
                    </Label>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            {/* MetaMask Payment Form */}
            {paymentMethod === "metamask" && (
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">MetaMask Payment Details</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="block text-xs text-gray-500 mb-1">Connected Wallet</Label>
                    <div className="flex items-center justify-between bg-white border border-gray-300 rounded-md px-3 py-2">
                      {account ? (
                        <>
                          <span className="font-mono text-sm">{account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Connected</span>
                        </>
                      ) : (
                        <div className="w-full flex justify-between items-center">
                          <span className="text-sm text-gray-500">No wallet connected</span>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={handleConnectWallet}
                            disabled={web3Loading}
                          >
                            {web3Loading ? "Connecting..." : "Connect"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="block text-xs text-gray-500 mb-1">Payment Token</Label>
                    <Select value={token} onValueChange={setToken}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select token" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ETH">ETH - Ethereum</SelectItem>
                        <SelectItem value="USDT">USDT - Tether</SelectItem>
                        <SelectItem value="USDC">USDC - USD Coin</SelectItem>
                        <SelectItem value="DAI">DAI - Dai Stablecoin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="block text-xs text-gray-500 mb-1">Amount</Label>
                    <div className="flex items-center justify-between bg-white border border-gray-300 rounded-md px-3 py-2">
                      <span className="text-sm">{token === "ETH" ? "0.431" : customizationData.totalCost.toFixed(2)} {token}</span>
                      <span className="text-sm text-gray-500">≈ ${customizationData.totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* UPI Payment Form */}
            {paymentMethod === "upi" && (
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">UPI Payment Details</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="block text-xs text-gray-500 mb-1">UPI ID</Label>
                    <Input 
                      type="text" 
                      placeholder="yourname@upi" 
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Example: username@okbank</p>
                  </div>
                  <div>
                    <Label className="block text-xs text-gray-500 mb-1">Amount</Label>
                    <div className="flex items-center justify-between bg-white border border-gray-300 rounded-md px-3 py-2">
                      <span className="text-sm">${customizationData.totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            

          </div>
          
          {/* Order Summary */}
          <div className="bg-gray-50 p-6 rounded-md">
            <h3 className="text-base font-medium text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Route:</span>
                <span className="text-sm text-gray-900">{space.source} → {space.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Vehicle Type:</span>
                <span className="text-sm text-gray-900">{space.vehicleType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cargo Space:</span>
                <span className="text-sm text-gray-900">
                  {customizationData.length}m × {customizationData.width}m × {customizationData.height}m 
                  ({(customizationData.length * customizationData.width * customizationData.height).toFixed(2)} m³)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Weight:</span>
                <span className="text-sm text-gray-900">{customizationData.weight.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Shipment Date:</span>
                <span className="text-sm text-gray-900">{formatDate(space.departureDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Token ID:</span>
                <span className="text-sm font-mono text-gray-900">{space.tokenId}</span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Base Price:</span>
                  <span className="text-sm text-gray-900">${space.price.toFixed(2)}</span>
                </div>
                {customizationData.additionalServices.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Services:</span>
                    <span className="text-sm text-gray-900">
                      ${(customizationData.totalCost - space.price).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between mt-4">
                  <span className="text-base font-medium text-gray-900">Total:</span>
                  <span className="text-base font-medium text-gray-900">${customizationData.totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full bg-[#8B5CF6] hover:bg-[#7c4df1]"
              onClick={handlePayment}
              disabled={
                processing || 
                (paymentMethod === "metamask" && !account) || 
                (paymentMethod === "upi" && !upiId)
              }
            >
              {processing ? "Processing..." : "Confirm Payment"}
            </Button>
            
            <p className="mt-4 text-xs text-gray-500 text-center">
              By confirming, you agree to our <a href="#" className="text-[#8B5CF6] hover:text-[#7c4df1]">Terms of Service</a> and acknowledge our <a href="#" className="text-[#8B5CF6] hover:text-[#7c4df1]">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
