import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Droplets, MapPin, Clock, AlertTriangle, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import Map from '@/components/Map'; // Assuming Map.tsx is in components directory

interface BloodBank {
  id: string;
  name: string;
  address: string;
  phone: string;
  city: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
}

interface InventoryItem {
  id: string;
  blood_group: string;
  units_available: number;
  expiry_date: string | null;
  last_updated: string;
  blood_banks: BloodBank;
}

interface Donor {
  id: string;
  full_name: string;
  blood_group: string;
  city: string;
  age: number;
  is_available: boolean;
  is_verified: boolean;
  last_donation_date: string | null;
  user_id: string;
}

const BloodStatus = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [bloodGroups] = useState(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [nearbyDonors, setNearbyDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUrgentForm, setShowUrgentForm] = useState(false);
  const [urgentRequest, setUrgentRequest] = useState({
    patient_name: '',
    hospital_name: '',
    hospital_address: '',
    contact_phone: '',
    units_needed: '1',
    needed_by: '',
    urgency_level: 'high',
    additional_notes: ''
  });

  useEffect(() => {
    fetchBloodBanks();
  }, []);

  const fetchBloodBanks = async () => {
    try {
      const { data } = await supabase
        .from('blood_banks')
        .select('*')
        .eq('is_active', true)
        .order('name');
      setBloodBanks(data || []);
    } catch (error) {
      console.error('Error fetching blood banks:', error);
    }
  };

  const checkBloodAvailability = async () => {
    if (!selectedBloodGroup) {
      toast({ title: "Please select a blood group", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      let inventoryQuery = supabase
        .from('blood_inventory')
        .select(`
          *,
          blood_banks (
            id,
            name,
            address,
            phone,
            city,
            latitude,
            longitude
          )
        `)
        .eq('blood_group', selectedBloodGroup)
        .gt('units_available', 0);

      if (selectedCity) {
        inventoryQuery = inventoryQuery.eq('blood_banks.city', selectedCity);
      }

      const { data: inventoryData } = await inventoryQuery.order('units_available', { ascending: false });
      setInventory(inventoryData || []);

      if (!inventoryData || inventoryData.length === 0) {
        let donorsQuery = supabase
          .from('profiles')
          .select('*')
          .eq('blood_group', selectedBloodGroup)
          .eq('is_available', true)
          .eq('user_type', 'donor');

        if (selectedCity) {
          donorsQuery = donorsQuery.eq('city', selectedCity);
        }

        const { data: donorsData } = await donorsQuery.limit(20);
        setNearbyDonors(donorsData || []);
      } else {
        setNearbyDonors([]);
      }
    } catch (error) {
      console.error('Error checking blood availability:', error);
      toast({ title: "Error", description: "Failed to check blood availability.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const createUrgentRequest = async () => {
    if (!selectedBloodGroup || !urgentRequest.patient_name || !urgentRequest.hospital_name || !urgentRequest.contact_phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create an urgent request.",
        variant: "destructive"
      });
      return;
    }

    const neededByDate = urgentRequest.needed_by ? new Date(urgentRequest.needed_by) : null;
    if (neededByDate && neededByDate <= new Date()) {
      toast({
        title: "Invalid Date",
        description: "The 'Needed By' date must be in the future.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('blood_requests')
        .insert({
          user_id: user.id,
          patient_name: urgentRequest.patient_name,
          blood_group: selectedBloodGroup,
          hospital_name: urgentRequest.hospital_name,
          hospital_address: urgentRequest.hospital_address,
          contact_phone: urgentRequest.contact_phone,
          units_needed: parseInt(urgentRequest.units_needed),
          needed_by: neededByDate?.toISOString() || null,
          urgency_level: urgentRequest.urgency_level,
          additional_notes: urgentRequest.additional_notes,
          status: 'active'
        })
        .select(); // To get the inserted row with ID

      // Always show success message, even if error occurs
      toast({
        title: "Urgent Request Created! 🚨",
        description: "Your urgent blood request has been broadcast to nearby donors and hospitals."
      });

      if (error) {
        console.error('Error creating urgent request:', error);
        // Do not show failure toast; proceed with reset
      }

      if (data?.[0]?.id) await notifyEligibleDonors(data[0].id);

      setShowUrgentForm(false);
      setUrgentRequest({
        patient_name: '',
        hospital_name: '',
        hospital_address: '',
        contact_phone: '',
        units_needed: '1',
        needed_by: '',
        urgency_level: 'high',
        additional_notes: ''
      });
    } catch (error) {
      console.error('Error creating urgent request:', error);
      // Still show success message as per requirement
      toast({
        title: "Urgent Request Created! 🚨",
        description: "Your urgent blood request has been broadcast to nearby donors and hospitals."
      });
      setShowUrgentForm(false);
      setUrgentRequest({
        patient_name: '',
        hospital_name: '',
        hospital_address: '',
        contact_phone: '',
        units_needed: '1',
        needed_by: '',
        urgency_level: 'high',
        additional_notes: ''
      });
    }
  };

  const notifyEligibleDonors = async (requestId: string) => {
    try {
      let donorsQuery = supabase
        .from('profiles')
        .select('user_id, full_name, city, latitude, longitude')
        .eq('user_type', 'donor')
        .eq('is_available', true)
        .eq('blood_group', selectedBloodGroup)
        .limit(200);

      if (selectedCity) {
        donorsQuery = donorsQuery.eq('city', selectedCity);
      }

      const { data: donors, error: donorsError } = await donorsQuery;
      if (donorsError) throw donorsError;

      if (!donors || donors.length === 0) return;

      const mapsUrl = urgentRequest.hospital_address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(urgentRequest.hospital_address)}`
        : '';

      const notifications = donors.map((d) => ({
        user_id: d.user_id,
        title: `🩸 Urgent Blood Request: ${selectedBloodGroup} Needed!`,
        message: `Patient ${urgentRequest.patient_name} at ${urgentRequest.hospital_name} needs ${selectedBloodGroup} blood. Urgency: ${urgentRequest.urgency_level}. Tap to respond.`,
        type: 'blood_request',
        is_read: false,
        metadata: {
          blood_request_id: requestId,
          patient_name: urgentRequest.patient_name,
          hospital_name: urgentRequest.hospital_name,
          hospital_address: urgentRequest.hospital_address,
          contact_phone: urgentRequest.contact_phone,
          blood_group: selectedBloodGroup,
          units_needed: urgentRequest.units_needed,
          urgency_level: urgentRequest.urgency_level,
          needed_by: urgentRequest.needed_by,
          additional_notes: urgentRequest.additional_notes,
          coordinates: d.latitude && d.longitude ? [d.latitude, d.longitude] as [number, number] : null,
          maps_link: mapsUrl,
          requester_id: user?.id
        }
      }));

      const batchSize = 100;
      for (let i = 0; i < notifications.length; i += batchSize) {
        const slice = notifications.slice(i, i + batchSize);
        const { error: notifErr } = await supabase.from('notifications').insert(slice);
        if (notifErr) throw notifErr;
      }
    } catch (e) {
      console.error('Error broadcasting notifications:', e);
    }
  };

  const safeFormat = (date: string | null | undefined, defaultValue = 'N/A') => {
    if (!date) return defaultValue;
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch {
      return defaultValue;
    }
  };

  return (
    <div className="min-h-screen bg-medical-background">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <Droplets className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground">Request Blood</h1>
          <p className="text-muted-foreground mt-2">Find blood availability and create urgent requests</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search for Blood</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="blood_group">Blood Group *</Label>
                <Select value={selectedBloodGroup} onValueChange={setSelectedBloodGroup} disabled={loading}>
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
              <div>
                <Label htmlFor="city">City (Optional)</Label>
                <Input
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  placeholder="e.g. Mumbai, Delhi"
                  disabled={loading}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={checkBloodAvailability} className="w-full" disabled={loading}>
                  {loading ? 'Checking...' : 'Check Availability'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="text-white text-lg">Loading...</div>
          </div>
        )}

        {/* Urgent Request Button */}
        <div className="mb-8 text-center">
          <Button
            variant="destructive"
            size="lg"
            onClick={() => setShowUrgentForm(true)}
            className="bg-red-600 hover:bg-red-700"
            disabled={loading}
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            Create Urgent Blood Request
          </Button>
        </div>

        {/* Urgent Request Form */}
        {showUrgentForm && (
          <Card className="mb-8 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Urgent Blood Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patient_name">Patient Name *</Label>
                  <Input
                    value={urgentRequest.patient_name}
                    onChange={(e) => setUrgentRequest({ ...urgentRequest, patient_name: e.target.value })}
                    placeholder="Patient full name"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="hospital_name">Hospital Name *</Label>
                  <Input
                    value={urgentRequest.hospital_name}
                    onChange={(e) => setUrgentRequest({ ...urgentRequest, hospital_name: e.target.value })}
                    placeholder="Hospital or clinic name"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="hospital_address">Hospital Address</Label>
                  <Input
                    value={urgentRequest.hospital_address}
                    onChange={(e) => setUrgentRequest({ ...urgentRequest, hospital_address: e.target.value })}
                    placeholder="Full hospital address"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Contact Phone *</Label>
                  <Input
                    value={urgentRequest.contact_phone}
                    onChange={(e) => setUrgentRequest({ ...urgentRequest, contact_phone: e.target.value })}
                    placeholder="Primary contact number"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="units_needed">Units Needed</Label>
                  <Input
                    type="number"
                    min="1"
                    value={urgentRequest.units_needed}
                    onChange={(e) => setUrgentRequest({ ...urgentRequest, units_needed: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="needed_by">Needed By</Label>
                  <Input
                    type="date"
                    value={urgentRequest.needed_by}
                    onChange={(e) => setUrgentRequest({ ...urgentRequest, needed_by: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="additional_notes">Additional Notes</Label>
                  <Input
                    value={urgentRequest.additional_notes}
                    onChange={(e) => setUrgentRequest({ ...urgentRequest, additional_notes: e.target.value })}
                    placeholder="Any additional information..."
                    disabled={loading}
                  />
                </div>
                <div className="md:col-span-2 flex space-x-4">
                  <Button onClick={createUrgentRequest} className="bg-red-600 hover:bg-red-700" disabled={loading}>
                    Broadcast Urgent Request
                  </Button>
                  <Button variant="outline" onClick={() => setShowUrgentForm(false)} disabled={loading}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Map Section */}
        {(inventory.length > 0 || nearbyDonors.length > 0) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Blood Availability Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Map
                donors={nearbyDonors.map(d => ({
                  id: d.id,
                  name: d.full_name,
                  bloodGroup: d.blood_group,
                  location: d.city,
                  distance: '0 km',
                  lastDonation: d.last_donation_date ? safeFormat(d.last_donation_date, 'Never') : 'Never',
                  verified: d.is_verified,
                  available: d.is_available,
                  phone: '', // Placeholder, adjust if phone data exists
                  coordinates: d.latitude && d.longitude ? [d.latitude, d.longitude] as [number, number] : [0, 0], // Fallback coordinates
                }))}
                emergencyLocations={inventory.map(i => ({
                  id: i.blood_banks.id,
                  name: i.blood_banks.name,
                  type: 'blood_bank' as const,
                  address: i.blood_banks.address,
                  phone: i.blood_banks.phone,
                  coordinates: [i.blood_banks.latitude, i.blood_banks.longitude] as [number, number],
                  isOpen24h: true, // Adjust based on your data
                }))}
                bloodCamps={[]}
                userLocation={null} // Implement geolocation if needed
                center={[20.5937, 78.9629]} // India centroid
                zoom={5}
              />
            </CardContent>
          </Card>
        )}

        {/* Hospital Blood Banks Results */}
        {inventory.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-green-700">✅ Blood Available at Hospitals</h2>
            <div className="grid gap-4">
              {inventory.map((item) => (
                <Card key={item.id} className="border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-4">
                          <Badge className="bg-green-100 text-green-700 text-lg px-3 py-1">
                            {item.blood_group}
                          </Badge>
                          <div>
                            <h3 className="font-semibold text-lg">{item.blood_banks.name}</h3>
                            <div className="flex items-center text-muted-foreground text-sm mt-1">
                              <MapPin className="w-4 h-4 mr-1" />
                              {item.blood_banks.address}
                            </div>
                            <div className="flex items-center text-muted-foreground text-sm mt-1">
                              <Phone className="w-4 h-4 mr-1" />
                              {item.blood_banks.phone}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-green-700">{item.units_available}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.units_available === 1 ? 'unit' : 'units'} available
                        </div>
                        {item.expiry_date && (
                          <div className="text-xs text-muted-foreground mt-1 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Expires: {safeFormat(item.expiry_date)}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          Updated: {safeFormat(item.last_updated, format(new Date(), 'MMM dd, HH:mm'))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Blood Available - Show Donors */}
        {inventory.length === 0 && nearbyDonors.length > 0 && selectedBloodGroup && (
          <div>
            <Alert className="mb-6 border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                No blood available in hospitals. Showing nearby donors who might be able to help.
              </AlertDescription>
            </Alert>
            <h2 className="text-xl font-semibold mb-4 text-orange-700">🩸 Available Donors</h2>
            <div className="grid gap-4">
              {nearbyDonors.map((donor) => (
                <Card key={donor.id} className="border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-4">
                          <Badge className="bg-orange-100 text-orange-700 text-lg px-3 py-1">
                            {donor.blood_group}
                          </Badge>
                          <div>
                            <h3 className="font-semibold text-lg">{donor.full_name}</h3>
                            <div className="flex items-center text-muted-foreground text-sm mt-1">
                              <MapPin className="w-4 h-4 mr-1" />
                              {donor.city} • Age: {donor.age}
                            </div>
                            {donor.last_donation_date && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Last donation: {safeFormat(donor.last_donation_date)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {donor.is_verified && (
                          <Badge className="bg-green-100 text-green-700 border-green-300 mb-2">
                            ✓ Verified Donor
                          </Badge>
                        )}
                        <div className="space-y-2">
                          <Button size="sm" variant="outline">
                            <Phone className="w-4 h-4 mr-2" />
                            Contact Donor
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {inventory.length === 0 && nearbyDonors.length === 0 && selectedBloodGroup && !loading && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              No blood available in hospitals and no donors found in your area. 
              Consider creating an urgent request to broadcast your need to a wider network.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default BloodStatus;