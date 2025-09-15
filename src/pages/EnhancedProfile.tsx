import React from 'react';
import { UserProfile } from '@/components/UserProfile';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const EnhancedProfile: React.FC = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-8">
        <div className="container mx-auto px-4">
          <UserProfile />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default EnhancedProfile;