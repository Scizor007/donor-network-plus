import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Phone, Calendar, Shield, Heart, Map as MapIcon, Loader2 } from 'lucide-react';
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

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchRealData();
    getUserLocation();
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
      const { data, error } = await supabase
        .from('eligible_donors')
        .select('*')
        .eq('is_eligible', true)
        .eq('is_available', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) {
        console.error('Error fetching donors:', error);
        return;
      }

      const formattedDonors: Donor[] = data.map(donor => ({
        id: donor.id,
        name: donor.full_name,
        bloodGroup: donor.blood_group,
        location: `${donor.city || 'Unknown'}, ${donor.address || ''}`,
        distance: '0 km',
        lastDonation: donor.last_donation_date ? formatLastDonation(donor.last_donation_date) : 'Never donated',
        verified: donor.is_verified || false,
        available: donor.is_available || false,
        phone: donor.phone || '',
        coordinates: [donor.latitude || 28.6139, donor.longitude || 77.2090],
        city: donor.city
      }));

      setAllDonors(formattedDonors);
      setFilteredDonors(formattedDonors);
      if (userLocation) calculateDistances(userLocation);

      addTestData();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const addTestData = () => {
    const testDonors: Donor[] = [
      { id: 'test-donor-1', name: 'Rajesh Kumar', bloodGroup: 'O+', location: 'Banjara Hills, Hyderabad', distance: '0 km', lastDonation: '2 months ago', verified: true, available: true, phone: '+91-98765-43210', coordinates: [17.4065, 78.4772], city: 'Hyderabad' },
      { id: 'test-donor-2', name: 'Priya Sharma', bloodGroup: 'A-', location: 'Andheri West, Mumbai', distance: '0 km', lastDonation: '1 month ago', verified: true, available: true, phone: '+91-98765-43211', coordinates: [19.1136, 72.8697], city: 'Mumbai' },
      { id: 'test-donor-3', name: 'Amit Singh', bloodGroup: 'B+', location: 'Connaught Place, Delhi', distance: '0 km', lastDonation: '3 months ago', verified: false, available: false, phone: '+91-98765-43212', coordinates: [28.6315, 77.2167], city: 'Delhi' },
      { id: 'test-donor-4', name: 'Sneha Patel', bloodGroup: 'AB-', location: 'Jubilee Hills, Hyderabad', distance: '0 km', lastDonation: '1 week ago', verified: true, available: true, phone: '+91-98765-43213', coordinates: [17.4339, 78.4010], city: 'Hyderabad' },
      { id: 'test-donor-5', name: 'Vikram Reddy', bloodGroup: 'O-', location: 'Bandra East, Mumbai', distance: '0 km', lastDonation: '6 weeks ago', verified: true, available: true, phone: '+91-98765-43214', coordinates: [19.0596, 72.8295], city: 'Mumbai' },
      { id: 'test-donor-6', name: 'Anita Gupta', bloodGroup: 'A+', location: 'Karol Bagh, Delhi', distance: '0 km', lastDonation: '2 weeks ago', verified: false, available: true, phone: '+91-98765-43215', coordinates: [28.6517, 77.1909], city: 'Delhi' },
    ];
    const testEmergencyLocations: EmergencyLocation[] = [
      { id: 'test-emergency-1', name: 'Apollo Hospitals, Hyderabad', type: 'hospital', address: 'Road No 72, Jubilee Hills, Hyderabad', phone: '+91-40-4344-7777', coordinates: [17.4339, 78.4010], isOpen24h: true, services: ['Emergency', 'Trauma', 'Blood Bank', 'ICU'] },
      { id: 'test-emergency-2', name: 'Kokilaben Dhirubhai Ambani Hospital, Mumbai', type: 'hospital', address: 'Rao Saheb Achutrao Patwardhan Marg, Andheri West, Mumbai', phone: '+91-22-3099-9999', coordinates: [19.1136, 72.8697], isOpen24h: true, services: ['Emergency', 'Trauma', 'Blood Bank', 'Cardiology'] },
      { id: 'test-emergency-3', name: 'AIIMS Delhi', type: 'hospital', address: 'Ansari Nagar, New Delhi', phone: '+91-11-2658-8500', coordinates: [28.6315, 77.2167], isOpen24h: true, services: ['Emergency', 'Trauma', 'Blood Bank', 'Research'] },
    ];
    const testBloodCamps: BloodCamp[] = [
      { id: 'test-camp-1', name: 'Hyderabad Blood Donation Drive', venue: 'HITEC City Convention Centre', address: 'HITEC City, Madhapur, Hyderabad', city: 'Hyderabad', state: 'Telangana', coordinates: [17.4478, 78.3564], start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(), status: 'upcoming', expected_units: 200, contact_phone: '+91-40-1234-5678', organizer_name: 'Red Cross Society, Hyderabad' },
      { id: 'test-camp-2', name: 'Mumbai Corporate Blood Camp', venue: 'Bandra Kurla Complex', address: 'Bandra East, Mumbai', city: 'Mumbai', state: 'Maharashtra', coordinates: [19.0596, 72.8295], start_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), end_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), status: 'ongoing', expected_units: 120, contact_phone: '+91-22-9876-5432', organizer_name: 'Mumbai Blood Bank' },
    ];
    setAllDonors(prev => [...prev, ...testDonors]);
    setFilteredDonors(prev => [...prev, ...testDonors]);
    setEmergencyLocations(prev => [...prev, ...testEmergencyLocations]);
    setBloodCamps(prev => [...prev, ...testBloodCamps]);
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

      setFilteredDonors(filtered);
      setIsSearching(false);
    }, 500);
  };

  useEffect(() => {
    handleRealTimeSearch();
  }, [searchFilters, allDonors]);

  useEffect(() => {
    const channel = supabase
      .channel('eligible_donors_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'eligible_donors' }, () => fetchRealData())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'eligible_donors' }, () => fetchRealData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getUrgencyColor = (urgency: string) => ({
    critical: 'bg-red-500',
    urgent: 'bg-orange-500',
    normal: 'bg-green-500'
  })[urgency] || 'bg-green-500';

  const getMapCenter = () => {
    if (userLocation) return userLocation;
    if (filteredDonors.length > 0) {
      const lats = filteredDonors.map(d => d.coordinates[0]);
      const lngs = filteredDonors.map(d => d.coordinates[1]);
      return [lats.reduce((a, b) => a + b, 0) / lats.length, lngs.reduce((a, b) => a + b, 0) / lngs.length];
    }
    return [20.5937, 78.9629]; // India centroid
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
              <div className="flex items-center gap-4">
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
              </div>
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
                donors={filteredDonors}
                emergencyLocations={emergencyLocations}
                bloodCamps={bloodCamps}
                userLocation={userLocation}
                center={getMapCenter()}
                zoom={userLocation ? 12 : 5}
              />
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
                              <Badge variant="secondary" className="text-xs">
                                <Shield className="w-3 h-3 mr-1" />
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