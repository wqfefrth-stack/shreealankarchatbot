import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Extend Window interface to include Speech Recognition APIs
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechToTextProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

const SpeechToText = ({ onTranscription, disabled = false }: SpeechToTextProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const startListening = useCallback(() => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Not supported",
        description: "Speech recognition is not supported in this browser",
        variant: "destructive",
      });
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US'; // You can make this dynamic based on user's language preference
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        toast({
          title: "Listening...",
          description: "Speak now, I'm listening!",
        });
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Speech recognition result:', transcript);
        
        if (transcript.trim()) {
          onTranscription(transcript);
          toast({
            title: "Speech recognized",
            description: "Text added to input field!",
          });
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        let errorMessage = "An error occurred";
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = "No speech was detected. Please try again.";
            break;
          case 'audio-capture':
            errorMessage = "No microphone was found. Please check your microphone.";
            break;
          case 'not-allowed':
            errorMessage = "Microphone permission denied. Please allow microphone access.";
            break;
          case 'network':
            errorMessage = "Network error occurred. Please check your connection.";
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        toast({
          title: "Recognition failed",
          description: errorMessage,
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
        setIsProcessing(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast({
        title: "Error",
        description: "Failed to start speech recognition",
        variant: "destructive",
      });
    }
  }, [onTranscription, toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <Button
      onClick={handleToggleListening}
      disabled={disabled || isProcessing}
      variant={isListening ? "destructive" : "outline"}
      size="icon"
      className={`transition-all duration-200 ${isListening ? 'animate-pulse' : ''}`}
      title={isListening ? "Click to stop listening" : "Click to start speech recognition"}
    >
      {isProcessing ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isListening ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
};

export default SpeechToText;