import React from 'react';
import SearchBar from './SearchBar';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  restaurantCount?: number;
}

const Hero: React.FC<HeroProps> = ({ searchQuery, onSearchChange, restaurantCount = 8 }) => {
  return (
    <section className="relative bg-gradient-to-br from-green-600 via-green-700 to-green-800 py-8 px-4 md:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center">
          {/* Top Row - Branding */}
          <div className="flex items-center justify-center w-full mb-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-yellow-400 animate-fade-in">
              E-Run <span className="italic">Calinan Delivery</span>
            </h1>
          </div>

          {/* Greeting Section */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Hello!
              </h2>
              <span className="text-4xl md:text-5xl">👋</span>
            </div>
            <p className="text-white/90 text-xl md:text-2xl text-center">
              {restaurantCount} Restaurant{restaurantCount !== 1 ? 's' : ''} Available
            </p>
          </div>

          {/* Search Bar - Centered */}
          <div className="w-full max-w-4xl">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              placeholder="Search for restaurants, cuisines..."
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;