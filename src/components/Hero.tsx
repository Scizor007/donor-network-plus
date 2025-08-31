import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Heart, Users, Shield, Clock } from 'lucide-react';
import heroImage from '@/assets/hero-blood-donation.jpg';

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-medical-background via-white to-accent/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Bridging Lives Through
                <span className="text-primary block">Blood Donation</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Connect patients in urgent need with verified blood donors in your area. 
                Join our community of life-savers and make a difference today.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">5,000+</div>
                <div className="text-sm text-muted-foreground">Lives Saved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">2,500+</div>
                <div className="text-sm text-muted-foreground">Active Donors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">100+</div>
                <div className="text-sm text-muted-foreground">Partner Hospitals</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Become a Donor
                </Button>
              </Link>
              <Link to="/find-donor">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 w-full sm:w-auto"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Find a Donor
                </Button>
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={heroImage} 
                alt="Blood donation community"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -top-6 -left-6 bg-white rounded-lg shadow-lg p-4 border">
              <Shield className="w-8 h-8 text-medical-secondary mb-2" />
              <div className="text-sm font-semibold">Verified Donors</div>
              <div className="text-xs text-muted-foreground">Health reports verified</div>
            </div>
            
            <div className="absolute -bottom-6 -right-6 bg-white rounded-lg shadow-lg p-4 border">
              <Clock className="w-8 h-8 text-medical-accent mb-2" />
              <div className="text-sm font-semibold">24/7 Available</div>
              <div className="text-xs text-muted-foreground">Emergency support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;