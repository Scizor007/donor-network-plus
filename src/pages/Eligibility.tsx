import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, XCircle, AlertTriangle, Heart } from 'lucide-react';
import Navigation from '@/components/Navigation';

interface EligibilityQuestion {
  id: string;
  question: string;
  type: 'select' | 'checkbox';
  options?: string[];
  required: boolean;
}

const eligibilityQuestions: EligibilityQuestion[] = [
  {
    id: 'age',
    question: 'What is your age?',
    type: 'select',
    options: ['Under 18', '18-25', '26-35', '36-45', '46-55', '56-65', 'Over 65'],
    required: true
  },
  {
    id: 'weight',
    question: 'What is your weight?',
    type: 'select',
    options: ['Under 110 lbs (50 kg)', '110-150 lbs (50-68 kg)', '150-200 lbs (68-91 kg)', 'Over 200 lbs (91 kg)'],
    required: true
  },
  {
    id: 'recentDonation',
    question: 'When did you last donate blood?',
    type: 'select',
    options: ['Never', 'Less than 8 weeks ago', '8-12 weeks ago', '3-6 months ago', 'Over 6 months ago'],
    required: true
  },
  {
    id: 'healthConditions',
    question: 'Do you have any of the following conditions? (Check all that apply)',
    type: 'checkbox',
    options: [
      'Heart disease',
      'High blood pressure (uncontrolled)',
      'Diabetes (insulin-dependent)',
      'Cancer (current)',
      'HIV/AIDS',
      'Hepatitis B or C',
      'Anemia',
      'Blood clotting disorders'
    ],
    required: false
  },
  {
    id: 'medications',
    question: 'Are you currently taking any of these medications?',
    type: 'checkbox',
    options: [
      'Blood thinners (Warfarin, Heparin)',
      'Antibiotics',
      'Aspirin (daily)',
      'Steroids',
      'Immunosuppressants',
      'Antidepressants',
      'Birth control pills',
      'None of the above'
    ],
    required: false
  },
  {
    id: 'recentActivities',
    question: 'Have you done any of the following in the past 12 months?',
    type: 'checkbox',
    options: [
      'Had a tattoo or piercing',
      'Traveled to malaria-endemic areas',
      'Had dental work',
      'Had surgery',
      'Received blood transfusion',
      'Used IV drugs',
      'Had unprotected sex with multiple partners',
      'None of the above'
    ],
    required: false
  }
];

const Eligibility = () => {
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [result, setResult] = useState<'eligible' | 'ineligible' | 'conditional' | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleSelectChange = (questionId: string, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    setResponses(prev => {
      const currentResponses = prev[questionId] as string[] || [];
      if (checked) {
        return { ...prev, [questionId]: [...currentResponses, option] };
      } else {
        return { ...prev, [questionId]: currentResponses.filter(item => item !== option) };
      }
    });
  };

  const checkEligibility = () => {
    setIsChecking(true);
    
    setTimeout(() => {
      // Age check
      const age = responses.age as string;
      if (age === 'Under 18' || age === 'Over 65') {
        setResult('ineligible');
        setIsChecking(false);
        return;
      }

      // Weight check
      const weight = responses.weight as string;
      if (weight === 'Under 110 lbs (50 kg)') {
        setResult('ineligible');
        setIsChecking(false);
        return;
      }

      // Recent donation check
      const recentDonation = responses.recentDonation as string;
      if (recentDonation === 'Less than 8 weeks ago') {
        setResult('ineligible');
        setIsChecking(false);
        return;
      }

      // Health conditions check
      const healthConditions = responses.healthConditions as string[] || [];
      const seriousConditions = ['Heart disease', 'HIV/AIDS', 'Hepatitis B or C', 'Cancer (current)', 'Blood clotting disorders'];
      if (healthConditions.some(condition => seriousConditions.includes(condition))) {
        setResult('ineligible');
        setIsChecking(false);
        return;
      }

      // Medications check
      const medications = responses.medications as string[] || [];
      const restrictiveMedications = ['Blood thinners (Warfarin, Heparin)', 'Immunosuppressants'];
      if (medications.some(med => restrictiveMedications.includes(med))) {
        setResult('ineligible');
        setIsChecking(false);
        return;
      }

      // Recent activities check
      const recentActivities = responses.recentActivities as string[] || [];
      const restrictiveActivities = ['Used IV drugs', 'Received blood transfusion'];
      if (recentActivities.some(activity => restrictiveActivities.includes(activity))) {
        setResult('ineligible');
        setIsChecking(false);
        return;
      }

      // Conditional eligibility
      const conditionalFactors = [
        ...healthConditions.filter(c => ['High blood pressure (uncontrolled)', 'Diabetes (insulin-dependent)', 'Anemia'].includes(c)),
        ...medications.filter(m => ['Antibiotics', 'Steroids'].includes(m)),
        ...recentActivities.filter(a => ['Had surgery', 'Traveled to malaria-endemic areas'].includes(a))
      ];

      if (conditionalFactors.length > 0) {
        setResult('conditional');
      } else {
        setResult('eligible');
      }

      setIsChecking(false);
    }, 2000);
  };

  const getResultCard = () => {
    switch (result) {
      case 'eligible':
        return (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-800 mb-2">You're Eligible to Donate! 🎉</h3>
              <p className="text-green-700 mb-4">
                Congratulations! Based on your responses, you meet the basic criteria for blood donation.
              </p>
              <Button className="bg-primary hover:bg-primary/90">
                Register as Donor
              </Button>
            </CardContent>
          </Card>
        );

      case 'conditional':
        return (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-yellow-800 mb-2">Medical Consultation Required</h3>
              <p className="text-yellow-700 mb-4">
                Some of your responses require medical evaluation. Please consult with our medical team.
              </p>
              <Button variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-100">
                Schedule Consultation
              </Button>
            </CardContent>
          </Card>
        );

      case 'ineligible':
        return (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-800 mb-2">Currently Not Eligible</h3>
              <p className="text-red-700 mb-4">
                Based on your responses, you're currently not eligible to donate blood. This may be temporary.
              </p>
              <Button variant="outline" className="border-red-600 text-red-700 hover:bg-red-100">
                Learn About Eligibility
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-medical-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground">Donor Eligibility Check</h1>
          <p className="text-muted-foreground mt-2">
            Complete this quick assessment to check if you're eligible to donate blood
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-primary" />
              <span>Self-Assessment Questionnaire</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-8">
              {eligibilityQuestions.map((question) => (
                <div key={question.id} className="space-y-3">
                  <Label className="text-base font-medium text-foreground">
                    {question.question}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>

                  {question.type === 'select' && (
                    <Select onValueChange={(value) => handleSelectChange(question.id, value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        {question.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {question.type === 'checkbox' && (
                    <div className="grid md:grid-cols-2 gap-3">
                      {question.options?.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${question.id}-${option}`}
                            onCheckedChange={(checked) => 
                              handleCheckboxChange(question.id, option, checked as boolean)
                            }
                          />
                          <Label 
                            htmlFor={`${question.id}-${option}`}
                            className="text-sm cursor-pointer"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-6 border-t">
                <Button
                  onClick={checkEligibility}
                  disabled={isChecking || !responses.age || !responses.weight || !responses.recentDonation}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isChecking ? 'Checking Eligibility...' : 'Check My Eligibility'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {result && (
          <div className="mt-8">
            {getResultCard()}
          </div>
        )}

        {/* Important Notes */}
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Important Notes</h3>
            <ul className="space-y-2 text-blue-700 text-sm">
              <li>• This assessment is for screening purposes only and doesn't guarantee final eligibility</li>
              <li>• Final eligibility is determined through medical examination and health screening</li>
              <li>• Eligibility criteria may vary based on local regulations and medical guidelines</li>
              <li>• If you have specific medical concerns, please consult with our medical staff</li>
              <li>• Some temporary deferrals may apply based on recent activities or health conditions</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Eligibility;