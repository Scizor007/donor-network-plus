import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Phone, Calendar, Shield, Heart, Map as MapIcon } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Map from '@/components/Map';

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
  type: 'hospital' | 'blood_bank';
  address: string;
  phone: string;
  coordinates: [number, number];
  isOpen24h: boolean;
}

const mockDonors: Donor[] = [
  {
    id: '1',
    name: 'John Smith',
    bloodGroup: 'O+',
    location: 'Downtown Medical Center',
    distance: '0.5 km',
    lastDonation: '3 months ago',
    verified: true,
    available: true,
    phone: '+1 (555) 123-4567',
    coordinates: [40.7580, -73.9855]
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    bloodGroup: 'O+',
    location: 'City Hospital',
    distance: '1.2 km',
    lastDonation: '4 months ago',
    verified: true,
    available: true,
    phone: '+1 (555) 234-5678',
    coordinates: [40.7505, -73.9934]
  },
  {
    id: '3',
    name: 'Michael Brown',
    bloodGroup: 'A+',
    location: 'Community Health Center',
    distance: '2.1 km',
    lastDonation: '2 months ago',
    verified: false,
    available: true,
    phone: '+1 (555) 345-6789',
    coordinates: [40.7410, -73.9896]
  },
  {
    id: '4',
    name: 'Emily Davis',
    bloodGroup: 'O+',
    location: 'General Hospital',
    distance: '3.0 km',
    lastDonation: '5 months ago',
    verified: true,
    available: false,
    phone: '+1 (555) 456-7890',
    coordinates: [40.7282, -73.9942]
  }
];

const mockEmergencyLocations: EmergencyLocation[] = [
  {
    id: '1',
    name: 'City General Hospital',
    type: 'hospital',
    address: '123 Main St, New York, NY',
    phone: '+1 (555) 911-1234',
    coordinates: [40.7505, -73.9934],
    isOpen24h: true
  },
  {
    id: '2',
    name: 'Central Blood Bank',
    type: 'blood_bank',
    address: '456 Health Ave, New York, NY',
    phone: '+1 (555) 922-5678',
    coordinates: [40.7614, -73.9776],
    isOpen24h: false
  },
  {
    id: '3',
    name: 'Emergency Medical Center',
    type: 'hospital',
    address: '789 Emergency Blvd, New York, NY',
    phone: '+1 (555) 933-9999',
    coordinates: [40.7390, -73.9903],
    isOpen24h: true
  },
  {
    id: '4',
    name: 'Community Blood Center',
    type: 'blood_bank',
    address: '321 Donor St, New York, NY',
    phone: '+1 (555) 944-2468',
    coordinates: [40.7342, -74.0016],
    isOpen24h: false
  }
];

const FindDonor = () => {
  const [searchFilters, setSearchFilters] = useState({
    bloodGroup: '',
    location: '',
    urgency: 'normal'
  });

  const [filteredDonors, setFilteredDonors] = useState<Donor[]>(mockDonors);
  const [isSearching, setIsSearching] = useState(false);
  const [showMap, setShowMap] = useState(true);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSearch = () => {
    setIsSearching(true);
    
    setTimeout(() => {
      let filtered = mockDonors;
      
      if (searchFilters.bloodGroup) {
        filtered = filtered.filter(donor => donor.bloodGroup === searchFilters.bloodGroup);
      }
      
      if (searchFilters.location) {
        filtered = filtered.filter(donor => 
          donor.location.toLowerCase().includes(searchFilters.location.toLowerCase()) ||
          donor.name.toLowerCase().includes(searchFilters.location.toLowerCase())
        );
      }
      
      setFilteredDonors(filtered);
      setIsSearching(false);
    }, 1000);
  };

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
        <div className="text-center mb-8">
          <Search className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground">Find Blood Donors</h1>
          <p className="text-muted-foreground mt-2">
            Connect with verified donors in your area
          </p>
        </div>

        {/* Search Filters */}
        <Card className="mb-8 shadow-lg">
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

              <div className="flex items-end">
                <Button 
                  onClick={handleSearch}
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isSearching || !searchFilters.bloodGroup}
                >
                  {isSearching ? 'Searching...' : 'Search Donors'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Urgency Indicator */}
        {searchFilters.urgency !== 'normal' && (
          <div className={`${getUrgencyColor(searchFilters.urgency)} text-white p-4 rounded-lg mb-6 text-center`}>
            <span className="font-semibold">
              {searchFilters.urgency === 'critical' ? '🚨 CRITICAL' : '⚠️ URGENT'} BLOOD NEEDED
            </span>
            <p className="text-sm mt-1">
              Please contact donors immediately. Emergency priority matching active.
            </p>
          </div>
        )}

        {/* Map Section */}
        <Card className="mb-8 shadow-lg">
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
                emergencyLocations={mockEmergencyLocations}
                center={[40.7505, -73.9934]}
                zoom={13}
              />
              <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                  <span>Blood Donors</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
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
              {filteredDonors.map((donor) => (
                <Card key={donor.id} className="shadow-sm hover:shadow-md transition-shadow">
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