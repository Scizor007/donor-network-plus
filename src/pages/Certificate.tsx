import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const Certificate = () => {
  const { toast } = useToast();
  const [pledgeName, setPledgeName] = useState('');
  const [pledged, setPledged] = useState(false);

  const pledge = () => {
    if (!pledgeName) {
      toast({ title: 'Enter your name', description: 'Your name will appear on the certificate.', variant: 'destructive' });
      return;
    }
    setPledged(true);
    toast({ title: 'Pledge recorded', description: 'Thank you for taking the donor pledge.' });
  };

  const download = () => {
    toast({ title: 'Download started', description: 'Mock certificate download initiated.' });
  };

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Donor Certificate</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Certificate Preview</CardTitle>
                <CardDescription>Preview of your donor certificate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-6 bg-white">
                  <div className="text-center space-y-2">
                    <div className="text-xs uppercase tracking-widest text-gray-500">National Donor Certificate</div>
                    <div className="text-2xl font-bold">Certificate of Appreciation</div>
                    <div className="text-sm text-gray-600">This is to certify that</div>
                    <div className="text-xl font-semibold">{pledged && pledgeName ? pledgeName : 'Your Name'}</div>
                    <div className="text-sm text-gray-600">has pledged to donate blood and help save lives</div>
                    <div className="text-xs text-gray-500">Certificate No: MOCK-2025-0001</div>
                  </div>
                </div>
                <div className="pt-4">
                  <Button onClick={download} disabled={!pledged}>Download PDF</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Take the Donor Pledge</CardTitle>
                <CardDescription>Enter your name to generate your certificate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Your full name" value={pledgeName} onChange={(e) => setPledgeName(e.target.value)} />
                <Button className="w-full" onClick={pledge}>Take Pledge</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Certificate;