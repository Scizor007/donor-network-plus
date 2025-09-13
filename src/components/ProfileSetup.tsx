import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Heart, User, MapPin, Phone, Mail, Calendar, Shield, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileSetupProps {
  onComplete: () => void;
  onSkip: () => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete, onSkip }) => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eligibilityStatus, setEligibilityStatus] = useState<'checking' | 'eligible' | 'ineligible' | null>(null);

  const [profileData, setProfileData] = useState({
    fullName: '',
    age: '',
    gender: '',
    bloodGroup: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalConditions: false,
    medications: false,
    recentIllness: false,
    lastDonation: '',
    consent: false
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh', 'Puducherry'
  ];

  const checkEligibility = () => {
    if (!profileData.age || !profileData.fullName || !profileData.bloodGroup || !profileData.gender) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields before checking eligibility.",
        variant: "destructive"
      });
      return;
    }

    const age = parseInt(profileData.age);
    const lastDonationDate = profileData.lastDonation ? new Date(profileData.lastDonation) : null;
    const monthsSinceLastDonation = lastDonationDate 
      ? (Date.now() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      : 12;

    setEligibilityStatus('checking');
    
    setTimeout(() => {
      if (age < 18 || age > 65) {
        setEligibilityStatus('ineligible');
        toast({
          title: "Age Not Eligible",
          description: "You must be between 18 and 65 years old to donate blood.",
          variant: "destructive"
        });
        return;
      }
      
      if (profileData.medicalConditions || profileData.medications || profileData.recentIllness) {
        setEligibilityStatus('ineligible');
        toast({
          title: "Medical Conditions",
          description: "Please consult with our medical team about your eligibility.",
          variant: "destructive"
        });
        return;
      }
      
      if (monthsSinceLastDonation < 3) {
        setEligibilityStatus('ineligible');
        toast({
          title: "Recent Donation",
          description: "You must wait at least 3 months between donations.",
          variant: "destructive"
        });
        return;
      }
      
      setEligibilityStatus('eligible');
      toast({
        title: "Eligibility Confirmed! ✅",
        description: "You are eligible to donate blood.",
      });
    }, 1500);
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Validate required fields
    const requiredFields = ['fullName', 'age', 'gender', 'bloodGroup', 'phone', 'address', 'city', 'state'];
    const missingFields = requiredFields.filter(field => !profileData[field as keyof typeof profileData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }
    
    if (!profileData.consent) {
      toast({
        title: "Consent Required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simple geocoding for Indian cities
      const getCoordinates = (city: string) => {
        const cityCoordinates: { [key: string]: [number, number] } = {
          'delhi': [28.6139, 77.2090],
          'mumbai': [19.0760, 72.8777],
          'bangalore': [12.9716, 77.5946],
          'chennai': [13.0827, 80.2707],
          'kolkata': [22.5726, 88.3639],
          'hyderabad': [17.3850, 78.4867],
          'pune': [18.5204, 73.8567],
          'ahmedabad': [23.0225, 72.5714],
        };
        const lowerCity = city.toLowerCase();
        return cityCoordinates[lowerCity] || [28.6139, 77.2090];
      };

      const [latitude, longitude] = getCoordinates(profileData.city);

      // Update profile with detailed information
      const profileUpdate = {
        full_name: profileData.fullName,
        age: parseInt(profileData.age),
        gender: profileData.gender,
        blood_group: profileData.bloodGroup,
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        location: `${profileData.city}, ${profileData.state}`,
        last_donation_date: profileData.lastDonation || null,
        medical_conditions: profileData.medicalConditions,
        taking_medications: profileData.medications,
        recent_illness: profileData.recentIllness,
        latitude,
        longitude,
        is_available: eligibilityStatus === 'eligible',
        is_verified: eligibilityStatus === 'eligible',
        user_type: eligibilityStatus === 'eligible' ? 'donor' : 'user',
        updated_at: new Date().toISOString(),
      };

      console.log('Updating profile with:', profileUpdate);
      await updateProfile(profileUpdate);

      toast({
        title: "Profile Created Successfully! 🎉",
        description: eligibilityStatus === 'eligible' 
          ? "You are now registered as a verified donor and can help save lives!"
          : "Your profile has been created. You can take the eligibility test later.",
      });

      onComplete();
    } catch (error) {
      console.error('Profile creation error:', error);
      toast({
        title: "Profile Creation Failed",
        description: "There was an error creating your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <User className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Personal Information</h2>
              <p className="text-muted-foreground">Let's start with your basic details</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="65"
                  value={profileData.age}
                  onChange={(e) => setProfileData({...profileData, age: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select onValueChange={(value) => setProfileData({...profileData, gender: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group *</Label>
                <Select onValueChange={(value) => setProfileData({...profileData, bloodGroup: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((group) => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                <Input
                  id="emergencyContact"
                  value={profileData.emergencyContact}
                  onChange={(e) => setProfileData({...profileData, emergencyContact: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={profileData.emergencyPhone}
                  onChange={(e) => setProfileData({...profileData, emergencyPhone: e.target.value})}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Location Information</h2>
              <p className="text-muted-foreground">Help us find donors near you</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={profileData.address}
                onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                required
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={profileData.city}
                  onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select onValueChange={(value) => setProfileData({...profileData, state: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={profileData.pincode}
                  onChange={(e) => setProfileData({...profileData, pincode: e.target.value})}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Medical Information & Eligibility</h2>
              <p className="text-muted-foreground">Help us ensure safe blood donation</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastDonation">Last Blood Donation Date (if any)</Label>
              <Input
                id="lastDonation"
                type="date"
                value={profileData.lastDonation}
                onChange={(e) => setProfileData({...profileData, lastDonation: e.target.value})}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Health Declaration</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="medicalConditions"
                    checked={profileData.medicalConditions}
                    onCheckedChange={(checked) => 
                      setProfileData({...profileData, medicalConditions: checked as boolean})}
                  />
                  <Label htmlFor="medicalConditions">
                    I have chronic medical conditions (diabetes, heart disease, etc.)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="medications"
                    checked={profileData.medications}
                    onCheckedChange={(checked) => 
                      setProfileData({...profileData, medications: checked as boolean})}
                  />
                  <Label htmlFor="medications">
                    I am currently taking medications
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recentIllness"
                    checked={profileData.recentIllness}
                    onCheckedChange={(checked) => 
                      setProfileData({...profileData, recentIllness: checked as boolean})}
                  />
                  <Label htmlFor="recentIllness">
                    I have been ill in the past 2 weeks
                  </Label>
                </div>
              </div>
            </div>

            {/* Eligibility Check */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Eligibility Check</h3>
                  <p className="text-sm text-muted-foreground">Check if you're eligible to donate blood</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={checkEligibility}
                  disabled={!profileData.age || !profileData.fullName || !profileData.bloodGroup || !profileData.gender || eligibilityStatus === 'checking'}
                >
                  {eligibilityStatus === 'checking' ? 'Checking...' : 'Check Eligibility'}
                </Button>
              </div>

              {eligibilityStatus === 'eligible' && (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">You are eligible to donate blood!</span>
                </div>
              )}

              {eligibilityStatus === 'ineligible' && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">You are currently not eligible to donate. Please consult with our medical team.</span>
                </div>
              )}
            </div>

            {/* Consent */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="consent"
                checked={profileData.consent}
                onCheckedChange={(checked) => 
                  setProfileData({...profileData, consent: checked as boolean})}
              />
              <Label htmlFor="consent" className="text-sm">
                I agree to the terms and conditions and consent to be contacted for blood donation requests *
              </Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">Complete Your Profile</CardTitle>
            <div className="flex items-center justify-center space-x-4 mt-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step <= currentStep ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      step < currentStep ? 'bg-primary' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {renderStep()}
            
            <div className="flex justify-between mt-8">
              <div>
                {currentStep > 1 && (
                  <Button variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button variant="ghost" onClick={onSkip}>
                  Skip for Now
                </Button>
                
                {currentStep < 3 ? (
                  <Button onClick={nextStep} disabled={!profileData.fullName || !profileData.age || !profileData.gender || !profileData.bloodGroup}>
                    Next
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || !profileData.consent}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isSubmitting ? 'Creating Profile...' : 'Complete Profile'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetup;
