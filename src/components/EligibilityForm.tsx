import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface EligibilityData {
  hemoglobin_level: number | null;
  rbc_count: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  pulse_rate: number | null;
  has_medical_conditions: boolean;
  taking_medications: boolean;
  recent_illness: boolean;
  recent_surgery: boolean;
  has_tattoos: boolean;
  last_donation_date: string;
}

interface EligibilityFormProps {
  onEligibilityCheck: (isEligible: boolean, data: EligibilityData) => void;
}

export const EligibilityForm: React.FC<EligibilityFormProps> = ({ onEligibilityCheck }) => {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState<EligibilityData>({
    hemoglobin_level: null,
    rbc_count: null,
    blood_pressure_systolic: null,
    blood_pressure_diastolic: null,
    weight_kg: null,
    height_cm: null,
    pulse_rate: null,
    has_medical_conditions: false,
    taking_medications: false,
    recent_illness: false,
    recent_surgery: false,
    has_tattoos: false,
    last_donation_date: ''
  });

  const [healthReportFile, setHealthReportFile] = useState<File | null>(null);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [eligibilityResults, setEligibilityResults] = useState<any>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, JPG, or PNG file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setHealthReportFile(file);
    setUploadingReport(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/health-report-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('health-reports')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('health-reports')
        .getPublicUrl(fileName);

      // Update profile with health report URL
      await supabase
        .from('profiles')
        .update({ health_report_url: urlData.publicUrl })
        .eq('user_id', user?.id);

      toast.success('Health report uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload health report');
    } finally {
      setUploadingReport(false);
    }
  };

  const checkEligibility = () => {
    const results = {
      age: checkAge(),
      weight: checkWeight(),
      hemoglobin: checkHemoglobin(),
      rbc: checkRBCCount(),
      bloodPressure: checkBloodPressure(),
      pulse: checkPulseRate(),
      healthConditions: checkHealthConditions(),
      lastDonation: checkLastDonation()
    };

    const isEligible = Object.values(results).every(result => result.status === 'pass');
    
    setEligibilityResults(results);
    onEligibilityCheck(isEligible, formData);
    
    if (isEligible) {
      toast.success('Congratulations! You are eligible to donate blood.');
    } else {
      toast.error('Unfortunately, you do not meet all eligibility criteria at this time.');
    }
  };

  const checkAge = () => {
    const age = profile?.age || 0;
    return {
      criterion: 'Age (18-65 years)',
      value: `${age} years`,
      status: age >= 18 && age <= 65 ? 'pass' : 'fail',
      message: age >= 18 && age <= 65 ? 'Age requirement met' : 'Must be between 18-65 years old'
    };
  };

  const checkWeight = () => {
    const weight = formData.weight_kg || 0;
    return {
      criterion: 'Weight (minimum 50kg)',
      value: `${weight} kg`,
      status: weight >= 50 ? 'pass' : 'fail',
      message: weight >= 50 ? 'Weight requirement met' : 'Must weigh at least 50kg'
    };
  };

  const checkHemoglobin = () => {
    const hb = formData.hemoglobin_level || 0;
    return {
      criterion: 'Hemoglobin (minimum 12.5 g/dL)',
      value: `${hb} g/dL`,
      status: hb >= 12.5 ? 'pass' : 'fail',
      message: hb >= 12.5 ? 'Hemoglobin level adequate' : 'Hemoglobin too low for donation'
    };
  };

  const checkRBCCount = () => {
    const rbc = formData.rbc_count || 0;
    const gender = profile?.gender;
    const minRBC = gender === 'male' ? 4.5 : 4.0;
    const maxRBC = gender === 'male' ? 5.5 : 5.0;
    
    return {
      criterion: `RBC Count (${minRBC}-${maxRBC} million/μL)`,
      value: `${rbc} million/μL`,
      status: rbc >= minRBC && rbc <= maxRBC ? 'pass' : 'fail',
      message: rbc >= minRBC && rbc <= maxRBC ? 'RBC count normal' : 'RBC count outside normal range'
    };
  };

  const checkBloodPressure = () => {
    const systolic = formData.blood_pressure_systolic || 0;
    const diastolic = formData.blood_pressure_diastolic || 0;
    const systolicOK = systolic >= 120 && systolic <= 180;
    const diastolicOK = diastolic >= 70 && diastolic <= 100;
    
    return {
      criterion: 'Blood Pressure (120-180/70-100 mmHg)',
      value: `${systolic}/${diastolic} mmHg`,
      status: systolicOK && diastolicOK ? 'pass' : 'fail',
      message: systolicOK && diastolicOK ? 'Blood pressure normal' : 'Blood pressure outside acceptable range'
    };
  };

  const checkPulseRate = () => {
    const pulse = formData.pulse_rate || 0;
    return {
      criterion: 'Pulse Rate (50-100 bpm)',
      value: `${pulse} bpm`,
      status: pulse >= 50 && pulse <= 100 ? 'pass' : 'fail',
      message: pulse >= 50 && pulse <= 100 ? 'Pulse rate normal' : 'Pulse rate outside normal range'
    };
  };

  const checkHealthConditions = () => {
    const hasConditions = formData.has_medical_conditions || 
                         formData.taking_medications || 
                         formData.recent_illness || 
                         formData.recent_surgery;
    
    return {
      criterion: 'Health Conditions',
      value: hasConditions ? 'Has conditions' : 'No conditions',
      status: !hasConditions ? 'pass' : 'fail',
      message: !hasConditions ? 'No disqualifying conditions' : 'Health conditions require medical clearance'
    };
  };

  const checkLastDonation = () => {
    if (!formData.last_donation_date) {
      return {
        criterion: 'Last Donation (90+ days ago)',
        value: 'Never donated',
        status: 'pass',
        message: 'First-time donor'
      };
    }
    
    const lastDonation = new Date(formData.last_donation_date);
    const daysSince = Math.floor((Date.now() - lastDonation.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      criterion: 'Last Donation (90+ days ago)',
      value: `${daysSince} days ago`,
      status: daysSince >= 90 ? 'pass' : 'fail',
      message: daysSince >= 90 ? 'Sufficient time since last donation' : 'Must wait 90 days between donations'
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Medical Eligibility Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Medical Measurements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hemoglobin">Hemoglobin Level (g/dL)</Label>
            <Input
              id="hemoglobin"
              type="number"
              step="0.1"
              value={formData.hemoglobin_level || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, hemoglobin_level: parseFloat(e.target.value) || null }))}
              placeholder="12.5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rbc">RBC Count (million cells/μL)</Label>
            <Input
              id="rbc"
              type="number"
              step="0.1"
              value={formData.rbc_count || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, rbc_count: parseFloat(e.target.value) || null }))}
              placeholder="4.5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              value={formData.weight_kg || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, weight_kg: parseFloat(e.target.value) || null }))}
              placeholder="50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              value={formData.height_cm || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, height_cm: parseInt(e.target.value) || null }))}
              placeholder="170"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="systolic">Systolic BP (mmHg)</Label>
            <Input
              id="systolic"
              type="number"
              value={formData.blood_pressure_systolic || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, blood_pressure_systolic: parseInt(e.target.value) || null }))}
              placeholder="120"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diastolic">Diastolic BP (mmHg)</Label>
            <Input
              id="diastolic"
              type="number"
              value={formData.blood_pressure_diastolic || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, blood_pressure_diastolic: parseInt(e.target.value) || null }))}
              placeholder="80"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pulse">Pulse Rate (bpm)</Label>
            <Input
              id="pulse"
              type="number"
              value={formData.pulse_rate || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, pulse_rate: parseInt(e.target.value) || null }))}
              placeholder="72"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastDonation">Last Donation Date</Label>
            <Input
              id="lastDonation"
              type="date"
              value={formData.last_donation_date}
              onChange={(e) => setFormData(prev => ({ ...prev, last_donation_date: e.target.value }))}
            />
          </div>
        </div>

        {/* Health Conditions */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Health Conditions (Select all that apply)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="medical-conditions"
                checked={formData.has_medical_conditions}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, has_medical_conditions: checked as boolean }))}
              />
              <Label htmlFor="medical-conditions">Chronic medical conditions</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="medications"
                checked={formData.taking_medications}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, taking_medications: checked as boolean }))}
              />
              <Label htmlFor="medications">Currently taking medications</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="recent-illness"
                checked={formData.recent_illness}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, recent_illness: checked as boolean }))}
              />
              <Label htmlFor="recent-illness">Recent illness (within 30 days)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="recent-surgery"
                checked={formData.recent_surgery}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, recent_surgery: checked as boolean }))}
              />
              <Label htmlFor="recent-surgery">Recent surgery (within 6 months)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="tattoos"
                checked={formData.has_tattoos}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, has_tattoos: checked as boolean }))}
              />
              <Label htmlFor="tattoos">Tattoos/piercings (within 12 months)</Label>
            </div>
          </div>
        </div>

        {/* Health Report Upload */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Upload Health Report (Optional)</h3>
          <div className="flex items-center justify-center w-full">
            <label htmlFor="health-report" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {healthReportFile ? (
                  <>
                    <FileText className="w-8 h-8 mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">{healthReportFile.name}</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Upload PDF, JPG, or PNG</p>
                    <p className="text-xs text-muted-foreground">Max 5MB</p>
                  </>
                )}
              </div>
              <input
                id="health-report"
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                disabled={uploadingReport}
              />
            </label>
          </div>
        </div>

        <Button 
          onClick={checkEligibility} 
          className="w-full"
          disabled={!formData.hemoglobin_level || !formData.rbc_count || !formData.weight_kg}
        >
          Check Eligibility
        </Button>

        {/* Eligibility Results */}
        {eligibilityResults && (
          <div className="space-y-4 mt-6">
            <h3 className="font-semibold">Eligibility Results</h3>
            <div className="space-y-3">
              {Object.values(eligibilityResults).map((result: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{result.criterion}</div>
                    <div className="text-xs text-muted-foreground">{result.message}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{result.value}</span>
                    {result.status === 'pass' ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Pass
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Fail
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EligibilityForm;