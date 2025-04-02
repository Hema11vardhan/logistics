import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, ExternalLink } from "lucide-react";

interface PaymentReceiptProps {
  transactionId: string;
  receipt: any;
  onViewTracking: () => void;
}

export default function PaymentReceipt({ transactionId, receipt, onViewTracking }: PaymentReceiptProps) {
  const [downloading, setDownloading] = useState(false);
  
  if (!receipt) return null;

  const handleDownload = () => {
    setDownloading(true);
    // In a real app, this would generate a PDF
    setTimeout(() => {
      setDownloading(false);
    }, 1000);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleString("en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  // In a real app, the blockchain explorer URL would depend on the network
  const blockchainExplorerUrl = receipt.blockchainTxHash 
    ? `https://etherscan.io/tx/${receipt.blockchainTxHash}`
    : null;

  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden">
      <div className="border-b border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Payment Receipt</h2>
          <Button variant="ghost" size="sm" onClick={handleDownload} disabled={downloading}>
            <FileText className="h-5 w-5" />
            {downloading ? "Downloading..." : "Download"}
          </Button>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-4">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Payment Successful</h3>
          <p className="text-sm text-gray-600">Transaction has been confirmed on the blockchain</p>
        </div>
        
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Transaction ID</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">
              {receipt.blockchainTxHash || "Processing..."}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {formatDate(receipt.date)}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {receipt.paymentMethod === "metamask" 
                ? `MetaMask (${receipt.currency})` 
                : receipt.paymentMethod === "upi" 
                  ? "UPI Payment" 
                  : "Credit/Debit Card"}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Amount</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {receipt.paymentMethod === "metamask" && receipt.currency === "ETH" 
                ? `0.431 ETH ($${receipt.amount.toFixed(2)})` 
                : `$${receipt.amount.toFixed(2)}`}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Space Token ID</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">
              {receipt.tokenId}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Shipping Details</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <p>Route: {receipt.space.source} → {receipt.space.destination}</p>
              <p>Vehicle: {receipt.space.vehicleType} (ID: TRK-{Math.floor(10000 + Math.random() * 90000)})</p>
              <p>Cargo: {receipt.customizationData.contentType} ({receipt.customizationData.weight.toLocaleString()} kg)</p>
              <p>Departure: {formatDate(receipt.space.departureDate || new Date(Date.now() + 86400000))}</p>
            </dd>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          {blockchainExplorerUrl && (
            <Button 
              variant="outline" 
              className="flex items-center justify-center"
              onClick={() => window.open(blockchainExplorerUrl, "_blank")}
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              View on Blockchain
            </Button>
          )}
          <Button 
            className="bg-[#8B5CF6] hover:bg-[#7c4df1] flex items-center justify-center"
            onClick={onViewTracking}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Track Shipment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
