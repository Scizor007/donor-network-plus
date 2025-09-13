import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';

const DonorRegistration = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    bloodGroup: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    lastDonation: '',
    medicalConditions: false,
    medications: false,
    recentIllness: false,
    consent: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [eligibilityStatus, setEligibilityStatus] = useState<'checking' | 'eligible' | 'ineligible' | null>(null);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const checkEligibility = () => {
    // Validate required fields first
    if (!formData.age || !formData.fullName || !formData.bloodGroup || !formData.gender) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields before checking eligibility.",
        variant: "destructive"
      });
      return;
    }

    const age = parseInt(formData.age);
    const lastDonationDate = formData.lastDonation ? new Date(formData.lastDonation) : null;
    const monthsSinceLastDonation = lastDonationDate 
      ? (Date.now() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      : 12; // Assume eligible if no previous donation

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
      
      if (formData.medicalConditions || formData.medications || formData.recentIllness) {
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
        description: "You are eligible to donate blood. You can now proceed with registration.",
      });
    }, 1500);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['fullName', 'age', 'gender', 'bloodGroup', 'phone', 'email', 'address', 'city'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.consent) {
      toast({
        title: "Consent Required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive"
      });
      return;
    }

    if (eligibilityStatus !== 'eligible') {
      toast({
        title: "Eligibility Check Required",
        description: "Please complete the eligibility check first by clicking 'Check Eligibility' button.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to register as a donor.",
          variant: "destructive"
        });
        return;
      }

      console.log('User authenticated:', user.id);
      console.log('Form data:', formData);
      console.log('Eligibility status:', eligibilityStatus);


      // Simple geocoding for Indian cities (you can enhance this with a real geocoding service)
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
        return cityCoordinates[lowerCity] || [28.6139, 77.2090]; // Default to Delhi
      };

      const [latitude, longitude] = getCoordinates(formData.city);

      // Update existing profile to mark as donor
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          age: parseInt(formData.age),
          gender: formData.gender,
          blood_group: formData.bloodGroup,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          location: `${formData.city}, ${formData.address}`,
          last_donation_date: formData.lastDonation || null,
          medical_conditions: formData.medicalConditions,
          taking_medications: formData.medications,
          recent_illness: formData.recentIllness,
          latitude,
          longitude,
          is_available: true,
          is_verified: eligibilityStatus === 'eligible',
          user_type: 'donor',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Database update error:', updateError);
        throw updateError;
      }

      console.log('Profile updated successfully');
      toast({
        title: "Registration Successful! 🎉",
        description: "Thank you for joining our life-saving community. You'll receive a confirmation email shortly.",
      });

      // Reset form
      setFormData({
        fullName: '',
        age: '',
        gender: '',
        bloodGroup: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        lastDonation: '',
        medicalConditions: false,
        medications: false,
        recentIllness: false,
        consent: false
      });
      setEligibilityStatus(null);

      // Redirect to profile page after successful registration
      setTimeout(() => {
        window.location.href = '/profile';
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "There was an error registering your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-medical-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground">Become a Blood Donor</h1>
          <p className="text-muted-foreground mt-2">
            Join thousands of heroes saving lives in your community
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-primary" />
              <span>Donor Registration</span>
            </CardTitle>
            <div className="flex items-center space-x-4 mt-4 text-sm">
              <div className={`flex items-center space-x-2 ${formData.fullName && formData.age && formData.bloodGroup && formData.gender ? 'text-green-600' : 'text-muted-foreground'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${formData.fullName && formData.age && formData.bloodGroup && formData.gender ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  1
                </div>
                <span>Fill Details</span>
              </div>
              <div className={`flex items-center space-x-2 ${eligibilityStatus === 'eligible' ? 'text-green-600' : 'text-muted-foreground'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${eligibilityStatus === 'eligible' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  2
                </div>
                <span>Check Eligibility</span>
              </div>
              <div className={`flex items-center space-x-2 ${eligibilityStatus === 'eligible' ? 'text-blue-600' : 'text-muted-foreground'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${eligibilityStatus === 'eligible' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                  3
                </div>
                <span>Register</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
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
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select onValueChange={(value) => setFormData({...formData, gender: value})}>
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
                  <Select onValueChange={(value) => setFormData({...formData, bloodGroup: value})}>
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
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Location Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Medical History */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Medical Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="lastDonation">Last Blood Donation Date (if any)</Label>
                  <Input
                    id="lastDonation"
                    type="date"
                    value={formData.lastDonation}
                    onChange={(e) => setFormData({...formData, lastDonation: e.target.value})}
                  />
                </div>


                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="medicalConditions"
                      checked={formData.medicalConditions}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, medicalConditions: checked as boolean})}
                    />
                    <Label htmlFor="medicalConditions">
                      I have chronic medical conditions (diabetes, heart disease, etc.)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="medications"
                      checked={formData.medications}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, medications: checked as boolean})}
                    />
                    <Label htmlFor="medications">
                      I am currently taking medications
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="recentIllness"
                      checked={formData.recentIllness}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, recentIllness: checked as boolean})}
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
                    <p className="text-sm text-muted-foreground">Complete this step to enable registration</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={checkEligibility}
                    disabled={!formData.age || !formData.fullName || !formData.bloodGroup || !formData.gender || eligibilityStatus === 'checking'}
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
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">You are currently not eligible to donate. Please consult with our medical team.</span>
                  </div>
                )}
              </div>

              {/* Consent */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consent"
                  checked={formData.consent}
                  onCheckedChange={(checked) => 
                    setFormData({...formData, consent: checked as boolean})}
                />
                <Label htmlFor="consent" className="text-sm">
                  I agree to the terms and conditions and consent to be contacted for blood donation requests *
                </Label>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={eligibilityStatus !== 'eligible' || isSubmitting}
              >
                {isSubmitting ? 'Registering...' : 'Register as Donor'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DonorRegistration;