import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EligibilityTestProps {
    onComplete: (isEligible: boolean, testData: any) => void;
    onSkip: () => void;
    userData?: {
        age?: string;
        gender?: string;
        bloodGroup?: string;
    };
}

export const EligibilityTest: React.FC<EligibilityTestProps> = ({
    onComplete,
    onSkip,
    userData
}) => {
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [testData, setTestData] = useState({
        age: userData?.age || '',
        gender: userData?.gender || '',
        bloodGroup: userData?.bloodGroup || '',
        weight: '',
        height: '',
        lastDonation: '',
        medicalConditions: [] as string[],
        medications: [] as string[],
        recentIllness: [] as string[],
        pregnancy: false,
        breastfeeding: false,
        recentTravel: false,
        recentTattoo: false,
        recentSurgery: false,
        bloodPressure: '',
        diabetes: false,
        heartDisease: false,
        cancer: false,
        hepatitis: false,
        hiv: false,
        consent: false
    });

    const [isEligible, setIsEligible] = useState<boolean | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    const medicalConditions = [
        'High Blood Pressure',
        'Diabetes',
        'Heart Disease',
        'Cancer',
        'Hepatitis B/C',
        'HIV/AIDS',
        'Epilepsy',
        'Thyroid Disorders',
        'Kidney Disease',
        'Liver Disease',
        'Autoimmune Disorders',
        'Bleeding Disorders'
    ];

    const medications = [
        'Blood Thinners',
        'Insulin',
        'Chemotherapy',
        'Antibiotics',
        'Steroids',
        'Antidepressants',
        'Blood Pressure Medication',
        'Heart Medication'
    ];

    const illnesses = [
        'Cold/Flu',
        'Fever',
        'Cough',
        'Diarrhea',
        'Vomiting',
        'Skin Infection',
        'Respiratory Infection',
        'Gastrointestinal Issues'
    ];

    const checkEligibility = async () => {
        setIsChecking(true);

        // Simulate eligibility check
        setTimeout(() => {
            let eligible = true;
            const reasons: string[] = [];

            // Age check
            const age = parseInt(testData.age);
            if (age < 18 || age > 65) {
                eligible = false;
                reasons.push('Age must be between 18-65 years');
            }

            // Weight check
            const weight = parseFloat(testData.weight);
            if (weight < 50) {
                eligible = false;
                reasons.push('Minimum weight requirement is 50kg');
            }

            // Medical conditions
            if (testData.medicalConditions.length > 0) {
                eligible = false;
                reasons.push('Certain medical conditions may prevent donation');
            }

            // Medications
            if (testData.medications.length > 0) {
                eligible = false;
                reasons.push('Current medications may affect eligibility');
            }

            // Recent illness
            if (testData.recentIllness.length > 0) {
                eligible = false;
                reasons.push('Recent illness requires waiting period');
            }

            // Pregnancy/breastfeeding
            if (testData.pregnancy || testData.breastfeeding) {
                eligible = false;
                reasons.push('Pregnancy/breastfeeding period requires waiting');
            }

            // Recent procedures
            if (testData.recentTravel || testData.recentTattoo || testData.recentSurgery) {
                eligible = false;
                reasons.push('Recent travel/tattoo/surgery requires waiting period');
            }

            // Chronic conditions
            if (testData.diabetes || testData.heartDisease || testData.cancer ||
                testData.hepatitis || testData.hiv) {
                eligible = false;
                reasons.push('Certain chronic conditions prevent donation');
            }

            // Blood pressure
            if (testData.bloodPressure === 'high' || testData.bloodPressure === 'low') {
                eligible = false;
                reasons.push('Blood pressure must be within normal range');
            }

            setIsEligible(eligible);
            setIsChecking(false);

            if (eligible) {
                toast({
                    title: "🎉 Congratulations!",
                    description: "You are eligible to donate blood. Thank you for your willingness to help save lives!",
                });
            } else {
                toast({
                    title: "Eligibility Check Complete",
                    description: `Based on your responses, you may not be eligible at this time. Reasons: ${reasons.join(', ')}`,
                    variant: "destructive"
                });
            }
        }, 2000);
    };

    const handleComplete = () => {
        onComplete(isEligible || false, testData);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Basic Information</h3>
                            <p className="text-muted-foreground">Let's start with some basic details</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="age">Age *</Label>
                                <Input
                                    id="age"
                                    type="number"
                                    min="18"
                                    max="65"
                                    value={testData.age}
                                    onChange={(e) => setTestData({ ...testData, age: e.target.value })}
                                    placeholder="Enter your age"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender *</Label>
                                <Select value={testData.gender} onValueChange={(value) => setTestData({ ...testData, gender: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="weight">Weight (kg) *</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    min="40"
                                    max="200"
                                    value={testData.weight}
                                    onChange={(e) => setTestData({ ...testData, weight: e.target.value })}
                                    placeholder="Enter your weight"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="height">Height (cm)</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    min="100"
                                    max="250"
                                    value={testData.height}
                                    onChange={(e) => setTestData({ ...testData, height: e.target.value })}
                                    placeholder="Enter your height"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-xl font-semibold mb-2">Medical History</h3>
                            <p className="text-muted-foreground">Please answer honestly for your safety</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label className="text-base font-medium">Do you have any of these medical conditions?</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {medicalConditions.map((condition) => (
                                        <div key={condition} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={condition}
                                                checked={testData.medicalConditions.includes(condition)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setTestData({
                                                            ...testData,
                                                            medicalConditions: [...testData.medicalConditions, condition]
                                                        });
                                                    } else {
                                                        setTestData({
                                                            ...testData,
                                                            medicalConditions: testData.medicalConditions.filter(c => c !== condition)
                                                        });
                                                    }
                                                }}
                                            />
                                            <Label htmlFor={condition} className="text-sm">{condition}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label className="text-base font-medium">Are you currently taking any medications?</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {medications.map((medication) => (
                                        <div key={medication} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={medication}
                                                checked={testData.medications.includes(medication)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setTestData({
                                                            ...testData,
                                                            medications: [...testData.medications, medication]
                                                        });
                                                    } else {
                                                        setTestData({
                                                            ...testData,
                                                            medications: testData.medications.filter(m => m !== medication)
                                                        });
                                                    }
                                                }}
                                            />
                                            <Label htmlFor={medication} className="text-sm">{medication}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-xl font-semibold mb-2">Recent Health & Activities</h3>
                            <p className="text-muted-foreground">Tell us about your recent health status</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="pregnancy"
                                        checked={testData.pregnancy}
                                        onCheckedChange={(checked) => setTestData({ ...testData, pregnancy: checked as boolean })}
                                    />
                                    <Label htmlFor="pregnancy">Are you currently pregnant?</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="breastfeeding"
                                        checked={testData.breastfeeding}
                                        onCheckedChange={(checked) => setTestData({ ...testData, breastfeeding: checked as boolean })}
                                    />
                                    <Label htmlFor="breastfeeding">Are you currently breastfeeding?</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="recentTravel"
                                        checked={testData.recentTravel}
                                        onCheckedChange={(checked) => setTestData({ ...testData, recentTravel: checked as boolean })}
                                    />
                                    <Label htmlFor="recentTravel">Have you traveled internationally in the last 3 months?</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="recentTattoo"
                                        checked={testData.recentTattoo}
                                        onCheckedChange={(checked) => setTestData({ ...testData, recentTattoo: checked as boolean })}
                                    />
                                    <Label htmlFor="recentTattoo">Have you gotten a tattoo or piercing in the last 6 months?</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="recentSurgery"
                                        checked={testData.recentSurgery}
                                        onCheckedChange={(checked) => setTestData({ ...testData, recentSurgery: checked as boolean })}
                                    />
                                    <Label htmlFor="recentSurgery">Have you had surgery in the last 6 months?</Label>
                                </div>
                            </div>

                            <div>
                                <Label className="text-base font-medium">Have you had any of these recent illnesses?</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {illnesses.map((illness) => (
                                        <div key={illness} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={illness}
                                                checked={testData.recentIllness.includes(illness)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setTestData({
                                                            ...testData,
                                                            recentIllness: [...testData.recentIllness, illness]
                                                        });
                                                    } else {
                                                        setTestData({
                                                            ...testData,
                                                            recentIllness: testData.recentIllness.filter(i => i !== illness)
                                                        });
                                                    }
                                                }}
                                            />
                                            <Label htmlFor={illness} className="text-sm">{illness}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-xl font-semibold mb-2">Final Check</h3>
                            <p className="text-muted-foreground">Almost done! Let's complete the eligibility assessment</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="diabetes"
                                        checked={testData.diabetes}
                                        onCheckedChange={(checked) => setTestData({ ...testData, diabetes: checked as boolean })}
                                    />
                                    <Label htmlFor="diabetes">Do you have diabetes?</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="heartDisease"
                                        checked={testData.heartDisease}
                                        onCheckedChange={(checked) => setTestData({ ...testData, heartDisease: checked as boolean })}
                                    />
                                    <Label htmlFor="heartDisease">Do you have heart disease?</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="cancer"
                                        checked={testData.cancer}
                                        onCheckedChange={(checked) => setTestData({ ...testData, cancer: checked as boolean })}
                                    />
                                    <Label htmlFor="cancer">Do you have or have had cancer?</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="hepatitis"
                                        checked={testData.hepatitis}
                                        onCheckedChange={(checked) => setTestData({ ...testData, hepatitis: checked as boolean })}
                                    />
                                    <Label htmlFor="hepatitis">Do you have hepatitis B or C?</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="hiv"
                                        checked={testData.hiv}
                                        onCheckedChange={(checked) => setTestData({ ...testData, hiv: checked as boolean })}
                                    />
                                    <Label htmlFor="hiv">Do you have HIV/AIDS?</Label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bloodPressure">Blood Pressure Status</Label>
                                <Select value={testData.bloodPressure} onValueChange={(value) => setTestData({ ...testData, bloodPressure: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your blood pressure status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="unknown">Don't know</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="consent"
                                    checked={testData.consent}
                                    onCheckedChange={(checked) => setTestData({ ...testData, consent: checked as boolean })}
                                />
                                <Label htmlFor="consent" className="text-sm">
                                    I confirm that all information provided is accurate and complete *
                                </Label>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return testData.age && testData.gender && testData.weight;
            case 2:
                return true; // Optional step
            case 3:
                return true; // Optional step
            case 4:
                return testData.consent;
            default:
                return false;
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="h-6 w-6 text-red-500" />
                            Blood Donation Eligibility Test
                        </CardTitle>
                        <CardDescription>
                            Step {currentStep} of 4 - Help us determine your eligibility to donate blood
                        </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onSkip}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-red-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / 4) * 100}%` }}
                    />
                </div>
            </CardHeader>

            <CardContent>
                {isEligible === null ? (
                    <>
                        {renderStep()}

                        <div className="flex justify-between mt-8">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                                disabled={currentStep === 1}
                            >
                                Previous
                            </Button>

                            {currentStep < 4 ? (
                                <Button
                                    onClick={() => setCurrentStep(currentStep + 1)}
                                    disabled={!canProceed()}
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    onClick={checkEligibility}
                                    disabled={!canProceed() || isChecking}
                                    className="bg-red-500 hover:bg-red-600"
                                >
                                    {isChecking ? 'Checking Eligibility...' : 'Check Eligibility'}
                                </Button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center space-y-6">
                        {isEligible ? (
                            <div className="flex flex-col items-center space-y-4">
                                <CheckCircle className="h-16 w-16 text-green-500" />
                                <div>
                                    <h3 className="text-2xl font-bold text-green-600 mb-2">You're Eligible!</h3>
                                    <p className="text-muted-foreground">
                                        Congratulations! Based on your responses, you are eligible to donate blood.
                                        Thank you for your willingness to help save lives!
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center space-y-4">
                                <AlertCircle className="h-16 w-16 text-red-500" />
                                <div>
                                    <h3 className="text-2xl font-bold text-red-600 mb-2">Not Eligible at This Time</h3>
                                    <p className="text-muted-foreground">
                                        Based on your responses, you may not be eligible to donate blood at this time.
                                        Please consult with a healthcare professional for more information.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex space-x-4">
                            <Button variant="outline" onClick={onSkip}>
                                Skip for Now
                            </Button>
                            <Button onClick={handleComplete} className="bg-red-500 hover:bg-red-600">
                                Continue
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
