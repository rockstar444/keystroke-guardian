
import { useState, useEffect } from 'react';
import { KeystrokeInput } from '@/components/KeystrokeInput';
import { AuthForm } from '@/components/AuthForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShieldCheck, UserPlus, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [mode, setMode] = useState<'enroll' | 'verify'>('enroll');
  const [storedPattern, setStoredPattern] = useState<any>(null);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const targetPhrase = "the quick brown fox jumps over the lazy dog";

  useEffect(() => {
    if (user) {
      loadStoredPattern();
    }
  }, [user]);

  const loadStoredPattern = async () => {
    try {
      console.log('Loading pattern for user:', user?.id);
      const { data, error } = await supabase
        .from('keystroke_patterns')
        .select('pattern')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error loading pattern:', error);
        throw error;
      }
      
      if (data) {
        console.log('Pattern loaded successfully');
        setStoredPattern(data.pattern);
        setMode('verify');
      }
    } catch (error) {
      console.error('Error loading pattern:', error);
      toast({
        title: "Error",
        description: "Failed to load typing pattern",
        variant: "destructive",
      });
    }
  };

  const handlePatternCapture = async (pattern: any) => {
    try {
      console.log('Saving pattern for user:', user?.id);
      console.log('Pattern data:', {
        user_id: user?.id,
        phrase: targetPhrase,
        pattern: pattern
      });

      const { error } = await supabase
        .from('keystroke_patterns')
        .upsert({
          user_id: user?.id,
          phrase: targetPhrase,
          pattern: pattern
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving pattern:', error);
        throw error;
      }

      console.log('Pattern saved successfully');
      setStoredPattern(pattern);
      setMode('verify');
      
      toast({
        title: "Pattern Saved",
        description: "Your typing pattern has been successfully stored.",
      });
    } catch (error) {
      console.error('Error saving pattern:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save typing pattern.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setStoredPattern(null);
      setMode('enroll');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md space-y-8 animate-fadeIn">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Keystroke Guardian</h1>
            <p className="text-gray-600">Secure authentication through typing patterns</p>
          </div>
          <AuthForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 animate-fadeIn">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Keystroke Guardian</h1>
          <p className="text-gray-600">Secure authentication through typing patterns</p>
          <p className="text-sm text-primary">Welcome, {user.email}</p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
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
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="flex items-center space-x-2"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
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
