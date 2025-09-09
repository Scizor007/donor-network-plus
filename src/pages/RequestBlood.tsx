import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMPONENTS = ['Whole Blood', 'RBC', 'Platelets', 'Plasma', 'FFP'];
const URGENCY = ['low', 'medium', 'high'];

const RequestBlood = () => {
  const { toast } = useToast();
  const [patientName, setPatientName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<string>('');
  const [component, setComponent] = useState<string>('');
  const [units, setUnits] = useState('');
  const [urgency, setUrgency] = useState<string>('medium');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const submit = () => {
    if (!patientName || !hospitalName || !bloodGroup || !component || !units || !city || !state) {
      toast({ title: 'Missing details', description: 'Please fill all required fields.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Request submitted', description: 'Your request has been sent to nearby blood banks.' });
    setPatientName('');
    setHospitalName('');
    setBloodGroup('');
    setComponent('');
    setUnits('');
    setUrgency('medium');
    setCity('');
    setState('');
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
            </div>
            <div className="pt-4">
              <Button onClick={submit}>Submit Request</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default RequestBlood;