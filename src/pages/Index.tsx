import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Sparkles, Phone, Clock, MapPin, Instagram, Youtube, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "🙏 Namaste! Welcome to Shree Alankar - Your trusted jewelry partner since 1998. How may I assist you today?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Apply dark theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const quickQuestions = [
    "What are your business hours?",
    "Do you offer custom jewelry design?",
    "How often are gold and silver rates updated?",
    "Do you provide jewelry valuation services?",
    "What types of jewelry do you sell?",
    "Do you offer gold coins and bars?",
    "What is your return policy?",
    "Do you provide jewelry repair services?"
  ];

  const predefinedQuestions = [
    "What are your business hours?",
    "Do you offer custom jewelry design?",
    "How often are gold and silver rates updated?",
    "Do you provide jewelry valuation services?",
    "What types of jewelry do you sell?",
    "Do you offer gold coins and bars?",
    "What is your return policy?",
    "Do you provide jewelry repair services?",
    "How can I check current gold rates?",
    "Do you offer wedding jewelry collections?",
    "What certifications do you provide?",
    "Do you offer online shopping?",
  ];

  const getResponse = (question: string): string => {
    const responses: { [key: string]: string } = {
      "What are your business hours?": "We are open Monday to Saturday from 10:00 AM to 8:00 PM, and on Sundays from 11:00 AM to 6:00 PM. We're located near Bank Of Maharashtra, Lohoner 423301.",
      "Do you offer custom jewelry design?": "Yes, we offer custom jewelry design services! Please visit our store or contact us to discuss your requirements. Our experienced craftsmen can create unique pieces tailored to your preferences.",
      "How often are gold and silver rates updated?": "Our rates are updated daily based on market fluctuations. You can always check the latest rates on our homepage or call us at 9921612155 for current pricing.",
      "Do you provide jewelry valuation services?": "Yes, we provide jewelry valuation services. Please bring your items to our store during business hours for professional assessment.",
      "What types of jewelry do you sell?": "We offer a wide range of jewelry including gold ornaments, silver jewelry, diamond pieces, traditional Indian jewelry, modern designs, rings, necklaces, earrings, bracelets, and more.",
      "Do you offer gold coins and bars?": "Yes, we deal in gold coins and bars of various weights and purities. Please visit our store or contact us for current availability and pricing.",
      "What is your return policy?": "We have a customer-friendly return policy. Please contact us at 9921612155 or visit our store to discuss specific return requirements for your purchase.",
      "Do you provide jewelry repair services?": "Yes, we provide professional jewelry repair and maintenance services. Our skilled craftsmen can handle various types of repairs and restorations.",
      "How can I check current gold rates?": "You can check current gold and silver rates by visiting our website, calling us at 9921612155, or visiting our store. Rates are updated daily.",
      "Do you offer wedding jewelry collections?": "Absolutely! We specialize in wedding jewelry collections including bridal sets, mangalsutras, bangles, and complete bridal jewelry ensembles.",
      "What certifications do you provide?": "We provide proper certifications and bills for all our jewelry purchases. For precious stones and diamonds, we also provide relevant quality certificates.",
      "Do you offer online shopping?": "Currently, we recommend visiting our store for the best experience. However, you can contact us at 9921612155 to discuss specific requirements and availability.",
    };

    return responses[question] || "Thank you for your question! For detailed information, please contact us at 9921612155 or visit our store near Bank Of Maharashtra, Lohoner 423301. Our team will be happy to assist you personally.";
  };

  const isGreeting = (text: string): boolean => {
    const greetings = ['hi', 'hello', 'hey', 'namaste', 'good morning', 'good afternoon', 'good evening'];
    return greetings.some(greeting => text.toLowerCase().includes(greeting));
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = '+919921612155';
    const message = 'Hello! I need assistance with jewelry inquiries from Shree Alankar website.';
    const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: text,
      isUser: true,
      timestamp: new Date(),
    };

    let botResponse: Message;

    // Check if it's a greeting
    if (isGreeting(text)) {
      botResponse = {
        id: messages.length + 2,
        text: "🙏 Hello! Welcome to Shree Alankar! I'm here to help you with all your jewelry needs. Please feel free to ask any questions or select from the quick questions below.",
        isUser: false,
        timestamp: new Date(),
      };
      setShowQuickQuestions(true);
    } else {
      botResponse = {
        id: messages.length + 2,
        text: getResponse(text),
        isUser: false,
        timestamp: new Date(),
      };
      setShowQuickQuestions(false);
    }

    setMessages(prev => [...prev, userMessage, botResponse]);
    setInputText('');
  };

  const handleQuestionClick = (question: string) => {
    handleSendMessage(question);
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Shree Alankar</h1>
                <p className="text-primary-foreground/80 text-sm">Fine Jewelry Seller Since 1998</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <div className="flex items-center space-x-2">
                <Sun className="w-4 h-4" />
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={setIsDarkMode}
                />
                <Moon className="w-4 h-4" />
              </div>
              
              {/* WhatsApp Customer Support */}
              <Badge 
                variant="secondary" 
                className="bg-green-500 text-white hover:bg-green-600 cursor-pointer transition-colors"
                onClick={handleWhatsAppClick}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Customer Support
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <Card className="mb-8 bg-gradient-to-r from-amber-600 to-amber-700 text-white border-none shadow-2xl">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">Welcome to Shree Alankar ChatBot Assistant</h2>
              <p className="text-amber-100 text-lg mb-6">
                Your 24/7 customer support for all jewelry-related queries
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center">
                  <Phone className="w-8 h-8 mb-2 text-amber-200" />
                  <p className="text-sm">Contact: 9921612155</p>
                </div>
                <div className="flex flex-col items-center">
                  <MapPin className="w-8 h-8 mb-2 text-amber-200" />
                  <p className="text-sm">Near Bank Of Maharashtra, Lohoner</p>
                </div>
                <div className="flex flex-col items-center">
                  <Clock className="w-8 h-8 mb-2 text-amber-200" />
                  <p className="text-sm">Mon-Sat: 10AM-8PM, Sun: 11AM-6PM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chat Window */}
            <div className="lg:col-span-2">
              <Card className="h-[600px] shadow-xl border-border bg-card">
                <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4 rounded-t-lg">
                  <h3 className="text-xl font-semibold flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Chat with Shree Alankar Assistant
                  </h3>
                </div>
                
                <ScrollArea className="h-[440px] p-4" ref={scrollAreaRef}>
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg shadow-md ${
                            message.isUser
                              ? 'bg-amber-600 text-white'
                              : 'bg-muted border border-border text-foreground'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <p className={`text-xs mt-1 ${
                            message.isUser ? 'text-amber-100' : 'text-muted-foreground'
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Quick Questions in Chat */}
                    {showQuickQuestions && (
                      <div className="flex justify-start">
                        <div className="max-w-[90%] bg-muted border border-border rounded-lg p-4 shadow-md">
                          <p className="text-sm text-foreground font-medium mb-3">
                            💡 Quick Questions - Click to ask:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {quickQuestions.map((question, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="text-xs border-border hover:bg-accent hover:text-accent-foreground h-8"
                                onClick={() => handleQuestionClick(question)}
                              >
                                {question}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t border-border">
                  <div className="flex space-x-2">
                    <Input
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                      className="flex-1 border-border focus:border-ring bg-background"
                    />
                    <Button
                      onClick={() => handleSendMessage(inputText)}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Questions & Info */}
            <div className="space-y-6">
              {/* Quick Questions */}
              <Card className="shadow-xl border-border bg-card">
                <div className="bg-muted p-4 rounded-t-lg">
                  <h3 className="text-lg font-semibold text-foreground">All Questions</h3>
                </div>
                <CardContent className="p-4">
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {predefinedQuestions.map((question, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full text-left justify-start text-sm border-border hover:bg-accent hover:text-accent-foreground"
                          onClick={() => handleQuestionClick(question)}
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Social Media & Links */}
              <Card className="shadow-xl border-border bg-card">
                <div className="bg-muted p-4 rounded-t-lg">
                  <h3 className="text-lg font-semibold text-foreground">Connect With Us</h3>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <a
                      href="https://shreealankar.lovable.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-amber-50 dark:bg-amber-950 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors"
                    >
                      <Sparkles className="w-5 h-5 text-amber-600 mr-3" />
                      <div>
                        <p className="font-medium text-amber-900 dark:text-amber-100">Visit Our Website</p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">shreealankar.lovable.app</p>
                      </div>
                    </a>
                    
                    <a
                      href="https://www.instagram.com/shreealankar2112"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-pink-50 dark:bg-pink-950 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900 transition-colors"
                    >
                      <Instagram className="w-5 h-5 text-pink-600 mr-3" />
                      <div>
                        <p className="font-medium text-pink-900 dark:text-pink-100">Follow on Instagram</p>
                        <p className="text-sm text-pink-700 dark:text-pink-300">@shreealankar2112</p>
                      </div>
                    </a>
                    
                    <a
                      href="http://www.youtube.com/@Shreealankar2112"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-red-50 dark:bg-red-950 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                    >
                      <Youtube className="w-5 h-5 text-red-600 mr-3" />
                      <div>
                        <p className="font-medium text-red-900 dark:text-red-100">Subscribe YouTube</p>
                        <p className="text-sm text-red-700 dark:text-red-300">@Shreealankar2112</p>
                      </div>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Shree Alankar</h3>
            <p className="text-primary-foreground/80 mb-4">Fine Jewelry Seller Since 1998</p>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-8 text-sm">
              <p>📍 Near Bank Of Maharashtra, Lohoner 423301</p>
              <p>📞 Contact: 9921612155</p>
              <p>🕒 Mon-Sat: 10AM-8PM | Sun: 11AM-6PM</p>
            </div>
            <div className="mt-6 pt-6 border-t border-primary-foreground/20">
              <p className="text-primary-foreground/60 text-sm">© 2024 Shree Alankar. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
