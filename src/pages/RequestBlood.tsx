import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMPONENTS = ['Whole Blood', 'RBC', 'Platelets', 'Plasma', 'FFP'];
const URGENCY = ['low', 'medium', 'high'];

const RequestBlood = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<string>('');
  const [component, setComponent] = useState<string>('');
  const [units, setUnits] = useState('');
  const [urgency, setUrgency] = useState<string>('medium');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [neededBy, setNeededBy] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const submit = async () => {
    if (!user) {
      toast({ title: 'Authentication Required', description: 'Please sign in to submit a blood request.', variant: 'destructive' });
      return;
    }

    if (!patientName || !hospitalName || !bloodGroup || !component || !units || !city || !state || !contactPhone) {
      toast({ title: 'Missing details', description: 'Please fill all required fields.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('blood_requests')
        .insert({
          user_id: user.id,
          patient_name: patientName,
          hospital_name: hospitalName,
          hospital_address: `${hospitalName}, ${city}, ${state}`,
          blood_group: bloodGroup,
          units_needed: parseInt(units),
          urgency_level: urgency,
          contact_phone: contactPhone,
          needed_by: neededBy || null,
          additional_notes: additionalNotes || null,
          status: 'pending'
        });

      if (error) throw error;

      toast({ 
        title: 'Request submitted successfully! 🎉', 
        description: 'Your blood request has been sent to nearby blood banks and donors.' 
      });

      // Reset form
      setPatientName('');
      setHospitalName('');
      setBloodGroup('');
      setComponent('');
      setUnits('');
      setUrgency('medium');
      setCity('');
      setState('');
      setContactPhone('');
      setNeededBy('');
      setAdditionalNotes('');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({ 
        title: 'Submission Failed', 
        description: 'There was an error submitting your request. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Request Blood</h1>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Patient Requirement</CardTitle>
            <CardDescription>Provide accurate information to help blood banks respond quickly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Patient Name</Label>
                <Input placeholder="Full name" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
              </div>
              <div>
                <Label>Hospital Name</Label>
                <Input placeholder="Hospital/Clinic" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} />
              </div>
              <div>
                <Label>Blood Group</Label>
                <Select value={bloodGroup} onValueChange={setBloodGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map(bg => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Component</Label>
                <Select value={component} onValueChange={setComponent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select component" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPONENTS.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Units Needed</Label>
                <Input type="number" min="1" placeholder="e.g., 2" value={units} onChange={(e) => setUnits(e.target.value)} />
              </div>
              <div>
                <Label>Urgency</Label>
                <Select value={urgency} onValueChange={setUrgency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    {URGENCY.map(u => (
                      <SelectItem key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>City</Label>
                <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div>
                <Label>State</Label>
                <Input placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
              </div>
              <div>
                <Label>Contact Phone *</Label>
                <Input placeholder="Your contact number" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
              </div>
              <div>
                <Label>Needed By (Optional)</Label>
                <Input type="datetime-local" value={neededBy} onChange={(e) => setNeededBy(e.target.value)} />
              </div>
            </div>
            <div className="pt-4">
              <Label>Additional Notes (Optional)</Label>
              <textarea 
                className="w-full p-2 border rounded-md mt-1" 
                rows={3} 
                placeholder="Any additional information about the patient or requirements..."
                value={additionalNotes} 
                onChange={(e) => setAdditionalNotes(e.target.value)} 
              />
            </div>
            <div className="pt-4">
              <Button onClick={submit} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default RequestBlood;