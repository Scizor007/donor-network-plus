import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Users, Shield, Clock, AlertCircle, CheckCircle, X, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const facts = [
  {
    icon: Heart,
    title: "One donation saves up to 3 lives",
    description: "A single blood donation can be separated into red cells, platelets, and plasma to help multiple patients."
  },
  {
    icon: Users,
    title: "Only 3% of eligible people donate",
    description: "Despite millions being eligible, very few actually donate blood regularly."
  },
  {
    icon: Clock,
    title: "Blood has a short shelf life",
    description: "Red blood cells last 42 days, platelets only 5 days. Fresh donations are always needed."
  },
  {
    icon: Target,
    title: "Every 2 seconds someone needs blood",
    description: "From surgeries to cancer treatments, blood is needed constantly in hospitals worldwide."
  }
];

const myths = [
  {
    myth: "Blood donation makes you weak",
    fact: "Your body replaces the donated blood within 24-48 hours. Most donors feel normal immediately after.",
    isMyth: true
  },
  {
    myth: "You can get diseases from donating blood",
    fact: "All equipment is sterile and single-use. There's no risk of infection when donating blood.",
    isMyth: true
  },
  {
    myth: "Donating blood is painful",
    fact: "The needle insertion feels like a small pinch and lasts just a few seconds.",
    isMyth: true
  },
  {
    myth: "You need to be very healthy to donate",
    fact: "Most healthy adults can donate. Basic health requirements ensure safety for both donor and recipient.",
    isMyth: false
  }
];

const benefits = [
  "Free health screening with every donation",
  "Helps reduce risk of heart disease",
  "Burns approximately 650 calories per donation",
  "Stimulates production of new blood cells",
  "Provides a sense of community service",
  "May help detect health problems early"
];

const bloodTypes = [
  { type: "O-", description: "Universal donor - can donate to all blood types", percentage: "6.6%" },
  { type: "O+", description: "Most common blood type", percentage: "37.4%" },
  { type: "A-", description: "Can donate to A and AB blood types", percentage: "6.3%" },
  { type: "A+", description: "Second most common blood type", percentage: "35.7%" },
  { type: "B-", description: "Can donate to B and AB blood types", percentage: "1.5%" },
  { type: "B+", description: "Can donate to B and AB blood types", percentage: "8.5%" },
  { type: "AB-", description: "Universal plasma donor", percentage: "0.6%" },
  { type: "AB+", description: "Universal recipient - can receive from all types", percentage: "3.4%" }
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />

      {/* Quick Actions */}
      <section className="py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/blood-banks">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                <span className="font-medium">Blood Banks</span>
                <span className="text-xs text-gray-500">Find licensed centers near you</span>
              </Button>
            </Link>
            <Link to="/camps">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                <span className="font-medium">Camps</span>
                <span className="text-xs text-gray-500">View & register for camps</span>
              </Button>
            </Link>
            <Link to="/request-blood">
              <Button className="w-full h-auto p-4 flex flex-col items-center space-y-2 bg-primary hover:bg-primary/90">
                <span className="font-medium">Request Blood</span>
                <span className="text-xs text-white/80">Submit a requirement to a bank</span>
              </Button>
            </Link>
            <Link to="/certificate">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                <span className="font-medium">Certificate</span>
                <span className="text-xs text-gray-500">Access your donor certificate</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Blood Donation Awareness Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-foreground mb-4">Blood Donation Awareness</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Learn about the importance of blood donation, understand the facts, and discover how you can make a difference in saving lives.
          </p>
        </div>
      </section>
      
      {/* Key Facts */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Why Blood Donation Matters</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {facts.map((fact, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <fact.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{fact.title}</h3>
                  <p className="text-sm text-muted-foreground">{fact.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blood Types */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Blood Type Compatibility</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {bloodTypes.map((bloodType, index) => (
              <Card key={index} className="shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="bg-primary text-primary-foreground font-bold text-lg rounded-full w-12 h-12 flex items-center justify-center">
                      {bloodType.type}
                    </div>
                    <Badge variant="secondary">{bloodType.percentage}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{bloodType.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Myths vs Facts */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Myths vs Facts</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {myths.map((item, index) => (
              <Card key={index} className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className={`p-2 rounded-full ${item.isMyth ? 'bg-red-100' : 'bg-green-100'}`}>
                      {item.isMyth ? (
                        <X className="w-5 h-5 text-red-600" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <Badge variant={item.isMyth ? "destructive" : "default"} className="mb-2">
                        {item.isMyth ? "MYTH" : "FACT"}
                      </Badge>
                      <h3 className="font-semibold text-foreground mb-2">{item.myth}</h3>
                      <p className="text-muted-foreground text-sm">{item.fact}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Health Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Health Benefits of Donating</h2>
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Benefits for Donors</h3>
                  <ul className="space-y-3">
                    {benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-primary/5 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">The Donation Process</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</div>
                      <span>Registration & health questionnaire (5 min)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</div>
                      <span>Quick health screening (5 min)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</div>
                      <span>Blood donation (8-10 min)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</div>
                      <span>Rest & refreshments (5-10 min)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-lg border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-12 text-center">
              <Heart className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Save Lives?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of heroes who donate blood regularly and help save lives in your community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/eligibility">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Check Eligibility
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    Register as Donor
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Emergency Blood Requests</h3>
              <p className="text-red-700 text-sm mb-4">
                For urgent blood needs or medical emergencies requiring immediate blood donations
              </p>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                Emergency Hotline: 1-800-BLOOD-911
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
