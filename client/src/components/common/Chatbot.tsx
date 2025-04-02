import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      content: 'Hello! I\'m your BlockLogistics assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsBotTyping(true);
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(inputMessage);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: botResponse,
        timestamp: new Date()
      }]);
      setIsBotTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  // Mock bot responses based on user input
  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return 'Hello there! How can I assist you with your logistics needs today?';
    }
    
    if (lowerMessage.includes('track') || lowerMessage.includes('shipment') || lowerMessage.includes('tracking')) {
      return 'To track your shipment, please go to the Tracking section in your dashboard. You\'ll need your shipment ID or tracking number.';
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('rate')) {
      return 'Our pricing is calculated based on distance, weight, dimensions, and other factors. You can use the Find Shipping feature to get a quote for your specific needs.';
    }
    
    if (lowerMessage.includes('token') || lowerMessage.includes('blockchain') || lowerMessage.includes('crypto')) {
      return 'Our blockchain tokens represent verified logistics space. Each token contains information about the source, destination, dimensions, and other attributes of the space.';
    }
    
    if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('method')) {
      return 'We accept multiple payment methods including MetaMask (cryptocurrency), UPI, and major credit/debit cards. All transactions are secure and verified on the blockchain.';
    }
    
    if (lowerMessage.includes('cancel') || lowerMessage.includes('refund')) {
      return 'For cancellations and refunds, please visit the Payments section in your dashboard. Cancellation policies vary depending on the stage of your shipment.';
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return 'I\'m here to help! You can ask me questions about tracking, payments, blockchain, and more. For more complex issues, please contact our support team at support@blocklogistics.com.';
    }
    
    return 'I\'m not sure I understand. Could you provide more details or rephrase your question? You can ask about tracking shipments, payment methods, blockchain tokens, or general logistics inquiries.';
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {isOpen ? (
        <Card className="w-80 sm:w-96 h-[450px] flex flex-col shadow-xl">
          <CardHeader className="bg-[#8B5CF6] text-white py-3 px-4 flex justify-between items-center">
            <CardTitle className="text-base flex items-center">
              <Bot className="h-5 w-5 mr-2" />
              BlockLogistics Assistant
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white hover:bg-[#7c4df1]"
              onClick={toggleChatbot}
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="flex-grow p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={cn("flex", 
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "max-w-[80%] rounded-lg p-3",
                    message.role === 'user' 
                      ? "bg-[#8B5CF6] text-white rounded-br-none" 
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  )}>
                    <div className="flex items-start gap-2">
                      {message.role === 'bot' && (
                        <Bot className="h-5 w-5 mt-0.5 text-[#8B5CF6]" />
                      )}
                      <div>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {message.role === 'user' && (
                        <User className="h-5 w-5 mt-0.5 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isBotTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none max-w-[80%] p-3">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-5 w-5 text-[#8B5CF6]" />
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          <CardFooter className="border-t p-3">
            <form onSubmit={handleSendMessage} className="flex w-full gap-2">
              <Input
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-grow"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="bg-[#8B5CF6] hover:bg-[#7c4df1]"
                disabled={!inputMessage.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      ) : (
        <Button 
          className="bg-[#8B5CF6] hover:bg-[#7c4df1] text-white rounded-full p-4 shadow-lg flex items-center justify-center h-14 w-14"
          onClick={toggleChatbot}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
      
      <style>{`
        .typing-indicator {
          display: flex;
          align-items: center;
        }
        
        .typing-indicator span {
          height: 8px;
          width: 8px;
          background-color: #8B5CF6;
          border-radius: 50%;
          display: inline-block;
          margin-right: 3px;
          animation: bounce 1.3s linear infinite;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.15s;
        }
        
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.3s;
        }
        
        @keyframes bounce {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </div>
  );
}
