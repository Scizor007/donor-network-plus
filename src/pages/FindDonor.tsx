import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Phone, Calendar, Shield, Heart, Map as MapIcon, Loader2, CheckCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Map from '@/components/Map';
import { supabase } from '@/integrations/supabase/client';

interface Donor {
  id: string;
  name: string;
  bloodGroup: string;
  location: string;
  distance: string;
  lastDonation: string;
  verified: boolean;
  available: boolean;
  phone: string;
  coordinates: [number, number];
  city?: string;
}

interface EmergencyLocation {
  id: string;
  name: string;
  type: 'hospital' | 'blood_bank' | 'clinic' | 'emergency_center';
  address: string;
  phone: string;
  coordinates: [number, number];
  isOpen24h: boolean;
  services?: string[];
}

interface BloodCamp {
  id: string;
  name: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  coordinates: [number, number];
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  expected_units: number;
  contact_phone: string;
  organizer_name: string;
}

interface ActiveRequest {
  id: string;
  patient_name: string;
  hospital_name?: string;
  blood_group: string;
  urgency_level?: string;
  latitude?: number | null;
  longitude?: number | null;
}

const FindDonor = () => {
  const [searchFilters, setSearchFilters] = useState({
    bloodGroup: '',
    location: '',
    urgency: 'normal'
  });
  const [filteredDonors, setFilteredDonors] = useState<Donor[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [allDonors, setAllDonors] = useState<Donor[]>([]);
  const [emergencyLocations, setEmergencyLocations] = useState<EmergencyLocation[]>([]);
  const [bloodCamps, setBloodCamps] = useState<BloodCamp[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [activeRequests, setActiveRequests] = useState<ActiveRequest[]>([]);
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [showRadius, setShowRadius] = useState<boolean>(true);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchRealData();
    fetchActiveRequests();
    fetchBloodBanks();
    getUserLocation();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('blood_requests_live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'blood_requests' }, fetchActiveRequests)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'blood_requests' }, fetchActiveRequests)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationPermission('denied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
        setUserLocation(coords);
        setLocationPermission('granted');
        calculateDistances(coords);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationPermission('denied');
      }
    );
  };

  const fetchRealData = async () => {
    try {
      const [donorsResp, profilesResp] = await Promise.all([
        supabase
          .from('eligible_donors')
          .select('*')
          .eq('is_eligible', true)
          .eq('is_available', true)
          .is('latitude', 'not.is', null)
          .is('longitude', 'not.is', null),
        supabase
          .from('profiles')
          .select('*')
          .eq('user_type', 'donor')
          .eq('is_available', true)
          .is('latitude', 'not.is', null)
          .is('longitude', 'not.is', null)
          .limit(500),
      ]);

      if (donorsResp.error || profilesResp.error) {
        console.error('Error fetching donors:', donorsResp.error, profilesResp.error);
      }

      const formattedDonors: Donor[] = (donorsResp.data || []).map(donor => ({
        id: donor.id,
        name: donor.full_name,
        bloodGroup: donor.blood_group,
        location: `${donor.city || 'Unknown'}, ${donor.address || ''}`,
        distance: '0 km',
        lastDonation: donor.last_donation_date ? formatLastDonation(donor.last_donation_date) : 'Never donated',
        verified: donor.is_verified || false,
        available: donor.is_available || false,
        phone: donor.phone || '',
        coordinates: [donor.latitude || 17.5097, donor.longitude || 78.4735],
        city: donor.city,
      }));

      const profileDonors: Donor[] = (profilesResp.data || []).map((donor: any) => ({
        id: donor.id,
        name: donor.full_name,
        bloodGroup: donor.blood_group,
        location: `${donor.city || 'Unknown'}, ${donor.address || ''}`,
        distance: '0 km',
        lastDonation: donor.last_donation_date ? formatLastDonation(donor.last_donation_date) : 'Never donated',
        verified: donor.is_verified || false,
        available: donor.is_available || false,
        phone: donor.phone || '',
        coordinates: [Number(donor.latitude) || 17.5097, Number(donor.longitude) || 78.4735],
        city: donor.city,
      }));

      const mergedDonors = [...formattedDonors, ...profileDonors];
      setAllDonors(prev => [...prev, ...mergedDonors.filter(d => !prev.some(p => p.id === d.id))]);
      setFilteredDonors(prev => [...prev, ...mergedDonors.filter(d => !prev.some(p => p.id === d.id))]);
      if (userLocation) calculateDistances(userLocation);

      addTestData();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchActiveRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('blood_requests')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      setActiveRequests(data || []);
    } catch (e) {
      console.error('Error fetching active requests:', e);
    }
  };

  const fetchBloodBanks = async () => {
    try {
      const { data, error } = await supabase
        .from('blood_banks')
        .select('id, name, address, phone, latitude, longitude, is_active')
        .eq('is_active', true)
        .is('latitude', 'not.is', null)
        .is('longitude', 'not.is', null)
        .limit(200);
      if (error) throw error;
      const banks = (data || []).map((b: any) => ({
        id: b.id,
        name: b.name,
        type: 'blood_bank' as const,
        address: b.address,
        phone: b.phone || '',
        coordinates: [Number(b.latitude), Number(b.longitude)] as [number, number],
        isOpen24h: true,
        services: ['Blood Bank'],
      }));
      setEmergencyLocations(prev => [...prev, ...banks.filter(b => !prev.some(p => p.id === b.id))]);
    } catch (e) {
      console.error('Error fetching blood banks:', e);
    }
  };

  const addTestData = () => {
    const kompallyCoords = [17.5097, 78.4735]; // Kompally, Hyderabad
    const testDonors: Donor[] = [
      { id: 'd1', name: 'Ravi Kumar', bloodGroup: 'O+', location: 'Kompally, Hyderabad', distance: '0 km', lastDonation: '1 month ago', verified: true, available: true, phone: '+91-79954-12345', coordinates: [17.5097, 78.4735], city: 'Hyderabad' },
      { id: 'd2', name: 'Sneha Reddy', bloodGroup: 'A+', location: 'Suchitra Circle, Hyderabad', distance: '0 km', lastDonation: '2 weeks ago', verified: true, available: true, phone: '+91-79954-12346', coordinates: [17.4998, 78.4776], city: 'Hyderabad' },
      { id: 'd3', name: 'Anil Sharma', bloodGroup: 'B+', location: 'Bolarum, Hyderabad', distance: '0 km', lastDonation: '3 months ago', verified: false, available: true, phone: '+91-79954-12347', coordinates: [17.5173, 78.4879], city: 'Hyderabad' },
      { id: 'd4', name: 'Priya Menon', bloodGroup: 'AB-', location: 'Alwal, Hyderabad', distance: '0 km', lastDonation: '1 week ago', verified: true, available: false, phone: '+91-79954-12348', coordinates: [17.4956, 78.4945], city: 'Hyderabad' },
      { id: 'd5', name: 'Vikram Singh', bloodGroup: 'O-', location: 'Quthbullapur, Hyderabad', distance: '0 km', lastDonation: '6 weeks ago', verified: true, available: true, phone: '+91-79954-12349', coordinates: [17.5021, 78.4589], city: 'Hyderabad' },
      { id: 'd6', name: 'Lakshmi Rao', bloodGroup: 'A-', location: 'Medchal, Hyderabad', distance: '0 km', lastDonation: '2 months ago', verified: false, available: true, phone: '+91-79954-12350', coordinates: [17.6290, 78.4810], city: 'Hyderabad' },
      { id: 'd7', name: 'Suresh Patel', bloodGroup: 'B-', location: 'Jeedimetla, Hyderabad', distance: '0 km', lastDonation: '1 month ago', verified: true, available: true, phone: '+91-79954-12351', coordinates: [17.4990, 78.4620], city: 'Hyderabad' },
      { id: 'd8', name: 'Deepika Nair', bloodGroup: 'AB+', location: 'Gundla Pochampally, Hyderabad', distance: '0 km', lastDonation: '3 weeks ago', verified: true, available: true, phone: '+91-79954-12352', coordinates: [17.5200, 78.4850], city: 'Hyderabad' },
    ];
    const testEmergencyLocations: EmergencyLocation[] = [
      { id: 'e1', name: 'Kompally Hospital', type: 'hospital', address: 'Kompally Main Road, Hyderabad', phone: '+91-40-2712-3456', coordinates: [17.5097, 78.4735], isOpen24h: true, services: ['Emergency', 'Blood Bank', 'Trauma'] },
      { id: 'e2', name: 'Suchitra Blood Bank', type: 'blood_bank', address: 'Suchitra X Road, Hyderabad', phone: '+91-40-2712-3457', coordinates: [17.4998, 78.4776], isOpen24h: true, services: ['Blood Bank'] },
      { id: 'e3', name: 'Alwal Clinic', type: 'clinic', address: 'Alwal Main Road, Hyderabad', phone: '+91-40-2712-3458', coordinates: [17.4956, 78.4945], isOpen24h: false, services: ['General Checkup', 'Blood Testing'] },
      { id: 'e4', name: 'Medchal Emergency Center', type: 'emergency_center', address: 'Medchal Road, Hyderabad', phone: '+91-40-2712-3459', coordinates: [17.6290, 78.4810], isOpen24h: true, services: ['Emergency Response'] },
    ];
    const testBloodCamps: BloodCamp[] = [
      { id: 'c1', name: 'Kompally Blood Drive', venue: 'Kompally Community Hall', address: 'Kompally, Hyderabad', city: 'Hyderabad', state: 'Telangana', coordinates: [17.5097, 78.4735], start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(), status: 'upcoming', expected_units: 150, contact_phone: '+91-40-1234-5678', organizer_name: 'Red Cross, Kompally' },
      { id: 'c2', name: 'Suchitra Donation Camp', venue: 'Suchitra Circle', address: 'Suchitra, Hyderabad', city: 'Hyderabad', state: 'Telangana', coordinates: [17.4998, 78.4776], start_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), end_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), status: 'ongoing', expected_units: 100, contact_phone: '+91-40-9876-5432', organizer_name: 'Suchitra Blood Bank' },
      { id: 'c3', name: 'Alwal Youth Camp', venue: 'Alwal Grounds', address: 'Alwal, Hyderabad', city: 'Hyderabad', state: 'Telangana', coordinates: [17.4956, 78.4945], start_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(), status: 'upcoming', expected_units: 200, contact_phone: '+91-40-5555-6666', organizer_name: 'Youth for Blood' },
    ];
    setAllDonors(prev => [...prev, ...testDonors.filter(d => !prev.some(p => p.id === d.id))]);
    setFilteredDonors(prev => [...prev, ...testDonors.filter(d => !prev.some(p => p.id === d.id))]);
    setEmergencyLocations(prev => [...prev, ...testEmergencyLocations.filter(e => !prev.some(p => p.id === e.id))]);
    setBloodCamps(prev => [...prev, ...testBloodCamps.filter(c => !prev.some(p => p.id === c.id))]);
    if (userLocation) calculateDistances(userLocation);
  };

  const calculateDistances = (userCoords: [number, number]) => {
    const R = 6371; // Earth's radius in km
    setAllDonors(prev => prev.map(donor => {
      const [lat1, lon1] = userCoords;
      const [lat2, lon2] = donor.coordinates;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return { ...donor, distance: `${distance.toFixed(1)} km` };
    }));
    setFilteredDonors(prev => prev.map(donor => {
      const [lat1, lon1] = userCoords;
      const [lat2, lon2] = donor.coordinates;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return { ...donor, distance: `${distance.toFixed(1)} km` };
    }));
  };

  const formatLastDonation = (date: string) => {
    const donationDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - donationDate.getTime());
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
    return diffMonths === 0 ? 'This month' : diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
  };

  const handleRealTimeSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      let filtered = allDonors;

      if (searchFilters.bloodGroup) {
        filtered = filtered.filter(donor => donor.bloodGroup === searchFilters.bloodGroup);
      }

      if (searchFilters.location) {
        filtered = filtered.filter(donor =>
          donor.location.toLowerCase().includes(searchFilters.location.toLowerCase()) ||
          donor.name.toLowerCase().includes(searchFilters.location.toLowerCase()) ||
          donor.city?.toLowerCase().includes(searchFilters.location.toLowerCase())
        );
      }

      filtered = filtered.filter(donor => donor.available);

      if (showRadius && userLocation && radiusKm) {
        const [lat1, lon1] = userLocation;
        const R = 6371;
        filtered = filtered.filter(donor => {
          const [lat2, lon2] = donor.coordinates;
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;
          return distance <= radiusKm;
        });
      }

      setFilteredDonors(filtered);
      setIsSearching(false);
    }, 500);
  };

  useEffect(() => {
    handleRealTimeSearch();
  }, [searchFilters, allDonors, userLocation, radiusKm, showRadius]);

  useEffect(() => {
    const channel1 = supabase
      .channel('eligible_donors_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'eligible_donors' }, () => fetchRealData())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'eligible_donors' }, () => fetchRealData())
      .subscribe();

    const channel2 = supabase
      .channel('profiles_and_registrations')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, fetchRealData)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, fetchRealData)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'donor_registrations' }, fetchRealData)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'donor_registrations' }, fetchRealData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel1);
      supabase.removeChannel(channel2);
    };
  }, []);

  const getUrgencyColor = (urgency: string) => ({
    critical: 'bg-red-500',
    urgent: 'bg-orange-500',
    normal: 'bg-green-500'
  })[urgency] || 'bg-green-500';

  const getMapCenter = (): [number, number] => {
    if (userLocation) return userLocation;
    if (allDonors.length > 0) {
      const lats = allDonors.map(d => d.coordinates[0]);
      const lngs = allDonors.map(d => d.coordinates[1]);
      const avgLat = lats.length > 0 ? lats.reduce((a, b) => a + b, 0) / lats.length : 17.5097;
      const avgLng = lngs.length > 0 ? lngs.reduce((a, b) => a + b, 0) / lngs.length : 78.4735;
      return [avgLat, avgLng];
    }
    return [17.5097, 78.4735]; // Kompally, Hyderabad
  };

  return (
    <div className="min-h-screen bg-medical-background">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8 animate-in fade-in-50 slide-in-from-top-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto mb-4 shadow-sm">
            <Search className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary">Find Blood Donors</h1>
          <p className="text-muted-foreground mt-2">Connect with verified donors in your area</p>
        </div>

        <Card className="mb-6 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {locationPermission === 'prompt' && (
                <Button onClick={getUserLocation} variant="outline" size="sm">
                  📍 Get My Location
                </Button>
              )}
              {locationPermission === 'granted' && userLocation && (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Location enabled</span>
                </div>
              )}
              {locationPermission === 'denied' && (
                <div className="flex items-center gap-2 text-red-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Location denied</span>
                </div>
              )}
              <Button onClick={fetchRealData} variant="outline" size="sm">
                🔄 Load Real Data
              </Button>
              <Button onClick={addTestData} variant="outline" size="sm">
                🧪 Add Test Data
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 shadow-lg sticky top-16 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/70 border border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-primary" />
              <span>Search Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group *</Label>
                <Select onValueChange={(value) => setSearchFilters({ ...searchFilters, bloodGroup: value })}>
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
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Enter city or area"
                  value={searchFilters.location}
                  onChange={(e) => setSearchFilters({ ...searchFilters, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select onValueChange={(value) => setSearchFilters({ ...searchFilters, urgency: value })}>
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
              <div className="flex items-end space-x-2">
                <Button
                  onClick={handleRealTimeSearch}
                  className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching...
                    </span>
                  ) : (
                    'Search Donors'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSearchFilters({ bloodGroup: '', location: '', urgency: 'normal' })}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {searchFilters.urgency !== 'normal' && (
          <div className={`${getUrgencyColor(searchFilters.urgency)} text-white p-4 rounded-lg mb-6 text-center shadow-md animate-pulse`}>
            <span className="font-semibold">
              {searchFilters.urgency === 'critical' ? '🚨 CRITICAL' : '⚠️ URGENT'} BLOOD NEEDED
            </span>
            <p className="text-sm mt-1">
              Please contact donors immediately. Emergency priority matching active.
            </p>
          </div>
        )}

        <Card className="mb-8 shadow-lg animate-in fade-in-50 slide-in-from-bottom-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <MapIcon className="w-5 h-5 text-primary" />
                <span>Donor & Emergency Locations Map</span>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMap(!showMap)}
              >
                {showMap ? 'Hide Map' : 'Show Map'}
              </Button>
            </div>
          </CardHeader>
          {showMap && (
            <CardContent>
              <Map
                donors={allDonors}
                emergencyLocations={emergencyLocations}
                bloodCamps={bloodCamps}
                userLocation={userLocation}
                center={getMapCenter()}
                zoom={userLocation ? 12 : 10}
                requests={activeRequests
                  .filter(r => r.latitude && r.longitude)
                  .map(r => ({
                    id: r.id,
                    patientName: r.patient_name,
                    bloodGroup: r.blood_group,
                    urgencyLevel: r.urgency_level,
                    hospitalName: r.hospital_name,
                    coordinates: [Number(r.latitude), Number(r.longitude)] as [number, number],
                  }))}
                radiusCenter={showRadius ? (userLocation || null) : null}
                radiusKm={showRadius ? radiusKm : null}
              />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label className="text-sm text-muted-foreground">Radius:</label>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(parseInt(e.target.value) || 5)}
                >
                  {[5, 10, 15, 25, 50].map(km => (
                    <option key={km} value={km}>{km} km</option>
                  ))}
                </select>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input type="checkbox" checked={showRadius} onChange={(e) => setShowRadius(e.target.checked)} />
                  Show radius
                </label>
                <span className="ml-auto text-xs text-muted-foreground">Requests shown on map: {activeRequests.length}</span>
              </div>
              <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-muted-foreground flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">📍</div>
                  <span>Your Location</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">A+</div>
                  <span>Available Donors</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold">A+</div>
                  <span>Unavailable Donors</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold relative">
                    A+
                    <CheckCircle className="absolute -top-1 -right-1 w-3 h-3 text-green-600 bg-white rounded-full" />
                  </div>
                  <span>Verified Donors</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center text-white text-xs transform -rotate-12">🏥</div>
                  <span>Upcoming Camps</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-500 rounded-sm flex items-center justify-center text-white text-xs transform -rotate-12">🏥</div>
                  <span>Ongoing Camps</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-white text-xs">🚨</div>
                  <span>Emergency Locations</span>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Available Donors ({filteredDonors.length} found)
            </h2>
            <Badge variant="secondary" className="px-3 py-1">
              Blood Group: {searchFilters.bloodGroup || 'All'}
            </Badge>
          </div>

          {filteredDonors.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No donors found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search filters or expanding your location range.
                </p>
                <Button variant="outline" onClick={() => setSearchFilters({ bloodGroup: '', location: '', urgency: 'normal' })}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredDonors.map((donor, index) => (
                <Card
                  key={donor.id}
                  className="shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-in fade-in-50 slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${donor.available ? 'bg-primary' : 'bg-muted-foreground'}`}>
                          {donor.bloodGroup}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-foreground">{donor.name}</h3>
                            {donor.verified && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-300">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                            <Badge variant={donor.available ? "default" : "secondary"} className="text-xs">
                              {donor.available ? 'Available' : 'Unavailable'}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {donor.location} • {donor.distance}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Last donation: {donor.lastDonation}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!donor.available}
                          className="flex items-center space-x-1"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Contact</span>
                        </Button>
                        <Button
                          size="sm"
                          disabled={!donor.available}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Request Donation
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Card className="mt-8 border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">Emergency Blood Need?</h3>
            <p className="text-muted-foreground mb-4">
              For critical situations, contact our 24/7 emergency hotline
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <Phone className="w-5 h-5 mr-2" />
              Call Emergency: 1-800-BLOOD-911
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FindDonor;