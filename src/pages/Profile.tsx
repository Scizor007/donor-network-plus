import React from 'react';
import { UserProfile } from '@/components/UserProfile';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const Profile: React.FC = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <UserProfile />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Profile;
