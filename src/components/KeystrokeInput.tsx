
import React, { useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { KeystrokeService } from '@/lib/keystroke-service';
import { AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';

interface KeyTiming {
  key: string;
  pressTime: number;
  releaseTime: number | null;
}

interface Props {
  phrase: string;
  onPatternCapture?: (pattern: any) => void;
  referencePattern?: any;
  mode: 'enroll' | 'verify';
}

export const KeystrokeInput: React.FC<Props> = ({ 
  phrase, 
  onPatternCapture, 
  referencePattern, 
  mode 
}) => {
  const [input, setInput] = useState('');
  const [timings, setTimings] = useState<KeyTiming[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<'idle' | 'recording' | 'success' | 'error'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isRecording && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRecording]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isRecording) return;
    
    setTimings(prev => [
      ...prev,
      {
        key: e.key,
        pressTime: performance.now(),
        releaseTime: null
      }
    ]);
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (!isRecording) return;
    
    setTimings(prev => prev.map(timing => 
      timing.key === e.key && timing.releaseTime === null
        ? { ...timing, releaseTime: performance.now() }
        : timing
    ));
  };

  const startRecording = () => {
    setIsRecording(true);
    setStatus('recording');
    setInput('');
    setTimings([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isRecording) return;
    setInput(e.target.value);

    if (e.target.value === phrase) {
      const pattern = KeystrokeService.calculatePattern(timings);
      
      if (mode === 'enroll') {
        onPatternCapture?.(pattern);
        setStatus('success');
        toast({
          title: "Pattern Recorded",
          description: "Your typing pattern has been successfully captured.",
        });
      } else if (mode === 'verify' && referencePattern) {
        const isMatch = KeystrokeService.isMatch(pattern, referencePattern);
        setStatus(isMatch ? 'success' : 'error');
        toast({
          title: isMatch ? "Authentication Successful" : "Authentication Failed",
          description: isMatch 
            ? "Your typing pattern matches the recorded pattern." 
            : "Your typing pattern does not match. Please try again.",
          variant: isMatch ? "default" : "destructive",
        });
      }
      
      setIsRecording(false);
    }
  };

  const statusColor = {
    idle: 'text-gray-400',
    recording: 'text-warning-DEFAULT animate-pulse',
    success: 'text-success-DEFAULT',
    error: 'text-error-DEFAULT',
  }[status];

  return (
    <Card className="w-full max-w-md p-6 space-y-6 animate-slideUp">
      <div className="text-center space-y-2">
        <div className={`inline-block ${statusColor}`}>
          {status === 'idle' && <KeyRound size={24} />}
          {status === 'recording' && <AlertCircle size={24} />}
          {status === 'success' && <CheckCircle2 size={24} />}
          {status === 'error' && <AlertCircle size={24} />}
        </div>
        <h3 className="text-lg font-semibold">
          {mode === 'enroll' ? 'Record Your Typing Pattern' : 'Verify Your Identity'}
        </h3>
        <p className="text-sm text-gray-500">
          Type the following phrase exactly as shown:
        </p>
        <p className="text-md font-medium">{phrase}</p>
      </div>

      <div className="space-y-4">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          disabled={!isRecording}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 
                   disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
          placeholder={isRecording ? "Start typing..." : "Click Start to begin"}
        />
        
        <Button
          onClick={startRecording}
          disabled={isRecording}
          className="w-full transition-all duration-200"
        >
          {isRecording ? "Recording..." : "Start"}
        </Button>
      </div>
    </Card>
  );
};
