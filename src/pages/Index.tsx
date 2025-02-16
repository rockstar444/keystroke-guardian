
import { useState } from 'react';
import { KeystrokeInput } from '@/components/KeystrokeInput';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShieldCheck, UserPlus } from 'lucide-react';

const Index = () => {
  const [mode, setMode] = useState<'enroll' | 'verify'>('enroll');
  const [storedPattern, setStoredPattern] = useState<any>(null);
  
  const targetPhrase = "the quick brown fox jumps over the lazy dog";

  const handlePatternCapture = (pattern: any) => {
    setStoredPattern(pattern);
    setMode('verify');
  };

  const handleModeSwitch = () => {
    setMode(mode === 'enroll' ? 'verify' : 'enroll');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 animate-fadeIn">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Keystroke Guardian</h1>
          <p className="text-gray-600">Secure authentication through typing patterns</p>
        </div>

        <div className="flex justify-center space-x-4">
          <Button
            variant={mode === 'enroll' ? 'default' : 'outline'}
            onClick={() => setMode('enroll')}
            className="flex items-center space-x-2"
          >
            <UserPlus size={18} />
            <span>Enroll</span>
          </Button>
          <Button
            variant={mode === 'verify' ? 'default' : 'outline'}
            onClick={() => setMode('verify')}
            disabled={!storedPattern}
            className="flex items-center space-x-2"
          >
            <ShieldCheck size={18} />
            <span>Verify</span>
          </Button>
        </div>

        <KeystrokeInput
          phrase={targetPhrase}
          mode={mode}
          onPatternCapture={handlePatternCapture}
          referencePattern={storedPattern}
        />

        {storedPattern && (
          <Card className="p-4 bg-green-50 border-green-200 animate-fadeIn">
            <p className="text-sm text-green-800 text-center">
              Pattern recorded! You can now switch between enrollment and verification.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
