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

  // Get user location
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
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationPermission('denied');
      }
    );
  };

  // Add predefined test data for demonstration
  const addPredefinedData = () => {
    // Add some test donors from Indian cities
    const testDonors: Donor[] = [
      {
        id: 'test-donor-1',
        name: 'Rajesh Kumar',
        bloodGroup: 'O+',
        location: 'Banjara Hills, Hyderabad',
        distance: '2.3 km',
        lastDonation: '2 months ago',
        verified: true,
        available: true,
        phone: '+91-98765-43210',
        coordinates: [17.4065, 78.4772]
      },
      {
        id: 'test-donor-2',
        name: 'Priya Sharma',
        bloodGroup: 'A-',
        location: 'Andheri West, Mumbai',
        distance: '1.8 km',
        lastDonation: '1 month ago',
        verified: true,
        available: true,
        phone: '+91-98765-43211',
        coordinates: [19.1136, 72.8697]
      },
      {
        id: 'test-donor-3',
        name: 'Amit Singh',
        bloodGroup: 'B+',
        location: 'Connaught Place, Delhi',
        distance: '3.1 km',
        lastDonation: '3 months ago',
        verified: false,
        available: false,
        phone: '+91-98765-43212',
        coordinates: [28.6315, 77.2167]
      },
      {
        id: 'test-donor-4',
        name: 'Sneha Patel',
        bloodGroup: 'AB-',
        location: 'Jubilee Hills, Hyderabad',
        distance: '4.2 km',
        lastDonation: '1 week ago',
        verified: true,
        available: true,
        phone: '+91-98765-43213',
        coordinates: [17.4339, 78.4010]
      },
      {
        id: 'test-donor-5',
        name: 'Vikram Reddy',
        bloodGroup: 'O-',
        location: 'Bandra East, Mumbai',
        distance: '2.7 km',
        lastDonation: '6 weeks ago',
        verified: true,
        available: true,
        phone: '+91-98765-43214',
        coordinates: [19.0596, 72.8295]
      },
      {
        id: 'test-donor-6',
        name: 'Anita Gupta',
        bloodGroup: 'A+',
        location: 'Karol Bagh, Delhi',
        distance: '1.5 km',
        lastDonation: '2 weeks ago',
        verified: false,
        available: true,
        phone: '+91-98765-43215',
        coordinates: [28.6517, 77.1909]
      }
    ];

    // Add some test emergency locations from Indian cities
    const testEmergencyLocations: EmergencyLocation[] = [
      {
        id: 'test-emergency-1',
        name: 'Apollo Hospitals, Hyderabad',
        type: 'hospital',
        address: 'Road No 72, Jubilee Hills, Hyderabad, Telangana',
        phone: '+91-40-4344-7777',
        coordinates: [17.4339, 78.4010],
        isOpen24h: true,
        services: ['Emergency', 'Trauma', 'Blood Bank', 'ICU']
      },
      {
        id: 'test-emergency-2',
        name: 'Kokilaben Dhirubhai Ambani Hospital, Mumbai',
        type: 'hospital',
        address: 'Rao Saheb Achutrao Patwardhan Marg, Four Bungalows, Andheri West, Mumbai',
        phone: '+91-22-3099-9999',
        coordinates: [19.1136, 72.8697],
        isOpen24h: true,
        services: ['Emergency', 'Trauma', 'Blood Bank', 'Cardiology']
      },
      {
        id: 'test-emergency-3',
        name: 'AIIMS Delhi',
        type: 'hospital',
        address: 'Ansari Nagar, New Delhi, Delhi',
        phone: '+91-11-2658-8500',
        coordinates: [28.6315, 77.2167],
        isOpen24h: true,
        services: ['Emergency', 'Trauma', 'Blood Bank', 'Research']
      },
      {
        id: 'test-emergency-4',
        name: 'Red Cross Blood Bank, Hyderabad',
        type: 'blood_bank',
        address: 'Red Cross Building, Red Hills, Hyderabad, Telangana',
        phone: '+91-40-2323-4567',
        coordinates: [17.4065, 78.4772],
        isOpen24h: false,
        services: ['Blood Collection', 'Emergency Response', 'Blood Storage']
      },
      {
        id: 'test-emergency-5',
        name: 'Mumbai Blood Bank',
        type: 'blood_bank',
        address: 'Dr. E. Moses Road, Worli, Mumbai, Maharashtra',
        phone: '+91-22-2494-1234',
        coordinates: [19.0596, 72.8295],
        isOpen24h: false,
        services: ['Blood Collection', 'Emergency Response', 'Blood Testing']
      },
      {
        id: 'test-emergency-6',
        name: 'Safdarjung Hospital, Delhi',
        type: 'hospital',
        address: 'Safdarjung Enclave, New Delhi, Delhi',
        phone: '+91-11-2616-5000',
        coordinates: [28.6517, 77.1909],
        isOpen24h: true,
        services: ['Emergency', 'Trauma', 'Blood Bank', 'Pediatrics']
      }
    ];

    // Add some test blood camps from Indian cities
    const testBloodCamps: BloodCamp[] = [
      {
        id: 'test-camp-1',
        name: 'Hyderabad Blood Donation Drive',
        venue: 'HITEC City Convention Centre',
        address: 'HITEC City, Madhapur, Hyderabad, Telangana',
        city: 'Hyderabad',
        state: 'Telangana',
        coordinates: [17.4478, 78.3564],
        start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
        status: 'upcoming',
        expected_units: 200,
        contact_phone: '+91-40-1234-5678',
        organizer_name: 'Red Cross Society, Hyderabad'
      },
      {
        id: 'test-camp-2',
        name: 'Mumbai Corporate Blood Camp',
        venue: 'Bandra Kurla Complex',
        address: 'Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra',
        city: 'Mumbai',
        state: 'Maharashtra',
        coordinates: [19.0596, 72.8295],
        start_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        status: 'ongoing',
        expected_units: 120,
        contact_phone: '+91-22-9876-5432',
        organizer_name: 'Mumbai Blood Bank'
      },
      {
        id: 'test-camp-3',
        name: 'Delhi University Blood Donation Camp',
        venue: 'Delhi University North Campus',
        address: 'Viceregal Lodge, Delhi University, Delhi',
        city: 'Delhi',
        state: 'Delhi',
        coordinates: [28.6881, 77.2105],
        start_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
        status: 'upcoming',
        expected_units: 300,
        contact_phone: '+91-11-2345-6789',
        organizer_name: 'Delhi University NSS'
      },
      {
        id: 'test-camp-4',
        name: 'IT Park Blood Drive, Hyderabad',
        venue: 'Cyber Gateway Building',
        address: 'Cyber Gateway, HITEC City, Hyderabad, Telangana',
        city: 'Hyderabad',
        state: 'Telangana',
        coordinates: [17.4478, 78.3564],
        start_date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        status: 'ongoing',
        expected_units: 80,
        contact_phone: '+91-40-9876-1234',
        organizer_name: 'Tech Mahindra CSR'
      }
    ];

    // Add test data to existing data
    setAllDonors(prev => [...prev, ...testDonors]);
    setFilteredDonors(prev => [...prev, ...testDonors]);
    setEmergencyLocations(prev => [...prev, ...testEmergencyLocations]);
    setBloodCamps(prev => [...prev, ...testBloodCamps]);
  };

  // Fetch donors from database
  const fetchDonors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_available', true)
        .not('blood_group', 'is', null);

      if (error) throw error;

      const donors: Donor[] = data.map(profile => ({
        id: profile.id,
        name: profile.full_name,
        bloodGroup: profile.blood_group,
        location: profile.location || `${profile.city || 'Unknown'}`,
        distance: '0 km', // You can calculate this based on user location
        lastDonation: profile.last_donation_date 
          ? formatLastDonation(profile.last_donation_date) 
          : 'Never donated',
        verified: profile.is_verified,
        available: profile.is_available,
        phone: profile.phone || '',
        coordinates: [
          profile.latitude || 28.6139, 
          profile.longitude || 77.2090
        ] as [number, number]
      }));

      setAllDonors(donors);
      setFilteredDonors(donors);
    } catch (error) {
      console.error('Error fetching donors:', error);
    }
  };

  const formatLastDonation = (date: string) => {
    const donationDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - donationDate.getTime());
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
    
    if (diffMonths === 0) return 'This month';
    if (diffMonths === 1) return '1 month ago';
    return `${diffMonths} months ago`;
  };

  const handleSearch = () => {
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
      
      // Filter by availability
      filtered = filtered.filter(donor => donor.available);
      
      setFilteredDonors(filtered);
      setIsSearching(false);
    }, 500);
  };

  // Real-time search as user types
  const handleRealTimeSearch = () => {
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
    
    // Filter by availability
    filtered = filtered.filter(donor => donor.available);
    
    setFilteredDonors(filtered);
  };

  // Fetch emergency locations from database
  const fetchEmergencyLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_locations')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      const locations: EmergencyLocation[] = data.map(loc => ({
        id: loc.id,
        name: loc.name,
        type: loc.type,
        address: loc.address,
        phone: loc.phone,
        coordinates: [loc.latitude, loc.longitude] as [number, number],
        isOpen24h: loc.is_24_hours,
        services: loc.services
      }));

      setEmergencyLocations(locations);
    } catch (error) {
      console.error('Error fetching emergency locations:', error);
    }
  };

  // Fetch blood camps from database
  const fetchBloodCamps = async () => {
    try {
      const { data, error } = await supabase
        .from('blood_donation_camps')
        .select('*')
        .in('status', ['upcoming', 'ongoing'])
        .order('start_date', { ascending: true });

      if (error) throw error;

      const camps: BloodCamp[] = data.map(camp => ({
        id: camp.id,
        name: camp.name,
        venue: camp.venue,
        address: camp.address,
        city: camp.city,
        state: camp.state,
        coordinates: [camp.latitude, camp.longitude] as [number, number],
        start_date: camp.start_date,
        end_date: camp.end_date,
        status: camp.status,
        expected_units: camp.expected_units,
        contact_phone: camp.contact_phone,
        organizer_name: camp.organizer_name
      }));

      setBloodCamps(camps);
    } catch (error) {
      console.error('Error fetching blood camps:', error);
    }
  };

  // Real-time search effect
  useEffect(() => {
    handleRealTimeSearch();
  }, [searchFilters, allDonors]);

  // Load data on component mount and set up real-time updates
  useEffect(() => {
    fetchDonors();
    fetchEmergencyLocations();
    fetchBloodCamps();

    // Set up real-time subscription for new donors
    const channel = supabase
      .channel('profiles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchDonors(); // Refresh donors when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500';
      case 'urgent': return 'bg-orange-500';
      default: return 'bg-green-500';
    }
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

        {/* Location Permission & Test Data */}
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
              <Button onClick={addPredefinedData} variant="outline" size="sm">
                🧪 Add Test Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Filters */}
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
                <Select onValueChange={(value) => setSearchFilters({...searchFilters, bloodGroup: value})}>
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
                  onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select onValueChange={(value) => setSearchFilters({...searchFilters, urgency: value})}>
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
                  onClick={handleSearch}
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
                  onClick={() => setSearchFilters({bloodGroup: '', location: '', urgency: 'normal'})}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Urgency Indicator */}
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

        {/* Map Section */}
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
                center={userLocation || [20.5937, 78.9629]}
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

        {/* Results */}
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
                <Button variant="outline" onClick={() => setSearchFilters({bloodGroup: '', location: '', urgency: 'normal'})}>
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
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                          donor.available ? 'bg-primary' : 'bg-muted-foreground'
                        }`}>
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

        {/* Emergency Contact */}
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