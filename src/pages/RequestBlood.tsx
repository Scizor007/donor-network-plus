import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { toast } from '@/components/ui/use-toast';
import { Heart, Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Map from '@/components/Map';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext'; // Assuming you have this context

const RequestBlood = () => {
  const { user } = useAuth(); // Get current user for user_id
  const [formData, setFormData] = useState({
    patientName: '',
    hospitalName: '',
    hospitalAddress: '',
    contactPhone: '',
    unitsNeeded: 1,
    neededBy: new Date().toISOString().split('T')[0],
    additionalNotes: '',
    urgencyLevel: 'normal',
    bloodGroup: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requests, setRequests] = useState([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    getUserLocation();
    fetchRequests();
    const channel = supabase
      .channel('blood_requests_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'blood_requests' }, fetchRequests)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation([position.coords.latitude, position.coords.longitude]),
        (error) => console.error('Location access denied:', error)
      );
    }
  };

  const fetchRequests = async () => {
    const { data, error } = await supabase.from('blood_requests').select('*');
    if (error) console.error('Error fetching requests:', error);
    else setRequests(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return toast({ title: 'Error', description: 'Please log in to submit a request.' });
    setIsSubmitting(true);

    // Geocode hospital address (simplified; consider a geocoding API like OpenCage or Google Maps)
    const [latitude, longitude] = userLocation || [28.6139, 77.2090]; // Default to Delhi if no location

    const { error } = await supabase.from('blood_requests').insert({
      patient_name: formData.patientName,
      hospital_name: formData.hospitalName,
      hospital_address: formData.hospitalAddress,
      contact_phone: formData.contactPhone,
      units_needed: formData.unitsNeeded,
      needed_by: formData.neededBy,
      additional_notes: formData.additionalNotes,
      urgency_level: formData.urgencyLevel,
      blood_group: formData.bloodGroup,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      latitude,
      longitude, // Add lat/long for mapping (optional; requires geocoding)
    });

    setIsSubmitting(false);
    if (error) toast({ title: 'Error', description: error.message });
    else {
      toast({ title: 'Success', description: 'Blood request submitted!' });
      setFormData({
        patientName: '',
        hospitalName: '',
        hospitalAddress: '',
        contactPhone: '',
        unitsNeeded: 1,
        neededBy: new Date().toISOString().split('T')[0],
        additionalNotes: '',
        urgencyLevel: 'normal',
        bloodGroup: '',
      });
      fetchRequests();
    }
  };

  const getMapCenter = () => userLocation || [20.5937, 78.9629]; // India centroid

  return (
    <div className="min-h-screen bg-medical-background">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8 animate-in fade-in-50 slide-in-from-top-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto mb-4 shadow-sm">
            <Heart className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary">
            Request Blood
          </h1>
          <p className="text-muted-foreground mt-2">Find availability and create urgent requests</p>
        </div>

        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Patient Name *</Label>
                  <Input
                    id="patientName"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospitalName">Hospital Name *</Label>
                  <Input
                    id="hospitalName"
                    value={formData.hospitalName}
                    onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospitalAddress">Hospital Address *</Label>
                  <Input
                    id="hospitalAddress"
                    value={formData.hospitalAddress}
                    onChange={(e) => setFormData({ ...formData, hospitalAddress: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone *</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitsNeeded">Units Needed</Label>
                  <Input
                    id="unitsNeeded"
                    type="number"
                    min="1"
                    value={formData.unitsNeeded}
                    onChange={(e) => setFormData({ ...formData, unitsNeeded: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neededBy">Needed By</Label>
                  <CalendarComponent
                    mode="single"
                    selected={new Date(formData.neededBy)}
                    onSelect={(date) => date && setFormData({ ...formData, neededBy: date.toISOString().split('T')[0] })}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group *</Label>
                  <Select
                    onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}
                    value={formData.bloodGroup}
                    required
                  >
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
                  <Label htmlFor="urgencyLevel">Urgency Level</Label>
                  <Select
                    onValueChange={(value) => setFormData({ ...formData, urgencyLevel: value })}
                    value={formData.urgencyLevel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Normal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Input
                  id="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-red-500 hover:bg-red-600">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </span>
                ) : (
                  'Create Urgent Blood Request'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-primary" />
              <span>Blood Request Map</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Map
              donors={[]}
              emergencyLocations={[]}
              bloodCamps={[]}
              userLocation={userLocation}
              center={getMapCenter()}
              zoom={12}
            />
            {requests.map((req) => (
              <div key={req.id} className="mt-2 p-2 bg-muted rounded">
                <p><strong>Patient:</strong> {req.patient_name}</p>
                <p><strong>Hospital:</strong> {req.hospital_name}</p>
                <p><strong>Blood Group:</strong> {req.blood_group}</p>
                <p><strong>Urgency:</strong> {req.urgency_level}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RequestBlood;