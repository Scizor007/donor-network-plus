import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  CheckCircle,
  Loader2,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  operating_hours?: string;
  services?: string[];
}

const BookAppointment = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState<'initial_checkup' | 'follow_up' | 'regular_checkup'>('initial_checkup');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [hospitalsLoading, setHospitalsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  useEffect(() => {
    fetchHospitals();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Location access denied:', error);
          toast({
            title: "Location Access Denied",
            description: "Geolocation is disabled. Distance sorting will not be available.",
            variant: "destructive"
          });
        }
      );
    }
  };

  const fetchHospitals = async () => {
    setHospitalsLoading(true);
    try {
      console.log('Fetching hospitals...');
      const { data, error } = await supabase
        .from('hospitals') // Changed from 'blood_banks' to 'hospitals'
        .select('*')
        .eq('is_active', true)
        .is('latitude', null, { negated: true }) // Corrected null check
        .is('longitude', null, { negated: true }) // Corrected null check
        .order('name');

      if (error) {
        console.error('Supabase error:', error.message);
        throw error;
      }

      console.log('Fetched hospitals:', data);
      setHospitals(data || []);

      if (!data || data.length === 0) {
        toast({
          title: "No Hospitals Found",
          description: "No active hospitals found. Please contact support.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch hospitals. Please try again.",
        variant: "destructive"
      });
    } finally {
      setHospitalsLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filteredHospitals = hospitals
    .filter(hospital =>
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.address.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(hospital => {
      let distance = null;
      if (userLocation) {
        distance = calculateDistance(
          userLocation[0], userLocation[1],
          hospital.latitude, hospital.longitude
        );
      }
      return { ...hospital, distance };
    })
    .sort((a, b) => {
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      return 0; // Maintain original order if distance is unavailable
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book an appointment",
        variant: "destructive"
      });
      return;
    }

    if (!selectedHospital || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select a hospital, date, and time",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const { error } = await supabase
        .from('appointments')
        .insert({
          donor_id: user.id,
          hospital_id: selectedHospital.id,
          appointment_date: appointmentDateTime.toISOString(),
          appointment_type: appointmentType,
          status: 'scheduled',
          notes: notes || null
        });

      if (error) throw error;

      toast({
        title: "Appointment Booked! ✅",
        description: `Your appointment is scheduled for ${format(appointmentDateTime, 'MMM dd, yyyy')} at ${selectedTime}`
      });

      // Reset form
      setSelectedHospital(null);
      setSelectedDate(undefined);
      setSelectedTime('');
      setNotes('');
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Booking Failed",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
              <p className="text-gray-600">Please sign in to book a health checkup appointment.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book Health Checkup Appointment</h1>
          <p className="text-gray-600 mt-2">Schedule your initial or follow-up health checkup at a nearby hospital</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hospital Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Select Hospital
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search hospitals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fetchHospitals}
                  disabled={hospitalsLoading}
                >
                  {hospitalsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
                </Button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {hospitalsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Loading hospitals...</span>
                  </div>
                ) : filteredHospitals.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hospitals found</p>
                    <p className="text-sm">Please try a different search term or contact support</p>
                  </div>
                ) : (
                  filteredHospitals.map((hospital) => (
                    <Card
                      key={hospital.id}
                      className={`cursor-pointer transition-all ${
                        selectedHospital?.id === hospital.id
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedHospital(hospital)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <h3 className="font-semibold">{hospital.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              {hospital.address}, {hospital.city}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              {hospital.phone}
                            </div>
                            {hospital.email && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Mail className="w-4 h-4" />
                                {hospital.email}
                              </div>
                            )}
                            {hospital.operating_hours && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                {hospital.operating_hours}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            {hospital.distance !== null && (
                              <Badge variant="outline" className="mb-2">
                                {hospital.distance.toFixed(1)} km
                              </Badge>
                            )}
                            {selectedHospital?.id === hospital.id && (
                              <CheckCircle className="w-5 h-5 text-blue-500" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="appointmentType">Appointment Type</Label>
                  <Select value={appointmentType} onValueChange={(value: any) => setAppointmentType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="initial_checkup">Initial Health Checkup</SelectItem>
                      <SelectItem value="follow_up">Follow-up Checkup</SelectItem>
                      <SelectItem value="regular_checkup">Regular Checkup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date() || date < new Date(Date.now() - 24 * 60 * 60 * 1000)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Select Time</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requirements or notes..."
                    rows={3}
                  />
                </div>

                {selectedHospital && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Selected Hospital</h4>
                    <p className="text-blue-800">{selectedHospital.name}</p>
                    <p className="text-sm text-blue-700">{selectedHospital.address}, {selectedHospital.city}</p>
                  </div>
                )}

                {/* Debug info - remove in production */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="p-4 bg-gray-100 rounded-lg text-xs">
                    <h4 className="font-semibold mb-2">Debug Info</h4>
                    <p>Hospitals loaded: {hospitals.length}</p>
                    <p>Filtered hospitals: {filteredHospitals.length}</p>
                    <p>Selected hospital: {selectedHospital ? selectedHospital.name : 'None'}</p>
                    <p>User location: {userLocation ? `${userLocation[0]}, ${userLocation[1]}` : 'Not available'}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!selectedHospital || !selectedDate || !selectedTime || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking Appointment...
                    </>
                  ) : (
                    'Book Appointment'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Information Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About Health Checkups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">Initial Checkup</h4>
                <p className="text-sm text-gray-600">
                  First-time donors need a comprehensive health assessment including blood tests, 
                  physical examination, and medical history review.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-700">Follow-up Checkup</h4>
                <p className="text-sm text-gray-600">
                  Regular health monitoring for existing donors to ensure continued eligibility 
                  and maintain health records.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-700">Regular Checkup</h4>
                <p className="text-sm text-gray-600">
                  Periodic health assessments to monitor donor health and update medical records 
                  as required by health regulations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookAppointment;