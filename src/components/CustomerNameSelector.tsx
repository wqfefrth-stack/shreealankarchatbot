import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Phone, ArrowRight, Loader2 } from 'lucide-react';

interface CustomerNameSelectorProps {
  onNameSubmit: (name: string, whatsappNo: string) => void;
}

const CustomerNameSelector = ({ onNameSubmit }: CustomerNameSelectorProps) => {
  const [customerName, setCustomerName] = useState('');
  const [whatsappNo, setWhatsappNo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [whatsappError, setWhatsappError] = useState('');

  const validateWhatsAppNumber = (number: string): boolean => {
    const cleanNumber = number.replace(/[^\d+]/g, '');
    if (cleanNumber.startsWith('+91')) {
      const digits = cleanNumber.substring(3);
      return digits.length === 10 && /^\d{10}$/.test(digits);
    }
    return /^\d{10}$/.test(cleanNumber);
  };

  const formatWhatsAppNumber = (number: string): string => {
    const cleanNumber = number.replace(/[^\d+]/g, '');
    if (cleanNumber.startsWith('+91')) return cleanNumber;
    if (/^\d{10}$/.test(cleanNumber)) return `+91${cleanNumber}`;
    return cleanNumber;
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWhatsappNo(value);
    if (value.trim()) {
      setWhatsappError(validateWhatsAppNumber(value) ? '' : 'Enter a valid 10-digit WhatsApp number');
    } else {
      setWhatsappError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;
    if (!whatsappNo.trim()) return setWhatsappError('WhatsApp number is required');
    if (!validateWhatsAppNumber(whatsappNo)) return setWhatsappError('Please enter a valid WhatsApp number');

    setIsSubmitting(true);
    const formattedNumber = formatWhatsAppNumber(whatsappNo);
    setTimeout(() => onNameSubmit(customerName.trim(), formattedNumber), 500);
  };

  return (
    <div className="min-h-screen gradient-backdrop flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 -left-32 w-96 h-96 rounded-full bg-primary/15 blur-3xl animate-float" />
      <div
        className="absolute bottom-0 -right-32 w-[28rem] h-[28rem] rounded-full bg-primary-glow/15 blur-3xl animate-float"
        style={{ animationDelay: '2s' }}
      />

      <Card className="w-full max-w-md glass-panel shadow-elegant border-border/40 animate-fade-up relative">
        <CardContent className="p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="relative mx-auto w-20 h-20 mb-5">
              <div className="absolute inset-0 rounded-full luxury-gradient opacity-25 blur-xl" />
              <div className="relative w-20 h-20 rounded-full glass-panel flex items-center justify-center shadow-soft">
                <img
                  src="/lovable-uploads/df89ad8d-4e94-4d53-813b-4e057004190e.png"
                  alt="Shree Alankar"
                  className="w-12 h-12 object-contain"
                />
              </div>
            </div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-2">
              Since 1998
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-luxury mb-2">
              Shree Alankar
            </h1>
            <p className="text-sm text-muted-foreground">
              Your personal jewelry concierge
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="e.g. Rajesh"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-background/60 border-border focus-visible:ring-primary/40"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                WhatsApp Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="9876543210"
                  value={whatsappNo}
                  onChange={handleWhatsAppChange}
                  className={`pl-10 h-12 rounded-xl bg-background/60 ${
                    whatsappError ? 'border-destructive focus-visible:ring-destructive/40' : 'border-border focus-visible:ring-primary/40'
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {whatsappError && (
                <p className="text-destructive text-xs pl-1 animate-fade-up">{whatsappError}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={!customerName.trim() || !whatsappNo.trim() || !!whatsappError || isSubmitting}
              className="w-full h-12 rounded-xl luxury-gradient text-primary-foreground font-semibold text-base shadow-elegant transition-all duration-300 hover:translate-y-[-1px] disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Preparing your chat...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-[11px] text-muted-foreground/80">
            We use your name only to personalize this conversation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerNameSelector;
