import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageCircle, Sparkles, Phone, Clock, MapPin, Instagram, Youtube, Moon, Sun, RotateCcw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCustomer } from '@/contexts/CustomerContext';
import CustomerNameSelector from '@/components/CustomerNameSelector';
import LanguageSelector from '@/components/LanguageSelector';
import LoadingAnimation from '@/components/LoadingAnimation';
import OwnerLogin from '@/components/OwnerLogin';
import OwnerDashboard from '@/components/OwnerDashboard';
import { useRates } from '@/hooks/useRates';
import { useAIChat } from '@/hooks/useAIChat';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

const Index = () => {
  // ALL HOOKS MUST BE DECLARED AT THE TOP - NO CONDITIONAL CALLS
  const { t } = useLanguage();
  const { customerName, setCustomerName } = useCustomer();
  const { rates, isLoading: ratesLoading, refetchRates } = useRates();
  const { sendAIMessage, isLoading: aiLoading, conversationHistory, clearConversationHistory } = useAIChat();
  
  // ALL STATE HOOKS
  const [showNameSelector, setShowNameSelector] = useState(true);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const [showOtherQuestions, setShowOtherQuestions] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [showOwnerLogin, setShowOwnerLogin] = useState(false);
  const [showOwnerDashboard, setShowOwnerDashboard] = useState(false);
  
  // ALL REF HOOKS
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // ALL CALLBACK HOOKS
  const handleNameSubmit = useCallback((name: string) => {
    setCustomerName(name);
    setShowNameSelector(false);
    setShowLoading(true);
  }, [setCustomerName]);

  const handleLoadingComplete = useCallback(() => {
    setShowLoading(false);
    setShowLanguageSelector(true);
  }, []);

  const handleLanguageSelectionComplete = useCallback(() => {
    setShowLanguageSelector(false);
  }, []);

  const initializeMessages = useCallback(() => {
    if (customerName && !showNameSelector && !showLanguageSelector && !showLoading) {
      const personalizedGreeting = t('chat.greeting').replace('{{name}}', customerName) || 
        `Hello ${customerName}! Welcome to Shree Alankar. How can I assist you today?`;
      
      setMessages([{
        id: 1,
        text: personalizedGreeting,
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, [customerName, showNameSelector, showLanguageSelector, showLoading, t]);

  // ALL EFFECT HOOKS
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    initializeMessages();
  }, [initializeMessages]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  // NOW WE CAN DO CONDITIONAL RENDERING AFTER ALL HOOKS ARE DECLARED
  if (showNameSelector) {
    return <CustomerNameSelector onNameSubmit={handleNameSubmit} />;
  }

  if (showLoading) {
    return <LoadingAnimation onComplete={handleLoadingComplete} />;
  }

  if (showLanguageSelector) {
    return <LanguageSelector onLanguageSelect={handleLanguageSelectionComplete} />;
  }

  // Initial 4 quick questions
  const initialQuickQuestions = [t('question.hours'), t('question.custom'), t('question.rates'), t('question.valuation')];
  
  // Other 4 questions
  const otherQuickQuestions = [t('question.types'), t('question.coins'), t('question.return'), t('question.repair')];
  
  const predefinedQuestions = [t('question.hours'), t('question.custom'), t('question.rates'), t('question.valuation'), t('question.types'), t('question.coins'), t('question.return'), t('question.repair'), t('question.checkRates'), t('question.wedding'), t('question.certificates'), t('question.online')];

  const isRateQuery = (text: string): boolean => {
    const rateKeywords = [
      'gold rate', 'silver rate', 'today rate', 'current rate', 'price',
      'सोन्याचा दर', 'चांदीचा दर', 'आजचा दर', 'किंमत', 'भाव',
      'gold price', 'silver price', 'today price', 'current price'
    ];
    return rateKeywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
  };

  const isSocialMediaQuery = (text: string): boolean => {
    const socialKeywords = [
      'instagram', 'youtube', 'social media', 'follow', 'subscribe',
      'इंस्टाग्राम', 'यूट्यूब', 'सोशल मीडिया'
    ];
    return socialKeywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
  };

  const getCurrentRates = () => {
    return {
      message: `🌐 **For current gold and silver rates, please visit our website:**\n\nhttps://shreealankar.lovable.app/\n\n📱 **Follow us on social media:**\n📸 Instagram: https://www.instagram.com/shreealankar2112/#\n📺 YouTube: https://www.youtube.com/@Shreealankar2112\n🗺️ Google Maps: https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s?authuser=0&entry=ttu&g_ep=EgoyMDI1MDcwOC4wIKXMDSoASAFQAw%3D%3D`,
      marathi: `🌐 **सध्याच्या सोने आणि चांदीच्या दरांसाठी, कृपया आमची वेबसाइट भेट द्या:**\n\nhttps://shreealankar.lovable.app/\n\n📱 **सोशल मीडियावर आमचे अनुसरण करा:**\n📸 Instagram: https://www.instagram.com/shreealankar2112/#\n📺 YouTube: https://www.youtube.com/@Shreealankar2112\n🗺️ Google Maps: https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s?authuser=0&entry=ttu&g_ep=EgoyMDI1MDcwOC4wIKXMDSoASAFQAw%3D%3D`
    };
  };

  const getSocialMediaResponse = () => {
    return {
      message: `📱 **Follow Shree Alankar on Social Media:**\n\n📸 **Instagram:** https://www.instagram.com/shreealankar2112/#\n📺 **YouTube:** https://www.youtube.com/@Shreealankar2112\n🗺️ **Google Maps:** https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s?authuser=0&entry=ttu&g_ep=EgoyMDI1MDcwOC4wIKXMDSoASAFQAw%3D%3D\n\n🌐 **Website:** https://shreealankar.lovable.app/\n\n📞 **Contact:** +91 9921612155`,
      marathi: `📱 **सोशल मीडियावर श्री अलंकार चे अनुसरण करा:**\n\n📸 **Instagram:** https://www.instagram.com/shreealankar2112/#\n📺 **YouTube:** https://www.youtube.com/@Shreealankar2112\n🗺️ **Google Maps:** https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s?authuser=0&entry=ttu&g_ep=EgoyMDI1MDcwOC4wIKXMDSoASAFQAw%3D%3D\n\n🌐 **वेबसाइट:** https://shreealankar.lovable.app/\n\n📞 **संपर्क:** +91 9921612155`
    };
  };

  const getResponse = async (question: string): Promise<string> => {
    // Check if it's a rate-related query
    if (isRateQuery(question)) {
      const rateInfo = getCurrentRates();
      return rateInfo.message;
    }

    // Check if it's a social media query
    if (isSocialMediaQuery(question)) {
      const socialInfo = getSocialMediaResponse();
      return socialInfo.message;
    }

    // Check if it's a predefined question
    const responses: { [key: string]: string } = {
      [t('question.hours')]: t('response.hours'),
      [t('question.custom')]: t('response.custom'),
      [t('question.rates')]: t('response.rates'),
      [t('question.valuation')]: t('response.valuation'),
      [t('question.types')]: t('response.types'),
      [t('question.coins')]: t('response.coins'),
      [t('question.return')]: t('response.return'),
      [t('question.repair')]: t('response.repair'),
      [t('question.checkRates')]: t('response.checkRates'),
      [t('question.wedding')]: t('response.wedding'),
      [t('question.certificates')]: t('response.certificates'),
      [t('question.online')]: t('response.online')
    };

    // If it's a predefined question, return the predefined response
    if (responses[question]) {
      return responses[question];
    }

    // For all other questions, use AI with conversation context and customer name
    console.log('Using Advanced Conversational Gemini AI for question:', question);
    try {
      const aiResponse = await sendAIMessage(question, customerName);
      return aiResponse;
    } catch (error) {
      console.error('Advanced Conversational AI error handling:', error);
      return t('language') === 'marathi' 
        ? 'तांत्रिक अडचण झाली आहे. कृपया पुन्हा प्रयत्न करा.'
        : 'Technical difficulty occurred. Please try again.';
    }
  };

  const isGreeting = (text: string): boolean => {
    const greetings = ['hi', 'hello', 'hey', 'namaste', 'good morning', 'good afternoon', 'good evening', 'नमस्कार', 'हॅलो'];
    return greetings.some(greeting => text.toLowerCase().includes(greeting));
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = '+919921612155';
    const message = `Hello! I'm ${customerName}. I need assistance with jewelry inquiries from Shree Alankar website.`;
    const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleClearChat = () => {
    const personalizedGreeting = t('chat.greeting').replace('{{name}}', customerName) || 
      `Hello ${customerName}! Welcome to Shree Alankar. How can I assist you today?`;
    
    setMessages([{
      id: 1,
      text: personalizedGreeting,
      isUser: false,
      timestamp: new Date()
    }]);
    clearConversationHistory();
    setShowQuickQuestions(true);
    setShowOtherQuestions(false);
    setInputText('');
  };

  const typeMessage = async (text: string, messageId: number) => {
    const words = text.split(' ');
    let currentText = '';

    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, text: currentText + '|', isTyping: true }
          : msg
      ));

      const wordLength = words[i].length;
      const baseDelay = 40;
      const wordDelay = Math.max(20, baseDelay - wordLength * 2);
      await new Promise(resolve => setTimeout(resolve, wordDelay));
    }

    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, text: text, isTyping: false }
        : msg
    ));
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isMessageLoading) return;
    
    if (isRateQuery(text)) {
      refetchRates();
    }
    
    const userMessage: Message = {
      id: messages.length + 1,
      text: text,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsMessageLoading(true);

    const loadingMessage: Message = {
      id: messages.length + 2,
      text: '...',
      isUser: false,
      timestamp: new Date(),
      isTyping: true
    };

    setMessages(prev => [...prev, loadingMessage]);

    await new Promise(resolve => setTimeout(resolve, 1000));

    let botResponseText: string;
    let shouldShowQuickQuestions = false;
    let shouldShowOtherQuestions = false;

    if (isGreeting(text)) {
      const personalizedHello = t('chat.hello').replace('{{name}}', customerName) || 
        `Hello ${customerName}! How can I help you today?`;
      botResponseText = personalizedHello;
      shouldShowQuickQuestions = true;
      shouldShowOtherQuestions = false;
    } else {
      botResponseText = await getResponse(text);
      shouldShowQuickQuestions = false;
      shouldShowOtherQuestions = false;
    }

    await typeMessage(botResponseText, loadingMessage.id);

    setShowQuickQuestions(shouldShowQuickQuestions);
    setShowOtherQuestions(shouldShowOtherQuestions);
    setIsMessageLoading(false);
  };

  const handleQuestionClick = async (question: string) => {
    if (isMessageLoading) return;
    
    const userMessage: Message = {
      id: messages.length + 1,
      text: question,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsMessageLoading(true);

    const loadingMessage: Message = {
      id: messages.length + 2,
      text: '...',
      isUser: false,
      timestamp: new Date(),
      isTyping: true
    };

    setMessages(prev => [...prev, loadingMessage]);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const botResponseText = await getResponse(question);

    await typeMessage(botResponseText, loadingMessage.id);

    setShowQuickQuestions(false);
    setShowOtherQuestions(false);
    setIsMessageLoading(false);
  };

  const handleOtherClick = async () => {
    if (isMessageLoading) return;
    
    const userMessage: Message = {
      id: messages.length + 1,
      text: t('language') === 'marathi' ? 'इतर' : 'Other',
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsMessageLoading(true);

    const loadingMessage: Message = {
      id: messages.length + 2,
      text: '...',
      isUser: false,
      timestamp: new Date(),
      isTyping: true
    };

    setMessages(prev => [...prev, loadingMessage]);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const botResponseText = t('language') === 'marathi' 
      ? `${customerName} जी, येथे आणखी काही प्रश्न आहेत जे तुम्ही विचारू शकता:` 
      : `${customerName}, here are some more questions you can ask:`;

    await typeMessage(botResponseText, loadingMessage.id);

    setShowOtherQuestions(true);
    setShowQuickQuestions(false);
    setIsMessageLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Owner Login Modal */}
      {showOwnerLogin && (
        <OwnerLogin
          onClose={() => setShowOwnerLogin(false)}
          onLoginSuccess={() => {
            setShowOwnerLogin(false);
            setShowOwnerDashboard(true);
          }}
        />
      )}

      {/* Owner Dashboard Modal */}
      {showOwnerDashboard && (
        <OwnerDashboard onClose={() => setShowOwnerDashboard(false)} />
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/lovable-uploads/df89ad8d-4e94-4d53-813b-4e057004190e.png" alt="Shree Alankar Logo" className="w-12 h-12 object-contain" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{t('header.title')}</h1>
                <p className="text-primary-foreground/80 text-sm">
                  {customerName ? `Welcome ${customerName}! ${t('header.subtitle')}` : t('header.subtitle')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {ratesLoading && (
                <Badge variant="secondary" className="bg-blue-500 text-white">
                  <Clock className="w-4 h-4 mr-1 animate-spin" />
                  Updating Rates...
                </Badge>
              )}
              
              {aiLoading && (
                <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse">
                  <Sparkles className="w-4 h-4 mr-1 animate-spin" />
                  Conversational AI Processing...
                </Badge>
              )}
              
              <Badge variant="secondary" className="bg-green-500 text-white hover:bg-green-600 cursor-pointer transition-colors" onClick={handleWhatsAppClick}>
                <MessageCircle className="w-4 h-4 mr-1" />
                {t('header.customerSupport')}
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
              <h2 className="text-3xl font-bold mb-4">
                {customerName ? `${t('welcome.title')}, ${customerName}!` : t('welcome.title')}
              </h2>
              <p className="text-amber-100 text-lg mb-6">
                {t('welcome.subtitle')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div className="flex flex-col items-center">
                  <Phone className="w-8 h-8 mb-2 text-amber-200" />
                  <p className="text-sm">{t('welcome.contact')}</p>
                </div>
                <div className="flex flex-col items-center">
                  <MapPin className="w-8 h-8 mb-2 text-amber-200" />
                  <p className="text-sm">{t('welcome.address')}</p>
                </div>
                <div className="flex flex-col items-center">
                  <Clock className="w-8 h-8 mb-2 text-amber-200" />
                  <p className="text-sm">{t('welcome.hours')}</p>
                </div>
                <div className="flex flex-col items-center">
                  <a href="https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s?authuser=0&entry=ttu&g_ep=EgoyMDI1MDcwOC4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center hover:text-amber-300 transition-colors">
                    <MapPin className="w-8 h-8 mb-2 text-amber-200" />
                    <p className="text-sm">Google Maps</p>
                  </a>
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
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      {customerName ? `${t('chat.title')} - ${customerName}` : t('chat.title')} - Conversational AI
                    </h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-amber-800"
                      onClick={handleClearChat}
                      title={t('language') === 'marathi' ? 'नवीन संवाद सुरू करा' : 'Start New Conversation'}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                  {conversationHistory.length > 0 && (
                    <p className="text-amber-200 text-xs mt-1">
                      {t('language') === 'marathi' 
                        ? `${conversationHistory.length / 2} संवाद संदेश संग्रहीत` 
                        : `${conversationHistory.length / 2} conversation messages stored`}
                    </p>
                  )}
                </div>
                
                <ScrollArea className="h-[440px] p-4" ref={scrollAreaRef}>
                  <div className="space-y-4">
                    {messages.map(message => (
                      <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                        <div className={`max-w-[80%] p-3 rounded-lg shadow-md transition-all duration-300 ${message.isUser ? 'bg-amber-600 text-white' : 'bg-muted border border-border text-foreground'}`}>
                          <div className={`text-sm whitespace-pre-line ${message.isTyping ? 'font-mono' : ''}`}>
                            {message.text.split(/(https?:\/\/[^\s]+)/g).map((part, index) => {
                              if (part.match(/https?:\/\/[^\s]+/)) {
                                return (
                                  <a
                                    key={index}
                                    href={part}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 underline break-all transition-colors duration-200"
                                  >
                                    {part}
                                  </a>
                                );
                              }
                              return part;
                            })}
                          </div>
                          {!message.isTyping && (
                            <p className={`text-xs mt-1 ${message.isUser ? 'text-amber-100' : 'text-muted-foreground'}`}>
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Initial Quick Questions in Chat */}
                    {showQuickQuestions && (
                      <div className="flex justify-start animate-fade-in">
                        <div className="max-w-[90%] bg-muted border border-border rounded-lg p-4 shadow-md">
                          <p className="text-sm text-foreground font-medium mb-3">
                            {customerName ? `${customerName}, ${t('chat.quickQuestions')}` : t('chat.quickQuestions')}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {initialQuickQuestions.map((question, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="text-xs border-border hover:bg-accent hover:text-accent-foreground h-8 transition-all duration-200 hover:scale-105"
                                onClick={() => handleQuestionClick(question)}
                                disabled={isMessageLoading}
                              >
                                {question}
                              </Button>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs border-border hover:bg-accent hover:text-accent-foreground h-8 bg-amber-50 dark:bg-amber-950 transition-all duration-200 hover:scale-105"
                              onClick={handleOtherClick}
                              disabled={isMessageLoading}
                            >
                              {t('language') === 'marathi' ? 'इतर' : 'Other'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Other Quick Questions in Chat */}
                    {showOtherQuestions && (
                      <div className="flex justify-start animate-fade-in">
                        <div className="max-w-[90%] bg-muted border border-border rounded-lg p-4 shadow-md">
                          <p className="text-sm text-foreground font-medium mb-3">
                            {t('language') === 'marathi' ? '💡 इतर प्रश्न - विचारण्यासाठी क्लिक करा:' : '💡 Other Questions - Click to ask:'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {otherQuickQuestions.map((question, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="text-xs border-border hover:bg-accent hover:text-accent-foreground h-8 transition-all duration-200 hover:scale-105"
                                onClick={() => handleQuestionClick(question)}
                                disabled={isMessageLoading}
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
                      placeholder={customerName ? `${customerName}, ${t('chat.placeholder')}` : t('chat.placeholder')}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                      className="flex-1 border-border focus:border-ring bg-background transition-all duration-200"
                      disabled={isMessageLoading}
                    />
                    <Button 
                      onClick={() => handleSendMessage(inputText)} 
                      className="bg-amber-600 hover:bg-amber-700 transition-all duration-200 hover:scale-105"
                      disabled={isMessageLoading}
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
                          disabled={isMessageLoading}
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
                    <a href="https://shreealankar.lovable.app/" target="_blank" rel="noopener noreferrer" className="flex items-center p-3 bg-amber-50 dark:bg-amber-950 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors">
                      <Sparkles className="w-5 h-5 text-amber-600 mr-3" />
                      <div>
                        <p className="font-medium text-amber-900 dark:text-amber-100">{t('social.website')}</p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">shreealankar.lovable.app</p>
                      </div>
                    </a>
                    
                    <a href="https://www.instagram.com/shreealankar2112/#" target="_blank" rel="noopener noreferrer" className="flex items-center p-3 bg-pink-50 dark:bg-pink-950 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900 transition-colors">
                      <Instagram className="w-5 h-5 text-pink-600 mr-3" />
                      <div>
                        <p className="font-medium text-pink-900 dark:text-pink-100">{t('social.instagram')}</p>
                        <p className="text-sm text-pink-700 dark:text-pink-300">@shreealankar2112</p>
                      </div>
                    </a>
                    
                    <a href="https://www.youtube.com/@Shreealankar2112" target="_blank" rel="noopener noreferrer" className="flex items-center p-3 bg-red-50 dark:bg-red-950 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition-colors">
                      <Youtube className="w-5 h-5 text-red-600 mr-3" />
                      <div>
                        <p className="font-medium text-red-900 dark:text-red-100">{t('social.youtube')}</p>
                        <p className="text-sm text-red-700 dark:text-red-300">@Shreealankar2112</p>
                      </div>
                    </a>

                    <a href="https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s?authuser=0&entry=ttu&g_ep=EgoyMDI1MDcwOC4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="flex items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg hover:bg-green-100 dark:hover:bg-green-900 transition-colors">
                      <MapPin className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">Google Maps</p>
                        <p className="text-sm text-green-700 dark:text-green-300">Find Us Here</p>
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
            <h3 className="text-xl font-bold mb-2">{t('footer.title')}</h3>
            <p className="text-primary-foreground/80 mb-4">{t('footer.subtitle')}</p>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-8 text-sm">
              <p>📍 {t('welcome.address')}</p>
              <p>📞 {t('welcome.contact')}</p>
              <p>🕒 {t('welcome.hours')}</p>
              <a href="https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s?authuser=0&entry=ttu&g_ep=EgoyMDI1MDcwOC4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground/80 transition-colors">
                🗺️ Google Maps
              </a>
            </div>
            
            {/* Owner Login Button */}
            <div className="mt-6 pt-4 border-t border-primary-foreground/20">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOwnerLogin(true)}
                className="text-primary-foreground/60 hover:text-primary-foreground/80 text-xs"
              >
                <Shield className="w-3 h-3 mr-1" />
                Owner Login
              </Button>
            </div>
            
            <div className="mt-4">
              <p className="text-primary-foreground/60 text-sm">{t('footer.copyright')}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
