import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-react';

interface Message {
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

const ChatAgent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const generateAIResponse = (userMessage: string): Promise<string> => {
    // Simulate API call delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('token') || lowerMessage.includes('nft')) {
          resolve("KALI's tokenization process allows for fractional ownership of real estate properties. Each property is represented as an NFT, enabling secure and transparent transactions on the blockchain. Would you like to know more about our tokenization standards?");
        } else if (lowerMessage.includes('rent') || lowerMessage.includes('lease')) {
          resolve("Our rental contracts are fully automated through smart contracts, ensuring transparent and secure rental agreements. Tenants can pay rent in stablecoins, and property owners receive payments automatically. Would you like to explore our rental properties?");
        } else if (lowerMessage.includes('invest') || lowerMessage.includes('property')) {
          resolve("KALI offers various investment opportunities, from fractional ownership to full property investment. Our platform provides detailed market analysis and property valuation tools. Would you like to see our current investment opportunities?");
        } else if (lowerMessage.includes('market') || lowerMessage.includes('trend')) {
          resolve("Our platform provides real-time market analysis and trends across different regions. We use AI to analyze property values, rental yields, and market movements. Would you like to see the latest market insights?");
        } else if (lowerMessage.includes('security') || lowerMessage.includes('safe')) {
          resolve("KALI implements bank-grade security measures, including blockchain technology and smart contracts. All transactions are immutable and transparent. Would you like to learn more about our security features?");
        } else {
          resolve("I'm your KALI real estate advisor. I can help you with property investment, tokenization, rental management, and market analysis. What specific aspect of real estate are you interested in?");
        }
      }, 1500);
    });
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      const userMessage: Message = {
        text: inputMessage,
        sender: 'user',
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      setIsLoading(true);

      try {
        const aiResponse = await generateAIResponse(inputMessage);
        const aiMessage: Message = {
          text: aiResponse,
          sender: 'ai',
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error('Error generating response:', error);
        const errorMessage: Message = {
          text: "I apologize, but I'm having trouble processing your request. Please try again or contact our support team.",
          sender: 'ai',
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="chat-agent-container">
      {!isOpen ? (
        <button 
          className="chat-agent-button"
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare size={24} />
          <span>Ask KALI Advisor</span>
        </button>
      ) : (
        <div className="chat-agent-window">
          <div className="chat-agent-header">
            <div className="chat-agent-title">
              <Bot size={20} />
              <span>KALI AI Advisor</span>
            </div>
            <button 
              className="chat-agent-close"
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="chat-agent-messages">
            {messages.length === 0 ? (
              <div className="chat-agent-welcome">
                <p>Hello! I'm your KALI real estate advisor. How can I help you today?</p>
                <p>You can ask me about:</p>
                <ul>
                  <li>Property tokenization and NFTs</li>
                  <li>Rental management and contracts</li>
                  <li>Investment opportunities</li>
                  <li>Market trends and analysis</li>
                  <li>Security and blockchain features</li>
                </ul>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div 
                    key={message.timestamp} 
                    className={`chat-message ${message.sender}`}
                  >
                    {message.text}
                  </div>
                ))}
                {isLoading && (
                  <div className="chat-message ai loading">
                    <Loader2 className="animate-spin" size={20} />
                    <span>KALI is analyzing your request...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          
          <div className="chat-agent-input">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about KALI real estate..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
            />
            <button 
              className="chat-agent-send"
              onClick={handleSendMessage}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatAgent; 