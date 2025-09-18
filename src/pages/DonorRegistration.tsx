import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Heart, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LocationService } from '@/services/locationService';


const DonorRegistration = () => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [eligibilityData, setEligibilityData] = useState<any>(null);
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
    recentSurgery: false,
    hasTattoos: false,
    hemoglobin: '',
    rbcCount: '',
    systolicBP: '',
    diastolicBP: '',
    weightKg: '',
    heightCm: '',
    pulseRate: '',
    consent: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eligibilityStatus, setEligibilityStatus] = useState<'idle' | 'checking' | 'eligible' | 'ineligible' | null>(null);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleEligibilityCheck = (eligible: boolean, data: any) => {
    setIsEligible(eligible);
    setEligibilityData(data);
    if (eligible) {
      setCurrentStep(3);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const checkEligibility = () => {
    if (!formData.fullName || !formData.age || !formData.gender || !formData.bloodGroup) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name, age, gender, and blood group first.",
        variant: "destructive"
      });
      return;
    }

    const hasMedicalData = formData.weightKg && formData.hemoglobin && formData.rbcCount && 
                          formData.systolicBP && formData.diastolicBP && formData.pulseRate;

    if (!hasMedicalData) {
      toast({
        title: "Medical Information Required",
        description: "Please fill in all medical fields (weight, hemoglobin, RBC, BP, pulse) for eligibility check.",
        variant: "destructive"
      });
      return;
    }

    setEligibilityStatus('checking');

    setTimeout(() => {
      const ageNumber = parseInt(formData.age);
      if (isNaN(ageNumber) || ageNumber < 18 || ageNumber > 65) {
        setEligibilityStatus('ineligible');
        toast({
          title: "Age Restriction",
          description: "Donors must be between 18 and 65 years old.",
          variant: "destructive"
        });
        return;
      }

      const hemoglobin = parseFloat(formData.hemoglobin || '0');
      const rbc = parseFloat(formData.rbcCount || '0');
      const systolic = parseInt(formData.systolicBP || '0');
      const diastolic = parseInt(formData.diastolicBP || '0');
      const weight = parseFloat(formData.weightKg || '0');
      const pulse = parseInt(formData.pulseRate || '0');

      if (isNaN(weight) || weight < 50) {
        setEligibilityStatus('ineligible');
        toast({
          title: "Weight Requirement",
          description: "Minimum weight to donate is 50 kg.",
          variant: "destructive"
        });
        return;
      }

      if (isNaN(hemoglobin) || hemoglobin < 12.5) {
        setEligibilityStatus('ineligible');
        toast({
          title: "Hemoglobin Too Low",
          description: "Hemoglobin must be at least 12.5 g/dL.",
          variant: "destructive"
        });
        return;
      }

      const isMale = formData.gender === 'male';
      const isFemale = formData.gender === 'female';
      if (isNaN(rbc) || (
        (isMale && (rbc < 4.5 || rbc > 5.9)) ||
        (isFemale && (rbc < 4.1 || rbc > 5.5))
      )) {
        setEligibilityStatus('ineligible');
        toast({
          title: "RBC Count Outside Range",
          description: isMale ? "Acceptable RBC for males: 4.5 - 5.9 million/µL" : "Acceptable RBC for females: 4.1 - 5.5 million/µL",
          variant: "destructive"
        });
        return;
      }

      if (isNaN(systolic) || isNaN(diastolic) || systolic < 100 || systolic > 180 || diastolic < 60 || diastolic > 100) {
        setEligibilityStatus('ineligible');
        toast({
          title: "Blood Pressure Out of Range",
          description: "BP should be between 100-180 / 60-100 mmHg.",
          variant: "destructive"
        });
        return;
      }

      if (isNaN(pulse) || pulse < 50 || pulse > 100) {
        setEligibilityStatus('ineligible');
        toast({
          title: "Pulse Rate Out of Range",
          description: "Pulse should be between 50 and 100 bpm.",
          variant: "destructive"
        });
        return;
      }

      if (formData.medicalConditions || formData.medications || formData.recentIllness || formData.recentSurgery) {
        setEligibilityStatus('ineligible');
        toast({
          title: "Health Screening",
          description: "Based on your medical information, you're currently not eligible to donate.",
          variant: "destructive"
        });
        return;
      }

      if (formData.hasTattoos) {
        setEligibilityStatus('ineligible');
        toast({
          title: "Recent Tattoo/Piercing",
          description: "Please wait at least 3 months after a tattoo or piercing.",
          variant: "destructive"
        });
        return;
      }

      if (formData.lastDonation) {
        const lastDate = new Date(formData.lastDonation);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (!isNaN(diffDays) && diffDays < 90) {
          setEligibilityStatus('ineligible');
          toast({
            title: "Recent Donation",
            description: "You must wait at least 3 months between donations.",
            variant: "destructive"
          });
          return;
        }
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
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('User authentication error:', userError);
        toast({
          title: "Authentication Required",
          description: "Please sign in to register as a donor.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      console.log('User authenticated:', user.id);
      console.log('Form data:', formData);
      console.log('Eligibility status:', eligibilityStatus);

      let latitude: number;
      let longitude: number;

      try {
        const coords = await LocationService.getCityCoordinates(formData.city);
        latitude = coords.latitude;
        longitude = coords.longitude;
      } catch (error) {
        console.error('Geocoding error:', error);
        latitude = 28.6139;
        longitude = 77.2090;
      }

      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileCheckError) {
        console.error('Error checking profile:', profileCheckError);
        toast({
          title: "Profile Check Error",
          description: `Failed to check existing profile: ${profileCheckError.message}`,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      let result;
      if (existingProfile) {
        result = await supabase
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
      } else {
        result = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.email || formData.email,
            full_name: formData.fullName,
            age: parseInt(formData.age),
            gender: formData.gender,
            blood_group: formData.bloodGroup,
            phone: formData.phone,
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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }

      if (result.error) {
        console.error('Database operation error:', result.error);
        toast({
          title: "Database Error",
          description: `Failed to save profile: ${result.error.message}`,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      const registrationPayload = {
        user_id: user.id,
        full_name: formData.fullName,
        age: parseInt(formData.age),
        gender: formData.gender,
        blood_group: formData.bloodGroup,
        phone: formData.phone,
        email: user.email || formData.email,
        address: formData.address,
        city: formData.city,
        weight_kg: formData.weightKg ? parseFloat(formData.weightKg) : null,
        height_cm: formData.heightCm ? parseInt(formData.heightCm) : null,
        hemoglobin_level: formData.hemoglobin ? parseFloat(formData.hemoglobin) : null,
        rbc_count: formData.rbcCount ? parseFloat(formData.rbcCount) : null,
        blood_pressure_systolic: formData.systolicBP ? parseInt(formData.systolicBP) : null,
        blood_pressure_diastolic: formData.diastolicBP ? parseInt(formData.diastolicBP) : null,
        pulse_rate: formData.pulseRate ? parseInt(formData.pulseRate) : null,
        has_medical_conditions: formData.medicalConditions,
        taking_medications: formData.medications,
        recent_illness: formData.recentIllness,
        recent_surgery: formData.recentSurgery,
        has_tattoos: formData.hasTattoos,
        last_donation_date: formData.lastDonation || null,
        latitude,
        longitude,
        registration_status: 'pending',
        eligibility_status: eligibilityStatus,
        consent_given: formData.consent
      };

      const { error: registrationError } = await supabase
        .from('donor_registrations')
        .insert(registrationPayload);

      if (registrationError) {
        console.error('Donor registration error:', registrationError);
        toast({
          title: "Registration Error",
          description: `Failed to save registration: ${registrationError.message}`,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      if (eligibilityStatus === 'eligible') {
        console.log('Adding to eligible donors table...');
        const eligiblePayload = {
          user_id: user.id,
          full_name: formData.fullName,
          blood_group: formData.bloodGroup,
          phone: formData.phone,
          email: user.email || formData.email,
          age: parseInt(formData.age),
          gender: formData.gender,
          city: formData.city,
          address: formData.address,
          latitude,
          longitude,
          hemoglobin_level: formData.hemoglobin ? parseFloat(formData.hemoglobin) : null,
          rbc_count: formData.rbcCount ? parseFloat(formData.rbcCount) : null,
          blood_pressure_systolic: formData.systolicBP ? parseInt(formData.systolicBP) : null,
          blood_pressure_diastolic: formData.diastolicBP ? parseInt(formData.diastolicBP) : null,
          weight_kg: formData.weightKg ? parseFloat(formData.weightKg) : null,
          height_cm: formData.heightCm ? parseInt(formData.heightCm) : null,
          pulse_rate: formData.pulseRate ? parseInt(formData.pulseRate) : null,
          has_medical_conditions: formData.medicalConditions,
          taking_medications: formData.medications,
          recent_illness: formData.recentIllness,
          recent_surgery: formData.recentSurgery,
          has_tattoos: formData.hasTattoos,
          is_eligible: true,
          is_verified: true,
          is_available: true,
          last_donation_date: formData.lastDonation || null
        };

        const { error: eligibleError } = await supabase
          .from('eligible_donors')
          .upsert(eligiblePayload, { onConflict: 'user_id' });

        if (eligibleError) {
          console.error('Eligible donors upsert error:', eligibleError);
          toast({
            title: "Warning",
            description: "Registration saved but couldn't add to eligible donors list.",
            variant: "destructive"
          });
        } else {
          console.log('Successfully added to eligible donors');
        }
      }

      console.log('Registration completed successfully!');
      toast({
        title: "Registration Successful! 🎉",
        description: "Thank you for joining our life-saving community. You'll receive a confirmation email shortly.",
      });

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
        recentSurgery: false,
        hasTattoos: false,
        hemoglobin: '',
        rbcCount: '',
        systolicBP: '',
        diastolicBP: '',
        weightKg: '',
        heightCm: '',
        pulseRate: '',
        consent: false
      });
      setEligibilityStatus(null);
      
      window.location.href = '/profile';
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "There was an error registering your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate progress for the Progress component (0-100%)
  const progressValue = () => {
    if (eligibilityStatus === 'eligible') return 100;
    if (formData.fullName && formData.age && formData.bloodGroup && formData.gender) return 50;
    return 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <Heart className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse" />
          <h1 className="text-4xl font-bold text-gray-900">Become a Blood Donor</h1>
          <p className="text-gray-600 mt-2 text-lg">
            Join thousands of heroes saving lives in your community
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm font-medium text-gray-700">
            <span className={formData.fullName && formData.age && formData.bloodGroup && formData.gender ? 'text-green-600' : ''}>
              1. Fill Details
            </span>
            <span className={eligibilityStatus === 'eligible' ? 'text-green-600' : ''}>
              2. Check Eligibility
            </span>
            <span className={eligibilityStatus === 'eligible' ? 'text-blue-600' : ''}>
              3. Register
            </span>
          </div>
          <Progress value={progressValue()} className="h-2 bg-gray-200" />
        </div>

        {/* Form Card */}
        <Card className="shadow-md rounded-lg bg-white">
          <CardHeader className="bg-red-50 rounded-t-lg">
            <CardTitle className="flex items-center space-x-2 text-2xl">
              <Heart className="w-6 h-6 text-red-500" />
              <span>Donor Registration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      className="border-gray-300 focus:ring-2 focus:ring-red-500"
                      aria-describedby="fullName-error"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-sm font-medium text-gray-700">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      min="18"
                      max="65"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      required
                      className="border-gray-300 focus:ring-2 focus:ring-red-500"
                      aria-describedby="age-error"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium text-gray-700">Gender *</Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-red-500">
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
                    <Label htmlFor="bloodGroup" className="text-sm font-medium text-gray-700">Blood Group *</Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}>
                      <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-red-500">
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
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="border-gray-300 focus:ring-2 focus:ring-red-500"
                      aria-describedby="phone-error"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="border-gray-300 focus:ring-2 focus:ring-red-500"
                      aria-describedby="email-error"
                    />
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900">Location Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const location = await LocationService.getCurrentLocation();
                            setFormData(prev => ({
                              ...prev,
                              address: location.address || prev.address,
                              city: location.city || prev.city
                            }));
                            toast({
                              title: "Location Updated",
                              description: "Your current location has been detected and added.",
                            });
                          } catch (error) {
                            toast({
                              title: "Location Access Denied",
                              description: "Please enter your location manually.",
                              variant: "destructive"
                            });
                          }
                        }}
                        className="text-xs border-gray-300 hover:bg-red-50"
                        aria-label="Use current location"
                      >
                        📍 Use Current Location
                      </Button>
                    </div>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                      className="border-gray-300 focus:ring-2 focus:ring-red-500"
                      aria-describedby="address-error"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium text-gray-700">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                      className="border-gray-300 focus:ring-2 focus:ring-red-500"
                      aria-describedby="city-error"
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900">Medical Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="lastDonation" className="text-sm font-medium text-gray-700">Last Blood Donation Date (if any)</Label>
                  <Input
                    id="lastDonation"
                    type="date"
                    value={formData.lastDonation}
                    onChange={(e) => setFormData({ ...formData, lastDonation: e.target.value })}
                    className="border-gray-300 focus:ring-2 focus:ring-red-500"
                    aria-describedby="lastDonation-error"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="weightKg" className="text-sm font-medium text-gray-700">Weight (kg) *</Label>
                    <Input
                      id="weightKg"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.weightKg}
                      onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                      className="border-gray-300 focus:ring-2 focus:ring-red-500"
                      aria-describedby="weightKg-error"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hemoglobin" className="text-sm font-medium text-gray-700">Hemoglobin (g/dL) *</Label>
                    <Input
                      id="hemoglobin"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.hemoglobin}
                      onChange={(e) => setFormData({ ...formData, hemoglobin: e.target.value })}
                      className="border-gray-300 focus:ring-2 focus:ring-red-500"
                      aria-describedby="hemoglobin-error"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rbcCount" className="text-sm font-medium text-gray-700">RBC Count (million/µL) *</Label>
                    <Input
                      id="rbcCount"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.rbcCount}
                      onChange={(e) => setFormData({ ...formData, rbcCount: e.target.value })}
                      className="border-gray-300 focus:ring-2 focus:ring-red-500"
                      aria-describedby="rbcCount-error"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pulseRate" className="text-sm font-medium text-gray-700">Pulse Rate (bpm) *</Label>
                    <Input
                      id="pulseRate"
                      type="number"
                      min="0"
                      value={formData.pulseRate}
                      onChange={(e) => setFormData({ ...formData, pulseRate: e.target.value })}
                      className="border-gray-300 focus:ring-2 focus:ring-red-500"
                      aria-describedby="pulseRate-error"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="systolicBP" className="text-sm font-medium text-gray-700">Systolic BP (mmHg) *</Label>
                    <Input
                      id="systolicBP"
                      type="number"
                      min="0"
                      value={formData.systolicBP}
                      onChange={(e) => setFormData({ ...formData, systolicBP: e.target.value })}
                      className="border-gray-300 focus:ring-2 focus:ring-red-500"
                      aria-describedby="systolicBP-error"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diastolicBP" className="text-sm font-medium text-gray-700">Diastolic BP (mmHg) *</Label>
                    <Input
                      id="diastolicBP"
                      type="number"
                      min="0"
                      value={formData.diastolicBP}
                      onChange={(e) => setFormData({ ...formData, diastolicBP: e.target.value })}
                      className="border-gray-300 focus:ring-2 focus:ring-red-500"
                      aria-describedby="diastolicBP-error"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="medicalConditions"
                      checked={formData.medicalConditions}
                      onCheckedChange={(checked) => setFormData({ ...formData, medicalConditions: checked as boolean })}
                      aria-label="Chronic medical conditions"
                    />
                    <Label htmlFor="medicalConditions" className="text-sm text-gray-700">
                      I have chronic medical conditions (diabetes, heart disease, etc.)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="medications"
                      checked={formData.medications}
                      onCheckedChange={(checked) => setFormData({ ...formData, medications: checked as boolean })}
                      aria-label="Currently taking medications"
                    />
                    <Label htmlFor="medications" className="text-sm text-gray-700">
                      I am currently taking medications
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="recentIllness"
                      checked={formData.recentIllness}
                      onCheckedChange={(checked) => setFormData({ ...formData, recentIllness: checked as boolean })}
                      aria-label="Recent illness"
                    />
                    <Label htmlFor="recentIllness" className="text-sm text-gray-700">
                      I have been ill in the past 2 weeks
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="recentSurgery"
                      checked={formData.recentSurgery}
                      onCheckedChange={(checked) => setFormData({ ...formData, recentSurgery: checked as boolean })}
                      aria-label="Recent surgery"
                    />
                    <Label htmlFor="recentSurgery" className="text-sm text-gray-700">
                      I underwent surgery in the last 6 months
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasTattoos"
                      checked={formData.hasTattoos}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasTattoos: checked as boolean })}
                      aria-label="Recent tattoo or piercing"
                    />
                    <Label htmlFor="hasTattoos" className="text-sm text-gray-700">
                      I had a tattoo/piercing in the last 3 months
                    </Label>
                  </div>
                </div>
              </div>

              {/* Eligibility Check */}
              <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Eligibility Check</h3>
                    <p className="text-sm text-gray-600">Complete this step to enable registration</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={checkEligibility}
                    disabled={!formData.age || !formData.fullName || !formData.bloodGroup || !formData.gender || eligibilityStatus === 'checking'}
                    className="border-gray-300 hover:bg-red-50"
                    aria-label="Check eligibility"
                  >
                    {eligibilityStatus === 'checking' ? (
                      <span className="flex items-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking...
                      </span>
                    ) : (
                      'Check Eligibility'
                    )}
                  </Button>
                </div>
                {eligibilityStatus === 'eligible' && (
                  <div className="flex items-center space-x-2 text-green-700 bg-green-100 p-4 rounded-lg animate-slide-in">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">You are eligible to donate blood!</span>
                  </div>
                )}
                {eligibilityStatus === 'ineligible' && (
                  <div className="flex items-center space-x-2 text-red-700 bg-red-100 p-4 rounded-lg animate-slide-in">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">You are currently not eligible to donate. Please consult with our medical team.</span>
                  </div>
                )}
              </div>

              {/* Consent */}
              <div className="flex items-center space-x-2 bg-gray-50 p-6 rounded-lg">
                <Checkbox
                  id="consent"
                  checked={formData.consent}
                  onCheckedChange={(checked) => setFormData({ ...formData, consent: checked as boolean })}
                  aria-label="Consent to terms and conditions"
                />
                <Label htmlFor="consent" className="text-sm text-gray-700">
                  I agree to the terms and conditions and consent to be contacted for blood donation requests *
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold disabled:bg-gray-400"
                disabled={eligibilityStatus !== 'eligible' || isSubmitting}
                aria-label="Register as donor"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Registering...
                  </span>
                ) : (
                  'Register as Donor'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DonorRegistration;
