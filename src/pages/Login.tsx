import React, { useState } from 'react';
import { GoogleAuth } from '@/components/GoogleAuth';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import ProfileSetup from '@/components/ProfileSetup';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const Login: React.FC = () => {
  const { user, loading, profileSetupComplete, completeProfileSetup } = useAuth();
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user && !profileSetupComplete && !showProfileSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome to Donor Network Plus!</CardTitle>
              <p className="text-muted-foreground">Complete your profile to get started</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Help us create a comprehensive profile so you can participate in our blood donation network.
              </p>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => setShowProfileSetup(true)} 
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Complete Profile
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => completeProfileSetup()}
                  className="flex-1"
                >
                  Skip for Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (user && profileSetupComplete) {
    return <Navigate to="/profile" replace />;
  }

  if (showProfileSetup) {
    return (
      <ProfileSetup 
        onComplete={() => {
          completeProfileSetup();
          setShowProfileSetup(false);
        }}
        onSkip={() => {
          completeProfileSetup();
          setShowProfileSetup(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <GoogleAuth />
      </div>
    </div>
  );
};

export default Login;
