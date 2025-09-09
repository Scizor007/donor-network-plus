import { useMemo, useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Clock, Search } from 'lucide-react';

interface BloodBank {
  id: string;
  name: string;
  licenseNo: string;
  services: string[];
  address: string;
  city: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  phone: string;
  email?: string;
  hours?: string;
  status: 'operational' | 'temporarily_closed';
}

const MOCK_BANKS: BloodBank[] = [
  {
    id: 'bb-001',
    name: 'City Central Blood Bank',
    licenseNo: 'MH/BB/2025/001',
    services: ['Whole Blood', 'RBC', 'Platelets', 'Plasma'],
    address: '123 Health St, Sector 5',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.5204,
    lng: 73.8567,
    phone: '+91 20 1234 5678',
    email: 'contact@ccbb.org',
    hours: 'Mon-Sun 9:00 AM - 8:00 PM',
    status: 'operational',
  },
  {
    id: 'bb-002',
    name: 'Lifeline Blood Bank',
    licenseNo: 'MH/BB/2025/045',
    services: ['Whole Blood', 'RBC', 'Plasma'],
    address: '45 Care Avenue',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    lat: 19.076,
    lng: 72.8777,
    phone: '+91 22 5555 8888',
    hours: 'Mon-Fri 10:00 AM - 6:00 PM',
    status: 'operational',
  },
  {
    id: 'bb-003',
    name: 'Red Cross Blood Center',
    licenseNo: 'DL/BB/2025/087',
    services: ['Whole Blood', 'RBC', 'Platelets'],
    address: '7 Relief Road',
    city: 'New Delhi',
    district: 'New Delhi',
    state: 'Delhi',
    lat: 28.6139,
    lng: 77.209,
    phone: '+91 11 2222 3333',
    email: 'help@rcbc.org',
    status: 'temporarily_closed',
  },
];

const unique = (arr: string[]) => Array.from(new Set(arr)).sort();

const BloodBanks = () => {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [service, setService] = useState<string>('');

  const states = useMemo(() => unique(MOCK_BANKS.map(b => b.state)), []);
  const districts = useMemo(
    () => unique(MOCK_BANKS.filter(b => (state ? b.state === state : true)).map(b => b.district)),
    [state]
  );
  const services = useMemo(() => unique(MOCK_BANKS.flatMap(b => b.services)), []);

  const filtered = useMemo(() => {
    return MOCK_BANKS.filter(b => {
      const matchesQuery = query
        ? (b.name + ' ' + b.address + ' ' + b.city + ' ' + b.district + ' ' + b.state)
            .toLowerCase()
            .includes(query.toLowerCase())
        : true;
      const matchesState = state ? b.state === state : true;
      const matchesDistrict = district ? b.district === district : true;
      const matchesService = service ? b.services.includes(service) : true;
      return matchesQuery && matchesState && matchesDistrict && matchesService;
    });
  }, [query, state, district, service]);

  const resetFilters = () => {
    setQuery('');
    setState('');
    setDistrict('');
    setService('');
  };

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Blood Banks</h1>
          <Button variant="outline" size="sm" onClick={resetFilters}>Reset</Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Search & Filters</CardTitle>
            <CardDescription>Find licensed blood banks and their services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search by name or location"
                  className="pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <Select value={state} onValueChange={setState}>
                <SelectTrigger>
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  {states.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={district} onValueChange={setDistrict}>
                <SelectTrigger>
                  <SelectValue placeholder="District" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={service} onValueChange={setService}>
                <SelectTrigger>
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((b) => (
            <Card key={b.id} className="hover:shadow-md transition">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{b.name}</CardTitle>
                    <CardDescription>License: {b.licenseNo}</CardDescription>
                  </div>
                  <Badge variant={b.status === 'operational' ? 'default' : 'destructive'}>
                    {b.status === 'operational' ? 'Operational' : 'Temporarily Closed'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-gray-600" />
                  <div>
                    <div className="text-sm text-foreground">{b.address}</div>
                    <div className="text-xs text-muted-foreground">{b.city}, {b.district}, {b.state}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-600" />
                  <a href={`tel:${b.phone}`} className="text-primary hover:underline">{b.phone}</a>
                </div>
                {b.hours && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="text-muted-foreground">{b.hours}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-2">
                  {b.services.map(s => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
                <div className="pt-2">
                  <Button variant="outline" size="sm">View Stock</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-12">No blood banks match your filters.</div>
        )}
      </div>
    </>
  );
};

export default BloodBanks;