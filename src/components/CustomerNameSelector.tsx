
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Sparkles } from 'lucide-react';

interface CustomerNameSelectorProps {
  onNameSubmit: (name: string, whatsappNo: string) => void;
}

const CustomerNameSelector = ({ onNameSubmit }: CustomerNameSelectorProps) => {
  const [customerName, setCustomerName] = useState('');
  const [whatsappNo, setWhatsappNo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [whatsappError, setWhatsappError] = useState('');

  const validateWhatsAppNumber = (number: string): boolean => {
    // Remove all spaces and special characters except +
    const cleanNumber = number.replace(/[^\d+]/g, '');
    
    // Check if it starts with +91 and has 10 digits after that
    if (cleanNumber.startsWith('+91')) {
      const digits = cleanNumber.substring(3);
      return digits.length === 10 && /^\d{10}$/.test(digits);
    }
    
    // Check if it's just 10 digits (we'll add +91 prefix)
    if (/^\d{10}$/.test(cleanNumber)) {
      return true;
    }
    
    return false;
  };

  const formatWhatsAppNumber = (number: string): string => {
    const cleanNumber = number.replace(/[^\d+]/g, '');
    
    if (cleanNumber.startsWith('+91')) {
      return cleanNumber;
    }
    
    if (/^\d{10}$/.test(cleanNumber)) {
      return `+91${cleanNumber}`;
    }
    
    return cleanNumber;
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWhatsappNo(value);
    
    if (value.trim()) {
      if (validateWhatsAppNumber(value)) {
        setWhatsappError('');
      } else {
        setWhatsappError('Please enter a valid WhatsApp number (10 digits or +91 followed by 10 digits)');
      }
    } else {
      setWhatsappError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim()) {
      return;
    }
    
    if (!whatsappNo.trim()) {
      setWhatsappError('WhatsApp number is required');
      return;
    }
    
    if (!validateWhatsAppNumber(whatsappNo)) {
      setWhatsappError('Please enter a valid WhatsApp number');
      return;
    }
    
    setIsSubmitting(true);
    const formattedNumber = formatWhatsAppNumber(whatsappNo);
    
    setTimeout(() => {
      onNameSubmit(customerName.trim(), formattedNumber);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100 dark:from-amber-950 dark:via-background dark:to-amber-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <img 
              src="/lovable-uploads/df89ad8d-4e94-4d53-813b-4e057004190e.png" 
              alt="Shree Alankar Logo" 
              className="w-20 h-20 mx-auto mb-4 object-contain"
            />
            <h1 className="text-3xl font-bold text-amber-800 dark:text-amber-200 mb-2">
              Welcome to Shree Alankar
            </h1>
            <p className="text-amber-700 dark:text-amber-300 mb-6">
              Your trusted jewelry partner since generations
            </p>
            <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 mb-6">
              <User className="w-5 h-5" />
              <span className="text-lg font-medium">Please tell us your name</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="text"
                placeholder="Enter your name (e.g., Rajesh, Priya)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="text-center text-lg py-3 border-2 border-amber-200 dark:border-amber-700 focus:border-amber-500 dark:focus:border-amber-400 bg-white/50 dark:bg-background/50"
                disabled={isSubmitting}
                autoFocus
              />
            </div>
            
            <div>
              <Input
                type="tel"
                placeholder="Enter WhatsApp number (e.g., 9876543210 or +91 9876543210)"
                value={whatsappNo}
                onChange={handleWhatsAppChange}
                className={`text-center text-lg py-3 border-2 ${whatsappError ? 'border-red-500 focus:border-red-500' : 'border-amber-200 dark:border-amber-700 focus:border-amber-500 dark:focus:border-amber-400'} bg-white/50 dark:bg-background/50`}
                disabled={isSubmitting}
              />
              {whatsappError && (
                <p className="text-red-500 text-sm text-center mt-2">{whatsappError}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={!customerName.trim() || !whatsappNo.trim() || !!whatsappError || isSubmitting}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>Please wait...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Continue</span>
                  <User className="w-5 h-5" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              We'll use your name to provide personalized assistance
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerNameSelector;
