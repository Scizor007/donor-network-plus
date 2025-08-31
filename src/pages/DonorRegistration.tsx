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

  const [eligibilityStatus, setEligibilityStatus] = useState<'checking' | 'eligible' | 'ineligible' | null>(null);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const checkEligibility = () => {
    const age = parseInt(formData.age);
    const lastDonationDate = formData.lastDonation ? new Date(formData.lastDonation) : null;
    const monthsSinceLastDonation = lastDonationDate 
      ? (Date.now() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      : 12; // Assume eligible if no previous donation

    setEligibilityStatus('checking');
    
    setTimeout(() => {
      if (age < 18 || age > 65) {
        setEligibilityStatus('ineligible');
        return;
      }
      
      if (formData.medicalConditions || formData.medications || formData.recentIllness) {
        setEligibilityStatus('ineligible');
        return;
      }
      
      if (monthsSinceLastDonation < 3) {
        setEligibilityStatus('ineligible');
        return;
      }
      
      setEligibilityStatus('eligible');
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
        description: "Please complete the eligibility check first.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Registration Successful! 🎉",
      description: "Thank you for joining our life-saving community. You'll receive a confirmation email shortly.",
    });
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
                  <h3 className="text-lg font-semibold">Eligibility Check</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={checkEligibility}
                    disabled={!formData.age || eligibilityStatus === 'checking'}
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
                disabled={eligibilityStatus !== 'eligible'}
              >
                Register as Donor
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DonorRegistration;