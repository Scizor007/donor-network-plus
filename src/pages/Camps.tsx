import { useMemo, useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, MapPin, Users, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CreateCampDialog } from '@/components/CreateCampDialog';

interface Camp {
  id: string;
  name: string;
  description: string;
  organizer: string;
  bankName?: string;
  venue: string;
  city: string;
  state: string;
  startAt: string; // ISO
  endAt: string; // ISO
  expectedUnits: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

const MOCK_CAMPS: Camp[] = [
  {
    id: 'camp-001',
    name: 'Community Health Drive',
    description: 'Join us for a neighborhood blood donation camp to support local hospitals.',
    organizer: 'City Central Blood Bank',
    bankName: 'City Central Blood Bank',
    venue: 'Community Hall, Sector 5',
    city: 'Pune',
    state: 'Maharashtra',
    startAt: new Date(Date.now() + 3*24*3600*1000).toISOString(),
    endAt: new Date(Date.now() + 3*24*3600*1000 + 3*3600*1000).toISOString(),
    expectedUnits: 120,
    status: 'upcoming',
  },
  {
    id: 'camp-002',
    name: 'Corporate Wellness Camp',
    description: 'Employee blood donation initiative with onsite health screening.',
    organizer: 'Lifeline Blood Bank',
    bankName: 'Lifeline Blood Bank',
    venue: 'Tech Park Tower B',
    city: 'Mumbai',
    state: 'Maharashtra',
    startAt: new Date(Date.now() - 2*3600*1000).toISOString(),
    endAt: new Date(Date.now() + 2*3600*1000).toISOString(),
    expectedUnits: 80,
    status: 'ongoing',
  },
  {
    id: 'camp-003',
    name: 'Red Cross Awareness Camp',
    description: 'Public awareness and donation camp.',
    organizer: 'Red Cross',
    bankName: 'Red Cross Blood Center',
    venue: 'Downtown Plaza',
    city: 'New Delhi',
    state: 'Delhi',
    startAt: new Date(Date.now() - 15*24*3600*1000).toISOString(),
    endAt: new Date(Date.now() - 15*24*3600*1000 + 4*3600*1000).toISOString(),
    expectedUnits: 150,
    status: 'completed',
  },
];

const unique = (arr: string[]) => Array.from(new Set(arr)).sort();

const Camps = () => {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const states = useMemo(() => unique(MOCK_CAMPS.map(c => c.state)), []);

  const filtered = useMemo(() => {
    return MOCK_CAMPS.filter(c => {
      const matchesQuery = query
        ? (c.name + ' ' + c.venue + ' ' + c.city + ' ' + c.state)
            .toLowerCase()
            .includes(query.toLowerCase())
        : true;
      const matchesState = state ? c.state === state : true;
      const matchesStatus = status ? c.status === status : true;
      return matchesQuery && matchesState && matchesStatus;
    });
  }, [query, state, status]);

  const reset = () => {
    setQuery('');
    setState('');
    setStatus('');
  };

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Blood Donation Camps</h1>
          <div className="flex gap-2">
            <CreateCampDialog>
              <Button variant="default" size="sm">Create Camp</Button>
            </CreateCampDialog>
            <Button variant="outline" size="sm" onClick={reset}>Reset</Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Search & Filters</CardTitle>
            <CardDescription>Find and register for upcoming camps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Placeholder */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><CalendarIcon className="w-5 h-5" /> Calendar</CardTitle>
            <CardDescription>Calendar integration coming soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-gray-50 border rounded-md flex items-center justify-center text-sm text-muted-foreground">
              Monthly calendar will appear here.
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(c => (
            <Card key={c.id} className="hover:shadow-md transition">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{c.name}</CardTitle>
                    <CardDescription>Organized by {c.organizer}</CardDescription>
                  </div>
                  <Badge variant={c.status === 'upcoming' || c.status === 'ongoing' ? 'default' : 'secondary'}>
                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="w-4 h-4 text-gray-600" />
                  <span>
                    {new Date(c.startAt).toLocaleString()} — {new Date(c.endAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-600 mt-0.5" />
                  <span>{c.venue}, {c.city}, {c.state}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span>Expected units: {c.expectedUnits}</span>
                </div>
                <p className="text-sm text-muted-foreground">{c.description}</p>
                <div className="pt-2 flex gap-2">
                  <Link to={`/camps/${c.id}`}>
                    <Button size="sm">View Details</Button>
                  </Link>
                  {c.status !== 'completed' && (
                    <Button variant="outline" size="sm">Register</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-12">No camps match your filters.</div>
        )}
      </div>
    </>
  );
};

export default Camps;