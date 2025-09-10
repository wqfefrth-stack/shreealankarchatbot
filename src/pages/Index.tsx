import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageCircle, RotateCcw, Phone, ExternalLink } from 'lucide-react';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCustomer } from '@/contexts/CustomerContext';
import CustomerNameSelector from '@/components/CustomerNameSelector';
import LanguageSelector from '@/components/LanguageSelector';
import LoadingAnimation from '@/components/LoadingAnimation';
import OwnerLogin from '@/components/OwnerLogin';
import OwnerDashboard from '@/components/OwnerDashboard';
import SpeechToText from '@/components/SpeechToText';
import { useRates } from '@/hooks/useRates';
import { useAIChat } from '@/hooks/useAIChat';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

const Index = () => {
  // Function to render text with links as buttons
  const renderTextWithLinks = (text: string) => {
    // URL regex pattern
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        // This is a URL, render as button
        const cleanUrl = part.replace(/\\n$/, ''); // Remove trailing \n if present
        const displayText = cleanUrl.length > 40 
          ? cleanUrl.substring(0, 40) + '...' 
          : cleanUrl;
        
        return (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => window.open(cleanUrl, '_blank', 'noopener,noreferrer')}
            className="mx-1 my-1 h-auto py-2 px-3 text-xs inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
          >
            <ExternalLink className="w-3 h-3" />
            {displayText}
          </Button>
        );
      }
      // Regular text
      return <span key={index}>{part}</span>;
    });
  };
  // ALL HOOKS MUST BE DECLARED AT THE TOP - NO CONDITIONAL CALLS
  const { t } = useLanguage();
  const { customerName, whatsappNo, setCustomerName, setWhatsappNo } = useCustomer();
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
  const playedWelcomeRef = useRef(false);

  // ALL CALLBACK HOOKS
  const handleNameSubmit = useCallback((name: string, whatsapp: string) => {
    setCustomerName(name);
    setWhatsappNo(whatsapp);
    setShowNameSelector(false);
    setShowLoading(true);
  }, [setCustomerName, setWhatsappNo]);

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

  // Play welcome sound when chat becomes active
  useEffect(() => {
    if (!showNameSelector && !showLoading && !showLanguageSelector && !playedWelcomeRef.current) {
      // Speak welcome message using Web Speech API with female voice
      const speakWelcome = () => {
        try {
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance('Welcome to Shree Alankar');
            utterance.rate = 0.8;
            utterance.pitch = 1.2;
            utterance.volume = 0.9;
            
            // Function to find best female voice
            const findFemaleVoice = () => {
              const voices = speechSynthesis.getVoices();
              
              // Priority list for female voices
              const femaleVoiceNames = [
                'microsoft zira - english (united states)',
                'google us english female',
                'female',
                'woman',
                'alice',
                'samantha',
                'victoria',
                'karen',
                'moira',
                'fiona',
                'susan',
                'allison',
                'ava',
                'serena'
              ];
              
              // First try to find by name
              for (const femaleName of femaleVoiceNames) {
                const voice = voices.find(v => 
                  v.name.toLowerCase().includes(femaleName.toLowerCase())
                );
                if (voice) return voice;
              }
              
              // Then try to find by language and assume female if available
              const englishVoices = voices.filter(v => 
                v.lang.startsWith('en') && !v.name.toLowerCase().includes('male')
              );
              
              // Return the second english voice (often female) or first available
              return englishVoices[1] || englishVoices[0] || voices[0];
            };
            
            // Set the best female voice
            const femaleVoice = findFemaleVoice();
            if (femaleVoice) {
              utterance.voice = femaleVoice;
              console.log('Using voice:', femaleVoice.name);
            }
            
            speechSynthesis.speak(utterance);
          }
        } catch (error) {
          console.log('Welcome speech could not be played:', error);
        }
      };
      
      // Wait for voices to be loaded
      if (speechSynthesis.getVoices().length > 0) {
        setTimeout(speakWelcome, 500);
      } else {
        speechSynthesis.addEventListener('voiceschanged', () => {
          setTimeout(speakWelcome, 500);
        }, { once: true });
      }
      
      playedWelcomeRef.current = true;
    }
  }, [showNameSelector, showLoading, showLanguageSelector]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  // Owner login keyboard shortcut (Ctrl+Shift+O)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'O') {
        e.preventDefault();
        setShowOwnerLogin(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // NOW WE CAN DO CONDITIONAL RENDERING AFTER ALL HOOKS ARE DECLARED
  if (showOwnerDashboard) {
    return <OwnerDashboard onLogout={() => setShowOwnerDashboard(false)} />;
  }

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
      message: `🌐 **For current gold and silver rates, please visit our website:**\\n\\nhttps://shreealankar.lovable.app/\\n\\n📱 **Follow us on social media:**\\n📸 Instagram: https://www.instagram.com/shreealankar2112/#\\n📺 YouTube: https://www.youtube.com/@Shreealankar2112\\n🗺️ Google Maps: https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s?authuser=0&entry=ttu&g_ep=EgoyMDI1MDcwOC4wIKXMDSoASAFQAw%3D%3D`,
      marathi: `🌐 **सध्याच्या सोने आणि चांदीच्या दरांसाठी, कृपया आमची वेबसाइट भेट द्या:**\\n\\nhttps://shreealankar.lovable.app/\\n\\n📱 **सोशल मीडियावर आमचे अनुसरण करा:**\\n📸 Instagram: https://www.instagram.com/shreealankar2112/#\\n📺 YouTube: https://www.youtube.com/@Shreealankar2112\\n🗺️ Google Maps: https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s?authuser=0&entry=ttu&g_ep=EgoyMDI1MDcwOC4wIKXMDSoASAFQAw%3D%3D`
    };
  };

  const getSocialMediaResponse = () => {
    return {
      message: `📱 **Follow Shree Alankar on Social Media:**\\n\\n📸 **Instagram:** https://www.instagram.com/shreealankar2112/#\\n📺 **YouTube:** https://www.youtube.com/@Shreealankar2112\\n🗺️ **Google Maps:** https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s?authuser=0&entry=ttu&g_ep=EgoyMDI1MDcwOC4wIKXMDSoASAFQAw%3D%3D\\n\\n🌐 **Website:** https://shreealankar.lovable.app/\\n\\n📞 **Contact:** +91 9921612155`,
      marathi: `📱 **सोशल मीडियावर श्री अलंकार चे अनुसरण करा:**\\n\\n📸 **Instagram:** https://www.instagram.com/shreealankar2112/#\\n📺 **YouTube:** https://www.youtube.com/@Shreealankar2112\\n🗺️ **Google Maps:** https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s?authuser=0&entry=ttu&g_ep=EgoyMDI1MDcwOC4wIKXMDSoASAFQAw%3D%3D\\n\\n🌐 **वेबसाइट:** https://shreealankar.lovable.app/\\n\\n📞 **संपर्क:** +91 9921612155`
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
      text: 'Shree is Thinking',
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

    // Save chat to database
    try {
      await supabase.from('chat_logs').insert({
        customer_name: customerName || 'Anonymous',
        whatsapp_no: whatsappNo || '',
        message: text,
        response: botResponseText
      });
      console.log('Chat saved to database successfully');
    } catch (dbError) {
      console.error('Error saving chat to database:', dbError);
    }

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
      text: 'Shree is Thinking',
      isUser: false,
      timestamp: new Date(),
      isTyping: true
    };

    setMessages(prev => [...prev, loadingMessage]);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const botResponseText = await getResponse(question);

    await typeMessage(botResponseText, loadingMessage.id);

    // Save chat to database
    try {
      await supabase.from('chat_logs').insert({
        customer_name: customerName || 'Anonymous',
        whatsapp_no: whatsappNo || '',
        message: question,
        response: botResponseText
      });
      console.log('Quick question chat saved to database successfully');
    } catch (dbError) {
      console.error('Error saving quick question chat to database:', dbError);
    }

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
      text: 'Shree is Thinking',
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

    // Save chat to database
    try {
      await supabase.from('chat_logs').insert({
        customer_name: customerName || 'Anonymous',
        whatsapp_no: whatsappNo || '',
        message: t('language') === 'marathi' ? 'इतर' : 'Other',
        response: botResponseText
      });
      console.log('Other questions chat saved to database successfully');
    } catch (dbError) {
      console.error('Error saving other questions chat to database:', dbError);
    }

    setShowOtherQuestions(true);
    setShowQuickQuestions(false);
    setIsMessageLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Fixed Header - Always Visible */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm p-3 border-b border-border/10">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <img src="/lovable-uploads/df89ad8d-4e94-4d53-813b-4e057004190e.png" alt="Shree Alankar" className="w-7 h-7 object-contain" />
            <div>
              <h1 className="text-lg font-medium text-foreground">Shree Alankar</h1>
              <p className="text-xs text-muted-foreground">AI Assistant for Jewelry Services</p>
            </div>
          </div>
          
          {/* Owner Login Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowOwnerLogin(true)}
            className="h-8 w-8 opacity-30 hover:opacity-100 transition-opacity"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chat Container with padding for fixed header and footer */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full pt-20 pb-32">
        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-4 py-4" ref={scrollAreaRef}>
            <div className="space-y-4 min-h-[60vh] flex flex-col justify-end">
              {messages.map((message) => (
                <div key={message.id} className="flex flex-col space-y-2">
                  <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      message.isUser 
                        ? 'bg-primary text-primary-foreground ml-auto' 
                        : 'bg-muted text-foreground'
                    }`}>
                      <div className="chat-font whitespace-pre-wrap break-words text-sm leading-relaxed">
                        {message.isTyping ? (
                          <span className="thinking-dots">{message.text}</span>
                        ) : (
                          renderTextWithLinks(message.text)
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Quick Questions */}
        {showQuickQuestions && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {initialQuickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleQuestionClick(question)}
                  disabled={isMessageLoading}
                  className="text-left justify-start h-auto py-3 px-4 whitespace-normal bg-card hover:bg-accent"
                >
                  {question}
                </Button>
              ))}
            </div>
            <div className="flex justify-center">
              <Button
                variant="ghost"
                onClick={handleOtherClick}
                disabled={isMessageLoading}
                className="text-primary hover:text-primary/80"
              >
                {t('language') === 'marathi' ? 'इतर प्रश्न' : 'More Questions'}
              </Button>
            </div>
          </div>
        )}

        {/* Other Questions */}
        {showOtherQuestions && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {otherQuickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleQuestionClick(question)}
                  disabled={isMessageLoading}
                  className="text-left justify-start h-auto py-3 px-4 whitespace-normal bg-card hover:bg-accent"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Fixed Input Area - Always Visible */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border/10">
          <div className="max-w-4xl mx-auto p-4">
            <div className="relative flex items-center space-x-2 bg-muted/30 rounded-3xl p-3 border border-border/20">
              <Input
                type="text"
                placeholder={isMessageLoading ? t('chat.thinking') : t('chat.placeholder')}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(inputText)}
                disabled={isMessageLoading}
                className="flex-1 border-0 bg-transparent focus:ring-0 focus:ring-offset-0 placeholder:text-muted-foreground/60 text-base"
              />
              <SpeechToText onTranscription={setInputText} />
              <Button
                onClick={() => handleSendMessage(inputText)}
                disabled={!inputText.trim() || isMessageLoading}
                size="icon"
                className="rounded-full h-9 w-9 bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Action buttons - Only WhatsApp */}
            <div className="flex justify-center mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleWhatsAppClick}
                className="text-green-600 hover:text-green-700"
              >
                <Phone className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Owner Login Modal - Hidden but accessible via Ctrl+Shift+O */}
      {showOwnerLogin && (
        <OwnerLogin
          onLoginSuccess={() => {
            setShowOwnerLogin(false);
            setShowOwnerDashboard(true);
          }}
          onCancel={() => setShowOwnerLogin(false)}
        />
      )}
    </div>
  );
};

export default Index;
