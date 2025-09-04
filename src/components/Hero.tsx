import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Users, Clock } from 'lucide-react';
import heroImage from '@/assets/hero-blood-donation.jpg';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center">
      {/* Background Image with Red Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Medical professionals"
          className="w-full h-full object-cover blur-sm"
        />
        <div className="absolute inset-0 bg-red-600/85" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Mission Tag */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
            <Heart className="w-4 h-4" />
            <span>Saving Lives Through Blood Donation</span>
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          Blood Bridge
        </h1>

        {/* Tagline */}
        <p className="text-lg sm:text-xl lg:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed">
          Connecting those in need with those who can help
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
          <Link to="/register">
            <Button 
              size="lg" 
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-full"
            >
              <Heart className="w-5 h-5 mr-2" />
              Become a Donor
            </Button>
          </Link>
          <Link to="/find-donor">
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-red-600 transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-full bg-transparent"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Find Donor
            </Button>
          </Link>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-white" />
            <div className="text-3xl font-bold text-white mb-1">10,000+</div>
            <div className="text-sm text-white/90">Donors Connected</div>
          </div>
          <div className="text-center">
            <Heart className="w-8 h-8 mx-auto mb-2 text-white" />
            <div className="text-3xl font-bold text-white mb-1">25,000+</div>
            <div className="text-sm text-white/90">Lives Saved</div>
          </div>
          <div className="text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-white" />
            <div className="text-3xl font-bold text-white mb-1">150+</div>
            <div className="text-sm text-white/90">Cities Covered</div>
          </div>
          <div className="text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-white" />
            <div className="text-3xl font-bold text-white mb-1">&lt;30min</div>
            <div className="text-sm text-white/90">Response Time</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;