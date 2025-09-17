import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CreateBloodBankDialogProps {
  children: React.ReactNode;
  onBloodBankCreated?: () => void;
}

const AVAILABLE_SERVICES = [
  'Whole Blood',
  'RBC',
  'Platelets',
  'Plasma',
  'Cryoprecipitate',
  'Blood Testing',
  'Component Separation'
];

export const CreateBloodBankDialog = ({ children, onBloodBankCreated }: CreateBloodBankDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    license_number: '',
    address: '',
    city: '',
    district: '',
    state: '',
    phone: '',
    email: '',
    website: '',
    operating_hours: '',
    capacity_daily: '50',
    status: 'operational'
  });

  const handleServiceChange = (service: string, checked: boolean) => {
    if (checked) {
      setSelectedServices([...selectedServices, service]);
    } else {
      setSelectedServices(selectedServices.filter(s => s !== service));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a blood bank.",
        variant: "destructive"
      });
      return;
    }

    if (selectedServices.length === 0) {
      toast({
        title: "Services Required",
        description: "Please select at least one service.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('blood_banks')
        .insert({
          ...formData,
          services: selectedServices,
          capacity_daily: parseInt(formData.capacity_daily),
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Blood Bank Created Successfully!",
        description: "Your blood bank has been created and is now listed in the directory."
      });

      setOpen(false);
      setFormData({
        name: '',
        license_number: '',
        address: '',
        city: '',
        district: '',
        state: '',
        phone: '',
        email: '',
        website: '',
        operating_hours: '',
        capacity_daily: '50',
        status: 'operational'
      });
      setSelectedServices([]);
      
      onBloodBankCreated?.();
    } catch (error) {
      console.error('Error creating blood bank:', error);
      toast({
        title: "Error",
        description: "Failed to create blood bank. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Blood Bank</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Blood Bank Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="license_number">License Number *</Label>
              <Input
                id="license_number"
                value={formData.license_number}
                onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="district">District *</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) => setFormData({...formData, district: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="operating_hours">Operating Hours</Label>
              <Input
                id="operating_hours"
                value={formData.operating_hours}
                onChange={(e) => setFormData({...formData, operating_hours: e.target.value})}
                placeholder="e.g., Mon-Fri 9:00 AM - 6:00 PM"
              />
            </div>
            <div>
              <Label htmlFor="capacity_daily">Daily Capacity</Label>
              <Input
                id="capacity_daily"
                type="number"
                min="1"
                value={formData.capacity_daily}
                onChange={(e) => setFormData({...formData, capacity_daily: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="temporarily_closed">Temporarily Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label>Services Offered *</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {AVAILABLE_SERVICES.map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={service}
                    checked={selectedServices.includes(service)}
                    onCheckedChange={(checked) => handleServiceChange(service, checked as boolean)}
                  />
                  <Label htmlFor={service} className="text-sm">{service}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Blood Bank'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};