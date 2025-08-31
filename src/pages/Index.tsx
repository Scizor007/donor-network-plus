import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Users, Shield, Clock, MapPin, Award } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: "Find Verified Donors",
    description: "Connect with health-screened, verified blood donors in your area instantly."
  },
  {
    icon: MapPin,
    title: "Location-Based Matching",
    description: "Find donors nearby using smart location matching for urgent needs."
  },
  {
    icon: Shield,
    title: "Health Verification",
    description: "All donors undergo thorough health screening and report verification."
  },
  {
    icon: Clock,
    title: "24/7 Emergency Support",
    description: "Round-the-clock support for critical blood requirements."
  },
  {
    icon: Award,
    title: "Donor Recognition",
    description: "Celebrate and recognize our life-saving community heroes."
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-medical-background">
      <Navigation />
      <Hero />
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">How Blood Bridge Works</h2>
            <p className="text-lg text-muted-foreground">
              Connecting lives through technology and compassion
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow border-0">
                <CardContent className="p-8 text-center">
                  <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Blood Bridge exists to save lives by creating the most efficient, trustworthy platform 
            connecting blood donors with patients in need. Every donation matters, every connection 
            counts, and every life saved makes our community stronger.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;
