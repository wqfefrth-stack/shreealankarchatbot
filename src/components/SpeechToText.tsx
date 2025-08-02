import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SpeechToTextProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

const SpeechToText = ({ onTranscription, disabled = false }: SpeechToTextProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      toast({
        title: "Recording started",
        description: "Speak your message now...",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording failed",
        description: "Please check microphone permissions",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);

      toast({
        title: "Processing audio",
        description: "Converting speech to text...",
      });
    }
  }, [isRecording, toast]);

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        const base64Audio = base64Data.split(',')[1]; // Remove data:audio/webm;base64, prefix

        // Call the speech-to-text edge function
        const response = await fetch('https://ywwmgwktvzmfbhazqyig.supabase.co/functions/v1/speech-to-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3d21nd2t0dnptZmJoYXpxeWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNDc5OTQsImV4cCI6MjA2NzYyMzk5NH0.f5EKN8U7jMxQ-hXDgHI0MI-54n5WFFIIUqrYjX85xTU`
          },
          body: JSON.stringify({
            audio: base64Audio
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.text && data.text.trim()) {
            onTranscription(data.text);
            toast({
              title: "Speech converted",
              description: "Text ready to send!",
            });
          } else {
            toast({
              title: "No speech detected",
              description: "Please try speaking more clearly",
              variant: "destructive",
            });
          }
        } else {
          throw new Error('Failed to transcribe audio');
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Processing failed",
        description: "Failed to convert speech to text",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Button
      onClick={handleToggleRecording}
      disabled={disabled || isProcessing}
      variant={isRecording ? "destructive" : "outline"}
      size="icon"
      className={`transition-all duration-200 ${isRecording ? 'animate-pulse' : ''}`}
    >
      {isProcessing ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isRecording ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
};

export default SpeechToText;