import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, User, Mail, Phone, MapPin, Calendar, Droplets, ArrowRight, Home, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export const UserProfile: React.FC = () => {
  const { user, profile, updateProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Debug logging
  console.log('UserProfile - User:', user);
  console.log('UserProfile - Profile:', profile);
  console.log('UserProfile - Loading:', loading);
  console.log('UserProfile - Loading Timeout:', loadingTimeout);

  // Timeout fallback for loading state
  React.useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000); // 10 second timeout

      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [loading]);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    age: profile?.age || '',
    gender: profile?.gender || '',
    blood_group: profile?.blood_group || '',
    is_available: profile?.is_available || false,
  });

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        age: formData.age ? Number(formData.age) : null,
        gender: formData.gender || null,
        blood_group: formData.blood_group || null,
        is_available: formData.is_available,
      });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      location: profile?.location || '',
      age: profile?.age || '',
      gender: profile?.gender || '',
      blood_group: profile?.blood_group || '',
      is_available: profile?.is_available || false,
    });
    setIsEditing(false);
  };

  if (loading && !loadingTimeout) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-gray-600">Loading your profile...</p>
        </CardContent>
      </Card>
    );
  }

  if (loadingTimeout) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Loading Timeout</CardTitle>
          <CardDescription>
            There seems to be an issue loading your profile. Please try refreshing the page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => window.location.reload()} className="w-full">
            Refresh Page
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'} className="w-full">
            Go Home
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading && !loadingTimeout) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <CardTitle>Loading Profile...</CardTitle>
          </div>
          <CardDescription>
            Please wait while we load your profile information.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loadingTimeout) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Loading Timeout</CardTitle>
          <CardDescription>
            There seems to be an issue loading your profile. Please try refreshing the page or contact support.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.reload()} className="w-full">
            Refresh Page
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!user || !profile) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Profile Not Found</CardTitle>
          <CardDescription>
            Please complete your profile setup to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/register">
            <Button className="w-full">
              Complete Profile Setup
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback className="text-2xl">
              {profile.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{profile.full_name}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-2 mt-2">
              <Mail className="h-4 w-4" />
              {profile.email}
            </CardDescription>
            {profile.is_available && (
              <Badge variant="default" className="mt-2 bg-green-500">
                Available to Donate
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            {isEditing ? (
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Enter your full name"
              />
            ) : (
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <User className="h-4 w-4 text-gray-500" />
                <span>{profile.full_name || 'Not provided'}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            {isEditing ? (
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            ) : (
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{profile.phone || 'Not provided'}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            {isEditing ? (
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter your location"
              />
            ) : (
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{profile.location || 'Not provided'}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            {isEditing ? (
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="Enter your age"
              />
            ) : (
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{profile.age ? `${profile.age} years` : 'Not provided'}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            {isEditing ? (
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <User className="h-4 w-4 text-gray-500" />
                <span className="capitalize">{profile.gender || 'Not provided'}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="blood_group">Blood Group</Label>
            {isEditing ? (
              <Select value={formData.blood_group} onValueChange={(value) => handleInputChange('blood_group', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <Droplets className="h-4 w-4 text-red-500" />
                <span>{profile.blood_group || 'Not provided'}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center space-x-4 pt-4">
          {isEditing ? (
            <>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>

        {/* Navigation Actions */}
        <div className="border-t pt-6 mt-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold mb-2">What would you like to do next?</h3>
            <p className="text-gray-600 text-sm">Complete your donor journey and help save lives</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/" className="block">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                <Home className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Go Home</div>
                  <div className="text-xs text-gray-500">Return to main page</div>
                </div>
              </Button>
            </Link>

            <Link to="/find-donor" className="block">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                <Heart className="h-6 w-6 text-red-500" />
                <div className="text-center">
                  <div className="font-medium">Find Blood</div>
                  <div className="text-xs text-gray-500">Search for donors</div>
                </div>
              </Button>
            </Link>

            <Link to="/register" className="block">
              <Button className="w-full h-auto p-4 flex flex-col items-center space-y-2 bg-primary hover:bg-primary/90">
                <ArrowRight className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Become a Donor</div>
                  <div className="text-xs text-white/80">Complete registration</div>
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
