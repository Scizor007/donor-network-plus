import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Users, Calendar, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const HospitalPortal = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [nearbyDonors, setNearbyDonors] = useState<any[]>([]);
  const [donationRequests, setDonationRequests] = useState<any[]>([]);
  const [hospitalInfo, setHospitalInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const [newInventoryItem, setNewInventoryItem] = useState({
    blood_group: '',
    units_available: '',
    expiry_date: ''
  });

  const [newDonationRequest, setNewDonationRequest] = useState({
    blood_group: '',
    units_needed: '',
    campaign_name: '',
    description: '',
    event_date: '',
    urgency_level: 'medium'
  });

  useEffect(() => {
    if (user) {
      fetchHospitalData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchHospitalData = async () => {
    try {
      setLoading(true);

      // Get hospital staff info
      const { data: staffData } = await supabase
        .from('hospital_staff')
        .select(`
          *,
          blood_banks (
            id,
            name,
            address,
            phone,
            latitude,
            longitude
          )
        `)
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .single();

      if (!staffData) {
        toast({
          title: "Access Denied",
          description: "You don't have hospital portal access.",
          variant: "destructive"
        });
        return;
      }

      setHospitalInfo(staffData.blood_banks);

      // Fetch blood inventory
      const { data: inventoryData } = await supabase
        .from('blood_inventory')
        .select('*')
        .eq('blood_bank_id', staffData.blood_banks.id)
        .order('blood_group');

      setInventory(inventoryData || []);

      // Fetch nearby donors
      const { data: donorsData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'donor')
        .eq('is_available', true)
        .not('blood_group', 'is', null)
        .limit(20);

      setNearbyDonors(donorsData || []);

      // Fetch donation requests
      const { data: requestsData } = await supabase
        .from('donation_requests')
        .select('*')
        .eq('hospital_id', staffData.blood_banks.id)
        .order('created_at', { ascending: false });

      setDonationRequests(requestsData || []);

    } catch (error) {
      console.error('Error fetching hospital data:', error);
      toast({
        title: "Error",
        description: "Failed to load hospital data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addInventoryItem = async () => {
    if (!newInventoryItem.blood_group || !newInventoryItem.units_available) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('blood_inventory')
        .upsert({
          blood_bank_id: hospitalInfo.id,
          blood_group: newInventoryItem.blood_group,
          units_available: parseInt(newInventoryItem.units_available),
          expiry_date: newInventoryItem.expiry_date || null
        }, {
          onConflict: 'blood_bank_id,blood_group'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Blood inventory updated successfully!"
      });

      setNewInventoryItem({ blood_group: '', units_available: '', expiry_date: '' });
      fetchHospitalData();
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast({
        title: "Error",
        description: "Failed to update inventory.",
        variant: "destructive"
      });
    }
  };

  const createDonationRequest = async () => {
    if (!newDonationRequest.blood_group || !newDonationRequest.campaign_name) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('donation_requests')
        .insert({
          hospital_id: hospitalInfo.id,
          ...newDonationRequest,
          units_needed: parseInt(newDonationRequest.units_needed) || 1,
          contact_phone: hospitalInfo.phone,
          location: hospitalInfo.address
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Donation request created successfully!"
      });

      setNewDonationRequest({
        blood_group: '',
        units_needed: '',
        campaign_name: '',
        description: '',
        event_date: '',
        urgency_level: 'medium'
      });
      fetchHospitalData();
    } catch (error) {
      console.error('Error creating donation request:', error);
      toast({
        title: "Error",
        description: "Failed to create donation request.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-medical-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading hospital portal...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-medical-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sign in required</h2>
              <p className="text-muted-foreground mb-4">
                Please sign in to access the hospital portal.
              </p>
              <Link to="/login">
                <Button>Go to Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!hospitalInfo) {
    return (
      <div className="min-h-screen bg-medical-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                You don't have access to the hospital portal. Please contact your administrator.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-medical-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Building2 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Hospital Portal</h1>
          </div>
          <p className="text-muted-foreground">{hospitalInfo.name}</p>
          <p className="text-sm text-muted-foreground">{hospitalInfo.address}</p>
        </div>

        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inventory">Blood Inventory</TabsTrigger>
            <TabsTrigger value="donors">Available Donors</TabsTrigger>
            <TabsTrigger value="campaigns">Donation Drives</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Add Blood Stock</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="blood_group">Blood Group *</Label>
                    <Select onValueChange={(value) => setNewInventoryItem({...newInventoryItem, blood_group: value})}>
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
                    <Label htmlFor="units_available">Units Available *</Label>
                    <Input
                      type="number"
                      min="0"
                      value={newInventoryItem.units_available}
                      onChange={(e) => setNewInventoryItem({...newInventoryItem, units_available: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiry_date">Expiry Date</Label>
                    <Input
                      type="date"
                      value={newInventoryItem.expiry_date}
                      onChange={(e) => setNewInventoryItem({...newInventoryItem, expiry_date: e.target.value})}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addInventoryItem} className="w-full">
                      Add Stock
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {inventory.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {item.blood_group}
                      </div>
                      <div className="text-3xl font-bold mb-2">
                        {item.units_available}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.units_available === 1 ? 'unit' : 'units'} available
                      </div>
                      {item.expiry_date && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Expires: {format(new Date(item.expiry_date), 'MMM dd, yyyy')}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        Updated: {format(new Date(item.last_updated), 'MMM dd, HH:mm')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="donors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Available Donors Nearby</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {nearbyDonors.map((donor) => (
                    <div key={donor.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <div className="flex items-center space-x-3">
                          <Badge variant="secondary" className="text-primary font-bold">
                            {donor.blood_group}
                          </Badge>
                          <span className="font-medium">{donor.full_name}</span>
                          {donor.is_verified && (
                            <Badge variant="default" className="bg-green-100 text-green-700 border-green-300">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {donor.city} • Age: {donor.age}
                        </div>
                        {donor.last_donation_date && (
                          <div className="text-xs text-muted-foreground">
                            Last donation: {format(new Date(donor.last_donation_date), 'MMM yyyy')}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Phone className="w-4 h-4 mr-2" />
                          Contact
                        </Button>
                        <Button size="sm">
                          Invite to Drive
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Create Donation Drive</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="campaign_name">Campaign Name *</Label>
                    <Input
                      value={newDonationRequest.campaign_name}
                      onChange={(e) => setNewDonationRequest({...newDonationRequest, campaign_name: e.target.value})}
                      placeholder="Emergency Blood Drive"
                    />
                  </div>
                  <div>
                    <Label htmlFor="blood_group">Blood Group Needed *</Label>
                    <Select onValueChange={(value) => setNewDonationRequest({...newDonationRequest, blood_group: value})}>
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
                    <Label htmlFor="units_needed">Units Needed</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newDonationRequest.units_needed}
                      onChange={(e) => setNewDonationRequest({...newDonationRequest, units_needed: e.target.value})}
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="urgency_level">Urgency Level</Label>
                    <Select value={newDonationRequest.urgency_level} onValueChange={(value) => setNewDonationRequest({...newDonationRequest, urgency_level: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="event_date">Event Date</Label>
                    <Input
                      type="date"
                      value={newDonationRequest.event_date}
                      onChange={(e) => setNewDonationRequest({...newDonationRequest, event_date: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      value={newDonationRequest.description}
                      onChange={(e) => setNewDonationRequest({...newDonationRequest, description: e.target.value})}
                      placeholder="Help save lives by donating blood..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button onClick={createDonationRequest} className="w-full">
                      Create Donation Drive
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {donationRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-3">
                          <Badge variant="secondary" className="text-primary font-bold">
                            {request.blood_group}
                          </Badge>
                          <span className="font-medium">{request.campaign_name}</span>
                          <Badge variant={
                            request.urgency_level === 'critical' ? 'destructive' :
                            request.urgency_level === 'high' ? 'default' : 'secondary'
                          }>
                            {request.urgency_level}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {request.description}
                        </p>
                        <div className="text-xs text-muted-foreground mt-2">
                          Units needed: {request.units_needed} • Created: {format(new Date(request.created_at), 'MMM dd, yyyy')}
                          {request.event_date && (
                            <span> • Event: {format(new Date(request.event_date), 'MMM dd, yyyy')}</span>
                          )}
                        </div>
                      </div>
                      <Badge variant={request.status === 'active' ? 'default' : 'secondary'}>
                        {request.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HospitalPortal;