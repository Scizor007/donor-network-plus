import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Search,
  Plus,
  Upload,
  Download,
  MapPin,
  Phone,
  Mail,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  donor_id: string;
  hospital_id: string;
  appointment_date: string;
  appointment_type: 'initial_checkup' | 'follow_up' | 'regular_checkup';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  donor_name?: string;
  donor_phone?: string;
  donor_email?: string;
}

interface HealthCheckup {
  id: string;
  appointment_id: string;
  donor_id: string;
  hospital_id: string;
  checkup_date: string;
  weight_kg?: number;
  height_cm?: number;
  bmi?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  pulse_rate?: number;
  temperature_celsius?: number;
  hemoglobin_gdl?: number;
  rbc_count?: number;
  wbc_count?: number;
  platelet_count?: number;
  hematocrit?: number;
  has_medical_conditions: boolean;
  taking_medications: boolean;
  recent_illness: boolean;
  recent_surgery: boolean;
  has_tattoos: boolean;
  last_donation_date?: string;
  is_eligible: boolean;
  is_verified: boolean;
  verification_notes?: string;
  donor_name?: string;
  donor_blood_group?: string;
}

const HospitalPortal = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [healthCheckups, setHealthCheckups] = useState<HealthCheckup[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showCheckupForm, setShowCheckupForm] = useState(false);
  const [checkupForm, setCheckupForm] = useState({
    weight_kg: '',
    height_cm: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    pulse_rate: '',
    temperature_celsius: '',
    hemoglobin_gdl: '',
    rbc_count: '',
    wbc_count: '',
    platelet_count: '',
    hematocrit: '',
    has_medical_conditions: false,
    taking_medications: false,
    recent_illness: false,
    recent_surgery: false,
    has_tattoos: false,
    last_donation_date: '',
    verification_notes: ''
  });

  useEffect(() => {
    if (user) {
      // Initialize with sample appointment data for Kompally Hospital
      const sampleAppointments: Appointment[] = [
        {
          id: "apt1",
          donor_id: "user123",
          hospital_id: "h1",
          appointment_date: "2025-09-21T09:00:00Z",
          appointment_type: "initial_checkup",
          status: "scheduled",
          notes: "First-time donor checkup",
          donor_name: "John Doe",
          donor_phone: "+91-9876543210",
          donor_email: "john.doe@example.com"
        }
      ];
      setAppointments(sampleAppointments);
      // Keep fetchHealthCheckups for potential real data
      fetchHealthCheckups();
    }
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          profiles!appointments_donor_id_fkey (
            full_name,
            phone,
            email
          )
        `)
        .order('appointment_date', { ascending: true });

      if (error) throw error;

      const formattedAppointments = data?.map(apt => ({
        ...apt,
        donor_name: apt.profiles?.full_name,
        donor_phone: apt.profiles?.phone,
        donor_email: apt.profiles?.email
      })) || [];

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch appointments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthCheckups = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('health_checkups')
        .select(`
          *,
          profiles!health_checkups_donor_id_fkey (
            full_name,
            blood_group
          )
        `)
        .order('checkup_date', { ascending: false });

      if (error) throw error;

      const formattedCheckups = data?.map(checkup => ({
        ...checkup,
        donor_name: checkup.profiles?.full_name,
        donor_blood_group: checkup.profiles?.blood_group
      })) || [];

      setHealthCheckups(formattedCheckups);
    } catch (error) {
      console.error('Error fetching health checkups:', error);
      toast({
        title: "Error",
        description: "Failed to fetch health checkups",
        variant: "destructive"
      });
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Appointment marked as ${status}`
      });

      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive"
      });
    }
  };

  const submitHealthCheckup = async () => {
    if (!selectedAppointment) return;

    try {
      const checkupData = {
        appointment_id: selectedAppointment.id,
        donor_id: selectedAppointment.donor_id,
        hospital_id: selectedAppointment.hospital_id,
        checkup_date: new Date().toISOString(),
        weight_kg: checkupForm.weight_kg ? parseFloat(checkupForm.weight_kg) : null,
        height_cm: checkupForm.height_cm ? parseInt(checkupForm.height_cm) : null,
        blood_pressure_systolic: checkupForm.blood_pressure_systolic ? parseInt(checkupForm.blood_pressure_systolic) : null,
        blood_pressure_diastolic: checkupForm.blood_pressure_diastolic ? parseInt(checkupForm.blood_pressure_diastolic) : null,
        pulse_rate: checkupForm.pulse_rate ? parseInt(checkupForm.pulse_rate) : null,
        temperature_celsius: checkupForm.temperature_celsius ? parseFloat(checkupForm.temperature_celsius) : null,
        hemoglobin_gdl: checkupForm.hemoglobin_gdl ? parseFloat(checkupForm.hemoglobin_gdl) : null,
        rbc_count: checkupForm.rbc_count ? parseFloat(checkupForm.rbc_count) : null,
        wbc_count: checkupForm.wbc_count ? parseFloat(checkupForm.wbc_count) : null,
        platelet_count: checkupForm.platelet_count ? parseInt(checkupForm.platelet_count) : null,
        hematocrit: checkupForm.hematocrit ? parseFloat(checkupForm.hematocrit) : null,
        has_medical_conditions: checkupForm.has_medical_conditions,
        taking_medications: checkupForm.taking_medications,
        recent_illness: checkupForm.recent_illness,
        recent_surgery: checkupForm.recent_surgery,
        has_tattoos: checkupForm.has_tattoos,
        last_donation_date: checkupForm.last_donation_date || null,
        verification_notes: checkupForm.verification_notes,
        verified_by: user?.id,
        verified_at: new Date().toISOString()
      };

      // Calculate BMI if weight and height are provided
      if (checkupData.weight_kg && checkupData.height_cm) {
        const heightM = checkupData.height_cm / 100;
        checkupData.bmi = parseFloat((checkupData.weight_kg / (heightM * heightM)).toFixed(1));
      }

      // Determine eligibility based on medical criteria
      const isEligible = determineEligibility(checkupData);
      checkupData.is_eligible = isEligible;
      checkupData.is_verified = true;

      const { error } = await supabase
        .from('health_checkups')
        .insert(checkupData);

      if (error) throw error;

      // Update appointment status to completed
      await updateAppointmentStatus(selectedAppointment.id, 'completed');

      // Update donor profile with verification status
      await supabase
        .from('profiles')
        .update({
          is_verified: true,
          is_available: isEligible,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', selectedAppointment.donor_id);

      // Update eligible_donors table if eligible
      if (isEligible) {
        await supabase
          .from('eligible_donors')
          .upsert({
            user_id: selectedAppointment.donor_id,
            is_eligible: true,
            is_verified: true,
            is_available: true,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      }

      toast({
        title: "Health Checkup Completed! ✅",
        description: `Donor ${isEligible ? 'is eligible' : 'is not eligible'} for blood donation`
      });

      setShowCheckupForm(false);
      setSelectedAppointment(null);
      setCheckupForm({
        weight_kg: '',
        height_cm: '',
        blood_pressure_systolic: '',
        blood_pressure_diastolic: '',
        pulse_rate: '',
        temperature_celsius: '',
        hemoglobin_gdl: '',
        rbc_count: '',
        wbc_count: '',
        platelet_count: '',
        hematocrit: '',
        has_medical_conditions: false,
        taking_medications: false,
        recent_illness: false,
        recent_surgery: false,
        has_tattoos: false,
        last_donation_date: '',
        verification_notes: ''
      });

      fetchHealthCheckups();
    } catch (error) {
      console.error('Error submitting health checkup:', error);
      toast({
        title: "Error",
        description: "Failed to submit health checkup",
        variant: "destructive"
      });
    }
  };

  const determineEligibility = (checkupData: any): boolean => {
    // Basic eligibility criteria
    if (checkupData.has_medical_conditions || 
        checkupData.taking_medications || 
        checkupData.recent_illness || 
        checkupData.recent_surgery || 
        checkupData.has_tattoos) {
      return false;
    }

    // Weight check (minimum 50kg)
    if (checkupData.weight_kg && checkupData.weight_kg < 50) {
      return false;
    }

    // Hemoglobin check (minimum 12.5 g/dL)
    if (checkupData.hemoglobin_gdl && checkupData.hemoglobin_gdl < 12.5) {
      return false;
    }

    // Blood pressure check
    if (checkupData.blood_pressure_systolic && 
        (checkupData.blood_pressure_systolic < 100 || checkupData.blood_pressure_systolic > 180)) {
      return false;
    }
    if (checkupData.blood_pressure_diastolic && 
        (checkupData.blood_pressure_diastolic < 60 || checkupData.blood_pressure_diastolic > 100)) {
      return false;
    }

    // Pulse rate check
    if (checkupData.pulse_rate && (checkupData.pulse_rate < 50 || checkupData.pulse_rate > 100)) {
      return false;
    }

    // Temperature check
    if (checkupData.temperature_celsius && 
        (checkupData.temperature_celsius < 36.1 || checkupData.temperature_celsius > 37.2)) {
      return false;
    }

    return true;
  };

  const filteredAppointments = appointments.filter(apt =>
    apt.donor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.donor_phone?.includes(searchTerm) ||
    apt.donor_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCheckups = healthCheckups.filter(checkup =>
    checkup.donor_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
              <p className="text-gray-600">Please sign in to access the hospital portal.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hospital Portal</h1>
          <p className="text-gray-600 mt-2">Manage appointments and health checkups</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="checkups" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Health Checkups
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Upcoming Appointments
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search appointments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAppointments.map((appointment) => (
                      <Card key={appointment.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-4">
                                <h3 className="font-semibold text-lg">{appointment.donor_name}</h3>
                                <Badge variant={
                                  appointment.status === 'scheduled' ? 'default' :
                                  appointment.status === 'completed' ? 'secondary' :
                                  appointment.status === 'cancelled' ? 'destructive' : 'outline'
                                }>
                                  {appointment.status}
                                </Badge>
                                <Badge variant="outline">
                                  {appointment.appointment_type.replace('_', ' ')}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-6 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {format(new Date(appointment.appointment_date), 'HH:mm')}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Phone className="w-4 h-4" />
                                  {appointment.donor_phone}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  {appointment.donor_email}
                                </div>
                              </div>
                              {appointment.notes && (
                                <p className="text-sm text-gray-600 mt-2">{appointment.notes}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {appointment.status === 'scheduled' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedAppointment(appointment);
                                      setShowCheckupForm(true);
                                    }}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Start Checkup
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              )}
                              {appointment.status === 'completed' && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Completed
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {filteredAppointments.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No appointments found
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checkups" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Health Checkup Records
                  </CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search checkups..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCheckups.map((checkup) => (
                    <Card key={checkup.id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-4">
                              <h3 className="font-semibold text-lg">{checkup.donor_name}</h3>
                              <Badge variant="outline">{checkup.donor_blood_group}</Badge>
                              {checkup.is_verified && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                              <Badge variant={checkup.is_eligible ? "default" : "destructive"}>
                                {checkup.is_eligible ? 'Eligible' : 'Not Eligible'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(checkup.checkup_date), 'MMM dd, yyyy')}
                              </div>
                              {checkup.weight_kg && (
                                <span>Weight: {checkup.weight_kg}kg</span>
                              )}
                              {checkup.hemoglobin_gdl && (
                                <span>Hb: {checkup.hemoglobin_gdl}g/dL</span>
                              )}
                              {checkup.blood_pressure_systolic && checkup.blood_pressure_diastolic && (
                                <span>BP: {checkup.blood_pressure_systolic}/{checkup.blood_pressure_diastolic}</span>
                              )}
                            </div>
                            {checkup.verification_notes && (
                              <p className="text-sm text-gray-600 mt-2">{checkup.verification_notes}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4 mr-1" />
                              Download Report
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredCheckups.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No health checkups found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Health Checkup Form Modal */}
        {showCheckupForm && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Health Checkup - {selectedAppointment.donor_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={checkupForm.weight_kg}
                      onChange={(e) => setCheckupForm({...checkupForm, weight_kg: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={checkupForm.height_cm}
                      onChange={(e) => setCheckupForm({...checkupForm, height_cm: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="systolic">Systolic BP (mmHg)</Label>
                    <Input
                      id="systolic"
                      type="number"
                      value={checkupForm.blood_pressure_systolic}
                      onChange={(e) => setCheckupForm({...checkupForm, blood_pressure_systolic: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diastolic">Diastolic BP (mmHg)</Label>
                    <Input
                      id="diastolic"
                      type="number"
                      value={checkupForm.blood_pressure_diastolic}
                      onChange={(e) => setCheckupForm({...checkupForm, blood_pressure_diastolic: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pulse">Pulse Rate (bpm)</Label>
                    <Input
                      id="pulse"
                      type="number"
                      value={checkupForm.pulse_rate}
                      onChange={(e) => setCheckupForm({...checkupForm, pulse_rate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature (°C)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      value={checkupForm.temperature_celsius}
                      onChange={(e) => setCheckupForm({...checkupForm, temperature_celsius: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hemoglobin">Hemoglobin (g/dL)</Label>
                    <Input
                      id="hemoglobin"
                      type="number"
                      step="0.1"
                      value={checkupForm.hemoglobin_gdl}
                      onChange={(e) => setCheckupForm({...checkupForm, hemoglobin_gdl: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rbc">RBC Count (million/µL)</Label>
                    <Input
                      id="rbc"
                      type="number"
                      step="0.01"
                      value={checkupForm.rbc_count}
                      onChange={(e) => setCheckupForm({...checkupForm, rbc_count: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wbc">WBC Count (thousand/µL)</Label>
                    <Input
                      id="wbc"
                      type="number"
                      step="0.1"
                      value={checkupForm.wbc_count}
                      onChange={(e) => setCheckupForm({...checkupForm, wbc_count: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="platelet">Platelet Count (thousand/µL)</Label>
                    <Input
                      id="platelet"
                      type="number"
                      value={checkupForm.platelet_count}
                      onChange={(e) => setCheckupForm({...checkupForm, platelet_count: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hematocrit">Hematocrit (%)</Label>
                    <Input
                      id="hematocrit"
                      type="number"
                      step="0.1"
                      value={checkupForm.hematocrit}
                      onChange={(e) => setCheckupForm({...checkupForm, hematocrit: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_donation">Last Donation Date</Label>
                    <Input
                      id="last_donation"
                      type="date"
                      value={checkupForm.last_donation_date}
                      onChange={(e) => setCheckupForm({...checkupForm, last_donation_date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Health Screening</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="medical_conditions"
                        checked={checkupForm.has_medical_conditions}
                        onCheckedChange={(checked) => setCheckupForm({...checkupForm, has_medical_conditions: checked as boolean})}
                      />
                      <Label htmlFor="medical_conditions">Has medical conditions</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="medications"
                        checked={checkupForm.taking_medications}
                        onCheckedChange={(checked) => setCheckupForm({...checkupForm, taking_medications: checked as boolean})}
                      />
                      <Label htmlFor="medications">Taking medications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="recent_illness"
                        checked={checkupForm.recent_illness}
                        onCheckedChange={(checked) => setCheckupForm({...checkupForm, recent_illness: checked as boolean})}
                      />
                      <Label htmlFor="recent_illness">Recent illness</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="recent_surgery"
                        checked={checkupForm.recent_surgery}
                        onCheckedChange={(checked) => setCheckupForm({...checkupForm, recent_surgery: checked as boolean})}
                      />
                      <Label htmlFor="recent_surgery">Recent surgery</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tattoos"
                        checked={checkupForm.has_tattoos}
                        onCheckedChange={(checked) => setCheckupForm({...checkupForm, has_tattoos: checked as boolean})}
                      />
                      <Label htmlFor="tattoos">Has tattoos/piercings</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Verification Notes</Label>
                  <Textarea
                    id="notes"
                    value={checkupForm.verification_notes}
                    onChange={(e) => setCheckupForm({...checkupForm, verification_notes: e.target.value})}
                    placeholder="Additional notes about the checkup..."
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCheckupForm(false);
                      setSelectedAppointment(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={submitHealthCheckup} className="bg-green-600 hover:bg-green-700">
                    Complete Checkup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalPortal;