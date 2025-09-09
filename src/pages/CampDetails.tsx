import { useMemo, useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, MapPin, Users, Mail, Phone } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const MOCK_CAMPS = [
  {
    id: 'camp-001',
    name: 'Community Health Drive',
    description: 'Join us for a neighborhood blood donation camp to support local hospitals.',
    organizer: 'City Central Blood Bank',
    venue: 'Community Hall, Sector 5',
    city: 'Pune',
    state: 'Maharashtra',
    startAt: new Date(Date.now() + 3*24*3600*1000).toISOString(),
    endAt: new Date(Date.now() + 3*24*3600*1000 + 3*3600*1000).toISOString(),
    expectedUnits: 120,
    status: 'upcoming',
    contact: { phone: '+91 20 1234 5678', email: 'camps@ccbb.org' }
  },
];

const CampDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const camp = useMemo(() => MOCK_CAMPS.find(c => c.id === id) || MOCK_CAMPS[0], [id]);

  const register = () => {
    if (!fullName || !email || !phone) {
      toast({ title: 'Missing details', description: 'Please fill all fields to register.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Registered', description: 'You have been registered for the camp.' });
    setFullName('');
    setEmail('');
    setPhone('');
  };

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">{camp.name}</h1>
          <Badge>{camp.status.toUpperCase()}</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Camp Information</CardTitle>
                <CardDescription>Key details and logistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-600" />
                  <span>
                    {new Date(camp.startAt).toLocaleString()} — {new Date(camp.endAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-600 mt-0.5" />
                  <span>{camp.venue}, {camp.city}, {camp.state}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span>Expected units: {camp.expectedUnits}</span>
                </div>
                <p className="text-muted-foreground">{camp.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Organizer Contact</CardTitle>
                <CardDescription>Reach out for any queries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-600" />
                  <a href={`tel:${camp.contact.phone}`} className="text-primary hover:underline">{camp.contact.phone}</a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-600" />
                  <a href={`mailto:${camp.contact.email}`} className="text-primary hover:underline">{camp.contact.email}</a>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Register for this Camp</CardTitle>
                <CardDescription>Provide your details to confirm a slot</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <Button className="w-full" onClick={register}>Register</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default CampDetails;